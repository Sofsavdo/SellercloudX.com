/**
 * Product Recognition Service
 * Uses Google Cloud Vision API to recognize products from images
 */

import axios from 'axios';
import sharp from 'sharp';

interface VisionLabel {
  description: string;
  score: number;
}

interface VisionWebEntity {
  entityId: string;
  score: number;
  description: string;
}

interface VisionWebImage {
  url: string;
  score: number;
}

interface RecognizedProduct {
  name: string;
  category: string;
  brand?: string;
  images: string[];
  marketplaceLinks: {
    uzum?: { url: string; price: number };
    wildberries?: { url: string; price: number };
    ozon?: { url: string; price: number };
    yandex?: { url: string; price: number };
  };
  averagePrice: number;
  confidence: number;
  description?: string;
}

export class ProductRecognitionService {
  private apiKey: string;
  private visionEndpoint = 'https://vision.googleapis.com/v1/images:annotate';

  constructor() {
    this.apiKey = process.env.GOOGLE_VISION_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  GOOGLE_VISION_API_KEY not set. Product recognition will use mock data.');
    }
  }

  /**
   * Optimize image for API processing
   */
  async optimizeImage(base64Image: string): Promise<string> {
    try {
      // Remove data:image/jpeg;base64, prefix if present
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Optimize: resize and compress
      const optimized = await sharp(buffer)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      return optimized.toString('base64');
    } catch (error) {
      console.error('Image optimization error:', error);
      // Return original if optimization fails
      return base64Image.replace(/^data:image\/\w+;base64,/, '');
    }
  }

  /**
   * Recognize product using Google Vision API
   */
  async recognizeProduct(base64Image: string): Promise<RecognizedProduct> {
    try {
      console.log('🔍 Starting product recognition...');

      // If no API key, return mock data for development
      if (!this.apiKey) {
        return this.getMockRecognition();
      }

      // Optimize image
      const optimizedImage = await this.optimizeImage(base64Image);

      // Call Google Vision API
      const response = await axios.post(
        `${this.visionEndpoint}?key=${this.apiKey}`,
        {
          requests: [
            {
              image: { content: optimizedImage },
              features: [
                { type: 'LABEL_DETECTION', maxResults: 10 },
                { type: 'WEB_DETECTION', maxResults: 10 },
                { type: 'LOGO_DETECTION', maxResults: 5 },
                { type: 'TEXT_DETECTION', maxResults: 5 }
              ]
            }
          ]
        }
      );

      const result = response.data.responses[0];
      console.log('✅ Vision API response received');

      // Extract product information
      const labels: VisionLabel[] = result.labelAnnotations || [];
      const webDetection = result.webDetection || {};
      const logos = result.logoAnnotations || [];
      const texts = result.textAnnotations || [];

      // Determine product name and category
      const productName = this.extractProductName(webDetection, labels, texts);
      const category = this.extractCategory(labels);
      const brand = this.extractBrand(logos, texts);

      // Get similar images
      const images = this.extractImages(webDetection);

      // Search marketplaces
      const marketplaceLinks = await this.searchMarketplaces(productName, brand);

      // Calculate average price
      const prices = Object.values(marketplaceLinks)
        .map(link => link?.price || 0)
        .filter(price => price > 0);
      const averagePrice = prices.length > 0
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        : 0;

      // Calculate confidence
      const confidence = this.calculateConfidence(labels, webDetection);

      return {
        name: productName,
        category,
        brand,
        images: images.slice(0, 5),
        marketplaceLinks,
        averagePrice,
        confidence,
        description: this.generateDescription(productName, category, brand)
      };

    } catch (error: any) {
      console.error('❌ Product recognition error:', error.message);
      
      // Return mock data on error
      return this.getMockRecognition();
    }
  }

  /**
   * Extract product name from Vision API results
   */
  private extractProductName(webDetection: any, labels: VisionLabel[], texts: any[]): string {
    // Try web entities first (most accurate)
    if (webDetection.webEntities && webDetection.webEntities.length > 0) {
      const topEntity = webDetection.webEntities[0];
      if (topEntity.description && topEntity.score > 0.5) {
        return topEntity.description;
      }
    }

    // Try best guess label
    if (webDetection.bestGuessLabels && webDetection.bestGuessLabels.length > 0) {
      return webDetection.bestGuessLabels[0].label;
    }

    // Fallback to top labels
    if (labels.length > 0) {
      return labels.slice(0, 3).map(l => l.description).join(' ');
    }

    return 'Unknown Product';
  }

  /**
   * Extract category from labels
   */
  private extractCategory(labels: VisionLabel[]): string {
    const categoryKeywords: Record<string, string[]> = {
      'Kiyim': ['clothing', 'shirt', 'dress', 'pants', 'jacket', 'coat'],
      'Poyabzal': ['shoe', 'boot', 'sneaker', 'sandal', 'footwear'],
      'Elektronika': ['phone', 'laptop', 'computer', 'tablet', 'electronic'],
      'Uy-ro\'zg\'or': ['furniture', 'home', 'kitchen', 'appliance'],
      'Go\'zallik': ['cosmetic', 'beauty', 'makeup', 'skincare'],
      'Sport': ['sport', 'fitness', 'gym', 'athletic'],
      'Kitob': ['book', 'magazine', 'publication'],
      'O\'yinchoq': ['toy', 'game', 'doll', 'puzzle']
    };

    for (const label of labels) {
      const desc = label.description.toLowerCase();
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => desc.includes(keyword))) {
          return category;
        }
      }
    }

    return 'Boshqa';
  }

  /**
   * Extract brand from logos and text
   */
  private extractBrand(logos: any[], texts: any[]): string | undefined {
    // Try logo detection first
    if (logos.length > 0) {
      return logos[0].description;
    }

    // Try to find brand in text
    const knownBrands = ['Nike', 'Adidas', 'Samsung', 'Apple', 'Sony', 'LG', 'Xiaomi'];
    for (const text of texts) {
      const desc = text.description;
      for (const brand of knownBrands) {
        if (desc.includes(brand)) {
          return brand;
        }
      }
    }

    return undefined;
  }

  /**
   * Extract similar images
   */
  private extractImages(webDetection: any): string[] {
    const images: string[] = [];

    if (webDetection.visuallySimilarImages) {
      images.push(...webDetection.visuallySimilarImages.map((img: VisionWebImage) => img.url));
    }

    if (webDetection.fullMatchingImages) {
      images.push(...webDetection.fullMatchingImages.map((img: VisionWebImage) => img.url));
    }

    return images.filter(url => url && url.startsWith('http'));
  }

  /**
   * Search marketplaces for product
   */
  private async searchMarketplaces(productName: string, brand?: string): Promise<any> {
    // TODO: Implement real marketplace search
    // For now, return mock data
    
    const searchQuery = brand ? `${brand} ${productName}` : productName;
    console.log('🔍 Searching marketplaces for:', searchQuery);

    return {
      uzum: { url: 'https://uzum.uz/product/...', price: 850000 },
      wildberries: { url: 'https://wildberries.ru/...', price: 4200 },
      ozon: { url: 'https://ozon.ru/...', price: 4500 }
    };
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(labels: VisionLabel[], webDetection: any): number {
    let confidence = 0;

    // Label confidence
    if (labels.length > 0) {
      const avgLabelScore = labels.slice(0, 3).reduce((sum, l) => sum + l.score, 0) / 3;
      confidence += avgLabelScore * 40;
    }

    // Web detection confidence
    if (webDetection.webEntities && webDetection.webEntities.length > 0) {
      const topEntityScore = webDetection.webEntities[0].score;
      confidence += topEntityScore * 40;
    }

    // Similar images boost
    if (webDetection.visuallySimilarImages && webDetection.visuallySimilarImages.length > 0) {
      confidence += 20;
    }

    return Math.min(Math.round(confidence), 100);
  }

  /**
   * Generate product description
   */
  private generateDescription(name: string, category: string, brand?: string): string {
    const parts = [];
    
    if (brand) {
      parts.push(`${brand} brendidan`);
    }
    
    parts.push(name);
    parts.push(`(${category} kategoriyasi)`);

    return parts.join(' ');
  }

  /**
   * Get mock recognition data for development
   */
  private getMockRecognition(): RecognizedProduct {
    return {
      name: 'Nike Air Max 270',
      category: 'Poyabzal',
      brand: 'Nike',
      images: [
        'https://via.placeholder.com/400x400?text=Nike+Air+Max+270',
        'https://via.placeholder.com/400x400?text=Product+Image+2',
        'https://via.placeholder.com/400x400?text=Product+Image+3'
      ],
      marketplaceLinks: {
        uzum: { url: 'https://uzum.uz/...', price: 850000 },
        wildberries: { url: 'https://wildberries.ru/...', price: 4200 },
        ozon: { url: 'https://ozon.ru/...', price: 4500 }
      },
      averagePrice: 900000,
      confidence: 95,
      description: 'Nike brendidan Nike Air Max 270 (Poyabzal kategoriyasi)'
    };
  }
}

export const productRecognitionService = new ProductRecognitionService();
