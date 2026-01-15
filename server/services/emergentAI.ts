// @ts-nocheck
// EMERGENT AI SERVICE - Unified AI Integration
// Cost-optimized, scalable, production-ready
// Uses Emergent LLM Key for OpenAI and Anthropic

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize clients with Emergent LLM key
const EMERGENT_KEY = process.env.EMERGENT_LLM_KEY || '';

// OpenAI client (for image generation and GPT models)
const openai = EMERGENT_KEY ? new OpenAI({
  apiKey: EMERGENT_KEY,
  baseURL: 'https://api.openai.com/v1',
}) : null;

// Anthropic client (for Claude models)
const anthropic = EMERGENT_KEY ? new Anthropic({
  apiKey: EMERGENT_KEY,
}) : null;

// ========================================
// COST TRACKING
// ========================================

interface CostEntry {
  partnerId: string;
  model: string;
  operation: string;
  tokensUsed?: number;
  imagesGenerated?: number;
  cost: number;
  timestamp: Date;
}

const costLog: CostEntry[] = [];

function logCost(entry: CostEntry) {
  costLog.push(entry);
  console.log(`💰 AI Cost: $${entry.cost.toFixed(4)} (${entry.operation}, ${entry.model})`);
}

export function getPartnerCosts(partnerId: string, startDate: Date, endDate: Date) {
  return costLog
    .filter(e => 
      e.partnerId === partnerId && 
      e.timestamp >= startDate && 
      e.timestamp <= endDate
    )
    .reduce((sum, e) => sum + e.cost, 0);
}

// ========================================
// SERVICE STATUS CHECK
// ========================================

export function isEnabled(): boolean {
  return !!EMERGENT_KEY && (!!openai || !!anthropic);
}

// ========================================
// TEXT GENERATION (Claude 4 Sonnet / GPT-4)
// ========================================

export interface TextGenerationOptions {
  prompt: string;
  systemMessage?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  provider?: 'anthropic' | 'openai';
}

export async function generateText(
  options: TextGenerationOptions,
  partnerId?: string
): Promise<string> {
  const {
    prompt,
    systemMessage = 'Sen professional marketplace AI assistant san.',
    maxTokens = 2000,
    temperature = 0.7,
    model = 'claude-4-sonnet-20250514',
    provider = 'anthropic',
  } = options;

  // Check if service is enabled
  if (!EMERGENT_KEY) {
    console.warn('⚠️  EMERGENT_LLM_KEY not set. AI service disabled.');
    return 'AI xizmati hozirda mavjud emas. EMERGENT_LLM_KEY sozlanmagan.';
  }

  try {
    const startTime = Date.now();
    let text = '';
    let tokensUsed = 0;
    let actualModel = model;
    let cost = 0;

    if (provider === 'anthropic' && anthropic) {
      // Use Claude
      const message = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemMessage,
        messages: [{ role: 'user', content: prompt }],
      });

      text = message.content[0].type === 'text' ? message.content[0].text : '';
      const inputTokens = message.usage.input_tokens;
      const outputTokens = message.usage.output_tokens;
      tokensUsed = inputTokens + outputTokens;
      
      // Cost calculation (Claude 4 Sonnet: ~$3/1M input, ~$15/1M output)
      cost = (inputTokens * 0.000003) + (outputTokens * 0.000015);
    } else if (openai) {
      // Fallback to OpenAI GPT-4
      actualModel = 'gpt-4-turbo-preview';
      const response = await openai.chat.completions.create({
        model: actualModel,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature,
      });

      text = response.choices[0]?.message?.content || '';
      tokensUsed = response.usage?.total_tokens || 0;
      
      // Cost calculation (GPT-4 Turbo: ~$0.01/1K tokens)
      cost = tokensUsed * 0.00001;
    } else {
      throw new Error('No AI provider available');
    }

    const duration = Date.now() - startTime;

    if (partnerId) {
      logCost({
        partnerId,
        model: actualModel,
        operation: 'text_generation',
        tokensUsed,
        cost,
        timestamp: new Date(),
      });
    }

    console.log(`✅ Text generated (${duration}ms, $${cost.toFixed(4)}, ${tokensUsed} tokens)`);

    return text;
  } catch (error: any) {
    console.error('❌ Text generation error:', error.message);
    // Return fallback response instead of throwing
    return `AI xatolik: ${error.message}. Keyinroq qayta urinib ko'ring.`;
  }
}

// ========================================
// IMAGE GENERATION (gpt-image-1)
// ========================================

export interface ImageGenerationOptions {
  prompt: string;
  size?: '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
  n?: number;
  model?: string;
}

