import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

interface CompetitorData {
  marketplace: string;
  productName: string;
  price: number;
  rating: number;
  reviews: number;
  seller: string;
  url: string;
  lastUpdated: Date;
}

interface PriceRecommendation {
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  competitorCount: number;
  reasoning: string;
}

class CompetitorIntelligenceService {
  /**
   * Scrape competitor prices from Uzum
   */
  async scrapeUzumPrices(productName: string): Promise<CompetitorData[]> {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      
      const searchUrl = `https://uzum.uz/uz/search?q=${encodeURIComponent(productName)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });

      const products = await page.evaluate(() => {
        const items: any[] = [];
        const productCards = document.querySelectorAll('[data-test-id="product-card"]');
        
        productCards.forEach((card, index) => {
          if (index < 10) { // Top 10 results
            const name = card.querySelector('[data-test-id="product-title"]')?.textContent || '';
            const priceText = card.querySelector('[data-test-id="product-price"]')?.textContent || '0';
            const price = parseInt(priceText.replace(/\D/g, ''));
            const ratingText = card.querySelector('[data-test-id="product-rating"]')?.textContent || '0';
            const rating = parseFloat(ratingText);
            const reviewsText = card.querySelector('[data-test-id="product-reviews"]')?.textContent || '0';
            const reviews = parseInt(reviewsText.replace(/\D/g, ''));
            const url = card.querySelector('a')?.href || '';

            items.push({
              marketplace: 'uzum',
              productName: name,
              price,
              rating,
              reviews,
              seller: 'Unknown',
              url,
              lastUpdated: new Date()
            });
          }
        });

        return items;
      });

      await browser.close();
      return products;
    } catch (error) {
      console.error('Uzum scraping error:', error);
      return [];
    }
  }

  /**
   * Scrape competitor prices from Wildberries
   */
  async scrapeWildberriesPrices(productName: string): Promise<CompetitorData[]> {
    try {
      const searchUrl = `https://www.wildberries.ru/catalog/0/search.aspx?search=${encodeURIComponent(productName)}`;
      const response = await axios.get(searchUrl);
      const $ = cheerio.load(response.data);

      const products: CompetitorData[] = [];

      $('.product-card').each((index, element) => {
        if (index < 10) {
          const name = $(element).find('.product-card__name').text().trim();
          const priceText = $(element).find('.price__lower-price').text().trim();
          const price = parseInt(priceText.replace(/\D/g, ''));
          const ratingText = $(element).find('.product-card__rating').text().trim();
          const rating = parseFloat(ratingText);
          const reviewsText = $(element).find('.product-card__count').text().trim();
          const reviews = parseInt(reviewsText.replace(/\D/g, ''));
          const url = 'https://www.wildberries.ru' + $(element).find('a').attr('href');

          products.push({
            marketplace: 'wildberries',
            productName: name,
            price,
            rating,
            reviews,
            seller: 'Unknown',
            url,
            lastUpdated: new Date()
          });
        }
      });

      return products;
    } catch (error) {
      console.error('Wildberries scraping error:', error);
      return [];
    }
  }

  /**
   * Get comprehensive competitor analysis
   */
  async analyzeCompetitors(productName: string, marketplaces: string[] = ['uzum', 'wildberries']): Promise<{
    competitors: CompetitorData[];
    priceRecommendation: PriceRecommendation;
    marketInsights: any;
  }> {
    const allCompetitors: CompetitorData[] = [];

    // Scrape all marketplaces
    for (const marketplace of marketplaces) {
      let competitors: CompetitorData[] = [];
      
      if (marketplace === 'uzum') {
        competitors = await this.scrapeUzumPrices(productName);
      } else if (marketplace === 'wildberries') {
        competitors = await this.scrapeWildberriesPrices(productName);
      }

      allCompetitors.push(...competitors);
    }

    // Calculate price recommendation
    const priceRecommendation = this.calculatePriceRecommendation(allCompetitors);

    // Generate market insights
    const marketInsights = this.generateMarketInsights(allCompetitors);

    return {
      competitors: allCompetitors,
      priceRecommendation,
      marketInsights
    };
  }

  /**
   * Calculate optimal price recommendation
   */
  private calculatePriceRecommendation(competitors: CompetitorData[]): PriceRecommendation {
    if (competitors.length === 0) {
      return {
        suggestedPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        averagePrice: 0,
        competitorCount: 0,
        reasoning: 'No competitor data available'
      };
    }

    const prices = competitors.map(c => c.price).filter(p => p > 0);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Calculate suggested price (slightly below average for competitiveness)
    const suggestedPrice = Math.round(avgPrice * 0.95);

    // Generate reasoning
    const topRatedCompetitors = competitors
      .filter(c => c.rating >= 4.5)
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, 3);

    const avgTopPrice = topRatedCompetitors.length > 0
      ? topRatedCompetitors.reduce((sum, c) => sum + c.price, 0) / topRatedCompetitors.length
      : avgPrice;

    let reasoning = `Based on ${competitors.length} competitors:\n`;
    reasoning += `- Average market price: ${Math.round(avgPrice).toLocaleString()} UZS\n`;
    reasoning += `- Price range: ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} UZS\n`;
    reasoning += `- Top-rated sellers average: ${Math.round(avgTopPrice).toLocaleString()} UZS\n`;
    reasoning += `- Suggested price is 5% below average for competitive advantage`;

    return {
      suggestedPrice,
      minPrice,
      maxPrice,
      averagePrice: Math.round(avgPrice),
      competitorCount: competitors.length,
      reasoning
    };
  }

  /**
   * Generate market insights
   */
  private generateMarketInsights(competitors: CompetitorData[]): any {
    const marketplaceDistribution: Record<string, number> = {};
    const ratingDistribution = { high: 0, medium: 0, low: 0 };
    let totalReviews = 0;

    competitors.forEach(comp => {
      // Marketplace distribution
      marketplaceDistribution[comp.marketplace] = 
        (marketplaceDistribution[comp.marketplace] || 0) + 1;

      // Rating distribution
      if (comp.rating >= 4.5) ratingDistribution.high++;
      else if (comp.rating >= 3.5) ratingDistribution.medium++;
      else ratingDistribution.low++;

      totalReviews += comp.reviews;
    });

    const avgReviews = competitors.length > 0 ? totalReviews / competitors.length : 0;

    return {
      marketplaceDistribution,
      ratingDistribution,
      averageReviews: Math.round(avgReviews),
      totalCompetitors: competitors.length,
      marketSaturation: competitors.length > 20 ? 'high' : competitors.length > 10 ? 'medium' : 'low',
      recommendations: this.generateRecommendations(competitors)
    };
  }

  /**
   * Generate strategic recommendations
   */
  private generateRecommendations(competitors: CompetitorData[]): string[] {
    const recommendations: string[] = [];

    const avgRating = competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length;
    const avgReviews = competitors.reduce((sum, c) => sum + c.reviews, 0) / competitors.length;

    if (avgRating < 4.0) {
      recommendations.push('Market has low average rating - opportunity for quality differentiation');
    }

    if (avgReviews < 50) {
      recommendations.push('Low review counts - focus on getting early reviews quickly');
    }

    if (competitors.length > 20) {
      recommendations.push('Highly competitive market - consider unique value proposition');
    } else if (competitors.length < 5) {
      recommendations.push('Low competition - opportunity for market leadership');
    }

    const priceVariance = this.calculatePriceVariance(competitors);
    if (priceVariance > 0.3) {
      recommendations.push('High price variance - market is not standardized, test different price points');
    }

    return recommendations;
  }

  /**
   * Calculate price variance
   */
  private calculatePriceVariance(competitors: CompetitorData[]): number {
    const prices = competitors.map(c => c.price);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / prices.length;
    return Math.sqrt(variance) / avg;
  }

  /**
   * Monitor price changes
   */
  async monitorPriceChanges(productName: string, currentPrice: number): Promise<{
    priceAlert: boolean;
    message: string;
    competitors: CompetitorData[];
  }> {
    const analysis = await this.analyzeCompetitors(productName);
    const { priceRecommendation } = analysis;

    let priceAlert = false;
    let message = '';

    if (currentPrice > priceRecommendation.maxPrice) {
      priceAlert = true;
      message = `Your price (${currentPrice.toLocaleString()}) is above market maximum (${priceRecommendation.maxPrice.toLocaleString()}). Consider lowering.`;
    } else if (currentPrice < priceRecommendation.minPrice) {
      priceAlert = true;
      message = `Your price (${currentPrice.toLocaleString()}) is below market minimum (${priceRecommendation.minPrice.toLocaleString()}). You may be underpricing.`;
    } else if (Math.abs(currentPrice - priceRecommendation.suggestedPrice) / priceRecommendation.suggestedPrice > 0.1) {
      priceAlert = true;
      message = `Consider adjusting to suggested price: ${priceRecommendation.suggestedPrice.toLocaleString()} UZS`;
    } else {
      message = 'Your price is competitive';
    }

    return {
      priceAlert,
      message,
      competitors: analysis.competitors
    };
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(marketplace: string = 'uzum'): Promise<any[]> {
    // Implementation for trending products
    return [];
  }

  /**
   * Analyze keyword performance
   */
  async analyzeKeywords(productName: string): Promise<{
    keywords: string[];
    searchVolume: Record<string, number>;
    competition: Record<string, string>;
  }> {
    // Extract keywords from product name
    const keywords = productName.toLowerCase().split(' ').filter(w => w.length > 3);

    // Mock data - in production, integrate with keyword research tools
    const searchVolume: Record<string, number> = {};
    const competition: Record<string, string> = {};

    keywords.forEach(keyword => {
      searchVolume[keyword] = Math.floor(Math.random() * 10000);
      competition[keyword] = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
    });

    return {
      keywords,
      searchVolume,
      competition
    };
  }
}

export const competitorIntelligence = new CompetitorIntelligenceService();
