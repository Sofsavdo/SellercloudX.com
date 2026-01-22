// Marketplace Analytics Service
// Yandex Market va Uzum Market analitikalarini birlashtirish va AI tahlil qilish

import { db } from '../db';
import { marketplaceIntegrations } from '@shared/schema';
import { eq } from 'drizzle-orm';
import YandexMarketService from './yandexMarketService';
import UzumMarketService from './uzumMarketService';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

interface MarketplaceAnalytics {
  marketplace: string;
  period: string;
  sales: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    growth: number; // %
  };
  products: {
    total: number;
    active: number;
    topSelling: Array<{
      productId: string;
      name: string;
      sales: number;
      revenue: number;
    }>;
  };
  performance: {
    qualityScore?: number; // Yandex uchun
    fulfillmentRate: number;
    responseTime: number;
    customerSatisfaction: number;
  };
  insights: string[]; // AI-generated insights
  recommendations: string[]; // AI-generated recommendations
}

/**
 * Barcha marketplace integratsiyalari uchun analitikani yig'ish
 */
export async function collectMarketplaceAnalytics(
  partnerId: string,
  period: { from: Date; to: Date }
): Promise<MarketplaceAnalytics[]> {
  console.log(`📊 Collecting marketplace analytics for partner ${partnerId}`);

  try {
    // Get all active marketplace integrations
    const integrations = await db
      .select()
      .from(marketplaceIntegrations)
      .where(eq(marketplaceIntegrations.partnerId, partnerId))
      .where(eq(marketplaceIntegrations.active, true));

    const analytics: MarketplaceAnalytics[] = [];

    for (const integration of integrations) {
      try {
        let marketplaceData: MarketplaceAnalytics | null = null;

        if (integration.marketplace === 'yandex') {
          const yandexService = new YandexMarketService({
            apiKey: integration.apiKey || '',
            oauthToken: integration.apiSecret,
            campaignId: integration.sellerId,
          });

          const yandexAnalytics = await yandexService.getAnalytics(
            integration.sellerId,
            period.from.toISOString(),
            period.to.toISOString()
          );

          const qualityIndex = await yandexService.getQualityIndex(integration.sellerId);

          marketplaceData = {
            marketplace: 'yandex',
            period: `${period.from.toISOString()} - ${period.to.toISOString()}`,
            sales: {
              totalRevenue: yandexAnalytics.orders.revenue,
              totalOrders: yandexAnalytics.orders.total,
              averageOrderValue: yandexAnalytics.orders.averageOrderValue,
              growth: 0, // Calculate from previous period
            },
            products: {
              total: 0, // Get from products list
              active: 0,
              topSelling: [],
            },
            performance: {
              qualityScore: qualityIndex,
              fulfillmentRate: 0,
              responseTime: 0,
              customerSatisfaction: 0,
            },
            insights: [],
            recommendations: [],
          };
        } else if (integration.marketplace === 'uzum') {
          const uzumService = new UzumMarketService({
            apiKey: integration.apiKey || '',
            accessToken: integration.apiSecret,
            sellerId: integration.sellerId,
          });

          const uzumAnalytics = await uzumService.getAnalytics(
            period.from.toISOString(),
            period.to.toISOString()
          );

          const topProducts = await uzumService.getTopProducts(10);

          marketplaceData = {
            marketplace: 'uzum',
            period: `${period.from.toISOString()} - ${period.to.toISOString()}`,
            sales: {
              totalRevenue: uzumAnalytics.sales.totalRevenue,
              totalOrders: uzumAnalytics.sales.totalOrders,
              averageOrderValue: uzumAnalytics.sales.averageOrderValue,
              growth: 0,
            },
            products: {
              total: 0,
              active: 0,
              topSelling: topProducts.map(p => ({
                productId: p.productId,
                name: p.name,
                sales: p.sales,
                revenue: 0,
              })),
            },
            performance: {
              fulfillmentRate: uzumAnalytics.performance.fulfillmentRate,
              responseTime: uzumAnalytics.performance.responseTime,
              customerSatisfaction: uzumAnalytics.performance.customerSatisfaction,
            },
            insights: [],
            recommendations: [],
          };
        }

        if (marketplaceData) {
          // Generate AI insights and recommendations
          const aiAnalysis = await generateAIAnalysis(marketplaceData);
          marketplaceData.insights = aiAnalysis.insights;
          marketplaceData.recommendations = aiAnalysis.recommendations;

          analytics.push(marketplaceData);
        }
      } catch (error: any) {
        console.error(`Error collecting analytics for ${integration.marketplace}:`, error);
      }
    }

    return analytics;
  } catch (error: any) {
    console.error('Marketplace analytics collection error:', error);
    return [];
  }
}

