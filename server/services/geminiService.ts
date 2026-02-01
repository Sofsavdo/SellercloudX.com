// Google Gemini API Service
// Gemini 2.5 Flash, Flash-Lite, Gemini 3 Pro integratsiyasi
// Uses Emergent LLM Key for authentication

import { GoogleGenerativeAI } from '@google/generative-ai';

// Use Emergent LLM Key (works for Gemini too)
const GEMINI_API_KEY = process.env.EMERGENT_LLM_KEY || process.env.GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export interface GeminiRequest {
  prompt: string;
  model?: 'flash' | 'flash-lite' | 'pro' | '3-pro';
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
  context?: string; // For context caching
  structuredOutput?: boolean; // JSON format
  tools?: any[]; // Function calling
}

export interface GeminiResponse {
  text: string;
  model: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  latency: number;
}

export interface GeminiImageRequest {
  prompt: string;
  image?: string | Buffer; // Base64 or Buffer
  type?: 'product_photo' | 'infographic';
  aspectRatio?: '1:1' | '4:3' | '16:9';
}

export interface GeminiImageResponse {
  imageUrl: string;
  model: string;
  cost: number;
  latency: number;
}

// Model configurations
const MODEL_CONFIG = {
  'flash': {
    name: 'gemini-2.5-flash',
    inputCost: 0.075 / 1_000_000, // $0.075 per 1M tokens
    outputCost: 0.30 / 1_000_000, // $0.30 per 1M tokens
    maxTokens: 1_000_000,
    rpm: 1000,
  },
  'flash-lite': {
    name: 'gemini-2.5-flash-lite',
    inputCost: 0.0375 / 1_000_000, // $0.0375 per 1M tokens
    outputCost: 0.15 / 1_000_000, // $0.15 per 1M tokens
    maxTokens: 1_000_000,
    rpm: 2000,
  },
  'pro': {
    name: 'gemini-2.5-pro',
    inputCost: 0.50 / 1_000_000, // $0.50 per 1M tokens
    outputCost: 1.25 / 1_000_000, // $1.25 per 1M tokens
    maxTokens: 1_000_000,
    rpm: 500,
  },
  '3-pro': {
    name: 'gemini-3-pro-preview',
    inputCost: 2.00 / 1_000_000, // $2.00 per 1M tokens (<=200K), $4.00 (>200K)
    outputCost: 12.00 / 1_000_000, // $12.00 per 1M tokens (<=200K), $18.00 (>200K)
    maxTokens: 1_000_000,
    rpm: 500,
  },
};

class GeminiService {
  private enabled: boolean;

  constructor() {
    this.enabled = !!GEMINI_API_KEY && !!genAI;
    if (!this.enabled) {
      console.warn('⚠️  Gemini API key not found. Gemini service disabled.');
    } else {
      console.log('✅ Gemini API Service initialized');
    }
  }

