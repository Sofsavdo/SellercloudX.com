// @ts-nocheck
// REAL AI SERVICE - Working AI Integration
// Supports: OpenAI API Key, Google Gemini API Key
// Demo mode when no API key is available

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API Keys - Gemini first (free tier), then OpenAI
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || '';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

// Initialize clients - prefer Gemini (free tier available)
const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;
const openai = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null;

// Determine which AI provider to use - Gemini first
const AI_PROVIDER = genAI ? 'gemini' : (openai ? 'openai' : 'demo');

if (AI_PROVIDER === 'gemini') {
  console.log('✅ Real AI Service initialized with Google Gemini');
} else if (AI_PROVIDER === 'openai') {
  console.log('✅ Real AI Service initialized with OpenAI');
} else {
  console.log('⚠️ AI Service running in DEMO mode (no API key found)');
  console.log('   Set GEMINI_API_KEY or OPENAI_API_KEY for real AI');
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
  const { prompt, systemMessage, maxTokens = 2000, temperature = 0.7, jsonMode = false } = options;

  // Try Gemini first (free tier)
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: systemMessage,
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log('✅ Gemini generated response');
      return text;
    } catch (error: any) {
      console.error('Gemini Error:', error.message);
      // Fall through to OpenAI or demo
    }
  }

  // Try OpenAI as fallback
  if (openai) {
    try {
      const messages: any[] = [];
      if (systemMessage) {
        messages.push({ role: 'system', content: systemMessage });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        max_tokens: maxTokens,
        temperature,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
      });

      console.log('✅ OpenAI generated response');
      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('OpenAI Error:', error.message);
      // Fall through to demo
    }
  }

  // Demo mode - return intelligent mock data
  console.log('🎭 Using demo mode for text generation');
  return generateDemoResponse(prompt, jsonMode);
}

// ========================================
// DEMO RESPONSE GENERATOR
// ========================================

function generateDemoResponse(prompt: string, jsonMode: boolean): string {
  // Extract product name from prompt
  const nameMatch = prompt.match(/MAHSULOT:\s*([^\n]+)/i);
  const productName = nameMatch ? nameMatch[1].trim() : 'Demo Mahsulot';
  
  const priceMatch = prompt.match(/NARX:\s*(\d+)/);
  const price = priceMatch ? parseInt(priceMatch[1]) : 100000;

  if (jsonMode || prompt.includes('JSON')) {
    // Product card response
    if (prompt.toLowerCase().includes('kartochka') || prompt.toLowerCase().includes('card')) {
      return JSON.stringify({
        title: `${productName} - Sifatli mahsulot`,
        description: `${productName} - yuqori sifatli mahsulot. O'zbekiston bo'ylab tez yetkazib berish. Rasmiy kafolat. Bu demo tavsif - haqiqiy AI uchun OPENAI_API_KEY yoki GEMINI_API_KEY qo'shing.`,
        shortDescription: `${productName} - eng yaxshi narxda`,
        keywords: productName.toLowerCase().split(' ').filter(w => w.length > 2),
        bulletPoints: [
          'Yuqori sifat',
          'Tez yetkazib berish',
          'Rasmiy kafolat',
          'Qulay narx',
          '24/7 qo\'llab-quvvatlash'
        ],
        seoScore: 65,
        suggestedPrice: price,
        categoryPath: ['Umumiy', 'Mahsulotlar'],
        _demo: true,
        _message: 'Bu demo javob. Haqiqiy AI uchun API key qo\'shing.'
      });
    }

    // Price optimization response
    if (prompt.toLowerCase().includes('narx') || prompt.toLowerCase().includes('price')) {
      const costMatch = prompt.match(/TANNARX:\s*(\d+)/);
      const costPrice = costMatch ? parseInt(costMatch[1]) : price * 0.7;
      
      return JSON.stringify({
        recommendedPrice: Math.round(price * 1.05),
        minPrice: Math.round(costPrice * 1.15),
        maxPrice: Math.round(price * 1.2),
        reasoning: 'Demo tahlil: Hozirgi narx maqbul. Haqiqiy AI tahlili uchun API key qo\'shing.',
        competitorAnalysis: 'Raqobatchilar tahlili demo rejimda mavjud emas.',
        confidence: 50,
        _demo: true
      });
    }

    // Product scan response
    if (prompt.toLowerCase().includes('rasm') || prompt.toLowerCase().includes('scan')) {
      return JSON.stringify({
        name: 'Demo mahsulot',
        category: 'electronics',
        description: 'Bu demo tahlil. Haqiqiy rasm tahlili uchun API key qo\'shing.',
        brand: 'Unknown',
        estimatedPrice: 500000,
        specifications: ['Demo xususiyat 1', 'Demo xususiyat 2'],
        keywords: ['demo', 'test', 'mahsulot'],
        confidence: 30,
        _demo: true
      });
    }
  }

  // Default text response
  return `Demo javob: ${productName} haqida ma'lumot. Haqiqiy AI javoblari uchun OPENAI_API_KEY yoki GEMINI_API_KEY environment variable qo'shing.`;
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
  const { imageBuffer, prompt, jsonMode = true } = options;

  // Try Gemini Vision first (free tier)
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: 'image/jpeg'
        }
      };

      const result = await model.generateContent([prompt, imagePart]);
      console.log('✅ Gemini Vision analyzed image');
      return result.response.text();
    } catch (error: any) {
      console.error('Gemini Vision Error:', error.message);
    }
  }

  // Try OpenAI Vision as fallback
  if (openai) {
    try {
      const base64Image = imageBuffer.toString('base64');

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
      });

      console.log('✅ OpenAI Vision analyzed image');
      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('OpenAI Vision Error:', error.message);
    }
  }

  // Demo mode
  console.log('🎭 Using demo mode for image analysis');
  return generateDemoResponse(prompt, true);
}

