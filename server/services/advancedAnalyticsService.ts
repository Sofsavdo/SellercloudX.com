// Advanced Analytics Service
// Predictive analytics, Sales forecasting, Customer behavior analysis

import OpenAI from 'openai';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

interface SalesForecast {
  period: '7days' | '30days' | '90days' | '1year';
  predictedRevenue: number;
  predictedOrders: number;
  confidence: number; // 0-100
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }>;
  scenarios: {
    best: { revenue: number; orders: number };
    average: { revenue: number; orders: number };
    worst: { revenue: number; orders: number };
  };
}

interface CustomerBehavior {
  customerSegment: string;
  purchasePattern: 'frequent' | 'occasional' | 'one-time';
  averageOrderValue: number;
  preferredCategory: string;
  preferredMarketplace: string;
  churnRisk: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Sales forecasting with AI
export async function forecastSales(
  partnerId: string,
  period: '7days' | '30days' | '90days' | '1year'
): Promise<SalesForecast> {
  console.log(`📊 Forecasting sales for partner ${partnerId}, period: ${period}`);
  
  try {
    // Get historical data
    const days = period === '7days' ? 7 : period === '30days' ? 30 : period === '90days' ? 90 : 365;
    
    const history = await db.all(
      `SELECT date, revenue, orders 
       FROM analytics 
       WHERE partner_id = ? 
       AND date >= date('now', '-${days * 2} days')
       ORDER BY date`,
      [partnerId]
    );
    
    // Get current trends
    const currentTrends = await analyzeTrends(partnerId);
    
    // AI forecasting
    const prompt = `
Siz professional sales forecasting mutaxassisisiz. Quyidagi ma'lumotlarni tahlil qiling va bashorat qiling.

HISTORICAL DATA (oxirgi ${days * 2} kun):
${JSON.stringify(history, null, 2)}

CURRENT TRENDS:
${JSON.stringify(currentTrends, null, 2)}

PERIOD: ${period}

VAZIFA:
Quyidagi JSON formatda javob bering:

{
  "period": "${period}",
  "predictedRevenue": 5000000,
  "predictedOrders": 150,
  "confidence": 85,
  "factors": [
    {
      "factor": "Seasonality",
      "impact": "positive",
      "weight": 0.3
    }
  ],
  "scenarios": {
    "best": { "revenue": 6000000, "orders": 180 },
    "average": { "revenue": 5000000, "orders": 150 },
    "worst": { "revenue": 4000000, "orders": 120 }
  }
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Siz professional sales forecasting mutaxassisisiz. JSON formatda javob bering.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5
    });

    const forecast: SalesForecast = JSON.parse(response.choices[0].message.content || '{}');
    
    // Save forecast
    await db.run(
      `INSERT INTO sales_forecasts 
       (partner_id, period, forecast_data, created_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [partnerId, period, JSON.stringify(forecast)]
    );
    
    return forecast;
  } catch (error: any) {
    console.error('Sales forecasting error:', error);
    throw error;
  }
}

// Analyze customer behavior
export async function analyzeCustomerBehavior(partnerId: string): Promise<CustomerBehavior[]> {
  console.log(`👥 Analyzing customer behavior for partner ${partnerId}`);
  
  try {
    // Get customer data
    const customers = await db.all(
      `SELECT customer_name, customer_email, total_amount, order_count, last_order_date
       FROM (
         SELECT 
           customer_name,
           customer_email,
           SUM(total_amount) as total_amount,
           COUNT(*) as order_count,
           MAX(created_at) as last_order_date
         FROM orders
         WHERE partner_id = ?
         GROUP BY customer_name, customer_email
       )`,
      [partnerId]
    );
    
    const behaviors: CustomerBehavior[] = [];
    
    for (const customer of customers) {
      const avgOrderValue = customer.total_amount / customer.order_count;
      const daysSinceLastOrder = Math.floor(
        (Date.now() - new Date(customer.last_order_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      let purchasePattern: 'frequent' | 'occasional' | 'one-time' = 'one-time';
      if (customer.order_count > 5) {
        purchasePattern = 'frequent';
      } else if (customer.order_count > 1) {
        purchasePattern = 'occasional';
      }
      
      let churnRisk: 'low' | 'medium' | 'high' = 'low';
      if (daysSinceLastOrder > 90) {
        churnRisk = 'high';
      } else if (daysSinceLastOrder > 30) {
        churnRisk = 'medium';
      }
      
      behaviors.push({
        customerSegment: avgOrderValue > 500000 ? 'premium' : 'standard',
        purchasePattern,
        averageOrderValue: avgOrderValue,
        preferredCategory: 'general', // Would be calculated from order history
        preferredMarketplace: 'uzum', // Would be calculated from order history
        churnRisk,
        recommendations: generateRecommendations(customer, churnRisk)
      });
    }
    
    return behaviors;
  } catch (error: any) {
    console.error('Customer behavior analysis error:', error);
    return [];
  }
}

// Predictive analytics
export async function predictTrends(partnerId: string, category: string) {
  console.log(`🔮 Predicting trends for partner ${partnerId}, category: ${category}`);
  
  try {
    // Use AI to predict future trends
    const prompt = `
Quyidagi kategoriya uchun kelajakdagi trendlarni bashorat qiling.

KATEGORIYA: ${category}
REGION: O'zbekiston

JSON formatda javob bering:
{
  "predictedTrend": "increasing",
  "confidence": 75,
  "timeframe": "next_3_months",
  "factors": ["Factor 1", "Factor 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error: any) {
    console.error('Trend prediction error:', error);
    return null;
  }
}

// Helper functions
async function analyzeTrends(partnerId: string) {
  const recent = await db.all(
    `SELECT AVG(revenue) as avg_revenue, AVG(orders) as avg_orders
     FROM analytics
     WHERE partner_id = ? AND date >= date('now', '-30 days')`,
    [partnerId]
  );
  
  const previous = await db.all(
    `SELECT AVG(revenue) as avg_revenue, AVG(orders) as avg_orders
     FROM analytics
     WHERE partner_id = ? AND date >= date('now', '-60 days') AND date < date('now', '-30 days')`,
    [partnerId]
  );
  
  return {
    recent: recent[0] || { avg_revenue: 0, avg_orders: 0 },
    previous: previous[0] || { avg_revenue: 0, avg_orders: 0 }
  };
}

function generateRecommendations(customer: any, churnRisk: string): string[] {
  const recommendations: string[] = [];
  
  if (churnRisk === 'high') {
    recommendations.push('Churn risk yuqori - maxsus taklif yuborish tavsiya etiladi');
    recommendations.push('Loyalty dasturiga qo\'shish');
  }
  
  if (customer.order_count === 1) {
    recommendations.push('Ikkinchi xarid uchun chegirma taklif qilish');
  }
  
  return recommendations;
}

export default {
  forecastSales,
  analyzeCustomerBehavior,
  predictTrends
};

