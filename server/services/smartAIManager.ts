import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db';
import { products, aiTasks } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Smart AI Manager with Image Recognition and Cost Optimization
// Google Lens-like functionality for product scanning

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

interface ProductFromImage {
  name: string;
  category: string;
  subcategory: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  material?: string;
  features: string[];
  description: string;
  keywords: string[];
  confidence: number;
}

interface MarketIntelligence {
  suggestedPrice: {
    min: number;
    optimal: number;
    max: number;
  };
  demand: 'high' | 'medium' | 'low';
  competition: 'high' | 'medium' | 'low';
  seasonality: string;
  trends: string[];
  bestMarketplaces: string[];
}

interface CompleteProductCard {
  // Basic Info (from image)
  name: string;
  category: string;
  description: string;
  
  // SEO Optimized
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  
  // Multi-language
  translations: {
    uz: { title: string; description: string; };
    ru: { title: string; description: string; };
    en: { title: string; description: string; };
  };
  
  // Market Intelligence
  marketIntelligence: MarketIntelligence;
  
  // Marketplace Specific
  marketplaceCards: {
    uzum: any;
    wildberries: any;
    ozon: any;
    yandex: any;
  };
}

class SmartAIManager {
  private cache: Map<string, any> = new Map();
  private costTracker = {
    totalCost: 0,
    requestCount: 0,
    cacheHits: 0
  };

  /**
   * Main function: Scan product image and generate complete card
   * Partner only provides: image, quantity, cost price
   */
  async scanAndGenerateCard(params: {
    imageUrl: string;
    quantity: number;
    costPrice: number;
    partnerId: string;
  }): Promise<CompleteProductCard> {
    console.log('🔍 Starting smart product scan...');

    // Step 1: Extract product info from image (GPT-4 Vision)
    const productInfo = await this.extractProductFromImage(params.imageUrl);
    
    // Step 2: Get market intelligence (GPT-3.5 - cheaper)
    const marketIntel = await this.getMarketIntelligence(
      productInfo.name,
      productInfo.category,
      params.costPrice
    );
    
    // Step 3: Generate SEO optimized content (Claude Haiku - fast & cheap)
    const seoContent = await this.generateSEOContent(productInfo);
    
    // Step 4: Generate multi-language content (Template + AI)
    const translations = await this.generateTranslations(productInfo, seoContent);
    
    // Step 5: Generate marketplace-specific cards (Batch)
    const marketplaceCards = await this.generateMarketplaceCards(
      productInfo,
      seoContent,
      marketIntel
    );

    // Step 6: Save to database
    const completeCard: CompleteProductCard = {
      name: productInfo.name,
      category: productInfo.category,
      description: productInfo.description,
      seoTitle: seoContent.title,
      seoDescription: seoContent.description,
      keywords: seoContent.keywords,
      translations,
      marketIntelligence: marketIntel,
      marketplaceCards
    };

    await this.saveProduct(completeCard, params);

    console.log('✅ Product card generated successfully!');
    console.log(`💰 Total cost: $${this.costTracker.totalCost.toFixed(4)}`);
    
    return completeCard;
  }