// ========================================
// PRODUCT CARD GENERATOR
// ========================================

export interface ProductCardInput {
  name: string;
  category?: string;
  description?: string;
  price?: number;
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
  _demo?: boolean;
}

export async function generateProductCard(input: ProductCardInput): Promise<ProductCardOutput> {
  const marketplaceRules: Record<string, string> = {
    uzum: "Uzum Market: O'zbek tilida, 80 belgigacha sarlavha",
    wildberries: 'Wildberries: Rus tilida, SEO kalit so\'zlar muhim',
    yandex: 'Yandex Market: Rus tilida, texnik xususiyatlar',
    ozon: 'Ozon: Rus tilida, batafsil tavsif',
  };

  const prompt = `Sen professional marketplace SEO mutaxassisisan.

MAHSULOT: ${input.name}
KATEGORIYA: ${input.category || 'umumiy'}
TAVSIF: ${input.description || "yo'q"}
NARX: ${input.price || 100000} so'm
MARKETPLACE: ${input.marketplace}
QOIDALAR: ${marketplaceRules[input.marketplace]}

Quyidagi JSON formatda professional mahsulot kartochkasi yarat:

{
  "title": "SEO-optimizatsiya qilingan sarlavha",
  "description": "To'liq SEO tavsif (300-500 so'z)",
  "shortDescription": "Qisqa tavsif (150 belgi)",
  "keywords": ["kalit1", "kalit2", "...10 tagacha"],
  "bulletPoints": ["Xususiyat 1", "Xususiyat 2", "...5 tagacha"],
  "seoScore": 85,
  "suggestedPrice": ${input.price || 100000},
  "categoryPath": ["Kategoriya", "Subkategoriya"]
}`;

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
    
    // Return default
    return {
      title: input.name,
      description: input.description || 'Mahsulot tavsifi',
      shortDescription: input.name.substring(0, 150),
      keywords: input.name.toLowerCase().split(' '),
      bulletPoints: ['Sifatli mahsulot'],
      seoScore: 50,
      suggestedPrice: input.price || 100000,
      categoryPath: [input.category || 'Umumiy'],
      _demo: true,
    };
  }
}

// ========================================
// PRODUCT SCANNER
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
  _demo?: boolean;
}

export async function scanProduct(imageBuffer: Buffer): Promise<ScanResult> {
  const prompt = `Bu rasmda ko'rsatilgan mahsulotni aniqlang va quyidagi JSON formatda javob bering:

{
  "name": "Mahsulot nomi (O'zbek tilida)",
  "category": "Kategoriya (electronics, clothing, home, beauty, food, other)",
  "description": "Batafsil tavsif (100-200 so'z)",
  "brand": "Brend nomi",
  "estimatedPrice": 100000,
  "specifications": ["Xususiyat 1", "Xususiyat 2"],
  "keywords": ["kalit1", "kalit2"],
  "confidence": 85
}`;

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
    
    return {
      name: "Noma'lum mahsulot",
      category: 'other',
      description: 'Mahsulotni aniqlash imkoni bo\'lmadi',
      brand: 'Unknown',
      estimatedPrice: 100000,
      specifications: [],
      keywords: [],
      confidence: 0,
      _demo: true,
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
  _demo?: boolean;
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
  "minPrice": ${Math.round(input.costPrice * 1.15)},
  "maxPrice": ${Math.round(input.currentPrice * 1.2)},
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
    return {
      recommendedPrice: input.currentPrice,
      minPrice: Math.round(input.costPrice * 1.15),
      maxPrice: Math.round(input.currentPrice * 1.2),
      reasoning: 'Demo tahlil',
      competitorAnalysis: 'Mavjud emas',
      confidence: 50,
      _demo: true,
    };
  }
}

// ========================================
// SERVICE STATUS
// ========================================

export function isEnabled(): boolean {
  return AI_PROVIDER !== 'demo';
}

export function getStatus(): { enabled: boolean; provider: string; model: string; demo: boolean } {
  return {
    enabled: AI_PROVIDER !== 'demo',
    provider: AI_PROVIDER === 'openai' ? 'OpenAI' : (AI_PROVIDER === 'gemini' ? 'Google Gemini' : 'Demo Mode'),
    model: AI_PROVIDER === 'openai' ? 'gpt-4o' : (AI_PROVIDER === 'gemini' ? 'gemini-1.5-flash' : 'demo'),
    demo: AI_PROVIDER === 'demo',
  };
}

export function getProvider(): string {
  return AI_PROVIDER;
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
  getProvider,
};

export default realAIService;
