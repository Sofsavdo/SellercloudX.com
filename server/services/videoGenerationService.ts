// Video Generation Service
// Google Veo 3, Runway, Pika, Stable Video Diffusion integratsiyasi
// Mahsulot kartochkalari uchun avtomatik video generatsiyasi

import { geminiService } from './geminiService';
import { aiCostOptimizer } from './aiCostOptimizer';

export interface VideoGenerationRequest {
  productName: string;
  productDescription: string;
  productImages?: string[];
  productCategory?: string;
  targetMarketplace?: string;
  duration?: number; // seconds (default: 15)
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  style?: 'product_showcase' | 'lifestyle' | 'infographic' | 'tutorial';
  language?: 'uz' | 'ru' | 'en';
  includeText?: boolean;
  music?: boolean;
}

export interface GeneratedVideo {
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  aspectRatio: string;
  aiModel: string;
  cost: number;
  latency: number;
  prompt: string;
}

// Video generation providers
const VIDEO_PROVIDERS = {
  google_veo3: {
    name: 'Google Veo 3',
    enabled: !!process.env.GOOGLE_VEO_API_KEY || geminiService.isEnabled(),
    cost: 0.05, // $0.05 per second of video
    maxDuration: 60,
    minDuration: 5,
  },
  runway: {
    name: 'Runway Gen-3',
    enabled: !!process.env.RUNWAY_API_KEY,
    cost: 0.05, // $0.05 per second
    maxDuration: 10,
    minDuration: 5,
  },
  pika: {
    name: 'Pika Labs',
    enabled: !!process.env.PIKA_API_KEY,
    cost: 0.10, // $0.10 per video
    maxDuration: 4,
    minDuration: 3,
  },
  stable_video: {
    name: 'Stable Video Diffusion',
    enabled: !!process.env.REPLICATE_API_KEY,
    cost: 0.02, // $0.02 per second
    maxDuration: 4,
    minDuration: 2,
  },
};

class VideoGenerationService {
  private enabled: boolean;
  private preferredProvider: string = 'google_veo3';

  constructor() {
    // Check if any provider is enabled
    this.enabled = Object.values(VIDEO_PROVIDERS).some(p => p.enabled);
    
    // Set preferred provider (priority: Veo 3 > Runway > Pika > Stable Video)
    if (VIDEO_PROVIDERS.google_veo3.enabled) {
      this.preferredProvider = 'google_veo3';
    } else if (VIDEO_PROVIDERS.runway.enabled) {
      this.preferredProvider = 'runway';
    } else if (VIDEO_PROVIDERS.pika.enabled) {
      this.preferredProvider = 'pika';
    } else if (VIDEO_PROVIDERS.stable_video.enabled) {
      this.preferredProvider = 'stable_video';
    }

    if (this.enabled) {
      console.log(`✅ Video Generation Service initialized (${VIDEO_PROVIDERS[this.preferredProvider as keyof typeof VIDEO_PROVIDERS].name})`);
    } else {
      console.warn('⚠️  Video Generation Service disabled (no API keys found)');
    }
  }

  /**
   * Generate video for product card
   * AI Manager automatically creates prompt based on product data
   */
  async generateProductVideo(request: VideoGenerationRequest): Promise<GeneratedVideo> {
    if (!this.enabled) {
      throw new Error('Video generation is not enabled. Please set API keys.');
    }

    const startTime = Date.now();
    const duration = request.duration || 15;

    try {
      // Step 1: Generate video prompt using AI (Gemini Flash)
      const videoPrompt = await this.generateVideoPrompt(request);

      // Step 2: Generate video using preferred provider
      let video: GeneratedVideo;

      switch (this.preferredProvider) {
        case 'google_veo3':
          video = await this.generateWithVeo3(videoPrompt, request, duration);
          break;
        case 'runway':
          video = await this.generateWithRunway(videoPrompt, request, duration);
          break;
        case 'pika':
          video = await this.generateWithPika(videoPrompt, request);
          break;
        case 'stable_video':
          video = await this.generateWithStableVideo(videoPrompt, request);
          break;
        default:
          throw new Error('No video provider available');
      }

      video.latency = Date.now() - startTime;
      video.prompt = videoPrompt;

      console.log(`✅ Video generated: ${video.videoUrl} (${video.duration}s, $${video.cost.toFixed(4)})`);

      return video;
    } catch (error: any) {
      console.error('Video generation error:', error);
      
      // Fallback to next available provider
      if (this.preferredProvider !== 'stable_video') {
        console.log('🔄 Trying fallback provider...');
        return await this.fallbackGenerate(request, duration);
      }
      
      throw error;
    }
  }

  /**
   * Generate video prompt using AI (Gemini Flash)
   * AI Manager automatically creates optimized prompt based on product data
   */
  private async generateVideoPrompt(request: VideoGenerationRequest): Promise<string> {
    const prompt = `
Siz professional video kontent mutaxassisiz. Quyidagi mahsulot uchun video prompt yarating:

MAHSULOT:
- Nomi: ${request.productName}
- Tavsif: ${request.productDescription}
- Kategoriya: ${request.productCategory || 'Umumiy'}
- Marketplace: ${request.targetMarketplace || 'Umumiy'}

VIDEO TALABLARI:
- Davomiyligi: ${request.duration || 15} soniya
- Format: ${request.aspectRatio || '16:9'}
- Uslub: ${request.style || 'product_showcase'}
- Til: ${request.language || 'uz'}
- Matn: ${request.includeText ? 'Ha' : 'Yo\'q'}
- Musiqa: ${request.music ? 'Ha' : 'Yo\'q'}

VAZIFA:
Professional, marketing-optimizatsiya qilingan video prompt yarating. Video mahsulotni yaxshi ko'rsatishi, xaridorni jalb qilishi va savdoni oshirishi kerak.

Video prompt (English, detailed, cinematic):
`;

    try {
      const response = await geminiService.generateText({
        prompt,
        model: 'flash',
        temperature: 0.8,
        maxTokens: 500,
      });

      return response.text.trim();
    } catch (error) {
      // Fallback prompt
      return `Professional product showcase video: ${request.productName}. ${request.productDescription}. High quality, cinematic, marketing-optimized, sales-boosting. ${request.style === 'lifestyle' ? 'Lifestyle setting, people using product.' : 'Product focus, clean background, professional lighting.'}`;
    }
  }

