// @ts-nocheck
// REAL AI SERVICE - Working AI Integration with Emergent LLM Key
// Uses OpenAI SDK with Emergent Key for text and image generation

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Initialize OpenAI with Emergent LLM Key
const EMERGENT_KEY = process.env.EMERGENT_LLM_KEY || '';

const openai = EMERGENT_KEY ? new OpenAI({
  apiKey: EMERGENT_KEY,
}) : null;

console.log(EMERGENT_KEY ? '✅ Real AI Service initialized with Emergent LLM Key' : '⚠️ No AI key found');

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
    return 'AI xizmati mavjud emas. EMERGENT_LLM_KEY sozlanmagan.';
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: options.systemMessage || 'Sen professional AI assistant san. O\'zbek va Rus tillarida javob bera olasan.' 
        },
        { role: 'user', content: options.prompt }
      ],
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.error('❌ AI Text Generation Error:', error.message);
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
    throw new Error('AI Service not initialized');
  }

  try {
    const base64Image = options.imageBuffer.toString('base64');
    const mimeType = 'image/jpeg'; // Assume JPEG

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
    throw error;
  }
}

// ========================================
// IMAGE GENERATION
// ========================================

export interface ImageGenerationOptions {
  prompt: string;
  size?: '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
  style?: 'natural' | 'vivid';
}

export async function generateImage(options: ImageGenerationOptions): Promise<string> {
  if (!openai) {
    throw new Error('AI Service not initialized');
  }

  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: options.prompt,
      n: 1,
      size: options.size || '1024x1024',
      quality: options.quality || 'standard',
      response_format: 'url',
    });

    return response.data[0]?.url || '';
  } catch (error: any) {
    console.error('❌ AI Image Generation Error:', error.message);
    throw error;
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
  "title": "SEO-optimizatsiya qilingan sarlavha",
  "description": "To'liq SEO tavsif (300-500 so'z, HTML teglar bilan)",
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
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid JSON response from AI');
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
    throw new Error('Could not parse product scan result');
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
  "minPrice": ${input.costPrice * 1.1},
  "maxPrice": ${input.currentPrice * 1.3},
  "reasoning": "Narx strategiyasi tushuntirilishi",
  "competitorAnalysis": "Raqobatchilar tahlili",
  "confidence": 80
}`;

  const response = await generateText({
    prompt,
    jsonMode: true,
    temperature: 0.3,
  });

  return JSON.parse(response);
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
    provider: 'OpenAI (Emergent)',
    model: 'gpt-4o',
  };
}

// ========================================
// EXPORTS
// ========================================

export const realAIService = {
  generateText,
  analyzeImage,
  generateImage,
  generateProductCard,
  scanProduct,
  optimizePrice,
  isEnabled,
  getStatus,
};

export default realAIService;
