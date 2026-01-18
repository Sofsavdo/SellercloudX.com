// Image Search Service - Google Cloud Vision + SerpAPI
// Scans product images to find product details and where they are sold online

import axios from 'axios';

// Environment configuration
const GOOGLE_VISION_API_KEY = process.env.GOOGLE_VISION_API_KEY || '';
const SERPAPI_KEY = process.env.SERPAPI_KEY || '';

// ==================== TYPES ====================

export interface ProductScanResult {
  productName: string;
  brand: string;
  category: string;
  description: string;
  confidence: number; // 0-100
  labels: string[];
  colors: string[];
  rawData?: any;
}

export interface CompetitorInfo {
  seller: string;
  price: number;
  currency: string;
  link: string;
  source: string; // marketplace name
  availability: string;
}

export interface ImageSearchResult {
  productInfo: ProductScanResult;
  competitors: CompetitorInfo[];
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  totalResults: number;
}

// ==================== GOOGLE CLOUD VISION SERVICE ====================

class GoogleVisionService {
  private apiKey: string;
  private endpoint = 'https://vision.googleapis.com/v1/images:annotate';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async analyzeImage(imageUrl: string): Promise<ProductScanResult> {
    try {
      const response = await axios.post(
        `${this.endpoint}?key=${this.apiKey}`,
        {
          requests: [
            {
              image: {
                source: {
                  imageUri: imageUrl,
                },
              },
              features: [
                { type: 'LABEL_DETECTION', maxResults: 10 },
                { type: 'LOGO_DETECTION', maxResults: 5 },
                { type: 'WEB_DETECTION', maxResults: 10 },
                { type: 'IMAGE_PROPERTIES', maxResults: 10 },
                { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
              ],
            },
          ],
        }
      );
      
      const result = response.data.responses[0];
      
      // Extract labels
      const labels = result.labelAnnotations?.map((l: any) => l.description) || [];
      
      // Extract brand from logo detection
      const brand = result.logoAnnotations?.[0]?.description || 'Unknown';
      
      // Extract web entities (product names)
      const webEntities = result.webDetection?.webEntities || [];
      const productName = webEntities.find((e: any) => e.score > 0.7)?.description || labels[0] || 'Unknown Product';
      
      // Extract dominant colors
      const colors = result.imagePropertiesAnnotation?.dominantColors?.colors?.slice(0, 3).map((c: any) => {
        const rgb = c.color;
        return `rgb(${rgb.red || 0}, ${rgb.green || 0}, ${rgb.blue || 0})`;
      }) || [];
      
      // Determine category from labels
      const category = this.categorizeFromLabels(labels);
      
      // Generate description
      const description = `${productName} - ${labels.slice(0, 5).join(', ')}`;
      
      // Calculate confidence (average of top labels)
      const confidence = Math.round(
        (result.labelAnnotations?.slice(0, 3).reduce((sum: number, l: any) => sum + (l.score || 0), 0) / 3) * 100
      );
      
      return {
        productName,
        brand,
        category,
        description,
        confidence,
        labels,
        colors,
        rawData: result,
      };
    } catch (error: any) {
      console.error('Google Vision API error:', error.response?.data || error.message);
      
      // Return default data on error
      return {
        productName: 'Unknown Product',
        brand: 'Unknown',
        category: 'other',
        description: 'Could not analyze image',
        confidence: 0,
        labels: [],
        colors: [],
      };
    }
  }
  
  private categorizeFromLabels(labels: string[]): string {
    const categoryMap: Record<string, string[]> = {
      electronics: ['phone', 'laptop', 'computer', 'tablet', 'camera', 'headphone', 'speaker'],
      clothing: ['shirt', 'pants', 'dress', 'shoes', 'jacket', 'clothing', 'fashion'],
      home: ['furniture', 'lamp', 'table', 'chair', 'bed', 'kitchen'],
      beauty: ['cosmetic', 'makeup', 'perfume', 'skincare', 'beauty'],
      food: ['food', 'drink', 'beverage', 'snack', 'meal'],
      sports: ['sport', 'fitness', 'gym', 'exercise', 'athletic'],
      toys: ['toy', 'game', 'puzzle', 'doll'],
    };
    
    const labelsLower = labels.map(l => l.toLowerCase());
    
    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => labelsLower.some(label => label.includes(keyword)))) {
        return category;
      }
    }
    
    return 'other';
  }
}

