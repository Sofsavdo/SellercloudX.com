// Trend Hunter Service - Market Intelligence & Profit Opportunity Detection
// Detects trending products from China/USA markets and calculates profit opportunities

import axios from 'axios';
import { db } from '../db';
import { trendingProducts } from '../../shared/schema';
import { desc, sql } from 'drizzle-orm';
import { formatDateForDB, getDatabaseType } from '../../shared/db-utils';

// ==================== TYPES ====================

export interface TrendingProduct {
  productName: string;
  category: string;
  imageUrl: string;
  sourceMarket: 'china' | 'usa' | 'global';
  sourcePrice: number; // USD or CNY
  sourceCurrency: string;
  
  // Market data
  salesVolume: number; // Monthly sales estimate
  salesGrowth: number; // % growth rate
  competitorCount: number;
  avgRating: number;
  reviewCount: number;
  
  // Links
  sourceUrl: string;
  aliexpressUrl?: string;
  amazonUrl?: string;
}

export interface ProfitOpportunity {
  product: TrendingProduct;
  
  // Cost analysis
  importCost: number; // Product + shipping from China/USA
  customsDuty: number; // Bojxona
  localLogistics: number;
  totalCost: number;
  
  // Market analysis
  localCompetitors: number; // O'zbekiston/Rossiya marketplacelarda
  localAvgPrice: number; // Local marketplace average price
  localDemand: 'high' | 'medium' | 'low';
  
  // Profit calculation
  recommendedPrice: number;
  profitMargin: number; // %
  monthlyProfitEstimate: number;
  roi: number; // Return on Investment %
  breakEvenUnits: number; // Nechta sotsa o'z pulini chiqaradi
  
  // Opportunity score (0-100)
  opportunityScore: number;
  
  // Analysis
  strengths: string[];
  risks: string[];
  recommendation: string;
}

// ==================== ALIEXPRESS API SERVICE ====================

class AliExpressService {
  private apiKey: string;
  private endpoint = 'https://api.aliexpress.com/v1';
  
  constructor(apiKey: string = '') {
    this.apiKey = apiKey;
  }
  
  async getTrendingProducts(category?: string, limit: number = 50): Promise<TrendingProduct[]> {
    try {
      // Note: AliExpress API yangi qoidalar bo'yicha affiliate API kerak
      // Hozircha mock data bilan ishlaymiz, keyin real API ga ulash mumkin
      
      // Alternative: Web scraping yoki third-party API (RapidAPI, etc.)
      return this.getMockTrendingProducts(category, limit);
    } catch (error) {
      console.error('AliExpress API error:', error);
      return [];
    }
  }
  
  private getMockTrendingProducts(category?: string, limit: number = 50): TrendingProduct[] {
    // Mock trending products from China market
    const mockProducts: TrendingProduct[] = [
      {
        productName: 'Wireless Earbuds TWS Bluetooth 5.3',
        category: 'electronics',
        imageUrl: 'https://example.com/earbuds.jpg',
        sourceMarket: 'china',
        sourcePrice: 3.5, // $3.5
        sourceCurrency: 'USD',
        salesVolume: 15000,
        salesGrowth: 45,
        competitorCount: 120,
        avgRating: 4.6,
        reviewCount: 8500,
        sourceUrl: 'https://aliexpress.com/item/...',
        aliexpressUrl: 'https://aliexpress.com/item/...',
      },
      {
        productName: 'Smart Watch Y68 Fitness Tracker',
        category: 'electronics',
        imageUrl: 'https://example.com/smartwatch.jpg',
        sourceMarket: 'china',
        sourcePrice: 8.2,
        sourceCurrency: 'USD',
        salesVolume: 12000,
        salesGrowth: 60,
        competitorCount: 85,
        avgRating: 4.4,
        reviewCount: 5200,
        sourceUrl: 'https://aliexpress.com/item/...',
        aliexpressUrl: 'https://aliexpress.com/item/...',
      },
      {
        productName: 'LED Strip Lights RGB 5m WiFi Control',
        category: 'home',
        imageUrl: 'https://example.com/ledstrip.jpg',
        sourceMarket: 'china',
        sourcePrice: 5.8,
        sourceCurrency: 'USD',
        salesVolume: 9500,
        salesGrowth: 38,
        competitorCount: 150,
        avgRating: 4.5,
        reviewCount: 6800,
        sourceUrl: 'https://aliexpress.com/item/...',
        aliexpressUrl: 'https://aliexpress.com/item/...',
      },
      {
        productName: 'Phone Holder Car Mount Magnetic',
        category: 'accessories',
        imageUrl: 'https://example.com/phone-holder.jpg',
        sourceMarket: 'china',
        sourcePrice: 2.1,
        sourceCurrency: 'USD',
        salesVolume: 18000,
        salesGrowth: 52,
        competitorCount: 200,
        avgRating: 4.7,
        reviewCount: 12000,
        sourceUrl: 'https://aliexpress.com/item/...',
        aliexpressUrl: 'https://aliexpress.com/item/...',
      },
      {
        productName: 'Mini Projector 4K WiFi Portable',
        category: 'electronics',
        imageUrl: 'https://example.com/projector.jpg',
        sourceMarket: 'china',
        sourcePrice: 45.0,
        sourceCurrency: 'USD',
        salesVolume: 3500,
        salesGrowth: 75,
        competitorCount: 45,
        avgRating: 4.3,
        reviewCount: 1850,
        sourceUrl: 'https://aliexpress.com/item/...',
        aliexpressUrl: 'https://aliexpress.com/item/...',
      },
    ];
    
    return mockProducts.slice(0, limit);
  }
}

