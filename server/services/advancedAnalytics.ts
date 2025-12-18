import { db } from '../db';
import { orders, products, partners } from '@shared/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { openai } from './openaiService';

interface PredictionResult {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  insights: string[];
}

interface AnalyticsDashboard {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    growthRate: number;
  };
  predictions: PredictionResult[];
  recommendations: string[];
  alerts: any[];
  trends: any[];
}

class AdvancedAnalyticsService {
  /**
   * Get comprehensive analytics dashboard
   */
  async getDashboard(partnerId: string, dateRange: { start: Date; end: Date }): Promise<AnalyticsDashboard> {
    const overview = await this.getOverview(partnerId, dateRange);
    const predictions = await this.generatePredictions(partnerId);
    const recommendations = await this.generateRecommendations(partnerId, overview);
    const alerts = await this.getAlerts(partnerId);
    const trends = await this.analyzeTrends(partnerId, dateRange);

    return {
      overview,
      predictions,
      recommendations,
      alerts,
      trends
    };
  }

  /**
   * Get overview metrics
   */
  private async getOverview(partnerId: string, dateRange: { start: Date; end: Date }): Promise<any> {
    // Get total revenue
    const revenueResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`
      })
      .from(orders)
      .where(
        and(
          eq(orders.partnerId, partnerId),
          gte(orders.createdAt, dateRange.start),
          lte(orders.createdAt, dateRange.end)
        )
      );

    const totalRevenue = revenueResult[0]?.total || 0;

    // Get total orders
    const ordersResult = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(orders)
      .where(
        and(
          eq(orders.partnerId, partnerId),
          gte(orders.createdAt, dateRange.start),
          lte(orders.createdAt, dateRange.end)
        )
      );

    const totalOrders = ordersResult[0]?.count || 0;

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get previous period for growth calculation
    const periodLength = dateRange.end.getTime() - dateRange.start.getTime();
    const previousStart = new Date(dateRange.start.getTime() - periodLength);
    const previousEnd = dateRange.start;

    const previousRevenueResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`
      })
      .from(orders)
      .where(
        and(
          eq(orders.partnerId, partnerId),
          gte(orders.createdAt, previousStart),
          lte(orders.createdAt, previousEnd)
        )
      );

    const previousRevenue = previousRevenueResult[0]?.total || 0;
    const growthRate = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      conversionRate: 0, // Calculate based on traffic data
      growthRate
    };
  }

  /**
   * Generate ML-based predictions
   */
  private async generatePredictions(partnerId: string): Promise<PredictionResult[]> {
    // Get historical data
    const historicalData = await this.getHistoricalData(partnerId, 90); // Last 90 days

    // Use simple linear regression for predictions
    const predictions: PredictionResult[] = [];

    // Revenue prediction
    const revenuePrediction = this.predictMetric(
      historicalData.map(d => d.revenue),
      'revenue'
    );
    predictions.push(revenuePrediction);

    // Orders prediction
    const ordersPrediction = this.predictMetric(
      historicalData.map(d => d.orders),
      'orders'
    );
    predictions.push(ordersPrediction);

    // Average order value prediction
    const aovPrediction = this.predictMetric(
      historicalData.map(d => d.averageOrderValue),
      'averageOrderValue'
    );
    predictions.push(aovPrediction);

    return predictions;
  }

  /**
   * Predict metric using linear regression
   */
  private predictMetric(data: number[], metricName: string): PredictionResult {
    if (data.length < 7) {
      return {
        metric: metricName,
        currentValue: data[data.length - 1] || 0,
        predictedValue: data[data.length - 1] || 0,
        confidence: 0,
        trend: 'stable',
        insights: ['Insufficient data for prediction']
      };
    }

    // Simple linear regression
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict next value
    const predictedValue = slope * n + intercept;
    const currentValue = data[data.length - 1];

    // Calculate confidence (R-squared)
    const yMean = sumY / n;
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const ssResidual = y.reduce((sum, yi, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    const rSquared = 1 - (ssResidual / ssTotal);
    const confidence = Math.max(0, Math.min(100, rSquared * 100));

    // Determine trend
    const trend = slope > 0.05 ? 'up' : slope < -0.05 ? 'down' : 'stable';

    // Generate insights
    const insights: string[] = [];
    const changePercent = ((predictedValue - currentValue) / currentValue) * 100;

    if (trend === 'up') {
      insights.push(`Expected ${Math.abs(changePercent).toFixed(1)}% increase`);
      insights.push('Positive momentum detected');
    } else if (trend === 'down') {
      insights.push(`Expected ${Math.abs(changePercent).toFixed(1)}% decrease`);
      insights.push('Consider intervention strategies');
    } else {
      insights.push('Stable performance expected');
    }

    if (confidence > 80) {
      insights.push('High confidence prediction');
    } else if (confidence > 60) {
      insights.push('Moderate confidence prediction');
    } else {
      insights.push('Low confidence - volatile data');
    }

    return {
      metric: metricName,
      currentValue,
      predictedValue,
      confidence,
      trend,
      insights
    };
  }

  /**
   * Get historical data
   */
  private async getHistoricalData(partnerId: string, days: number): Promise<any[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Group by day
    const data: any[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = await db
        .select({
          count: sql<number>`COUNT(*)`,
          total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`
        })
        .from(orders)
        .where(
          and(
            eq(orders.partnerId, partnerId),
            gte(orders.createdAt, date),
            lte(orders.createdAt, nextDate)
          )
        );

      const count = dayOrders[0]?.count || 0;
      const total = dayOrders[0]?.total || 0;

      data.push({
        date,
        orders: count,
        revenue: total,
        averageOrderValue: count > 0 ? total / count : 0
      });
    }

    return data;
  }

  /**
   * Generate AI-powered recommendations
   */
  private async generateRecommendations(partnerId: string, overview: any): Promise<string[]> {
    const prompt = `
As an e-commerce analytics expert, analyze this business data and provide 5 actionable recommendations:

Metrics:
- Total Revenue: ${overview.totalRevenue} UZS
- Total Orders: ${overview.totalOrders}
- Average Order Value: ${overview.averageOrderValue} UZS
- Growth Rate: ${overview.growthRate}%

Provide specific, actionable recommendations to improve performance.
Format: Numbered list, each recommendation in one concise sentence.
    `.trim();

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      });

      const recommendations = completion.choices[0].message.content || '';
      return recommendations.split('\n').filter(r => r.trim().length > 0);
    } catch (error) {
      console.error('AI recommendations error:', error);
      return [
        'Increase average order value through upselling',
        'Optimize product pricing based on competitor analysis',
        'Improve conversion rate with better product descriptions',
        'Expand to additional marketplaces',
        'Implement automated marketing campaigns'
      ];
    }
  }

  /**
   * Get alerts
   */
  private async getAlerts(partnerId: string): Promise<any[]> {
    const alerts: any[] = [];

    // Check for low stock products
    const lowStockProducts = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.partnerId, partnerId),
          sql`${products.stockQuantity} <= ${products.lowStockThreshold}`
        )
      );

    if (lowStockProducts.length > 0) {
      alerts.push({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${lowStockProducts.length} products are running low on stock`,
        action: 'View Products',
        priority: 'high'
      });
    }

    // Check for pending orders
    const pendingOrders = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(
        and(
          eq(orders.partnerId, partnerId),
          eq(orders.status, 'pending')
        )
      );

    const pendingCount = pendingOrders[0]?.count || 0;
    if (pendingCount > 10) {
      alerts.push({
        type: 'info',
        title: 'Pending Orders',
        message: `You have ${pendingCount} pending orders to process`,
        action: 'View Orders',
        priority: 'medium'
      });
    }

    return alerts;
  }

  /**
   * Analyze trends
   */
  private async analyzeTrends(partnerId: string, dateRange: { start: Date; end: Date }): Promise<any[]> {
    // Get top selling products
    const topProducts = await db
      .select({
        productId: orders.id,
        productName: products.name,
        totalSales: sql<number>`COUNT(*)`,
        totalRevenue: sql<number>`SUM(${orders.totalAmount})`
      })
      .from(orders)
      .leftJoin(products, eq(orders.partnerId, products.partnerId))
      .where(
        and(
          eq(orders.partnerId, partnerId),
          gte(orders.createdAt, dateRange.start),
          lte(orders.createdAt, dateRange.end)
        )
      )
      .groupBy(orders.id, products.name)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    return topProducts.map(p => ({
      type: 'product',
      name: p.productName,
      sales: p.totalSales,
      revenue: p.totalRevenue,
      trend: 'up'
    }));
  }

  /**
   * Get customer lifetime value prediction
   */
  async predictCustomerLTV(partnerId: string, customerId: string): Promise<{
    currentValue: number;
    predictedLTV: number;
    confidence: number;
    insights: string[];
  }> {
    // Get customer order history
    const customerOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.partnerId, partnerId),
          sql`${orders.customerEmail} = (SELECT email FROM customers WHERE id = ${customerId})`
        )
      )
      .orderBy(orders.createdAt);

    if (customerOrders.length === 0) {
      return {
        currentValue: 0,
        predictedLTV: 0,
        confidence: 0,
        insights: ['No order history available']
      };
    }

    const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = totalSpent / customerOrders.length;
    const daysSinceFirst = (Date.now() - customerOrders[0].createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const orderFrequency = customerOrders.length / (daysSinceFirst / 30); // Orders per month

    // Simple LTV prediction: AOV × Purchase Frequency × Customer Lifespan
    const predictedLifespan = 24; // months
    const predictedLTV = avgOrderValue * orderFrequency * predictedLifespan;

    const insights: string[] = [];
    insights.push(`Average order value: ${avgOrderValue.toLocaleString()} UZS`);
    insights.push(`Order frequency: ${orderFrequency.toFixed(1)} orders/month`);
    insights.push(`Customer since: ${Math.floor(daysSinceFirst)} days`);

    if (orderFrequency > 2) {
      insights.push('High-value customer - prioritize retention');
    } else if (orderFrequency < 0.5) {
      insights.push('At-risk customer - consider re-engagement campaign');
    }

    return {
      currentValue: totalSpent,
      predictedLTV,
      confidence: Math.min(90, customerOrders.length * 10),
      insights
    };
  }

  /**
   * Churn prediction
   */
  async predictChurn(partnerId: string): Promise<{
    atRiskCustomers: number;
    churnRate: number;
    recommendations: string[];
  }> {
    // Get all customers with their last order date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactiveCustomers = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${orders.customerEmail})`
      })
      .from(orders)
      .where(
        and(
          eq(orders.partnerId, partnerId),
          lte(orders.createdAt, thirtyDaysAgo)
        )
      );

    const atRiskCustomers = inactiveCustomers[0]?.count || 0;

    const totalCustomers = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${orders.customerEmail})`
      })
      .from(orders)
      .where(eq(orders.partnerId, partnerId));

    const total = totalCustomers[0]?.count || 1;
    const churnRate = (atRiskCustomers / total) * 100;

    const recommendations = [
      'Send re-engagement email campaign to inactive customers',
      'Offer special discount to customers who haven\'t ordered in 30+ days',
      'Implement loyalty program to increase retention',
      'Analyze why customers are churning and address pain points',
      'Set up automated win-back campaigns'
    ];

    return {
      atRiskCustomers,
      churnRate,
      recommendations
    };
  }

  /**
   * Seasonal trend analysis
   */
  async analyzeSeasonalTrends(partnerId: string): Promise<{
    peakMonths: string[];
    lowMonths: string[];
    seasonalityScore: number;
    insights: string[];
  }> {
    // Get monthly data for the past year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const monthlyData = await db
      .select({
        month: sql<string>`strftime('%Y-%m', ${orders.createdAt})`,
        revenue: sql<number>`SUM(${orders.totalAmount})`,
        orders: sql<number>`COUNT(*)`
      })
      .from(orders)
      .where(
        and(
          eq(orders.partnerId, partnerId),
          gte(orders.createdAt, oneYearAgo)
        )
      )
      .groupBy(sql`strftime('%Y-%m', ${orders.createdAt})`)
      .orderBy(sql`strftime('%Y-%m', ${orders.createdAt})`);

    if (monthlyData.length < 6) {
      return {
        peakMonths: [],
        lowMonths: [],
        seasonalityScore: 0,
        insights: ['Insufficient data for seasonal analysis']
      };
    }

    const revenues = monthlyData.map(d => d.revenue);
    const avgRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length;
    const variance = revenues.reduce((sum, r) => sum + Math.pow(r - avgRevenue, 2), 0) / revenues.length;
    const seasonalityScore = Math.min(100, (Math.sqrt(variance) / avgRevenue) * 100);

    // Find peak and low months
    const sorted = [...monthlyData].sort((a, b) => b.revenue - a.revenue);
    const peakMonths = sorted.slice(0, 3).map(d => d.month);
    const lowMonths = sorted.slice(-3).map(d => d.month);

    const insights: string[] = [];
    if (seasonalityScore > 50) {
      insights.push('High seasonality detected - plan inventory accordingly');
      insights.push(`Peak months: ${peakMonths.join(', ')}`);
      insights.push(`Low months: ${lowMonths.join(', ')}`);
    } else {
      insights.push('Low seasonality - consistent demand throughout year');
    }

    return {
      peakMonths,
      lowMonths,
      seasonalityScore,
      insights
    };
  }
}

export const advancedAnalytics = new AdvancedAnalyticsService();
