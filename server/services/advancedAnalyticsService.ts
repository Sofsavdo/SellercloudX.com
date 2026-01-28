// @ts-nocheck
// Advanced Analytics Service
// Predictive analytics, Sales forecasting, Customer behavior analysis
// Fixed for PostgreSQL/SQLite compatibility

import { db, getDbType } from '../db';
import { analytics, orders, partners } from '@shared/schema';
import { eq, sql, desc, gte, and } from 'drizzle-orm';

interface SalesForecast {
  period: '7days' | '30days' | '90days' | '1year';
  predictedRevenue: number;
  predictedOrders: number;
  confidence: number;
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

// Safe date calculation function
function getDateDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// Sales forecasting with simple statistical analysis
export async function forecastSales(
  partnerId: string,
  period: '7days' | '30days' | '90days' | '1year'
): Promise<SalesForecast> {
  console.log(`📊 Forecasting sales for partner ${partnerId}, period: ${period}`);
  
  try {
    const days = period === '7days' ? 7 : period === '30days' ? 30 : period === '90days' ? 90 : 365;
    const lookbackDays = days * 2;
    const startDate = getDateDaysAgo(lookbackDays);
    
    // Get historical data using Drizzle ORM (PostgreSQL/SQLite compatible)
    let history: any[] = [];
    try {
      history = await db.select({
        metricType: analytics.metricType,
        value: analytics.value,
        date: analytics.date,
      })
      .from(analytics)
      .where(and(
        eq(analytics.partnerId, partnerId),
        gte(analytics.date, startDate)
      ))
      .orderBy(desc(analytics.date));
    } catch (dbError: any) {
      console.warn('[Analytics] Could not fetch history:', dbError.message);
      history = [];
    }
    
    // Calculate based on historical data or use defaults
    let totalRevenue = 0;
    let totalOrders = 0;
    let dataPoints = 0;
    
    for (const record of history) {
      if (record.metricType === 'revenue' || record.metricType === 'sales') {
        totalRevenue += Number(record.value) || 0;
        dataPoints++;
      } else if (record.metricType === 'orders') {
        totalOrders += Number(record.value) || 0;
      }
    }
    
    // Calculate averages
    const avgDailyRevenue = dataPoints > 0 ? totalRevenue / lookbackDays : 500000; // Default 500k UZS/day
    const avgDailyOrders = dataPoints > 0 ? totalOrders / lookbackDays : 5; // Default 5 orders/day
    
    // Project for the forecast period
    const predictedRevenue = Math.round(avgDailyRevenue * days);
    const predictedOrders = Math.round(avgDailyOrders * days);
    
    // Confidence based on data availability
    const confidence = dataPoints > 10 ? 85 : dataPoints > 5 ? 70 : 55;
    
    const forecast: SalesForecast = {
      period,
      predictedRevenue,
      predictedOrders,
      confidence,
      factors: [
        {
          factor: 'Mavjud ma\'lumotlar',
          impact: dataPoints > 10 ? 'positive' : 'neutral',
          weight: 0.4
        },
        {
          factor: 'Mavsumiylik',
          impact: 'neutral',
          weight: 0.3
        },
        {
          factor: 'Bozor tendensiyalari',
          impact: 'positive',
          weight: 0.3
        }
      ],
      scenarios: {
        best: { 
          revenue: Math.round(predictedRevenue * 1.3), 
          orders: Math.round(predictedOrders * 1.3) 
        },
        average: { 
          revenue: predictedRevenue, 
          orders: predictedOrders 
        },
        worst: { 
          revenue: Math.round(predictedRevenue * 0.7), 
          orders: Math.round(predictedOrders * 0.7) 
        }
      }
    };
    
    return forecast;
  } catch (error: any) {
    console.error('Sales forecasting error:', error.message);
    
    // Return default forecast on error
    return {
      period,
      predictedRevenue: 5000000,
      predictedOrders: 50,
      confidence: 40,
      factors: [
        { factor: 'Default bashorat', impact: 'neutral', weight: 1.0 }
      ],
      scenarios: {
        best: { revenue: 6500000, orders: 65 },
        average: { revenue: 5000000, orders: 50 },
        worst: { revenue: 3500000, orders: 35 }
      }
    };
  }
}

// Analyze customer behavior
export async function analyzeCustomerBehavior(partnerId: string): Promise<CustomerBehavior[]> {
  console.log(`👥 Analyzing customer behavior for partner ${partnerId}`);
  
  try {
    // Get orders for this partner using Drizzle ORM
    let partnerOrders: any[] = [];
    try {
      partnerOrders = await db.select({
        customerName: orders.customerName,
        customerEmail: orders.customerEmail,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.partnerId, partnerId))
      .orderBy(desc(orders.createdAt));
    } catch (dbError: any) {
      console.warn('[Analytics] Could not fetch orders:', dbError.message);
      partnerOrders = [];
    }
    
    // Group by customer
    const customerMap = new Map<string, any>();
    
    for (const order of partnerOrders) {
      const key = order.customerEmail || order.customerName || 'unknown';
      
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          totalAmount: 0,
          orderCount: 0,
          lastOrderDate: order.createdAt
        });
      }
      