// ==================== AMAZON TRENDS SERVICE ====================

class AmazonTrendsService {
  async getBestSellers(category?: string): Promise<TrendingProduct[]> {
    // Amazon Best Sellers API yoki Product Advertising API
    // Hozircha mock data
    const mockProducts: TrendingProduct[] = [
      {
        productName: 'Apple AirPods Pro 2nd Generation',
        category: 'electronics',
        imageUrl: 'https://example.com/airpods.jpg',
        sourceMarket: 'usa',
        sourcePrice: 189.99,
        sourceCurrency: 'USD',
        salesVolume: 25000,
        salesGrowth: 25,
        competitorCount: 15,
        avgRating: 4.8,
        reviewCount: 45000,
        sourceUrl: 'https://amazon.com/...',
        amazonUrl: 'https://amazon.com/...',
      },
      {
        productName: 'Anker PowerBank 20000mAh',
        category: 'electronics',
        imageUrl: 'https://example.com/powerbank.jpg',
        sourceMarket: 'usa',
        sourcePrice: 39.99,
        sourceCurrency: 'USD',
        salesVolume: 18000,
        salesGrowth: 30,
        competitorCount: 50,
        avgRating: 4.7,
        reviewCount: 28000,
        sourceUrl: 'https://amazon.com/...',
        amazonUrl: 'https://amazon.com/...',
      },
    ];
    
    return mockProducts;
  }
}

// ==================== LOCAL MARKETPLACE ANALYZER ====================

class LocalMarketplaceAnalyzer {
  async checkLocalCompetition(productName: string, category: string): Promise<{
    competitorCount: number;
    avgPrice: number;
    demand: 'high' | 'medium' | 'low';
  }> {
    // Bu yerda Wildberries, Ozon, Uzum API lardan ma'lumot olish kerak
    // Hozircha simplified logic
    
    // Product name bilan local marketplace da qidirish
    // Masalan: Wildberries API search endpoint
    
    // Mock data
    const randomCompetitors = Math.floor(Math.random() * 50);
    const avgPrice = Math.random() * 100000 + 50000; // 50k - 150k so'm
    
    return {
      competitorCount: randomCompetitors,
      avgPrice,
      demand: randomCompetitors < 10 ? 'high' : randomCompetitors < 30 ? 'medium' : 'low',
    };
  }
}

// ==================== PROFIT CALCULATOR ====================

class ProfitCalculator {
  private readonly USD_TO_UZS = 12600; // Kurs: 1 USD = 12600 UZS
  private readonly SHIPPING_PER_KG = 8; // $8 per kg from China
  private readonly CUSTOMS_RATE = 0.15; // 15% bojxona
  private readonly LOCAL_LOGISTICS = 10000; // 10k so'm local yetkazib berish
  