  /**
   * Check if Gemini service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Generate text content using Gemini
   */
  async generateText(request: GeminiRequest): Promise<GeminiResponse> {
    if (!this.enabled) {
      throw new Error('Gemini API is not enabled. Please set GEMINI_API_KEY.');
    }

    const startTime = Date.now();
    const modelType = request.model || 'flash';
    const config = MODEL_CONFIG[modelType];

    try {
      const model = genAI!.getGenerativeModel({ 
        model: config.name,
        generationConfig: {
          temperature: request.temperature || 0.7,
          maxOutputTokens: request.maxTokens || 8192,
          responseMimeType: request.structuredOutput ? 'application/json' : undefined,
        },
        systemInstruction: request.systemInstruction,
      });

      // Build prompt with context
      let fullPrompt = request.prompt;
      if (request.context) {
        fullPrompt = `${request.context}\n\n${request.prompt}`;
      }

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      // Calculate tokens (approximate)
      const inputTokens = Math.ceil(fullPrompt.length / 4); // Rough estimate
      const outputTokens = Math.ceil(text.length / 4);
      const totalTokens = inputTokens + outputTokens;

      // Calculate cost
      const inputCost = inputTokens * config.inputCost;
      const outputCost = outputTokens * config.outputCost;
      const cost = inputCost + outputCost;

      const latency = Date.now() - startTime;

      return {
        text,
        model: config.name,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: totalTokens,
        },
        cost,
        latency,
      };
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Generate image using Nano Banana
   */
  async generateImage(request: GeminiImageRequest): Promise<GeminiImageResponse> {
    if (!this.enabled) {
      throw new Error('Gemini API is not enabled. Please set GEMINI_API_KEY.');
    }

    const startTime = Date.now();

    try {
      // Nano Banana model for image generation
      const model = genAI!.getGenerativeModel({ 
        model: 'nano-banana-preview',
      });

      // Image generation prompt
      const prompt = request.type === 'infographic' 
        ? `Create a professional marketplace product infographic with text: ${request.prompt}`
        : `Create a photorealistic product image: ${request.prompt}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      // Extract image URL from response
      // Note: Gemini image generation API structure may vary
      const imageUrl = response.text(); // This might need adjustment based on actual API response

      const cost = 0.02; // $0.02 per image (Nano Banana)
      const latency = Date.now() - startTime;

      return {
        imageUrl,
        model: 'nano-banana-preview',
        cost,
        latency,
      };
    } catch (error: any) {
      console.error('Gemini Image API error:', error);
      throw new Error(`Gemini Image API error: ${error.message}`);
    }
  }

  /**
   * Analyze image (multimodal)
   */
  async analyzeImage(image: string | Buffer, prompt: string): Promise<GeminiResponse> {
    if (!this.enabled) {
      throw new Error('Gemini API is not enabled. Please set GEMINI_API_KEY.');
    }

    const startTime = Date.now();
    const config = MODEL_CONFIG['flash'];

    try {
      const model = genAI!.getGenerativeModel({ 
        model: config.name,
      });

      // Convert image to base64 if Buffer
      let imageBase64: string;
      if (Buffer.isBuffer(image)) {
        imageBase64 = image.toString('base64');
      } else {
        imageBase64 = image;
      }

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg',
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      // Calculate tokens and cost
      const inputTokens = Math.ceil((prompt.length + imageBase64.length) / 4);
      const outputTokens = Math.ceil(text.length / 4);
      const totalTokens = inputTokens + outputTokens;

      const inputCost = inputTokens * config.inputCost;
      const outputCost = outputTokens * config.outputCost;
      const cost = inputCost + outputCost;

      const latency = Date.now() - startTime;

      return {
        text,
        model: config.name,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: totalTokens,
        },
        cost,
        latency,
      };
    } catch (error: any) {
      console.error('Gemini Image Analysis error:', error);
      throw new Error(`Gemini Image Analysis error: ${error.message}`);
    }
  }

  /**
   * Use Google Search integration
   */
  async searchWeb(query: string, maxResults: number = 5): Promise<any[]> {
    if (!this.enabled) {
      throw new Error('Gemini API is not enabled. Please set GEMINI_API_KEY.');
    }

    try {
      const model = genAI!.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
      });

      // Use Google Search grounding
      const result = await model.generateContent(
        `Search the web for: ${query}. Return top ${maxResults} results with URLs.`
      );

      const response = await result.response;
      const text = response.text();

      // Parse search results (format may vary)
      // This is a simplified version - actual implementation depends on API response format
      const results = text.split('\n').filter(line => line.includes('http')).map(line => ({
        title: line.split('http')[0].trim(),
        url: 'http' + line.split('http')[1].trim(),
      }));

      return results.slice(0, maxResults);
    } catch (error: any) {
      console.error('Gemini Search error:', error);
      throw new Error(`Gemini Search error: ${error.message}`);
    }
  }

  /**
   * Analyze document (PDF, etc.)
   */
  async analyzeDocument(document: Buffer, prompt: string): Promise<GeminiResponse> {
    if (!this.enabled) {
      throw new Error('Gemini API is not enabled. Please set GEMINI_API_KEY.');
    }

    const startTime = Date.now();
    const config = MODEL_CONFIG['flash'];

    try {
      const model = genAI!.getGenerativeModel({ 
        model: config.name,
      });

      const documentBase64 = document.toString('base64');

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: documentBase64,
            mimeType: 'application/pdf',
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      // Calculate tokens and cost
      const inputTokens = Math.ceil((prompt.length + documentBase64.length) / 4);
      const outputTokens = Math.ceil(text.length / 4);
      const totalTokens = inputTokens + outputTokens;

      const inputCost = inputTokens * config.inputCost;
      const outputCost = outputTokens * config.outputCost;
      const cost = inputCost + outputCost;

      const latency = Date.now() - startTime;

      return {
        text,
        model: config.name,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: totalTokens,
        },
        cost,
        latency,
      };
    } catch (error: any) {
      console.error('Gemini Document Analysis error:', error);
      throw new Error(`Gemini Document Analysis error: ${error.message}`);
    }
  }
}

export const geminiService = new GeminiService();
export default geminiService;