/**
 * AI orqali analitikani tahlil qilish va tavsiyalar berish
 */
async function generateAIAnalysis(
  analytics: MarketplaceAnalytics
): Promise<{ insights: string[]; recommendations: string[] }> {
  try {
    const prompt = `
Siz professional e-commerce analitika mutaxassisisiz. Quyidagi marketplace analitikasini tahlil qiling:

MARKETPLACE: ${analytics.marketplace}
PERIOD: ${analytics.period}

SALES:
- Total Revenue: ${analytics.sales.totalRevenue}
- Total Orders: ${analytics.sales.totalOrders}
- Average Order Value: ${analytics.sales.averageOrderValue}
- Growth: ${analytics.sales.growth}%

PRODUCTS:
- Total: ${analytics.products.total}
- Active: ${analytics.products.active}
- Top Selling: ${analytics.products.topSelling.length} products

PERFORMANCE:
- Quality Score: ${analytics.performance.qualityScore || 'N/A'}
- Fulfillment Rate: ${analytics.performance.fulfillmentRate}%
- Response Time: ${analytics.performance.responseTime}ms
- Customer Satisfaction: ${analytics.performance.customerSatisfaction}%

VAZIFA:
Quyidagi JSON formatda javob bering:

{
  "insights": [
    "Insight 1 - muhim kuzatuvlar",
    "Insight 2 - tendentsiyalar",
    "Insight 3 - muammolar"
  ],
  "recommendations": [
    "Recommendation 1 - qanday yaxshilash mumkin",
    "Recommendation 2 - strategiya",
    "Recommendation 3 - optimizatsiya"
  ]
}

O'zbek yoki Rus tillarida javob bering.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Siz professional e-commerce analitika mutaxassisisiz. JSON formatda javob bering.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      insights: analysis.insights || [],
      recommendations: analysis.recommendations || []
    };
  } catch (error: any) {
    console.error('AI analysis error:', error);
    return {
      insights: ['Analitika yuklanmoqda...'],
      recommendations: ['Tavsiyalar tayyorlanmoqda...']
    };
  }
}

/**
 * Marketplace bo'yicha solishtirma analitika
 */
export async function compareMarketplaces(
  partnerId: string,
  period: { from: Date; to: Date }
): Promise<{
  comparison: Array<{
    marketplace: string;
    revenue: number;
    orders: number;
    performance: number;
  }>;
  bestPerformer: string;
  recommendations: string[];
}> {
  const analytics = await collectMarketplaceAnalytics(partnerId, period);

  const comparison = analytics.map(a => ({
    marketplace: a.marketplace,
    revenue: a.sales.totalRevenue,
    orders: a.sales.totalOrders,
    performance: a.performance.qualityScore || a.performance.fulfillmentRate || 0,
  }));

  const bestPerformer = comparison.reduce((best, current) =>
    current.revenue > best.revenue ? current : best
  ).marketplace;

  // Generate recommendations
  const recommendations = analytics
    .flatMap(a => a.recommendations)
    .slice(0, 5);

  return {
    comparison,
    bestPerformer,
    recommendations,
  };
}

export default {
  collectMarketplaceAnalytics,
  compareMarketplaces,
};