  calculateProfitOpportunity(
    product: TrendingProduct,
    localCompetition: { competitorCount: number; avgPrice: number; demand: string }
  ): ProfitOpportunity {
    // 1. Import cost calculation
    const productCostUSD = product.sourcePrice;
    const estimatedWeight = this.estimateProductWeight(product.category);
    const shippingCost = estimatedWeight * this.SHIPPING_PER_KG;
    const totalImportCostUSD = productCostUSD + shippingCost;
    
    // Convert to UZS
    const importCostUZS = totalImportCostUSD * this.USD_TO_UZS;
    
    // 2. Customs duty
    const customsDuty = importCostUZS * this.CUSTOMS_RATE;
    
    // 3. Total cost
    const totalCost = importCostUZS + customsDuty + this.LOCAL_LOGISTICS;
    
    // 4. Market analysis
    const { competitorCount, avgPrice, demand } = localCompetition;
    
    // 5. Pricing strategy
    let recommendedPrice: number;
    
    if (competitorCount === 0) {
      // No competition - premium pricing
      recommendedPrice = totalCost * 2.5; // 150% profit margin
    } else if (competitorCount < 10) {
      // Low competition - competitive pricing
      recommendedPrice = Math.min(avgPrice * 0.95, totalCost * 2.2); // 120% margin or 5% cheaper
    } else {
      // High competition - aggressive pricing
      recommendedPrice = Math.min(avgPrice * 0.9, totalCost * 1.8); // 80% margin or 10% cheaper
    }
    
    // Ensure minimum profit
    if (recommendedPrice < totalCost * 1.3) {
      recommendedPrice = totalCost * 1.3; // Minimum 30% profit
    }
    
    // 6. Profit calculation
    const profit = recommendedPrice - totalCost;
    const profitMargin = (profit / totalCost) * 100;
    const roi = (profit / totalCost) * 100;
    
    // 7. Monthly profit estimate (conservative)
    const monthlySalesEstimate = this.estimateMonthlySales(
      product.salesVolume,
      competitorCount,
      demand
    );
    const monthlyProfitEstimate = profit * monthlySalesEstimate;
    
    // 8. Break-even calculation
    const breakEvenUnits = Math.ceil(totalCost / profit);
    
    // 9. Opportunity score (0-100)
    const opportunityScore = this.calculateOpportunityScore(
      profitMargin,
      competitorCount,
      product.salesGrowth,
      demand,
      product.avgRating
    );
    
    // 10. Analysis
    const strengths: string[] = [];
    const risks: string[] = [];
    
    if (profitMargin > 80) strengths.push(`Yuqori foyda marjasi: ${profitMargin.toFixed(0)}%`);
    if (competitorCount < 10) strengths.push(`Kam raqobat: ${competitorCount} ta raqobatchi`);
    if (product.salesGrowth > 50) strengths.push(`Tez o'sish: ${product.salesGrowth}% o'sish`);
    if (demand === 'high') strengths.push('Yuqori talab');
    
    if (competitorCount > 30) risks.push(`Ko'p raqobat: ${competitorCount} ta`);
    if (profitMargin < 40) risks.push('Past foyda marjasi');
    if (product.avgRating < 4.0) risks.push('Past reyting');
    
    const recommendation = this.generateRecommendation(
      opportunityScore,
      profitMargin,
      competitorCount,
      demand
    );
    
    return {
      product,
      importCost: importCostUZS,
      customsDuty,
      localLogistics: this.LOCAL_LOGISTICS,
      totalCost,
      localCompetitors: competitorCount,
      localAvgPrice: avgPrice,
      localDemand: demand as 'high' | 'medium' | 'low',
      recommendedPrice,
      profitMargin,
      monthlyProfitEstimate,
      roi,
      breakEvenUnits,
      opportunityScore,
      strengths,
      risks,
      recommendation,
    };
  }
  
  private estimateProductWeight(category: string): number {
    // Estimate weight in kg based on category
    const weights: Record<string, number> = {
      electronics: 0.5,
      clothing: 0.3,
      home: 1.0,
      accessories: 0.2,
      toys: 0.4,
      beauty: 0.3,
      sports: 0.8,
    };
    
    return weights[category] || 0.5;
  }
  
  private estimateMonthlySales(
    sourceSales: number,
    localCompetitors: number,
    demand: string
  ): number {
    // Conservative estimate: 1-5% of source market sales
    const baseConversion = 0.02; // 2%
    
    // Adjust for competition
    const competitionFactor = Math.max(0.2, 1 - (localCompetitors / 100));
    
    // Adjust for demand
    const demandFactor = demand === 'high' ? 1.5 : demand === 'medium' ? 1.0 : 0.6;
    
    return Math.round(sourceSales * baseConversion * competitionFactor * demandFactor);
  }
  
  private calculateOpportunityScore(
    profitMargin: number,
    competitors: number,
    growthRate: number,
    demand: string,
    rating: number
  ): number {
    // Score components (0-100)
    const profitScore = Math.min(100, profitMargin); // Higher is better
    const competitionScore = Math.max(0, 100 - competitors * 2); // Lower is better
    const growthScore = Math.min(100, growthRate * 1.2); // Higher is better
    const demandScore = demand === 'high' ? 100 : demand === 'medium' ? 60 : 30;
    const qualityScore = (rating / 5) * 100; // 0-5 rating to 0-100
    
    // Weighted average
    const totalScore =
      profitScore * 0.3 +
      competitionScore * 0.25 +
      growthScore * 0.2 +
      demandScore * 0.15 +
      qualityScore * 0.1;
    
    return Math.round(totalScore);
  }
  
