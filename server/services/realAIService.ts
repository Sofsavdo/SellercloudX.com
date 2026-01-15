// @ts-nocheck
// REAL AI SERVICE - Working AI Integration
// Uses OpenAI SDK with proper API key

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get API key - try Emergent key first, then OpenAI key
const API_KEY = process.env.OPENAI_API_KEY || process.env.EMERGENT_LLM_KEY || '';

// Initialize OpenAI client
const openai = API_KEY ? new OpenAI({
  apiKey: API_KEY,
}) : null;

if (API_KEY) {
  console.log('✅ Real AI Service initialized');
} else {
  console.warn('⚠️ No AI API key found (OPENAI_API_KEY or EMERGENT_LLM_KEY)');
}

// ========================================
// TEXT GENERATION
// ========================================

export interface TextGenerationOptions {
  prompt: string;
  systemMessage?: string;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}

export async function generateText(options: TextGenerationOptions): Promise<string> {
  if (!openai) {
    console.error('❌ AI Service not initialized');
    // Return mock response for demo
    return JSON.stringify({
      title: "Demo mahsulot sarlavhasi",
      description: "Bu demo tavsif. AI xizmati hozirda mavjud emas.",
      shortDescription: "Demo qisqa tavsif",
      keywords: ["demo", "test"],
      bulletPoints: ["Demo xususiyat 1", "Demo xususiyat 2"],
      seoScore: 50,
      suggestedPrice: 100000,
      categoryPath: ["Demo"]
    });
  }

  try {
    const messages: any[] = [];
    
    if (options.systemMessage) {
      messages.push({ role: 'system', content: options.systemMessage });
    }
    messages.push({ role: 'user', content: options.prompt });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.error('❌ AI Text Generation Error:', error.message);
    
    // Return mock response on error
    if (options.jsonMode) {
      return JSON.stringify({
        title: "Xatolik - demo javob",
        description: "AI xizmati vaqtinchalik ishlamayapti: " + error.message,
        shortDescription: "Demo",
        keywords: ["error"],
        bulletPoints: ["AI xizmati mavjud emas"],
        seoScore: 30,
        suggestedPrice: 100000,
        categoryPath: ["Umumiy"]
      });
    }
    throw error;
  }
}

// ========================================
// IMAGE ANALYSIS (Vision)
// ========================================

export interface ImageAnalysisOptions {
  imageBuffer: Buffer;
  prompt: string;
  jsonMode?: boolean;
}

export async function analyzeImage(options: ImageAnalysisOptions): Promise<string> {
  if (!openai) {
    // Return mock response for demo
    return JSON.stringify({
      name: "Demo mahsulot",
      category: "electronics",
      description: "Bu demo tahlil. AI xizmati mavjud emas.",
      brand: "Unknown",
      estimatedPrice: 100000,
      specifications: ["Demo spec 1", "Demo spec 2"],
      keywords: ["demo", "product"],
      confidence: 30
    });
  }

  try {
    const base64Image = options.imageBuffer.toString('base64');
    const mimeType = 'image/jpeg';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: options.prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.error('❌ AI Image Analysis Error:', error.message);
    
    // Return mock response on error
    return JSON.stringify({
      name: "Rasm tahlil qilinmadi",
      category: "unknown",
      description: "AI xatolik: " + error.message,
      brand: "Unknown",
      estimatedPrice: 100000,
      specifications: [],
      keywords: [],
      confidence: 0
    });
  }
}

// ========================================
// PRODUCT CARD GENERATOR
// ========================================

export interface ProductCardInput {
  name: string;
  category?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  marketplace: 'uzum' | 'wildberries' | 'yandex' | 'ozon';
}

export interface ProductCardOutput {
  title: string;
  description: string;
  shortDescription: string;
  keywords: string[];
  bulletPoints: string[];
  seoScore: number;
  suggestedPrice: number;
  categoryPath: string[];
}

export async function generateProductCard(input: ProductCardInput): Promise<ProductCardOutput> {
  const marketplaceRules: Record<string, string> = {
    uzum: 'Uzum Market: O\'zbek tilida, 80 belgigacha sarlavha, emoji yo\'q',
    wildberries: 'Wildberries: Rus tilida, SEO kalit so\'zlar muhim, 60 belgigacha sarlavha',
    yandex: 'Yandex Market: Rus tilida, texnik xususiyatlar muhim',
    ozon: 'Ozon: Rus tilida, batafsil tavsif, rich content',
  };

  const prompt = `Sen professional marketplace SEO mutaxassisisan.

MAHSULOT: ${input.name}
KATEGORIYA: ${input.category || 'umumiy'}
TAVSIF: ${input.description || 'yo\'q'}
NARX: ${input.price || 'belgilanmagan'} so'm
MARKETPLACE: ${input.marketplace}
QOIDALAR: ${marketplaceRules[input.marketplace]}

Quyidagi JSON formatda professional mahsulot kartochkasi yarat:

{
  "title": "SEO-optimizatsiya qilingan sarlavha (marketplace qoidalariga mos)",
  "description": "To'liq SEO tavsif (300-500 so'z)",
  "shortDescription": "Qisqa tavsif (150 belgi)",
  "keywords": ["kalit1", "kalit2", "...10 tagacha"],
  "bulletPoints": ["Xususiyat 1", "Xususiyat 2", "...5 tagacha"],
  "seoScore": 85,
  "suggestedPrice": ${input.price || 100000},
  "categoryPath": ["Kategoriya", "Subkategoriya"]
}

Faqat JSON qaytar, boshqa hech narsa yozma.`;

  const response = await generateText({
    prompt,
    systemMessage: 'Sen marketplace SEO ekspert. Faqat valid JSON qaytar.',
    jsonMode: true,
    temperature: 0.5,
  });

  try {
    return JSON.parse(response);
  } catch {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Return default card
    return {
      title: input.name,
      description: input.description || 'Mahsulot tavsifi',
      shortDescription: input.name.substring(0, 150),
      keywords: input.name.toLowerCase().split(' '),
      bulletPoints: ['Sifatli mahsulot', 'Tez yetkazib berish'],
      seoScore: 50,
      suggestedPrice: input.price || 100000,
      categoryPath: [input.category || 'Umumiy'],
    };
  }
}

