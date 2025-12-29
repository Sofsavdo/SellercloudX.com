// Autonomous AI Manager - Avtomatik ishlaydigan AI Manager
// Hamkor buyruq bermaydi - marketplace reglamentidan kelib chiqib hammasini avtomatik bajara

import { db } from '../db';
import { partners, marketplaceIntegrations, products } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { generateProductCard, optimizePrice, monitorPartnerProducts, autoUploadToMarketplace } from './aiManagerService';
import { wsManager } from '../websocket';
import OpenAI from 'openai';

// ================================================================
// AUTONOMOUS AI MANAGER - Background Worker
// ================================================================

class AutonomousAIManager {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

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
      // Get all active partners with AI enabled
      const activePartners = await db.select()
        .from(partners)
        .where(eq(partners.aiEnabled, true))
        .where(eq(partners.approved, true));

      for (const partner of activePartners) {
        try {
          // Get partner's products
          const partnerProducts = await db.select()
            .from(products)
            .where(eq(products.partnerId, partner.id))
            .where(eq(products.isActive, true));

          // Get active marketplace integrations
          const integrations = await db.select()
            .from(marketplaceIntegrations)
            .where(eq(marketplaceIntegrations.partnerId, partner.id))
            .where(eq(marketplaceIntegrations.active, true));

          for (const product of partnerProducts) {
            for (const integration of integrations) {
              // Check if card already exists (using raw SQL for SQLite)
              const { sqlite } = await import('../db');
              let existingCard = null;
              if (sqlite) {
                const stmt = sqlite.prepare(
                  `SELECT id FROM ai_generated_products 
                   WHERE partner_id = ? AND marketplace = ? LIMIT 1`
                );
                existingCard = stmt.get(partner.id, integration.marketplace);
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
                    price: parseFloat(product.price.toString()),
                    images: [],
                    targetMarketplace: integration.marketplace as any
                  }, parseInt(partner.id));
                  
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
    // Use AI to analyze error and create fixed version
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
Marketplace mahsulot kartochkasi bloklangan yoki xatoga ega.

XATO: ${product.error_message || 'Noma\'lum'}
MAHSULOT: ${product.raw_product_name}
MARKETPLACE: ${product.marketplace_type}

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
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      const fixData = JSON.parse(response.choices[0].message.content || '{}');
      
      // Update product with fixed data (using raw SQL for SQLite)
      const { sqlite } = await import('../db');
      if (sqlite) {
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
        stmt.run(fixData.fixedTitle, fixData.fixedDescription, fixData.fixedTitle, fixData.fixedDescription, product.id);
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
        try {
          await optimizePrice(
            parseInt(product.partner_id),
            parseInt(product.id),
            product.marketplace_type
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
      const activePartners = await db.select()
        .from(partners)
        .where(eq(partners.aiEnabled, true))
        .where(eq(partners.approved, true));

      for (const partner of activePartners) {
        try {
          await monitorPartnerProducts(parseInt(partner.id));
        } catch (error) {
          console.error(`Error monitoring partner ${partner.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in monitorAllPartners:', error);
    }
  }
}

// Singleton instance
export const autonomousAIManager = new AutonomousAIManager();
