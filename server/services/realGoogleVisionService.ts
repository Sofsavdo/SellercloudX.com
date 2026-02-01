// Real Google Cloud Vision API Service
import vision from '@google-cloud/vision';
import axios from 'axios';

const GOOGLE_CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || '/app/google-vision-credentials.json';

export interface VisionAnalysisResult {
  productName: string;
  brand: string;
  category: string;
  description: string;
  confidence: number;
  labels: string[];
  colors: string[];
  webEntities: Array<{
    description: string;
    score: number;
  }>;
  success: boolean;
  error?: string;
}

class RealGoogleVisionService {
  private client: any;
  private isInitialized: boolean = false;

  constructor() {
    try {
      this.client = new vision.ImageAnnotatorClient({
        keyFilename: GOOGLE_CREDENTIALS_PATH,
      });
      this.isInitialized = true;
      console.log('✅ Google Vision API initialized successfully');
    } catch (error) {
      console.error('❌ Google Vision API initialization failed:', error);
      this.isInitialized = false;
    }
  }

  async analyzeImage(imageSource: string): Promise<VisionAnalysisResult> {
    if (!this.isInitialized) {
      return this.getFallbackResult('Google Vision API not initialized');
    }

    try {
      let imageBuffer: Buffer;

      // Handle different image sources
      if (imageSource.startsWith('data:')) {
        // Base64 image
        const base64Data = imageSource.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else if (imageSource.startsWith('http')) {
        // URL image
        const response = await axios.get(imageSource, {
          responseType: 'arraybuffer',
          timeout: 10000,
        });
        imageBuffer = Buffer.from(response.data);
      } else {
        throw new Error('Invalid image source format');
      }

      // Perform multiple detections
      const [result] = await this.client.annotateImage({
        image: { content: imageBuffer },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 15 },
          { type: 'LOGO_DETECTION', maxResults: 5 },
          { type: 'WEB_DETECTION', maxResults: 15 },
          { type: 'IMAGE_PROPERTIES', maxResults: 10 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
        ],
      });

      // Extract labels
      const labels = (result.labelAnnotations || [])
        .map((label: any) => label.description)
        .filter(Boolean);

      // Extract brand from logo detection
      const logoAnnotations = result.logoAnnotations || [];
      const brand = logoAnnotations.length > 0 
        ? logoAnnotations[0].description 
        : this.extractBrandFromLabels(labels);

      // Extract web entities (product names)
      const webDetection = result.webDetection || {};
      const webEntities = (webDetection.webEntities || [])
        .filter((entity: any) => entity.score && entity.score > 0.5)
        .map((entity: any) => ({
          description: entity.description,
          score: entity.score,
        }));

      // Determine product name
      const productName = webEntities.length > 0
        ? webEntities[0].description
        : this.generateProductName(labels);

      // Extract dominant colors
      const imageProperties = result.imagePropertiesAnnotation || {};
      const dominantColors = imageProperties.dominantColors?.colors || [];
      const colors = dominantColors
        .slice(0, 3)
        .map((color: any) => {
          const rgb = color.color;
          return `rgb(${Math.round(rgb.red || 0)}, ${Math.round(rgb.green || 0)}, ${Math.round(rgb.blue || 0)})`;
        });

      // Determine category
      const category = this.categorizeFromLabels(labels);

      // Generate description
      const description = this.generateDescription(productName, labels, brand);

      // Calculate confidence
      const confidence = this.calculateConfidence(labels, webEntities, logoAnnotations);

      return {
        productName,
        brand,
        category,
        description,
        confidence,
        labels: labels.slice(0, 15),
        colors,
        webEntities: webEntities.slice(0, 10),
        success: true,
      };
    } catch (error: any) {
      console.error('Google Vision API error:', error);
      return this.getFallbackResult(error.message);
    }
  }

  private extractBrandFromLabels(labels: string[]): string {
    const brandKeywords = ['apple', 'samsung', 'sony', 'lg', 'nike', 'adidas', 'xiaomi', 'huawei'];
    const foundBrand = labels.find(label => 
      brandKeywords.some(keyword => label.toLowerCase().includes(keyword))
    );
    return foundBrand || 'Unknown';
  }

  private generateProductName(labels: string[]): string {
    if (labels.length === 0) return 'Unknown Product';
    
    // Take first 2-3 relevant labels
    const relevantLabels = labels
      .filter(label => !['product', 'technology', 'electronic device'].includes(label.toLowerCase()))
      .slice(0, 3);
    
    return relevantLabels.length > 0 
      ? relevantLabels.join(' ') 
      : labels[0];
  }

  private categorizeFromLabels(labels: string[]): string {
    const categoryMap: Record<string, string[]> = {
      electronics: ['phone', 'laptop', 'computer', 'tablet', 'camera', 'headphone', 'speaker', 'watch', 'electronic'],
      clothing: ['shirt', 'pants', 'dress', 'shoes', 'jacket', 'clothing', 'fashion', 'footwear'],
      home: ['furniture', 'lamp', 'table', 'chair', 'bed', 'kitchen', 'home'],
      beauty: ['cosmetic', 'makeup', 'perfume', 'skincare', 'beauty'],
      food: ['food', 'drink', 'beverage', 'snack', 'meal'],
      sports: ['sport', 'fitness', 'gym', 'exercise', 'athletic'],
      toys: ['toy', 'game', 'puzzle', 'doll'],
      accessories: ['bag', 'wallet', 'belt', 'jewelry', 'accessory'],
    };

    const labelsLower = labels.map(l => l.toLowerCase());

    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => labelsLower.some(label => label.includes(keyword)))) {
        return category;
      }
    }

    return 'other';
  }

  private generateDescription(productName: string, labels: string[], brand: string): string {
    const topLabels = labels.slice(0, 5).join(', ');
    const brandText = brand !== 'Unknown' ? `${brand} ` : '';
    return `${brandText}${productName} - ${topLabels}`;
  }

  private calculateConfidence(labels: any[], webEntities: any[], logos: any[]): number {
    let confidence = 0;

    // Label confidence (max 40%)
    if (labels.length > 0) {
      const avgLabelScore = labels.slice(0, 5).reduce((sum, l) => sum + (l.score || 0.5), 0) / Math.min(5, labels.length);
      confidence += avgLabelScore * 40;
    }

    // Web entities confidence (max 40%)
    if (webEntities.length > 0) {
      const avgEntityScore = webEntities.slice(0, 3).reduce((sum: number, e: any) => sum + e.score, 0) / Math.min(3, webEntities.length);
      confidence += avgEntityScore * 40;
    }

    // Logo detection bonus (20%)
    if (logos.length > 0) {
      confidence += 20;
    }

    return Math.min(100, Math.round(confidence));
  }

  private getFallbackResult(errorMessage: string): VisionAnalysisResult {
    return {
      productName: 'Product',
      brand: 'Unknown',
      category: 'other',
      description: 'Unable to analyze image',
      confidence: 0,
      labels: [],
      colors: [],
      webEntities: [],
      success: false,
      error: errorMessage,
    };
  }

  isEnabled(): boolean {
    return this.isInitialized;
  }
}

export const realGoogleVisionService = new RealGoogleVisionService();