  /**
   * Generate video with Google Veo 3
   */
  private async generateWithVeo3(
    prompt: string,
    request: VideoGenerationRequest,
    duration: number
  ): Promise<GeneratedVideo> {
    try {
      // Google Veo 3 API call
      // Note: Veo 3 API structure may vary - adjust based on actual API
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/veo-3:generateVideo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GOOGLE_VEO_API_KEY || process.env.GEMINI_API_KEY || '',
        },
        body: JSON.stringify({
          prompt,
          duration_seconds: Math.min(duration, 60),
          aspect_ratio: request.aspectRatio || '16:9',
          style: request.style || 'product_showcase',
        }),
      });

      if (!response.ok) {
        throw new Error(`Veo 3 API error: ${response.status}`);
      }

      const data = await response.json();
      const videoUrl = data.video_url || data.videoUrl;
      const thumbnailUrl = data.thumbnail_url || data.thumbnailUrl;

      const cost = duration * VIDEO_PROVIDERS.google_veo3.cost;

      return {
        videoUrl,
        thumbnailUrl,
        duration,
        aspectRatio: request.aspectRatio || '16:9',
        aiModel: 'google-veo-3',
        cost,
        latency: 0, // Will be set by caller
        prompt,
      };
    } catch (error: any) {
      console.error('Veo 3 generation error:', error);
      throw error;
    }
  }

  /**
   * Generate video with Runway Gen-3
   */
  private async generateWithRunway(
    prompt: string,
    request: VideoGenerationRequest,
    duration: number
  ): Promise<GeneratedVideo> {
    try {
      const response = await fetch('https://api.runwayml.com/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          duration: Math.min(duration, 10),
          aspect_ratio: request.aspectRatio || '16:9',
        }),
      });

      if (!response.ok) {
        throw new Error(`Runway API error: ${response.status}`);
      }

      const data = await response.json();
      const videoUrl = data.video_url;
      const cost = duration * VIDEO_PROVIDERS.runway.cost;

      return {
        videoUrl,
        duration,
        aspectRatio: request.aspectRatio || '16:9',
        aiModel: 'runway-gen-3',
        cost,
        latency: 0,
        prompt,
      };
    } catch (error: any) {
      console.error('Runway generation error:', error);
      throw error;
    }
  }

  /**
   * Generate video with Pika Labs
   */
  private async generateWithPika(
    prompt: string,
    request: VideoGenerationRequest
  ): Promise<GeneratedVideo> {
    try {
      const response = await fetch('https://api.pika.art/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PIKA_API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          aspect_ratio: request.aspectRatio || '16:9',
        }),
      });

      if (!response.ok) {
        throw new Error(`Pika API error: ${response.status}`);
      }

      const data = await response.json();
      const videoUrl = data.video_url;
      const duration = 4; // Pika default duration

      return {
        videoUrl,
        duration,
        aspectRatio: request.aspectRatio || '16:9',
        aiModel: 'pika-labs',
        cost: VIDEO_PROVIDERS.pika.cost,
        latency: 0,
        prompt,
      };
    } catch (error: any) {
      console.error('Pika generation error:', error);
      throw error;
    }
  }

  /**
   * Generate video with Stable Video Diffusion (via Replicate)
   */
  private async generateWithStableVideo(
    prompt: string,
    request: VideoGenerationRequest
  ): Promise<GeneratedVideo> {
    try {
      // Using Replicate for Stable Video Diffusion
      const Replicate = (await import('replicate')).default;
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_KEY || '',
      });

      const output = await replicate.run(
        'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51aa314a7817b6b1c5b35d0e5b4c0',
        {
          input: {
            image: request.productImages?.[0] || '',
            motion_bucket_id: 127,
            cond_aug: 0.02,
            decoding_t: 14,
          },
        }
      );

      const videoUrl = Array.isArray(output) ? output[0] : output as string;
      const duration = 4; // Stable Video default

      return {
        videoUrl,
        duration,
        aspectRatio: request.aspectRatio || '16:9',
        aiModel: 'stable-video-diffusion',
        cost: duration * VIDEO_PROVIDERS.stable_video.cost,
        latency: 0,
        prompt,
      };
    } catch (error: any) {
      console.error('Stable Video generation error:', error);
      throw error;
    }
  }

  /**
   * Fallback video generation
   */
  private async fallbackGenerate(
    request: VideoGenerationRequest,
    duration: number
  ): Promise<GeneratedVideo> {
    // Try next available provider
    const providers = ['runway', 'pika', 'stable_video'];
    const currentIndex = providers.indexOf(this.preferredProvider);

    for (let i = currentIndex + 1; i < providers.length; i++) {
      const provider = providers[i] as keyof typeof VIDEO_PROVIDERS;
      if (VIDEO_PROVIDERS[provider].enabled) {
        this.preferredProvider = provider;
        return await this.generateProductVideo(request);
      }
    }

    throw new Error('No video generation provider available');
  }

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    return Object.entries(VIDEO_PROVIDERS)
      .filter(([_, config]) => config.enabled)
      .map(([key, _]) => key);
  }
}

export const videoGenerationService = new VideoGenerationService();
export default videoGenerationService;
