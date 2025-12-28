// AI-Powered Price Strategy Service
// Real-time narx optimizatsiyasi, raqobatchilar kuzatish, dinamik narx o'zgartirish

import OpenAI from 'openai';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

interface CompetitorPrice {
  seller: string;
  price: number;
  rating: number;
  sales: number;
}

interface PriceStrategy {
  recommendedPrice: number;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  strategy: 'aggressive' | 'competitive' | 'premium' | 'value';
  reasoning: string;
  expectedImpact: {
    salesIncrease: number; // %
    revenueIncrease: number; // %
    profitChange: number; // %
  };
  competitorAnalysis: {
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    ourPosition: 'lowest' | 'average' | 'highest';
  };
  confidence: number; // 0-100
  risks: string[];
  alternatives: Array<{
    price: number;
    strategy: string;
    expectedOutcome: string;
  }>;
}

// Real-time price optimization
export async function optimizePriceRealTime(
  productId: string,
  marketplace: string,
  currentPrice: number
): Promise<PriceStrategy> {
  console.log(`💰 Optimizing price for product ${productId} on ${marketplace}`);

  try {
    // 1. Get competitor prices
    const competitors = await getCompetitorPrices(productId, marketplace);
    
    // 2. Get product sales history
    const salesHistory = await getSalesHistory(productId);
    
    // 3. Get market trends
    const marketTrends = await getMarketTrends(productId, marketplace);
    
    // 4. AI analysis
    const prompt = `
Siz professional narx strategiyasi mutaxassisisiz. Quyidagi ma'lumotlarni tahlil qiling va optimal narx strategiyasini taklif qiling.

MAHSULOT: ${productId}
MARKETPLACE: ${marketplace}
HOZIRGI NARX: ${currentPrice} so'm

RAQOBATCHILAR:
${JSON.stringify(competitors, null, 2)}

SAVDO TARIXI (oxirgi 30 kun):
${JSON.stringify(salesHistory, null, 2)}

BOZOR TRENDLARI:
${JSON.stringify(marketTrends, null, 2)}

VAZIFA:
Quyidagi JSON formatda javob bering:

{
  "recommendedPrice": 100000,
  "currentPrice": ${currentPrice},
  "priceChange": -5000,
  "priceChangePercent": -5,
  "strategy": "competitive",
  "reasoning": "Batafsil tushuntirish",
  "expectedImpact": {
    "salesIncrease": 15,
    "revenueIncrease": 10,
    "profitChange": 5
  },
  "competitorAnalysis": {
    "avgPrice": 95000,
    "minPrice": 85000,
    "maxPrice": 120000,
    "ourPosition": "average"
  },
  "confidence": 85,
  "risks": ["Risk 1", "Risk 2"],
  "alternatives": [
    {
      "price": 95000,
      "strategy": "aggressive",
      "expectedOutcome": "Savdo 25% oshadi, lekin foyda 10% kamayadi"
    }
  ]
}

MUHIM:
- Narx raqobatbardosh bo'lishi kerak
- Foyda marjasini saqlash kerak
- Bozor tendentsiyalarini hisobga olish kerak
- Real-time ma'lumotlarga asoslanish kerak
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Siz professional e-commerce narx strategiyasi mutaxassisisiz. JSON formatda javob bering.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const strategy: PriceStrategy = JSON.parse(response.choices[0].message.content || '{}');
    
    // Save price strategy to database
    await savePriceStrategy(productId, marketplace, strategy);
    
    return strategy;
  } catch (error: any) {
    console.error('Price optimization error:', error);
    throw error;
  }
}

// Monitor competitor prices continuously
export async function monitorCompetitorPrices(productId: string, marketplace: string) {
  console.log(`👁️ Monitoring competitors for product ${productId}`);
  
  try {
    const competitors = await getCompetitorPrices(productId, marketplace);
    
    // Check if significant price changes
    const [product] = await db.all(
      `SELECT * FROM products WHERE id = ?`,
      [productId]
    );
    
    if (product) {
      const avgCompetitorPrice = competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length;
      const priceDifference = ((product.price - avgCompetitorPrice) / avgCompetitorPrice) * 100;
      
      // Alert if price is too high or too low
      if (priceDifference > 20) {
        await createPriceAlert(productId, 'price_too_high', {
          ourPrice: product.price,
          avgCompetitorPrice,
          difference: priceDifference
        });
      } else if (priceDifference < -20) {
        await createPriceAlert(productId, 'price_too_low', {
          ourPrice: product.price,
          avgCompetitorPrice,
          difference: priceDifference
        });
      }
    }
    
    return competitors;
  } catch (error: any) {
    console.error('Competitor monitoring error:', error);
    return [];
  }
}

// Dynamic price adjustment
export async function adjustPriceDynamically(
  productId: string,
  marketplace: string,
  newPrice: number
): Promise<boolean> {
  console.log(`🔄 Adjusting price dynamically: ${productId} → ${newPrice}`);
  
  try {
    // Update product price
    await db.run(
      `UPDATE products SET price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newPrice, productId]
    );
    
    // Update marketplace price if product is published
    await db.run(
      `UPDATE ai_generated_products 
       SET suggested_price = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id IN (SELECT id FROM ai_generated_products WHERE raw_product_name = (SELECT name FROM products WHERE id = ?) LIMIT 1)`,
      [newPrice, productId]
    );
    
    // Log price change
    await db.run(
      `INSERT INTO price_history (product_id, marketplace, old_price, new_price, changed_at, reason)
       VALUES (?, ?, (SELECT price FROM products WHERE id = ?), ?, CURRENT_TIMESTAMP, 'dynamic_adjustment')`,
      [productId, marketplace, productId, newPrice]
    );
    
    return true;
  } catch (error: any) {
    console.error('Dynamic price adjustment error:', error);
    return false;
  }
}