export async function generateImage(
  options: ImageGenerationOptions,
  partnerId?: string
): Promise<string[]> {
  const {
    prompt,
    size = '1024x1024',
    quality = 'standard',
    n = 1,
    model = 'gpt-image-1',
  } = options;

  if (!openai) {
    console.warn('⚠️  OpenAI client not available for image generation');
    return [];
  }

  try {
    const startTime = Date.now();

    const response = await openai.images.generate({
      model,
      prompt,
      n,
      size,
      quality,
      response_format: 'url',
    });

    const urls = response.data.map(img => img.url || '').filter(url => url);
    const duration = Date.now() - startTime;

    // Cost calculation (gpt-image-1: ~$0.04 per standard image, ~$0.08 per HD)
    const costPerImage = quality === 'hd' ? 0.08 : 0.04;
    const totalCost = costPerImage * n;

    if (partnerId) {
      logCost({
        partnerId,
        model,
        operation: 'image_generation',
        imagesGenerated: n,
        cost: totalCost,
        timestamp: new Date(),
      });
    }

    console.log(`✅ Images generated (${duration}ms, $${totalCost.toFixed(4)}, ${urls.length} images)`);

    return urls;
  } catch (error: any) {
    console.error('❌ Image generation error:', error.message);
    return [];
  }
}

// ========================================
// JSON GENERATION (Structured Output)
// ========================================

export async function generateJSON<T = any>(
  prompt: string,
  schema: string,
  partnerId?: string
): Promise<T> {
  const fullPrompt = `${prompt}

MUHIM: Faqat valid JSON qaytaring, hech qanday tushuntirish yoki markdown yozmasdan.
Schema: ${schema}`;
  
  const text = await generateText(
    {
      prompt: fullPrompt,
      systemMessage: 'You are a JSON API. Return only valid JSON, no explanation, no markdown code blocks.',
      temperature: 0.3,
    },
    partnerId
  );

  try {
    // Extract JSON from markdown code blocks if present
    let jsonText = text.trim();
    
    // Remove markdown code blocks
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }
    
    // Try to find JSON object or array
    const objectMatch = jsonText.match(/\{[\s\S]*\}/);
    const arrayMatch = jsonText.match(/\[[\s\S]*\]/);
    
    if (objectMatch) {
      jsonText = objectMatch[0];
    } else if (arrayMatch) {
      jsonText = arrayMatch[0];
    }
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('❌ JSON parse error. Raw text:', text.substring(0, 200));
    // Return empty object as fallback
    return {} as T;
  }
}

// ========================================
// BATCH PROCESSING
// ========================================

export async function batchGenerateText(
  prompts: Array<{ prompt: string; systemMessage?: string }>,
  partnerId?: string
): Promise<string[]> {
  const batchSize = parseInt(process.env.AI_BATCH_SIZE || '10');
  const results: string[] = [];

  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(p => generateText(p, partnerId))
    );
    results.push(...batchResults);
    
    // Rate limiting
    if (i + batchSize < prompts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

// ========================================
// MARKETPLACE-SPECIFIC GENERATORS
// ========================================

export interface ProductCardInput {
  name: string;
  category?: string;
  description?: string;
  price?: number;
  images?: string[];
  marketplace: 'uzum' | 'wildberries' | 'yandex' | 'ozon';
}

export interface ProductCardOutput {
  title: string;
  description: string;
  shortDescription: string;
  keywords: string[];
  bulletPoints: string[];
  seoScore: number;
  categoryPath: string[];
  tags: string[];
}

export async function generateProductCard(
  input: ProductCardInput,
  partnerId?: string
): Promise<ProductCardOutput> {
  const prompt = `
Sen professional marketplace SEO mutaxassisi san.

MAHSULOT:
- Nomi: ${input.name}
- Kategoriya: ${input.category || 'umumiy'}
- Tavsif: ${input.description || 'yo\'q'}
- Narx: ${input.price || 'belgilanmagan'} so'm
- Marketplace: ${input.marketplace}

Quyidagilarni JSON formatda yarat:
{
  "title": "SEO-optimizatsiya qilingan sarlavha (60-80 belgi)",
  "description": "To'liq tavsif (500-800 so'z)",
  "shortDescription": "Qisqa tavsif (150 belgi)",
  "keywords": ["kalit1", "kalit2", "...10 tagacha"],
  "bulletPoints": ["Xususiyat1", "Xususiyat2", "...5 tagacha"],
  "seoScore": 85,
  "categoryPath": ["Kategoriya", "Subkategoriya"],
  "tags": ["tag1", "tag2", "...8 tagacha"]
}

Til: O'zbek va Rus aralash (marketplace ga qarab)
`;

  return generateJSON<ProductCardOutput>(prompt, 'ProductCard', partnerId);
}

// ========================================
// EXPORTS
// ========================================

export const emergentAI = {
  generateText,
  generateImage,
  generateJSON,
  batchGenerateText,
  getPartnerCosts,
  isEnabled,
  generateProductCard,
};

export default emergentAI;
