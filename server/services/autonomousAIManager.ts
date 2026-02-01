// Autonomous AI Manager - Avtomatik ishlaydigan AI Manager
// Hamkor buyruq bermaydi - marketplace reglamentidan kelib chiqib hammasini avtomatik bajara

import { db, getDbType } from '../db';
import { partners, marketplaceIntegrations, products } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { generateProductCard, optimizePrice, monitorPartnerProducts, autoUploadToMarketplace } from './aiManagerService';
import { wsManager } from '../websocket';
import { geminiService } from './geminiService';
import emergentAI from './emergentAI';
import { storage } from '../storage';

// Universal timestamp formatter
function formatTimestamp(): any {
  const dbType = getDbType();
  return dbType === 'sqlite' ? Math.floor(Date.now() / 1000) : new Date();
}

// ================================================================
// AUTONOMOUS AI MANAGER - Background Worker
// ================================================================

interface AIDecision {
  module: string;
  action: string;
  confidence: number;
  timestamp: Date;
  details?: any;
}

interface ProductInput {
  name: string;
  image: string;
  description: string;
  costPrice: number;
  stockQuantity: number;
  partnerId: string;
}

class AutonomousAIManager {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private decisions: AIDecision[] = [];

  // Start autonomous AI Manager
  start() {
    if (this.isRunning) {
      console.log('⚠️ Autonomous AI Manager allaqachon ishlamoqda');
      return;
    }

    console.log('🚀 Autonomous AI Manager ishga tushdi');
    this.isRunning = true;

    // Check every 5 minutes for new products and tasks
    this.intervalId = setInterval(() => {
      this.processPendingTasks();
    }, 5 * 60 * 1000); // 5 minutes

    // Initial processing
    this.processPendingTasks();
  }

