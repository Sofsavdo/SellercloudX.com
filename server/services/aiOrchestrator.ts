// AI Orchestrator - Smart AI Model Selection and Management
// Avtomatik AI tanlash, caching, fallback, paralel ishlash

import { aiCostOptimizer } from './aiCostOptimizer';
import { db } from '../db';
import Bull from 'bull';
import Redis from 'redis';

// Redis connection for queue
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// AI Task Queue for parallel processing
export const aiTaskQueue = new Bull('ai-tasks', {
  redis: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 50
  }
});

interface AITask {
  id: string;
  partnerId: string;
  taskType: string;
  complexity: 'simple' | 'medium' | 'complex' | 'vision';
  prompt: string;
  data?: any;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  retryCount?: number;
}

interface AIUsage {
  partnerId: string;
  model: string;
  tokens: number;
  cost: number;
  latency: number;
  success: boolean;
  timestamp: Date;
}

// Cache for AI responses (Redis or in-memory fallback)
const memoryCache = new Map<string, { value: any; expires: number }>();

const cache = {
  async get(key: string): Promise<any> {
    // Try Redis first
    if (redisClient) {
      try {
        const cached = await redisClient.get(`ai:cache:${key}`);
        if (cached) return JSON.parse(cached);
      } catch (error) {
        console.warn('Redis cache get error:', error);
      }
    }
    
    // Fallback to memory cache
    const memCached = memoryCache.get(key);
    if (memCached && memCached.expires > Date.now()) {
      return memCached.value;
    }
    if (memCached) {
      memoryCache.delete(key);
    }
    
    return null;
  },
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    // Try Redis first
    if (redisClient) {
      try {
        await redisClient.setEx(`ai:cache:${key}`, ttl, JSON.stringify(value));
        return;
      } catch (error) {
        console.warn('Redis cache set error:', error);
      }
    }
    
    // Fallback to memory cache
    memoryCache.set(key, {
      value,
      expires: Date.now() + (ttl * 1000)
    });
    
    // Cleanup expired entries periodically
    if (memoryCache.size > 10000) {
      for (const [k, v] of memoryCache.entries()) {
        if (v.expires <= Date.now()) {
          memoryCache.delete(k);
        }
      }
    }
  }
};

class AIOrchestrator {
  private activeJobs: Map<string, any> = new Map();
  private usageStats: Map<string, AIUsage[]> = new Map();

  constructor() {
    this.setupQueueProcessors();
  }

  /**
   * Process AI task with smart routing
   */
  async processTask(task: AITask): Promise<any> {
    const cacheKey = this.generateCacheKey(task);
    
    // Check cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit for task ${task.id}`);
      await this.trackUsage(task.partnerId, {
        model: 'cache',
        tokens: 0,
        cost: 0,
        latency: 10,
        success: true,
        timestamp: new Date()
      });
      return cached;
    }