// Helper functions
async function getCompetitorPrices(productId: string, marketplace: string): Promise<CompetitorPrice[]> {
  // In production, this would scrape marketplace APIs
  // For now, return mock data with some intelligence
  const [product] = await db.all(`SELECT * FROM products WHERE id = ?`, [productId]);
  
  if (!product) return [];
  
  // Mock competitor data (in production, use real scraping)
  return [
    { seller: 'Raqobatchi 1', price: parseFloat(product.price.toString()) * 0.9, rating: 4.5, sales: 150 },
    { seller: 'Raqobatchi 2', price: parseFloat(product.price.toString()) * 1.1, rating: 4.8, sales: 200 },
    { seller: 'Raqobatchi 3', price: parseFloat(product.price.toString()) * 0.95, rating: 4.3, sales: 100 }
  ];
}

async function getSalesHistory(productId: string) {
  const history = await db.all(
    `SELECT date, revenue, orders 
     FROM analytics 
     WHERE product_id = ? 
     ORDER BY date DESC 
     LIMIT 30`,
    [productId]
  );
  
  return history || [];
}

async function getMarketTrends(productId: string, marketplace: string) {
  // Get trending data for similar products
  return {
    demandTrend: 'increasing',
    seasonality: 'high',
    competitionLevel: 'medium'
  };
}

async function savePriceStrategy(productId: string, marketplace: string, strategy: PriceStrategy) {
  await db.run(
    `INSERT OR REPLACE INTO price_strategies 
     (product_id, marketplace, strategy_data, created_at, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [productId, marketplace, JSON.stringify(strategy)]
  );
}

async function createPriceAlert(productId: string, type: string, data: any) {
  await db.run(
    `INSERT INTO price_alerts (product_id, alert_type, alert_data, status, created_at)
     VALUES (?, ?, ?, 'open', CURRENT_TIMESTAMP)`,
    [productId, type, JSON.stringify(data)]
  );
}

export default {
  optimizePriceRealTime,
  monitorCompetitorPrices,
  adjustPriceDynamically
};