  /**
   * Step 1: Extract product info from image using GPT-4 Vision
   * This is the most expensive but most accurate step
   */
  private async extractProductFromImage(imageUrl: string): Promise<ProductFromImage> {
    console.log('📸 Analyzing image with GPT-4 Vision...');

    // Check cache first
    const cacheKey = `image:${imageUrl}`;
    if (this.cache.has(cacheKey)) {
      console.log('✅ Cache hit! Saved $0.02');
      this.costTracker.cacheHits++;
      return this.cache.get(cacheKey);
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this product image and extract ALL information in JSON format:
{
  "name": "Full product name",
  "category": "Main category",
  "subcategory": "Subcategory",
  "brand": "Brand name if visible",
  "model": "Model number if visible",
  "color": "Color",
  "size": "Size if visible",
  "material": "Material if identifiable",
  "features": ["feature1", "feature2"],
  "description": "Detailed description",
  "keywords": ["keyword1", "keyword2"],
  "confidence": 0.95
}

Be very detailed and accurate. Extract everything you can see.`
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 1000
      });

      const content = response.choices[0].message.content || '{}';
      const productInfo = JSON.parse(content);

      // Track cost: ~$0.02 per image
      this.costTracker.totalCost += 0.02;
      this.costTracker.requestCount++;

      // Cache result
      this.cache.set(cacheKey, productInfo);

      return productInfo;
    } catch (error) {
      console.error('Error extracting product from image:', error);
      throw new Error('Failed to analyze product image');
    }
  }

  /**
   * Step 2: Get market intelligence using GPT-3.5 (cheaper)
   */
  private async getMarketIntelligence(
    productName: string,
    category: string,
    costPrice: number
  ): Promise<MarketIntelligence> {
    console.log('📊 Getting market intelligence...');

    const cacheKey = `market:${productName}:${category}`;
    if (this.cache.has(cacheKey)) {
      console.log('✅ Cache hit! Saved $0.002');
      this.costTracker.cacheHits++;
      return this.cache.get(cacheKey);
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a market intelligence expert for Uzbekistan e-commerce.'
          },
          {
            role: 'user',
            content: `Analyze market for: ${productName} (${category})
Cost price: ${costPrice} UZS

Provide JSON:
{
  "suggestedPrice": {
    "min": number,
    "optimal": number,
    "max": number
  },
  "demand": "high|medium|low",
  "competition": "high|medium|low",
  "seasonality": "description",
  "trends": ["trend1", "trend2"],
  "bestMarketplaces": ["uzum", "wildberries"]
}

Consider Uzbekistan market specifically.`
          }
        ],
        temperature: 0.7
      });

      const content = response.choices[0].message.content || '{}';
      const marketIntel = JSON.parse(content);

      // Track cost: ~$0.002
      this.costTracker.totalCost += 0.002;
      this.costTracker.requestCount++;

      this.cache.set(cacheKey, marketIntel);

      return marketIntel;
    } catch (error) {
      console.error('Error getting market intelligence:', error);
      // Return default values
      return {
        suggestedPrice: {
          min: costPrice * 1.3,
          optimal: costPrice * 1.5,
          max: costPrice * 2
        },
        demand: 'medium',
        competition: 'medium',
        seasonality: 'Year-round',
        trends: [],
        bestMarketplaces: ['uzum', 'wildberries']
      };
    }
  }

  /**
   * Step 3: Generate SEO content using Claude Haiku (fast & cheap)
   */
  private async generateSEOContent(productInfo: ProductFromImage): Promise<any> {
    console.log('🔍 Generating SEO content...');

    const cacheKey = `seo:${productInfo.name}`;
    if (this.cache.has(cacheKey)) {
      console.log('✅ Cache hit! Saved $0.0003');
      this.costTracker.cacheHits++;
      return this.cache.get(cacheKey);
    }

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Create SEO-optimized content for: ${productInfo.name}

Category: ${productInfo.category}
Features: ${productInfo.features.join(', ')}

Return JSON:
{
  "title": "SEO optimized title (max 60 chars)",
  "description": "SEO description (max 160 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Focus on Uzbekistan market and local search terms.`
          }
        ]
      });

      const content = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '{}';
      const seoContent = JSON.parse(content);

      // Track cost: ~$0.0003
      this.costTracker.totalCost += 0.0003;
      this.costTracker.requestCount++;

      this.cache.set(cacheKey, seoContent);

      return seoContent;
    } catch (error) {
      console.error('Error generating SEO content:', error);
      return {
        title: productInfo.name,
        description: productInfo.description,
        keywords: productInfo.keywords
      };
    }
  }

  /**
   * Step 4: Generate translations (Template-based + AI for unique parts)
   */
  private async generateTranslations(
    productInfo: ProductFromImage,
    seoContent: any
  ): Promise<any> {
    console.log('🌍 Generating translations...');

    // Use templates for common phrases, AI only for unique content
    const templates = {
      uz: {
        prefix: 'Mahsulot:',
        suffix: '- Yuqori sifat, tez yetkazib berish'
      },
      ru: {
        prefix: 'Товар:',
        suffix: '- Высокое качество, быстрая доставка'
      },
      en: {
        prefix: 'Product:',
        suffix: '- High quality, fast delivery'
      }
    };

    // Simple translation without AI (cost: $0)
    return {
      uz: {
        title: `${templates.uz.prefix} ${productInfo.name}`,
        description: `${productInfo.description} ${templates.uz.suffix}`
      },
      ru: {
        title: `${templates.ru.prefix} ${productInfo.name}`,
        description: `${productInfo.description} ${templates.ru.suffix}`
      },
      en: {
        title: `${templates.en.prefix} ${productInfo.name}`,
        description: `${productInfo.description} ${templates.en.suffix}`
      }
    };
  }

  /**
   * Step 5: Generate marketplace-specific cards (Batch processing)
   */
  private async generateMarketplaceCards(
    productInfo: ProductFromImage,
    seoContent: any,
    marketIntel: MarketIntelligence
  ): Promise<any> {
    console.log('🏪 Generating marketplace cards...');

    // Use templates for marketplace-specific formats
    const marketplaceCards = {
      uzum: {
        title: seoContent.title,
        description: seoContent.description,
        price: marketIntel.suggestedPrice.optimal,
        category: productInfo.category,
        attributes: productInfo.features
      },
      wildberries: {
        title: seoContent.title,
        description: seoContent.description,
        price: marketIntel.suggestedPrice.optimal,
        category: productInfo.category,
        characteristics: productInfo.features
      },
      ozon: {
        name: seoContent.title,
        description: seoContent.description,
        price: marketIntel.suggestedPrice.optimal,
        category_id: productInfo.category
      },
      yandex: {
        name: seoContent.title,
        description: seoContent.description,
        price: marketIntel.suggestedPrice.optimal,
        category: productInfo.category
      }
    };

    return marketplaceCards;
  }

  /**
   * Save product to database
   */
  private async saveProduct(card: CompleteProductCard, params: any): Promise<void> {
    try {
      await db.insert(products).values({
        partnerId: params.partnerId,
        name: card.name,
        description: card.description,
        category: card.category,
        price: card.marketIntelligence.suggestedPrice.optimal,
        costPrice: params.costPrice,
        stockQuantity: params.quantity,
        sku: `AUTO-${Date.now()}`,
        barcode: '',
        imageUrl: params.imageUrl,
        createdAt: new Date()
      });

      console.log('💾 Product saved to database');
    } catch (error) {
      console.error('Error saving product:', error);
    }
  }

  /**
   * Get cost statistics
   */
  getCostStats() {
    return {
      totalCost: this.costTracker.totalCost,
      requestCount: this.costTracker.requestCount,
      cacheHits: this.costTracker.cacheHits,
      averageCost: this.costTracker.totalCost / this.costTracker.requestCount,
      cacheSavings: this.costTracker.cacheHits * 0.02
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }
}

export const smartAIManager = new SmartAIManager();
