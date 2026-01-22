// Social Media Management (SMM) Service
// Post generation, video generation, scheduling, multi-platform posting
// YouTube, Instagram, LinkedIn, X.com, Telegram, Facebook integratsiyasi

import { geminiService } from './geminiService';
import { videoGenerationService } from './videoGenerationService';
import { imageAIService } from './imageAIService';
import { aiCostOptimizer } from './aiCostOptimizer';

export interface SMMPostRequest {
  content: string;
  platform: 'youtube' | 'instagram' | 'linkedin' | 'twitter' | 'telegram' | 'facebook';
  postType: 'text' | 'image' | 'video' | 'carousel';
  images?: string[];
  video?: string;
  hashtags?: string[];
  mentions?: string[];
  scheduledTime?: Date;
  language?: 'uz' | 'ru' | 'en';
}

export interface SMMPost {
  id: string;
  platform: string;
  content: string;
  mediaUrls: string[];
  hashtags: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledTime?: Date;
  publishedTime?: Date;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
}

export interface SMMCampaign {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  posts: SMMPost[];
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'completed' | 'paused';
  metrics: {
    totalReach: number;
    totalEngagement: number;
    totalClicks: number;
    conversionRate: number;
  };
}

// Platform-specific configurations
const PLATFORM_CONFIG = {
  youtube: {
    maxLength: 5000,
    hashtags: true,
    mentions: true,
    video: true,
    images: false,
    optimalPostTime: '14:00-16:00',
  },
  instagram: {
    maxLength: 2200,
    hashtags: true,
    mentions: true,
    video: true,
    images: true,
    carousel: true,
    optimalPostTime: '11:00-13:00, 19:00-21:00',
  },
  linkedin: {
    maxLength: 3000,
    hashtags: true,
    mentions: true,
    video: true,
    images: true,
    optimalPostTime: '08:00-10:00, 17:00-19:00',
  },
  twitter: {
    maxLength: 280,
    hashtags: true,
    mentions: true,
    video: true,
    images: true,
    optimalPostTime: '09:00-11:00, 15:00-17:00',
  },
  telegram: {
    maxLength: 4096,
    hashtags: false,
    mentions: true,
    video: true,
    images: true,
    optimalPostTime: '10:00-12:00, 18:00-20:00',
  },
  facebook: {
    maxLength: 5000,
    hashtags: true,
    mentions: true,
    video: true,
    images: true,
    optimalPostTime: '13:00-15:00, 19:00-21:00',
  },
};

class SMMService {
  private enabled: boolean;
  private posts: Map<string, SMMPost> = new Map();
  private campaigns: Map<string, SMMCampaign> = new Map();

  constructor() {
    this.enabled = geminiService.isEnabled();
    if (this.enabled) {
      console.log('✅ SMM Service initialized');
    } else {
      console.warn('⚠️  SMM Service disabled (Gemini API required)');
    }
  }

  /**
   * Generate post content using AI
   */
  async generatePost(request: SMMPostRequest): Promise<SMMPost> {
    if (!this.enabled) {
      throw new Error('SMM Service is not enabled. Please set GEMINI_API_KEY.');
    }

    const platformConfig = PLATFORM_CONFIG[request.platform];

    try {
      // Generate optimized content for platform
      const prompt = `
Siz professional SMM mutaxassisiz. Quyidagi kontent uchun ${request.platform} platformasi uchun optimizatsiya qilingan post yarating:

ORIGINAL KONTENT:
${request.content}

PLATFORM: ${request.platform}
POST TYPE: ${request.postType}
MAX LENGTH: ${platformConfig.maxLength} belgi
HASHTAGS: ${platformConfig.hashtags ? 'Kerak' : 'Kerak emas'}
LANGUAGE: ${request.language || 'uz'}

VAZIFA:
- Platforma qoidalariga mos
- Engagement oshiruvchi
- Hashtaglar optimizatsiya qilingan
- Professional va marketing-optimizatsiya qilingan
- ${request.language === 'uz' ? 'O\'zbek tilida' : request.language === 'ru' ? 'Rus tilida' : 'English'}

Post matni (JSON format):
{
  "content": "Post matni",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "mentions": ["@mention1", "@mention2", ...],
  "callToAction": "CTA matni"
}
`;

      const response = await geminiService.generateText({
        prompt,
        model: 'flash',
        structuredOutput: true,
        temperature: 0.8,
        maxTokens: 1000,
      });

      const postData = JSON.parse(response.text);

      // Generate media if needed
      let mediaUrls: string[] = [];

      if (request.postType === 'image' && !request.images?.length) {
        // Generate image using AI
        const image = await imageAIService.generateProductImage({
          prompt: `Professional social media post image: ${request.content}`,
          type: 'infographic',
          aspectRatio: request.platform === 'instagram' ? '1:1' : '16:9',
          includeText: true,
          textContent: postData.content.substring(0, 100),
        });
        mediaUrls.push(image.url);
      } else if (request.postType === 'video' && !request.video) {
        // Generate video using AI
        const video = await videoGenerationService.generateProductVideo({
          productName: request.content.split(' ').slice(0, 5).join(' '),
          productDescription: request.content,
          duration: 15,
          aspectRatio: request.platform === 'instagram' ? '9:16' : '16:9',
          style: 'lifestyle',
          language: request.language || 'uz',
        });
        mediaUrls.push(video.videoUrl);
      } else {
        mediaUrls = request.images || (request.video ? [request.video] : []);
      }

      const post: SMMPost = {
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        platform: request.platform,
        content: postData.content,
        mediaUrls,
        hashtags: postData.hashtags || [],
        status: request.scheduledTime ? 'scheduled' : 'draft',
        scheduledTime: request.scheduledTime,
      };

      this.posts.set(post.id, post);

      return post;
    } catch (error: any) {
      console.error('SMM post generation error:', error);
      throw error;
    }
  }