// ==================== SERPAPI SERVICE ====================

class SerpAPIService {
  private apiKey: string;
  private endpoint = 'https://serpapi.com/search';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async reverseImageSearch(imageUrl: string): Promise<CompetitorInfo[]> {
    try {
      const response = await axios.get(this.endpoint, {
        params: {
          engine: 'google_reverse_image',
          image_url: imageUrl,
          api_key: this.apiKey,
          location: 'Russia',
          hl: 'ru',
        },
      });
      
      const data = response.data;
      const competitors: CompetitorInfo[] = [];
      
      // Extract shopping results
      const shoppingResults = data.shopping_results || [];
      
      for (const item of shoppingResults) {
        const priceMatch = item.extracted_price || item.price;
        
        if (priceMatch) {
          competitors.push({
            seller: item.source || item.merchant || 'Unknown',
            price: parseFloat(priceMatch),
            currency: 'RUB',
            link: item.link || '',
            source: this.extractMarketplace(item.link || ''),
            availability: item.delivery || item.availability || 'available',
          });
        }
      }
      
      // Extract inline shopping results
      const inlineResults = data.inline_shopping_results || [];
      
      for (const item of inlineResults) {
        const priceMatch = item.extracted_price || item.price;
        
        if (priceMatch) {
          competitors.push({
            seller: item.source || 'Unknown',
            price: parseFloat(priceMatch),
            currency: 'RUB',
            link: item.link || '',
            source: this.extractMarketplace(item.link || ''),
            availability: 'available',
          });
        }
      }
      
      return competitors;
    } catch (error: any) {
      console.error('SerpAPI error:', error.response?.data || error.message);
      return [];
    }
  }
  
  private extractMarketplace(url: string): string {
    if (!url) return 'other';
    
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('wildberries')) return 'wildberries';
    if (urlLower.includes('ozon')) return 'ozon';
    if (urlLower.includes('uzum')) return 'uzum';
    if (urlLower.includes('yandex')) return 'yandex';
    if (urlLower.includes('aliexpress')) return 'aliexpress';
    if (urlLower.includes('amazon')) return 'amazon';
    
    return 'other';
  }
}

// ==================== COMBINED IMAGE SEARCH SERVICE ====================

export class ImageSearchService {
  private visionService: GoogleVisionService | null = null;
  private serpService: SerpAPIService | null = null;
  
  constructor() {
    // Initialize services if API keys are available
    if (GOOGLE_VISION_API_KEY) {
      this.visionService = new GoogleVisionService(GOOGLE_VISION_API_KEY);
    }
    
    if (SERPAPI_KEY) {
      this.serpService = new SerpAPIService(SERPAPI_KEY);
    }
  }
  
  async searchByImage(imageUrl: string): Promise<ImageSearchResult> {
    // Step 1: Analyze image with Google Vision
    let productInfo: ProductScanResult = {
      productName: 'Unknown Product',
      brand: 'Unknown',
      category: 'other',
      description: 'Image analysis not available',
      confidence: 0,
      labels: [],
      colors: [],
    };
    
    if (this.visionService) {
      productInfo = await this.visionService.analyzeImage(imageUrl);
    } else {
      console.warn('⚠️ Google Vision API key not configured');
    }
    
    // Step 2: Find competitors with SerpAPI
    let competitors: CompetitorInfo[] = [];
    
    if (this.serpService) {
      competitors = await this.serpService.reverseImageSearch(imageUrl);
    } else {
      console.warn('⚠️ SerpAPI key not configured');
    }
    
    // Step 3: Calculate price statistics
    const prices = competitors.map(c => c.price).filter(p => p > 0);
    
    const avgPrice = prices.length > 0
      ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)
      : 0;
    
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    
    return {
      productInfo,
      competitors,
      avgPrice,
      minPrice,
      maxPrice,
      totalResults: competitors.length,
    };
  }
  
  isEnabled(): boolean {
    return !!(this.visionService && this.serpService);
  }
  
  getStatus(): {
    visionEnabled: boolean;
    serpEnabled: boolean;
    fullyEnabled: boolean;
  } {
    return {
      visionEnabled: !!this.visionService,
      serpEnabled: !!this.serpService,
      fullyEnabled: this.isEnabled(),
    };
  }
}

// ==================== SINGLETON INSTANCE ====================

export const imageSearchService = new ImageSearchService();
