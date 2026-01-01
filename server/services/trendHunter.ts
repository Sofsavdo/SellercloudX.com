import OpenAI from 'openai';
import { competitorIntelligence } from './competitorIntelligence';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

interface TrendData {
  productName: string;
  category: string;
  trendScore: number; // 0-100
  growthRate: number; // percentage
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  seasonality: string;
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
  topMarketplaces: string[];
  recommendations: string[];
}

interface MarketOpportunity {
  niche: string;
  opportunity: 'high' | 'medium' | 'low';
  reason: string;
  estimatedRevenue: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeToMarket: string;
  requiredInvestment: number;
}

class TrendHunterService {
  private cache: Map<string, any> = new Map();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Analyze product trends in Uzbekistan market
   */
  async analyzeTrends(category?: string): Promise<TrendData[]> {
    console.log('🔍 Hunting for trends...');

    const cacheKey = `trends:${category || 'all'}`;
    const cached = this.getCached(cacheKey);
    if (cached) {
      console.log('✅ Using cached trends');
      return cached;
    }

    try {
      // Get trending products from AI
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a market trend analyst for Uzbekistan e-commerce market.'
          },
          {
            role: 'user',
            content: `Analyze current trending products in Uzbekistan${category ? ` for category: ${category}` : ''}.

Return JSON array of top 10 trending products:
[
  {
    "productName": "Product name",
    "category": "Category",
    "trendScore": 85,
    "growthRate": 45.5,
    "searchVolume": 15000,
    "competition": "medium",
    "seasonality": "Year-round",
    "priceRange": {
      "min": 100000,
      "max": 500000,
      "average": 300000
    },
    "topMarketplaces": ["uzum", "wildberries"],
    "recommendations": ["recommendation1", "recommendation2"]
  }
]

Focus on:
- Current demand in Uzbekistan
- Growth potential
- Competition level
- Profit margins
- Market gaps`
          }
        ],
        temperature: 0.7
      });

      const content = response.choices[0].message.content || '[]';
      const trends = JSON.parse(content);

      // Enhance with real competitor data
      for (const trend of trends) {
        try {
          const competitorData = await competitorIntelligence.analyzeCompetitors(
            trend.productName,
            ['uzum', 'wildberries']
          );

          if (competitorData.competitors.length > 0) {
            trend.priceRange = {
              min: competitorData.priceRecommendation.minPrice,
              max: competitorData.priceRecommendation.maxPrice,
              average: competitorData.priceRecommendation.averagePrice
            };
            trend.competition = competitorData.marketInsights.marketSaturation;
          }
        } catch (error) {
          console.log('Could not get competitor data for:', trend.productName);
        }
      }

      this.setCache(cacheKey, trends);
      return trends;
    } catch (error) {
      console.error('Error analyzing trends:', error);
      return [];
    }
  }

  /**
   * Find market opportunities (gaps in the market)
   */
  async findOpportunities(): Promise<MarketOpportunity[]> {
    console.log('💡 Finding market opportunities...');

    const cacheKey = 'opportunities:all';
    const cached = this.getCached(cacheKey);
    if (cached) {
      console.log('✅ Using cached opportunities');
      return cached;
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a market opportunity analyst for Uzbekistan e-commerce.'
          },
          {
            role: 'user',
            content: `Identify top 5 market opportunities in Uzbekistan e-commerce.

Return JSON array:
[
  {
    "niche": "Niche name",
    "opportunity": "high",
    "reason": "Why this is an opportunity",
    "estimatedRevenue": 5000000,
    "difficulty": "medium",
    "timeToMarket": "2-3 months",
    "requiredInvestment": 1000000
  }
]

Focus on:
- Underserved markets
- Growing demand
- Low competition
- High profit margins
- Realistic for small businesses`
          }
        ],
        temperature: 0.8
      });

      const content = response.choices[0].message.content || '[]';
      const opportunities = JSON.parse(content);

      this.setCache(cacheKey, opportunities);
      return opportunities;
    } catch (error) {
      console.error('Error finding opportunities:', error);
      return [];
    }
  }

  /**
   * Predict product success probability
   */
  async predictSuccess(params: {
    productName: string;
    category: string;
    costPrice: number;
    targetPrice: number;
  }): Promise<{
    successProbability: number;
    factors: {
      demand: number;
      competition: number;
      pricing: number;
      seasonality: number;
    };
    recommendations: string[];
    estimatedMonthlySales: number;
  }> {
    console.log('🎯 Predicting product success...');

    try {
      // Get trend data
      const trends = await this.analyzeTrends(params.category);
      const similarTrend = trends.find(t => 
        t.productName.toLowerCase().includes(params.productName.toLowerCase()) ||
        t.category === params.category
      );

      // Get competitor data
      const competitorData = await competitorIntelligence.analyzeCompetitors(
        params.productName,
        ['uzum', 'wildberries']
      );

      // Calculate factors
      const factors = {
        demand: similarTrend ? similarTrend.trendScore : 50,
        competition: this.calculateCompetitionScore(competitorData.competitors.length),
        pricing: this.calculatePricingScore(
          params.targetPrice,
          competitorData.priceRecommendation.averagePrice
        ),
        seasonality: 70 // Default
      };

      // Calculate success probability
      const successProbability = (
        factors.demand * 0.4 +
        factors.competition * 0.3 +
        factors.pricing * 0.2 +
        factors.seasonality * 0.1
      );

      // Generate recommendations
      const recommendations = [];
      if (factors.demand < 60) {
        recommendations.push('Demand is low - consider different product or niche');
      }
      if (factors.competition < 50) {
        recommendations.push('High competition - differentiate your offering');
      }
      if (factors.pricing < 60) {
        recommendations.push('Price is not competitive - adjust pricing strategy');
      }
      if (successProbability > 70) {
        recommendations.push('High success probability - good product choice!');
      }

      // Estimate monthly sales
      const estimatedMonthlySales = Math.round(
        (successProbability / 100) * 100 * (params.targetPrice - params.costPrice)
      );

      return {
        successProbability,
        factors,
        recommendations,
        estimatedMonthlySales
      };
    } catch (error) {
      console.error('Error predicting success:', error);
      return {
        successProbability: 50,
        factors: { demand: 50, competition: 50, pricing: 50, seasonality: 50 },
        recommendations: ['Unable to analyze - try again later'],
        estimatedMonthlySales: 0
      };
    }
  }

  /**
   * Get personalized product recommendations for partner
   */
  async getRecommendations(partnerId: string): Promise<{
    trending: TrendData[];
    opportunities: MarketOpportunity[];
    suggestions: string[];
  }> {
    console.log('📋 Getting personalized recommendations...');

    const trending = await this.analyzeTrends();
    const opportunities = await this.findOpportunities();

    const suggestions = [
      'Focus on trending categories with low competition',
      'Consider seasonal products 2-3 months in advance',
      'Use AI-generated content to save time',
      'Monitor competitor prices weekly',
      'Test multiple marketplaces simultaneously'
    ];

    return {
      trending: trending.slice(0, 5),
      opportunities: opportunities.slice(0, 3),
      suggestions
    };
  }

  /**
   * Helper: Calculate competition score
   */
  private calculateCompetitionScore(competitorCount: number): number {
    if (competitorCount < 5) return 90;
    if (competitorCount < 10) return 70;
    if (competitorCount < 20) return 50;
    return 30;
  }

  /**
   * Helper: Calculate pricing score
   */
  private calculatePricingScore(targetPrice: number, averagePrice: number): number {
    if (averagePrice === 0) return 50;
    
    const ratio = targetPrice / averagePrice;
    if (ratio >= 0.9 && ratio <= 1.1) return 90; // Within 10% of average
    if (ratio >= 0.8 && ratio <= 1.2) return 70; // Within 20%
    if (ratio >= 0.7 && ratio <= 1.3) return 50; // Within 30%
    return 30;
  }

  /**
   * Cache helpers
   */
  private getCached(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const { data, timestamp } = cached;
    if (Date.now() - timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }

    return data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Trend cache cleared');
  }
}

export const trendHunter = new TrendHunterService();