      const customer = customerMap.get(key);
      customer.totalAmount += Number(order.totalAmount) || 0;
      customer.orderCount++;
      
      // Track most recent order
      const orderDate = new Date(order.createdAt);
      const lastDate = new Date(customer.lastOrderDate);
      if (orderDate > lastDate) {
        customer.lastOrderDate = order.createdAt;
      }
    }
    
    const behaviors: CustomerBehavior[] = [];
    
    for (const [key, customer] of customerMap) {
      const avgOrderValue = customer.totalAmount / customer.orderCount;
      
      // Calculate days since last order safely
      let daysSinceLastOrder = 0;
      try {
        const lastOrderDate = new Date(customer.lastOrderDate);
        if (!isNaN(lastOrderDate.getTime())) {
          daysSinceLastOrder = Math.floor(
            (Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
          );
        }
      } catch {
        daysSinceLastOrder = 30; // Default
      }
      
      let purchasePattern: 'frequent' | 'occasional' | 'one-time' = 'one-time';
      if (customer.orderCount > 5) {
        purchasePattern = 'frequent';
      } else if (customer.orderCount > 1) {
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
        preferredCategory: 'general',
        preferredMarketplace: 'uzum',
        churnRisk,
        recommendations: generateRecommendations(customer, churnRisk)
      });
    }
    
    return behaviors;
  } catch (error: any) {
    console.error('Customer behavior analysis error:', error.message);
    return [];
  }
}

// Predictive analytics
export async function predictTrends(partnerId: string, category: string) {
  console.log(`🔮 Predicting trends for partner ${partnerId}, category: ${category}`);
  
  try {
    // Simple trend prediction based on category
    const categoryTrends: Record<string, any> = {
      'electronics': {
        predictedTrend: 'increasing',
        confidence: 75,
        timeframe: 'next_3_months',
        factors: ['Yangi model chiqishlari', 'Bayram mavsumi'],
        recommendations: ['Zaxirani oshiring', 'Reklama kuchaytiring']
      },
      'clothing': {
        predictedTrend: 'stable',
        confidence: 70,
        timeframe: 'next_3_months',
        factors: ['Mavsumiy o\'zgarishlar', 'Fashion trendlari'],
        recommendations: ['Yangi kolleksiya qo\'shing', 'Chegirmalar o\'tkazing']
      },
      'home': {
        predictedTrend: 'increasing',
        confidence: 65,
        timeframe: 'next_3_months',
        factors: ['Uy-joy bozori o\'sishi', 'Ta\'mirlash mavsumi'],
        recommendations: ['Assortimentni kengaytiring']
      },
      'default': {
        predictedTrend: 'stable',
        confidence: 60,
        timeframe: 'next_3_months',
        factors: ['Umumiy bozor holati'],
        recommendations: ['Raqobatchilarni kuzating', 'Narxlarni optimallashtiring']
      }
    };
    
    return categoryTrends[category?.toLowerCase()] || categoryTrends['default'];
  } catch (error: any) {
    console.error('Trend prediction error:', error.message);
    return {
      predictedTrend: 'unknown',
      confidence: 0,
      timeframe: 'next_3_months',
      factors: [],
      recommendations: ['Ma\'lumot yetarli emas']
    };
  }
}

// Helper functions
function generateRecommendations(customer: any, churnRisk: string): string[] {
  const recommendations: string[] = [];
  
  if (churnRisk === 'high') {
    recommendations.push('Churn risk yuqori - maxsus taklif yuborish tavsiya etiladi');
    recommendations.push('Loyalty dasturiga qo\'shish');
  }
  
  if (customer.orderCount === 1) {
    recommendations.push('Ikkinchi xarid uchun chegirma taklif qilish');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Doimiy mijoz - sifatli xizmatni davom ettiring');
  }
  
  return recommendations;
}

export default {
  forecastSales,
  analyzeCustomerBehavior,
  predictTrends
};