  private generateRecommendation(
    score: number,
    profitMargin: number,
    competitors: number,
    demand: string
  ): string {
    if (score >= 80) {
      return `⭐ EXCELLENT: Juda yaxshi imkoniyat! Yuqori foyda va kam raqobat. Darhol boshlang!`;
    } else if (score >= 65) {
      return `✅ GOOD: Yaxshi imkoniyat. ${profitMargin.toFixed(0)}% foyda va ${competitors} ta raqobatchi. Tavsiya etiladi.`;
    } else if (score >= 50) {
      return `⚠️ MODERATE: O'rtacha imkoniyat. Raqobat yuqori yoki foyda past. Ehtiyotkorlik bilan boshlang.`;
    } else {
      return `❌ LOW: Past imkoniyat. Raqobat juda yuqori yoki foyda kam. Boshqa mahsulot tanlang.`;
    }
  }
}

// ==================== MAIN TREND HUNTER SERVICE ====================

export class TrendHunterService {
  private aliexpressService: AliExpressService;
  private amazonService: AmazonTrendsService;
  private localAnalyzer: LocalMarketplaceAnalyzer;
  private profitCalculator: ProfitCalculator;
  
  constructor() {
    this.aliexpressService = new AliExpressService();
    this.amazonService = new AmazonTrendsService();
    this.localAnalyzer = new LocalMarketplaceAnalyzer();
    this.profitCalculator = new ProfitCalculator();
  }
  
  /**
   * Main function: Find profitable trending products
   */
  async findProfitableOpportunities(
    options: {
      category?: string;
      minProfitMargin?: number;
      maxCompetitors?: number;
      limit?: number;
    } = {}
  ): Promise<ProfitOpportunity[]> {
    const {
      category,
      minProfitMargin = 30,
      maxCompetitors = 50,
      limit = 20,
    } = options;
    
    try {
      // 1. Get trending products from China (AliExpress)
      const chinaTrends = await this.aliexpressService.getTrendingProducts(category, 30);
      
      // 2. Get trending products from USA (Amazon)
      const usaTrends = await this.amazonService.getBestSellers(category);
      
      // 3. Combine all trending products
      const allTrends = [...chinaTrends, ...usaTrends];
      
      // 4. Analyze each product for profit opportunity
      const opportunities: ProfitOpportunity[] = [];
      
      for (const product of allTrends) {
        // Check local competition
        const localCompetition = await this.localAnalyzer.checkLocalCompetition(
          product.productName,
          product.category
        );
        
        // Calculate profit opportunity
        const opportunity = this.profitCalculator.calculateProfitOpportunity(
          product,
          localCompetition
        );
        
        // Filter by criteria
        if (
          opportunity.profitMargin >= minProfitMargin &&
          opportunity.localCompetitors <= maxCompetitors
        ) {
          opportunities.push(opportunity);
        }
      }
      
      // 5. Sort by opportunity score (highest first)
      opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);
      
      // 6. Save to database for tracking
      await this.saveTrendingProducts(opportunities.slice(0, limit));
      
      // 7. Return top opportunities
      return opportunities.slice(0, limit);
    } catch (error: any) {
      console.error('Trend Hunter error:', error);
      throw error;
    }
  }
  
  /**
   * Get trending products by category
   */
  async getTrendsByCategory(category: string): Promise<ProfitOpportunity[]> {
    return this.findProfitableOpportunities({ category, limit: 10 });
  }
  
  /**
   * Get top opportunities (highest profit potential)
   */
  async getTopOpportunities(limit: number = 10): Promise<ProfitOpportunity[]> {
    return this.findProfitableOpportunities({ limit });
  }
  
  /**
   * Save trending products to database
   */
  private async saveTrendingProducts(opportunities: ProfitOpportunity[]): Promise<void> {
    const dbType = getDatabaseType();
    
    for (const opp of opportunities) {
      try {
        const now = new Date();
        
        await db.insert(trendingProducts).values({
          id: `trend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          marketplace: opp.product.sourceMarket,
          category: opp.product.category,
          productName: opp.product.productName,
          price: opp.recommendedPrice,
          salesCount: opp.product.salesVolume,
          rating: opp.product.avgRating,
          trendScore: opp.opportunityScore,
          imageUrl: opp.product.imageUrl,
          productUrl: opp.product.sourceUrl,
          analyzedAt: dbType === 'postgres' ? now.toISOString() : Math.floor(now.getTime() / 1000),
        });
      } catch (error) {
        // Ignore duplicate errors
        console.warn('Failed to save trending product:', error);
      }
    }
  }
  
  /**
   * Get saved trending products from database
   */
  async getSavedTrends(limit: number = 50): Promise<any[]> {
    try {
      const trends = await db
        .select()
        .from(trendingProducts)
        .orderBy(desc(trendingProducts.trendScore), desc(trendingProducts.analyzedAt))
        .limit(limit);
      
      return trends;
    } catch (error) {
      console.error('Error fetching saved trends:', error);
      return [];
    }
  }
}

// ==================== SINGLETON INSTANCE ====================

export const trendHunterService = new TrendHunterService();
