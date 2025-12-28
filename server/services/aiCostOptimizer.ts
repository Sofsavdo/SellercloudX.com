// AI Cost Optimizer Service
// Vazifa murakkabligiga qarab eng mos va arzon AI modelni tanlash

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

interface AIRequest {
  task: string;
  prompt: string;
  complexity: 'simple' | 'medium' | 'complex' | 'vision';
  language?: 'uz' | 'ru' | 'en';
  requiresVision?: boolean;
  maxTokens?: number;
}

interface AIResponse {
  content: string;
  model: string;
  cost: number;
  tokens: number;
  latency: number;
}

/**
 * Smart AI Model Selection based on task complexity
 */
export class AICostOptimizer {
  
  /**
   * Select best AI model for the task
   */
  async processRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      // Vision tasks - always use GPT-4 Vision
      if (request.requiresVision || request.complexity === 'vision') {
        return await this.processWithGPT4Vision(request, startTime);
      }

      // Simple tasks - use Claude Haiku (cheapest and fastest)
      if (request.complexity === 'simple') {
        return await this.processWithClaudeHaiku(request, startTime);
      }

      // Medium tasks - use Claude Sonnet (good balance)
      if (request.complexity === 'medium') {
        return await this.processWithClaudeSonnet(request, startTime);
      }

      // Complex tasks - use Claude Sonnet or GPT-4 Turbo
      if (request.complexity === 'complex') {
        // For Uzbek language, prefer GPT-4 (better support)
        if (request.language === 'uz') {
          return await this.processWithGPT4Turbo(request, startTime);
        }
        // For other languages, use Claude Sonnet (cheaper)
        return await this.processWithClaudeSonnet(request, startTime);
      }

      // Default: Claude Haiku
      return await this.processWithClaudeHaiku(request, startTime);
    } catch (error: any) {
      console.error('AI processing error:', error);
      // Fallback to Claude Haiku
      return await this.processWithClaudeHaiku(request, startTime);
    }
  }

  /**
   * Process with Claude 3 Haiku (cheapest, fastest)
   */
  private async processWithClaudeHaiku(
    request: AIRequest,
    startTime: number
  ): Promise<AIResponse> {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: request.maxTokens || 4096,
      messages: [
        {
          role: 'user',
          content: request.prompt
        }
      ]
    });

    const latency = Date.now() - startTime;
    const tokens = (response.usage.input_tokens || 0) + (response.usage.output_tokens || 0);
    const cost = this.calculateClaudeHaikuCost(response.usage);

    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      model: 'claude-3-haiku-20240307',
      cost,
      tokens,
      latency
    };
  }

  /**
   * Process with Claude 3.5 Sonnet (good balance)
   */
  private async processWithClaudeSonnet(
    request: AIRequest,
    startTime: number
  ): Promise<AIResponse> {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: request.maxTokens || 8192,
      messages: [
        {
          role: 'user',
          content: request.prompt
        }
      ]
    });

    const latency = Date.now() - startTime;
    const tokens = (response.usage.input_tokens || 0) + (response.usage.output_tokens || 0);
    const cost = this.calculateClaudeSonnetCost(response.usage);

    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      model: 'claude-3-5-sonnet-20241022',
      cost,
      tokens,
      latency
    };
  }

  /**
   * Process with GPT-4 Turbo (best quality, expensive)
   */
  private async processWithGPT4Turbo(
    request: AIRequest,
    startTime: number
  ): Promise<AIResponse> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      max_tokens: request.maxTokens || 4096,
      messages: [
        {
          role: 'user',
          content: request.prompt
        }
      ]
    });

    const latency = Date.now() - startTime;
    const tokens = response.usage?.total_tokens || 0;
    const cost = this.calculateGPT4TurboCost(response.usage);

    return {
      content: response.choices[0].message.content || '',
      model: 'gpt-4-turbo-preview',
      cost,
      tokens,
      latency
    };
  }

  /**
   * Process with GPT-4 Vision (for image analysis)
   */
  private async processWithGPT4Vision(
    request: AIRequest,
    startTime: number
  ): Promise<AIResponse> {
    // This would need image URL or base64
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      max_tokens: request.maxTokens || 4096,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: request.prompt },
            // Image would be added here
          ]
        }
      ]
    });

    const latency = Date.now() - startTime;
    const tokens = response.usage?.total_tokens || 0;
    const cost = this.calculateGPT4VisionCost(response.usage);

    return {
      content: response.choices[0].message.content || '',
      model: 'gpt-4-vision-preview',
      cost,
      tokens,
      latency
    };
  }

  /**
   * Cost calculations
   */
  private calculateClaudeHaikuCost(usage: any): number {
    const inputTokens = usage.input_tokens || 0;
    const outputTokens = usage.output_tokens || 0;
    // $0.25/1M input, $1.25/1M output
    return (inputTokens / 1_000_000) * 0.25 + (outputTokens / 1_000_000) * 1.25;
  }

  private calculateClaudeSonnetCost(usage: any): number {
    const inputTokens = usage.input_tokens || 0;
    const outputTokens = usage.output_tokens || 0;
    // $3/1M input, $15/1M output
    return (inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 15;
  }

  private calculateGPT4TurboCost(usage: any): number {
    const totalTokens = usage?.total_tokens || 0;
    // Approx $0.01 per 1K tokens
    return (totalTokens / 1000) * 0.01;
  }

  private calculateGPT4VisionCost(usage: any): number {
    const totalTokens = usage?.total_tokens || 0;
    // $10/1M input, $30/1M output (approx)
    return (totalTokens / 1_000_000) * 0.01;
  }

  /**
   * Get cost statistics
   */
  async getCostStatistics(period: 'day' | 'week' | 'month'): Promise<{
    totalCost: number;
    byModel: Record<string, number>;
    byTask: Record<string, number>;
    savings: number;
  }> {
    // This would query database for actual usage
    // For now, return mock data
    return {
      totalCost: 0,
      byModel: {},
      byTask: {},
      savings: 0
    };
  }
}

export const aiCostOptimizer = new AICostOptimizer();