    try {
      // Determine complexity if not provided
      if (!task.complexity) {
        task.complexity = this.determineComplexity(task);
      }

      // Process with AI Cost Optimizer
      const startTime = Date.now();
      const response = await aiCostOptimizer.processRequest({
        task: task.taskType,
        prompt: task.prompt,
        complexity: task.complexity,
        language: task.data?.language || 'uz',
        requiresVision: task.complexity === 'vision',
        maxTokens: task.data?.maxTokens
      });

      const latency = Date.now() - startTime;

      // Track usage
      await this.trackUsage(task.partnerId, {
        model: response.model,
        tokens: response.tokens,
        cost: response.cost,
        latency: response.latency,
        success: true,
        timestamp: new Date()
      });

      // Cache result
      await cache.set(cacheKey, response.content, 3600);

      // Save to database
      await this.saveAIUsage(task.partnerId, response);

      return response.content;
    } catch (error: any) {
      console.error(`❌ AI task error: ${error.message}`);
      
      // Fallback mechanism
      if (task.retryCount === undefined || task.retryCount < 2) {
        console.log(`🔄 Retrying with fallback model...`);
        return await this.fallbackProcess(task);
      }

      throw error;
    }
  }

  /**
   * Add task to queue for parallel processing
   */
  async queueTask(task: AITask): Promise<string> {
    const job = await aiTaskQueue.add(task.taskType, task, {
      priority: this.getPriorityValue(task.priority || 'medium'),
      jobId: task.id
    });

    this.activeJobs.set(task.id, job);
    return job.id.toString();
  }

  /**
   * Process multiple tasks in parallel
   */
  async processBatch(tasks: AITask[]): Promise<Map<string, any>> {
    console.log(`🚀 Processing ${tasks.length} tasks in parallel...`);

    const results = new Map<string, any>();
    const promises = tasks.map(async (task) => {
      try {
        const result = await this.processTask(task);
        results.set(task.id, { success: true, data: result });
      } catch (error: any) {
        results.set(task.id, { success: false, error: error.message });
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Determine task complexity
   */
  private determineComplexity(task: AITask): 'simple' | 'medium' | 'complex' | 'vision' {
    const simpleTasks = ['chat', 'auto-response', 'simple-analysis'];
    const mediumTasks = ['seo-content', 'price-optimization', 'analytics'];
    const complexTasks = ['strategy', 'forecasting', 'deep-analysis'];
    const visionTasks = ['image-analysis', 'product-recognition'];

    if (visionTasks.includes(task.taskType)) return 'vision';
    if (simpleTasks.includes(task.taskType)) return 'simple';
    if (mediumTasks.includes(task.taskType)) return 'medium';
    if (complexTasks.includes(task.taskType)) return 'complex';

    // Default based on prompt length
    if (task.prompt.length < 200) return 'simple';
    if (task.prompt.length < 1000) return 'medium';
    return 'complex';
  }

  /**
   * Fallback mechanism
   */
  private async fallbackProcess(task: AITask): Promise<any> {
    // Try with simpler/cheaper model
    const fallbackTask = {
      ...task,
      complexity: task.complexity === 'complex' ? 'medium' : 'simple',
      retryCount: (task.retryCount || 0) + 1
    };

    return await this.processTask(fallbackTask);
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(task: AITask): string {
    const hash = require('crypto')
      .createHash('md5')
      .update(`${task.taskType}:${task.prompt}:${task.complexity}`)
      .digest('hex');
    return hash;
  }

  /**
   * Track AI usage
   */
  private async trackUsage(partnerId: string, usage: AIUsage): Promise<void> {
    if (!this.usageStats.has(partnerId)) {
      this.usageStats.set(partnerId, []);
    }
    this.usageStats.get(partnerId)!.push(usage);
  }

  /**
   * Save AI usage to database
   */
  private async saveAIUsage(partnerId: string, response: any): Promise<void> {
    try {
      await db.run(
        `INSERT INTO ai_usage_logs 
         (partner_id, model, tokens, cost, latency, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          partnerId,
          response.model,
          response.tokens,
          response.cost,
          response.latency
        ]
      );
    } catch (error) {
      console.error('Error saving AI usage:', error);
    }
  }

  /**
   * Get priority value
   */
  private getPriorityValue(priority: string): number {
    const priorities = {
      urgent: 1,
      high: 2,
      medium: 3,
      low: 4
    };
    return priorities[priority as keyof typeof priorities] || 3;
  }

  /**
   * Setup queue processors with dynamic concurrency
   */
  private setupQueueProcessors(): void {
    // Check if queue is available (Redis)
    if (!aiTaskQueue || typeof aiTaskQueue.process !== 'function') {
      console.warn('⚠️  Queue not available, using direct processing');
      return;
    }

    // Get concurrency from env or default to 10
    const concurrency = parseInt(process.env.AI_WORKER_CONCURRENCY || '10');
    
    // Process jobs with concurrency
    aiTaskQueue.process(concurrency, async (job) => {
      const task = job.data as AITask;
      console.log(`🔄 Processing AI task: ${task.id} (${task.taskType})`);
      
      try {
        const result = await this.processTask(task);
        return { success: true, data: result };
      } catch (error: any) {
        console.error(`❌ Task ${task.id} failed:`, error);
        
        // Log error to database
        await this.logError(task.partnerId, {
          errorType: 'task_failed',
          errorMessage: error.message,
          model: 'unknown',
          taskType: task.taskType
        });
        
        throw error;
      }
    });

    // Handle completed jobs
    aiTaskQueue.on('completed', (job: any, result: any) => {
      console.log(`✅ Task ${job.id} completed`);
      if (job?.data?.id) {
        this.activeJobs.delete(job.data.id);
      }
    });

    // Handle failed jobs
    aiTaskQueue.on('failed', (job: any, error: any) => {
      console.error(`❌ Task ${job?.id} failed:`, error);
      if (job?.data?.id) {
        this.activeJobs.delete(job.data.id);
      }
    });
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(partnerId?: string, period?: { from: Date; to: Date }): Promise<{
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    byModel: Record<string, { cost: number; tokens: number; requests: number }>;
    averageLatency: number;
  }> {
    let query = `
      SELECT 
        model,
        SUM(tokens) as total_tokens,
        SUM(cost) as total_cost,
        COUNT(*) as request_count,
        AVG(latency) as avg_latency
      FROM ai_usage_logs
      WHERE 1=1
    `;

    const params: any[] = [];

    if (partnerId) {
      query += ' AND partner_id = ?';
      params.push(partnerId);
    }

    if (period) {
      query += ' AND created_at >= ? AND created_at <= ?';
      params.push(period.from.toISOString(), period.to.toISOString());
    }

    query += ' GROUP BY model';

    const stats = await db.all(query, params);

    const result = {
      totalCost: 0,
      totalTokens: 0,
      totalRequests: 0,
      byModel: {} as Record<string, { cost: number; tokens: number; requests: number }>,
      averageLatency: 0
    };

    for (const stat of stats) {
      result.totalCost += stat.total_cost || 0;
      result.totalTokens += stat.total_tokens || 0;
      result.totalRequests += stat.request_count || 0;
      result.byModel[stat.model] = {
        cost: stat.total_cost || 0,
        tokens: stat.total_tokens || 0,
        requests: stat.request_count || 0
      };
      result.averageLatency += (stat.avg_latency || 0) * stat.request_count;
    }

    if (result.totalRequests > 0) {
      result.averageLatency = result.averageLatency / result.totalRequests;
    }

    return result;
  }

  /**
   * Get active jobs count
   */
  async getActiveJobsCount(): Promise<number> {
    try {
      if (aiTaskQueue && typeof aiTaskQueue.getWaitingCount === 'function') {
        const waiting = await aiTaskQueue.getWaitingCount();
        const active = await aiTaskQueue.getActiveCount();
        return waiting + active;
      }
      return this.activeJobs.size;
    } catch (error) {
      return this.activeJobs.size;
    }
  }

  /**
   * Log error to database
   */
  private async logError(partnerId: string, error: {
    errorType: string;
    errorMessage: string;
    model?: string;
    taskType?: string;
  }): Promise<void> {
    try {
      const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.run(
        `INSERT INTO ai_error_logs 
         (id, partner_id, error_type, error_message, model, task_type, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'open', CURRENT_TIMESTAMP)`,
        [errorId, partnerId, error.errorType, error.errorMessage, error.model || null, error.taskType || null]
      );
    } catch (err) {
      console.error('Error logging error:', err);
    }
  }

  /**
   * Clear cache
   */
  async clearCache(pattern?: string): Promise<void> {
    try {
      if (redisClient) {
        if (pattern) {
          const keys = await redisClient.keys(`ai:cache:${pattern}*`);
          if (keys.length > 0) {
            await redisClient.del(keys);
          }
        } else {
          const keys = await redisClient.keys('ai:cache:*');
          if (keys.length > 0) {
            await redisClient.del(keys);
          }
        }
      }
      
      // Clear memory cache
      if (pattern) {
        for (const key of memoryCache.keys()) {
          if (key.includes(pattern)) {
            memoryCache.delete(key);
          }
        }
      } else {
        memoryCache.clear();
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

export const aiOrchestrator = new AIOrchestrator();
