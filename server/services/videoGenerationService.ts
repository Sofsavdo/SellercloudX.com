import axios from 'axios';
import { openai } from './openaiService';

// AI Video Generation Service
class VideoGenerationService {
  private runwayConfig = {
    apiKey: process.env.RUNWAYML_API_KEY || '',
    apiUrl: 'https://api.runwayml.com/v1'
  };

  private synthesiaConfig = {
    apiKey: process.env.SYNTHESIA_API_KEY || '',
    apiUrl: 'https://api.synthesia.io/v2'
  };

  /**
   * Generate product video using Runway ML
   */
  async generateProductVideo(params: {
    productName: string;
    description: string;
    images: string[];
    duration?: number;
  }): Promise<{
    success: boolean;
    videoUrl?: string;
    taskId?: string;
    error?: string;
  }> {
    try {
      // Generate video script using GPT-4
      const script = await this.generateVideoScript(params.productName, params.description);

      // Create video with Runway ML
      const response = await axios.post(
        `${this.runwayConfig.apiUrl}/generate`,
        {
          prompt: script,
          images: params.images,
          duration: params.duration || 15,
          style: 'product_showcase'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.runwayConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        taskId: response.data.id,
        videoUrl: response.data.output_url
      };
    } catch (error: any) {
      console.error('Video generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate video script using AI
   */
  private async generateVideoScript(productName: string, description: string): Promise<string> {
    const prompt = `
Create a compelling 15-second product video script for:
Product: ${productName}
Description: ${description}

The script should:
- Start with an attention-grabbing hook
- Highlight 3 key benefits
- End with a call-to-action
- Be suitable for social media (Instagram, TikTok)
- Use dynamic, engaging language

Format: Scene-by-scene breakdown with visual descriptions.
    `.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8
    });

    return completion.choices[0].message.content || '';
  }

  /**
   * Generate talking head video using Synthesia
   */
  async generateTalkingHeadVideo(params: {
    script: string;
    avatar?: string;
    voice?: string;
    background?: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.synthesiaConfig.apiUrl}/videos`,
        {
          test: false,
          input: [{
            scriptText: params.script,
            avatar: params.avatar || 'anna_costume1_cameraA',
            voice: params.voice || 'en-US-Neural2-A',
            background: params.background || 'green_screen'
          }]
        },
        {
          headers: {
            'Authorization': this.synthesiaConfig.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        videoId: response.data.id
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate social media video (short-form)
   */
  async generateSocialVideo(params: {
    productName: string;
    images: string[];
    style: 'tiktok' | 'instagram' | 'youtube_shorts';
  }): Promise<any> {
    const aspectRatios = {
      tiktok: '9:16',
      instagram: '9:16',
      youtube_shorts: '9:16'
    };

    return this.generateProductVideo({
      productName: params.productName,
      description: `Create engaging ${params.style} video`,
      images: params.images,
      duration: 15
    });
  }

  /**
   * Add text overlays and effects
   */
  async addVideoEffects(videoUrl: string, effects: {
    text?: string[];
    music?: string;
    transitions?: string;
  }): Promise<any> {
    // Implementation for adding effects
    return { success: true, videoUrl };
  }

  /**
   * Check video generation status
   */
  async checkVideoStatus(taskId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    progress?: number;
  }> {
    try {
      const response = await axios.get(
        `${this.runwayConfig.apiUrl}/tasks/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.runwayConfig.apiKey}`
          }
        }
      );

      return {
        status: response.data.status,
        videoUrl: response.data.output_url,
        progress: response.data.progress
      };
    } catch (error) {
      return { status: 'failed' };
    }
  }
}

export const videoGenerationService = new VideoGenerationService();
