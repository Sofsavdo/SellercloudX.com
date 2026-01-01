// @ts-nocheck
// Google Search Integration Service
// Real-time web search for competitor prices, trends, and product information

import { geminiService } from './geminiService';

export interface SearchRequest {
  query: string;
  maxResults?: number;
  market?: 'uz' | 'ru' | 'en';
}

export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
  price?: number;
  currency?: string;
}

export interface CompetitorPrice {
  marketplace: string;
  productName: string;
  price: number;
  currency: string;
  url: string;
  availability: boolean;
}

class GoogleSearchService {
  private enabled: boolean;
  private monthlyRequests: number = 0;
  private monthlyLimit: number = 5000; // Free tier: 5000 requests/month

  constructor() {
    this.enabled = geminiService.isEnabled();
    if (!this.enabled) {
      console.warn('⚠️  Google Search service disabled (Gemini API required)');
    } else {
      console.log('✅ Google Search Service initialized');
    }
  }

  /**
   * Search the web for information
   */
  async search(request: SearchRequest): Promise<SearchResult[]> {
    if (!this.enabled) {
      throw new Error('Google Search is not enabled. Please set GEMINI_API_KEY.');
    }

    // Check monthly limit
    if (this.monthlyRequests >= this.monthlyLimit) {
      throw new Error(`Monthly search limit reached (${this.monthlyLimit} requests). Upgrade to Pro tier.`);
    }

    try {
      const query = request.query;
      const maxResults = request.maxResults || 5;

      // Use Gemini with Google Search grounding
      const response = await geminiService.generateText({
        prompt: `Search the web for: ${query}. Return top ${maxResults} results with URLs, titles, and snippets. Format as JSON array.`,
        model: 'flash',
        structuredOutput: true,
      });

      // Parse JSON response
      let results: SearchResult[] = [];
      try {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed)) {
          results = parsed;
        }
      } catch (error) {
        // Fallback: parse text response
        results = this.parseTextResults(response.text);
      }

      this.monthlyRequests++;
      return results.slice(0, maxResults);
    } catch (error: any) {
      console.error('Google Search error:', error);
      throw new Error(`Google Search error: ${error.message}`);
    }
  }

  /**
   * Search for competitor prices
   */
  async searchCompetitorPrices(
    productName: string,
    marketplaces: string[] = ['uzum', 'wildberries', 'yandex', 'ozon']
  ): Promise<CompetitorPrice[]> {
    if (!this.enabled) {
      throw new Error('Google Search is not enabled.');
    }

    const prices: CompetitorPrice[] = [];

    for (const marketplace of marketplaces) {
      try {
        const query = `${productName} ${marketplace} narx`;
        const results = await this.search({ query, maxResults: 3 });

        for (const result of results) {
          // Extract price from result
          const priceMatch = result.snippet?.match(/(\d+[\s,.]?\d*)\s*(so'm|sum|руб|₽)/i);
          if (priceMatch) {
            const price = parseFloat(priceMatch[1].replace(/\s/g, '').replace(',', '.'));
            const currency = priceMatch[2]?.toLowerCase().includes('so') ? 'UZS' : 'RUB';

            prices.push({
              marketplace,
              productName,
              price,
              currency,
              url: result.url,
              availability: true,
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to search prices for ${marketplace}:`, error);
      }
    }

    return prices;
  }

  /**
   * Search for trending products
   */
  async searchTrendingProducts(category: string, market: 'uz' | 'ru' | 'en' = 'uz'): Promise<SearchResult[]> {
    const query = `${category} trend mahsulotlar ${market === 'uz' ? 'O\'zbekiston' : market === 'ru' ? 'Россия' : 'Uzbekistan'}`;
    return await this.search({ query, maxResults: 10, market });
  }

  /**
   * Search for SEO keywords
   */
  async searchSEOKeywords(productName: string, language: 'uz' | 'ru' | 'en' = 'uz'): Promise<string[]> {
    const query = `${productName} SEO kalit so'zlar ${language === 'uz' ? 'O\'zbek' : language === 'ru' ? 'Русский' : 'English'}`;
    const results = await this.search({ query, maxResults: 5 });

    // Extract keywords from results
    const keywords: string[] = [];
    results.forEach(result => {
      const words = result.snippet?.toLowerCase().match(/\b\w{4,}\b/g) || [];
      keywords.push(...words);
    });

    // Remove duplicates and return top keywords
    return [...new Set(keywords)].slice(0, 20);
  }

  /**
   * Parse text results (fallback)
   */
  private parseTextResults(text: string): SearchResult[] {
    const results: SearchResult[] = [];
    const lines = text.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        results.push({
          title: line.split(urlMatch[0])[0].trim(),
          url: urlMatch[0],
          snippet: line,
        });
      }
    }

    return results;
  }

  /**
   * Get monthly usage statistics
   */
  getMonthlyUsage(): { requests: number; limit: number; remaining: number } {
    return {
      requests: this.monthlyRequests,
      limit: this.monthlyLimit,
      remaining: Math.max(0, this.monthlyLimit - this.monthlyRequests),
    };
  }

  /**
   * Reset monthly counter (called monthly)
   */
  resetMonthlyCounter(): void {
    this.monthlyRequests = 0;
    console.log('✅ Google Search monthly counter reset');
  }

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

export const googleSearchService = new GoogleSearchService();
export default googleSearchService;