// ========================================
// PRODUCT SCANNER (Image to Product)
// ========================================

export interface ScanResult {
  name: string;
  category: string;
  description: string;
  brand: string;
  estimatedPrice: number;
  specifications: string[];
  keywords: string[];
  confidence: number;
}

export async function scanProduct(imageBuffer: Buffer): Promise<ScanResult> {
  const prompt = `Bu rasmda ko'rsatilgan mahsulotni aniqlang va quyidagi JSON formatda javob bering:

{
  "name": "Mahsulot nomi (O'zbek tilida)",
  "category": "Kategoriya (electronics, clothing, home, beauty, food, other)",
  "description": "Batafsil tavsif (100-200 so'z)",
  "brand": "Brend nomi (agar aniq bo'lsa)",
  "estimatedPrice": 100000,
  "specifications": ["Xususiyat 1", "Xususiyat 2", "Xususiyat 3"],
  "keywords": ["kalit1", "kalit2", "kalit3"],
  "confidence": 85
}

MUHIM:
- Mahsulotni sinchiklab tahlil qiling
- O'zbekiston bozori uchun narx taxmin qiling (so'mda)
- Agar aniqlay olmasangiz, confidence past bo'lsin
- Faqat JSON qaytar`;

  const response = await analyzeImage({
    imageBuffer,
    prompt,
    jsonMode: true,
  });

  try {
    return JSON.parse(response);
  } catch {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Return default result
    return {
      name: "Noma'lum mahsulot",
      category: "other",
      description: "Mahsulotni aniqlash imkoni bo'lmadi",
      brand: "Unknown",
      estimatedPrice: 100000,
      specifications: [],
      keywords: [],
      confidence: 0
    };
  }
}

// ========================================
// PRICE OPTIMIZER
// ========================================

export interface PriceOptimizationInput {
  productName: string;
  currentPrice: number;
  costPrice: number;
  category: string;
  marketplace: string;
}

export interface PriceOptimizationResult {
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  reasoning: string;
  competitorAnalysis: string;
  confidence: number;
}

export async function optimizePrice(input: PriceOptimizationInput): Promise<PriceOptimizationResult> {
  const margin = ((input.currentPrice - input.costPrice) / input.currentPrice * 100).toFixed(1);

  const prompt = `Narx optimizatsiyasi tahlili:

MAHSULOT: ${input.productName}
HOZIRGI NARX: ${input.currentPrice} so'm
TANNARX: ${input.costPrice} so'm
FOYDA MARJASI: ${margin}%
KATEGORIYA: ${input.category}
MARKETPLACE: ${input.marketplace}

Quyidagi JSON formatda optimal narx tavsiyasi ber:

{
  "recommendedPrice": ${input.currentPrice},
  "minPrice": ${Math.round(input.costPrice * 1.1)},
  "maxPrice": ${Math.round(input.currentPrice * 1.3)},
  "reasoning": "Narx strategiyasi tushuntirilishi",
  "competitorAnalysis": "Raqobatchilar tahlili",
  "confidence": 80
}`;

  const response = await generateText({
    prompt,
    jsonMode: true,
    temperature: 0.3,
  });

  try {
    return JSON.parse(response);
  } catch {
    // Return calculated default
    return {
      recommendedPrice: input.currentPrice,
      minPrice: Math.round(input.costPrice * 1.15),
      maxPrice: Math.round(input.currentPrice * 1.2),
      reasoning: "Standart foyda marjasi asosida",
      competitorAnalysis: "Tahlil mavjud emas",
      confidence: 50
    };
  }
}

// ========================================
// SERVICE STATUS
// ========================================

export function isEnabled(): boolean {
  return !!openai;
}

export function getStatus(): { enabled: boolean; provider: string; model: string } {
  return {
    enabled: !!openai,
    provider: openai ? 'OpenAI' : 'Demo Mode',
    model: 'gpt-4o',
  };
}

// ========================================
// EXPORTS
// ========================================

export const realAIService = {
  generateText,
  analyzeImage,
  generateProductCard,
  scanProduct,
  optimizePrice,
  isEnabled,
  getStatus,
};

export default realAIService;