  // Stop autonomous AI Manager
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Autonomous AI Manager toxtatildi');
  }

  /**
   * Process product with AI - creates cards, optimizes content, etc.
   */
  async processProduct(input: ProductInput): Promise<{
    success: boolean;
    product?: any;
    decisions: AIDecision[];
    errors?: string[];
  }> {
    const decisions: AIDecision[] = [];
    const errors: string[] = [];

    try {
      // Decision 1: Analyze product
      decisions.push({
        module: 'analyzer',
        action: 'analyze_product',
        confidence: 95,
        timestamp: new Date(),
        details: { name: input.name }
      });

      // Decision 2: Generate SEO content
      decisions.push({
        module: 'seo',
        action: 'generate_seo',
        confidence: 90,
        timestamp: new Date(),
        details: { marketplace: 'all' }
      });

      // Decision 3: Optimize pricing
      const markup = 1.3; // 30% markup
      const price = input.costPrice * markup;
      decisions.push({
        module: 'pricing',
        action: 'set_price',
        confidence: 85,
        timestamp: new Date(),
        details: { costPrice: input.costPrice, sellPrice: price, markup: '30%' }
      });

      // Store decisions
      this.decisions.push(...decisions);

      // Create product (mock - integrate with actual storage)
      const product = {
        id: `prod_${Date.now()}`,
        name: input.name,
        description: input.description,
        costPrice: input.costPrice,
        price,
        stockQuantity: input.stockQuantity,
        partnerId: input.partnerId,
        createdAt: formatTimestamp()
      };

      return {
        success: true,
        product,
        decisions
      };
    } catch (error: any) {
      errors.push(error.message);
      return {
        success: false,
        decisions,
        errors
      };
    }
  }

  /**
   * Get all decisions
   */
  getDecisions(): AIDecision[] {
    return this.decisions;
  }

  /**
   * Clear decisions log
   */
  clearDecisions(): void {
    this.decisions = [];
  }

  // Process pending tasks
  private async processPendingTasks() {
    try {
      // 1. Find products without marketplace cards
      await this.createMissingCards();
      
      // 2. Monitor and fix marketplace errors
      await this.fixMarketplaceErrors();
      
      // 3. Optimize prices
      await this.optimizePrices();
      
      // 4. Monitor partner products
      await this.monitorAllPartners();
    } catch (error) {
      console.error('❌ Autonomous AI Manager xatosi:', error);
    }
  }

  // Create missing marketplace cards
  private async createMissingCards() {
    console.log('🔍 Checking for products without marketplace cards...');
    
    try {
      // SAFE: Only try if database is available
      // Get all active partners with AI enabled
      let activePartners: any[] = [];
      
      try {
        activePartners = await db.select({
          id: partners.id,
          businessName: partners.businessName,
          aiEnabled: partners.aiEnabled,
          approved: partners.approved
        })
          .from(partners)
          .where(eq(partners.aiEnabled, true))
          .where(eq(partners.approved, true));
      } catch (dbError) {
        console.log('⚠️ Database query skipped in createMissingCards:', (dbError as Error).message);
        return; // Exit gracefully
      }
      
      if (!activePartners || activePartners.length === 0) {
        console.log('ℹ️ No active partners to process');
        return;
      }

      for (const partner of activePartners) {
        try {
          // Get partner's products
          let partnerProducts: any[] = [];
          try {
            partnerProducts = await db.select({
              id: products.id,
              name: products.name,
              category: products.category,
              description: products.description,
              price: products.price,
              isActive: products.isActive,
              partnerId: products.partnerId
            })
              .from(products)
              .where(eq(products.partnerId, partner.id))
              .where(eq(products.isActive, true));
          } catch (e) {
            console.log(`⚠️ Products query skipped for partner ${partner.id}`);
            continue;
          }

          // Get active marketplace integrations
          let integrations: any[] = [];
          try {
            integrations = await db.select({
              id: marketplaceIntegrations.id,
              marketplace: marketplaceIntegrations.marketplace,
              partnerId: marketplaceIntegrations.partnerId,
              active: marketplaceIntegrations.active
            })
              .from(marketplaceIntegrations)
              .where(eq(marketplaceIntegrations.partnerId, partner.id))
              .where(eq(marketplaceIntegrations.active, true));
          } catch (e) {
            console.log(`⚠️ Integrations query skipped for partner ${partner.id}`);
            continue;
          }

          for (const product of partnerProducts) {
            for (const integration of integrations) {
              // Check if card already exists (using raw SQL for SQLite)
              const { sqlite } = await import('../db');
              let existingCard = null;
              if (sqlite) {
                try {
                  const stmt = sqlite.prepare(
                    `SELECT id FROM ai_generated_products 
                     WHERE partner_id = ? AND marketplace = ? LIMIT 1`
                  );
                  existingCard = stmt.get(partner.id, integration.marketplace);
                } catch (e) {
                  continue;
                }
              } else {
                // Fallback: skip if SQLite not available
                existingCard = null;
              }

              if (!existingCard) {
                console.log(`📝 Creating card for ${product.name} on ${integration.marketplace}`);
                
                try {
                  await generateProductCard({
                    name: product.name,
                    category: product.category || 'general',
                    description: product.description || '',
                    price: parseFloat(product.price?.toString() || '0') || 0,
                    images: [],
                    targetMarketplace: integration.marketplace as any
                  }, partner.id);
                  
                  console.log(`✅ Card created for ${product.name}`);
                } catch (error) {
                  console.error(`❌ Failed to create card:`, error);
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error processing partner ${partner.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in createMissingCards:', error);
    }
  }

  // Fix marketplace errors and blocked products
  private async fixMarketplaceErrors() {
    console.log('🔧 Checking for marketplace errors...');
    
    try {
      // Get products with errors or blocked status (using raw SQL for SQLite)
      const { sqlite } = await import('../db');
      let errorProducts: any[] = [];
      if (sqlite) {
        const stmt = sqlite.prepare(
          `SELECT * FROM ai_generated_products 
           WHERE status IN ('error', 'blocked', 'rejected')
           ORDER BY updated_at DESC
           LIMIT 10`
        );
        errorProducts = stmt.all() as any[];
      } else {
        // Fallback: return empty array if SQLite not available
        errorProducts = [];
      }

      for (const product of errorProducts) {
        try {
          console.log(`🔧 Fixing product ${product.id}...`);
          
          // Analyze error and fix
          const fixedCard = await this.fixProductCard(product);
          
          if (fixedCard) {
            console.log(`✅ Product ${product.id} fixed`);
          }
        } catch (error) {
          console.error(`❌ Failed to fix product ${product.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in fixMarketplaceErrors:', error);
    }
  }

  // Fix individual product card
  private async fixProductCard(product: any) {
    // Use AI to analyze error and create fixed version using Emergent AI
    const prompt = `
Marketplace mahsulot kartochkasi bloklangan yoki xatoga ega.

XATO: ${product.error_message || 'Noma\'lum'}
MAHSULOT: ${product.raw_product_name || 'Noma\'lum'}
MARKETPLACE: ${product.marketplace_type || 'general'}

Quyidagilarni tahlil qiling va tuzatilgan versiyani yarating:
1. Xatoning sababini aniqlang
2. Marketplace qoidalariga mos kelmaydigan qismlarni toping
3. Tuzatilgan kartochka yarating

JSON formatda javob bering:
{
  "errorReason": "Xato sababi",
  "fixedTitle": "Tuzatilgan sarlavha",
  "fixedDescription": "Tuzatilgan tavsif",
  "fixedKeywords": ["kalit", "so'zlar"],
  "complianceIssues": ["Muammo 1", "Muammo 2"],
  "fixes": ["Tuzatish 1", "Tuzatish 2"]
}
`;

    try {
      const fixData = await emergentAI.generateJSON(prompt, 'ProductCardFix');
      
      // Update product with fixed data (using raw SQL for SQLite)
      const { sqlite } = await import('../db');
      if (sqlite && fixData && fixData.fixedTitle) {
        const stmt = sqlite.prepare(
          `UPDATE ai_generated_products 
           SET generated_title = ?, 
               generated_description = ?,
               ai_title = ?,
               ai_description = ?,
               status = 'review',
               error_message = NULL,
               updated_at = unixepoch()
           WHERE id = ?`
        );
        stmt.run(
          fixData.fixedTitle || '', 
          fixData.fixedDescription || '', 
          fixData.fixedTitle || '', 
          fixData.fixedDescription || '', 
          product.id
        );
      }

      return fixData;
    } catch (error) {
      console.error('Error fixing product card:', error);
      return null;
    }
  }

  // Optimize prices
  private async optimizePrices() {
    console.log('💰 Optimizing prices...');
    
    try {
      // Get products that need price optimization (using raw SQL for SQLite)
      const { sqlite } = await import('../db');
      let productsToOptimize: any[] = [];
      if (sqlite) {
        const stmt = sqlite.prepare(
          `SELECT * FROM marketplace_products 
           WHERE (last_price_update IS NULL OR last_price_update < (unixepoch() - 604800))
           AND status = 'active'
           LIMIT 20`
        );
        productsToOptimize = stmt.all() as any[];
      } else {
        // Fallback: return empty array if SQLite not available
        productsToOptimize = [];
      }

      for (const product of productsToOptimize) {
        // Validate product data before processing
        if (!product || !product.partner_id || !product.id) {
          console.warn('⚠️ Skipping product with invalid data');
          continue;
        }

        try {
          // Pass IDs as strings (UUIDs), NOT parseInt!
          await optimizePrice(
            product.partner_id,
            product.id,
            product.marketplace_type || 'general'
          );
        } catch (error) {
          console.error(`Error optimizing price for product ${product.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in optimizePrices:', error);
    }
  }

  // Monitor all partners
  private async monitorAllPartners() {
    console.log('👁️ Monitoring partners...');
    
    try {
      // SAFE: Use storage layer which works with both SQLite and PostgreSQL
      let activePartners: any[] = [];
      
      try {
        // Use storage.getAllPartners() which handles both SQLite and PostgreSQL
        const allPartners = await storage.getAllPartners();
        
        // Filter for active partners with AI enabled and approved
        activePartners = allPartners.filter((partner: any) => {
          const aiEnabled = partner.aiEnabled === true || partner.ai_enabled === true;
          const approved = partner.approved === true || partner.is_approved === true;
          return aiEnabled && approved;
        });
      } catch (dbError) {
        console.log('⚠️ Database query skipped in monitorAllPartners:', (dbError as Error).message);
        return; // Exit gracefully
      }

      // Validate we have partners to monitor
      if (!activePartners || activePartners.length === 0) {
        console.log('ℹ️ No active partners with AI enabled to monitor');
        return;
      }

      for (const partner of activePartners) {
        // CRITICAL: Validate partner ID is a valid string (UUID), not NaN
        // Use partner.id (not userId) as that's the actual partner record ID
        const partnerId = partner.id;
        if (!partnerId || typeof partnerId !== 'string' || partnerId.trim() === '' || partnerId === 'NaN' || partnerId === 'null' || partnerId === 'undefined') {
          console.warn('⚠️ Skipping partner with invalid ID:', partner);
          continue;
        }

        try {
          // Pass partner.id as STRING (UUID), NOT parseInt which causes NaN!
          await monitorPartnerProducts(partnerId);
        } catch (error: any) {
          // Silently handle errors - don't spam logs
          if (error?.message?.includes('Symbol(drizzle:Columns)')) {
            // Schema mismatch - skip this partner
            console.log(`⚠️ Skipping partner ${partnerId} due to schema mismatch`);
          } else {
            console.error(`Error monitoring partner ${partnerId}:`, error?.message || error);
          }
        }
      }
    } catch (error) {
      console.error('Error in monitorAllPartners:', error);
    }
  }
}

// Singleton instance
export const autonomousAIManager = new AutonomousAIManager();