  /**
   * Create SMM campaign
   */
  async createCampaign(
    name: string,
    description: string,
    platforms: string[],
    posts: SMMPostRequest[],
    startDate: Date,
    endDate: Date
  ): Promise<SMMCampaign> {
    const generatedPosts: SMMPost[] = [];

    // Generate posts for each platform
    for (const postRequest of posts) {
      for (const platform of platforms) {
        try {
          const post = await this.generatePost({
            ...postRequest,
            platform: platform as any,
          });
          generatedPosts.push(post);
        } catch (error) {
          console.error(`Failed to generate post for ${platform}:`, error);
        }
      }
    }

    const campaign: SMMCampaign = {
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      platforms,
      posts: generatedPosts,
      startDate,
      endDate,
      status: 'draft',
      metrics: {
        totalReach: 0,
        totalEngagement: 0,
        totalClicks: 0,
        conversionRate: 0,
      },
    };

    this.campaigns.set(campaign.id, campaign);

    return campaign;
  }

  /**
   * Schedule post
   */
  async schedulePost(postId: string, scheduledTime: Date): Promise<SMMPost> {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    post.status = 'scheduled';
    post.scheduledTime = scheduledTime;
    this.posts.set(postId, post);

    return post;
  }

  /**
   * Publish post to platform
   */
  async publishPost(postId: string): Promise<SMMPost> {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    try {
      // Platform-specific publishing logic
      // This would integrate with actual platform APIs
      // For now, simulate publishing

      post.status = 'published';
      post.publishedTime = new Date();

      this.posts.set(postId, post);

      return post;
    } catch (error: any) {
      post.status = 'failed';
      this.posts.set(postId, post);
      throw error;
    }
  }

  /**
   * Get platform analytics
   */
  async getPlatformAnalytics(platform: string, startDate: Date, endDate: Date): Promise<any> {
    const posts = Array.from(this.posts.values()).filter(
      p => p.platform === platform &&
      p.publishedTime &&
      p.publishedTime >= startDate &&
      p.publishedTime <= endDate
    );

    const totalReach = posts.reduce((sum, p) => sum + (p.engagement?.views || 0), 0);
    const totalEngagement = posts.reduce((sum, p) => 
      sum + (p.engagement?.likes || 0) + (p.engagement?.comments || 0) + (p.engagement?.shares || 0), 0
    );

    return {
      platform,
      period: { startDate, endDate },
      posts: posts.length,
      totalReach,
      totalEngagement,
      averageEngagement: posts.length > 0 ? totalEngagement / posts.length : 0,
      topPosts: posts
        .sort((a, b) => 
          ((b.engagement?.likes || 0) + (b.engagement?.comments || 0)) -
          ((a.engagement?.likes || 0) + (a.engagement?.comments || 0))
        )
        .slice(0, 5),
    };
  }

  /**
   * Get all campaigns
   */
  getCampaigns(): SMMCampaign[] {
    return Array.from(this.campaigns.values());
  }

  /**
   * Get campaign by ID
   */
  getCampaign(campaignId: string): SMMCampaign | undefined {
    return this.campaigns.get(campaignId);
  }

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

export const smmService = new SMMService();
export default smmService;

