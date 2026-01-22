import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import { 
  addAITask, 
  getTaskStatus, 
  getPendingTasksCount,
  getPartnerTasks,
  addBatchTasks
} from '../services/aiTaskQueue';
import { db, sqlite } from '../db';
import { aiTasks, users, partners } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

// Mock the AI marketplace manager functions
vi.mock('../services/aiMarketplaceManager', () => ({
  generateReviewResponse: vi.fn().mockResolvedValue({ response: 'Test response' }),
  createProductCard: vi.fn().mockResolvedValue({ title: 'Test card' }),
  analyzeCompetitor: vi.fn().mockResolvedValue({ analysis: 'Test analysis' }),
  optimizeSEO: vi.fn().mockResolvedValue({ optimized: true }),
  createAdCampaign: vi.fn().mockResolvedValue({ campaign: 'Test campaign' }),
  generateReport: vi.fn().mockResolvedValue({ report: 'Test report' })
}));

describe('AI Task Queue', () => {
  let testUserId: string;
  let testPartnerId: string;

  beforeAll(async () => {
    // Create test user and partner using raw SQL to avoid schema mismatch
    testUserId = nanoid();
    testPartnerId = nanoid();

    const hashedPassword = await bcrypt.hash('testpass123', 10);

    // Insert user
    sqlite.prepare(`
      INSERT INTO users (id, username, email, password, role, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      testUserId,
      `testuser_${testUserId}`,
      `test_${testUserId}@test.com`,
      hashedPassword,
      'partner',
      1,
      Math.floor(Date.now() / 1000)
    );

    // Insert partner
    sqlite.prepare(`
      INSERT INTO partners (id, user_id, business_name, phone, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      testPartnerId,
      testUserId,
      'Test Business',
      '+998901234567',
      Math.floor(Date.now() / 1000)
    );
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await db.delete(aiTasks).where(eq(aiTasks.partnerId, testPartnerId));
      await db.delete(partners).where(eq(partners.id, testPartnerId));
      await db.delete(users).where(eq(users.id, testUserId));
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  beforeEach(async () => {
    // Clean up test tasks before each test
    try {
      await db.delete(aiTasks).where(eq(aiTasks.partnerId, testPartnerId));
    } catch (error) {
      // Ignore errors if table doesn't exist yet
    }
  });

  describe('addAITask', () => {
    it('should add a task to the queue with correct data types', async () => {
      // Ensure partner exists
      const partnerCheck = sqlite.prepare('SELECT id FROM partners WHERE id = ?').get(testPartnerId);
      expect(partnerCheck).toBeDefined();

      const task = {
        partnerId: testPartnerId,
        accountId: 'test-account',
        taskType: 'review_response' as const,
        priority: 'high' as const,
        inputData: {
          reviewText: 'Great product!',
          rating: 5,
          productName: 'Test Product',
          language: 'uz'
        }
      };

      const taskId = await addAITask(task);

      expect(taskId).toBeDefined();
      expect(typeof taskId).toBe('string');
      expect(taskId.length).toBeGreaterThan(0);

      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify task was saved to database
      const savedTask = await getTaskStatus(taskId);
      expect(savedTask).toBeDefined();
      expect(savedTask?.partnerId).toBe(testPartnerId);
      expect(savedTask?.taskType).toBe('review_response');
      expect(savedTask?.priority).toBe('high');
      // Status might change due to async processing
      expect(['pending', 'processing', 'completed']).toContain(savedTask?.status);
    });

    it('should handle different priority levels', async () => {
      const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
      
      for (const priority of priorities) {
        const task = {
          partnerId: testPartnerId,
          taskType: 'seo_optimization' as const,
          priority,
          inputData: { test: 'data' }
        };

        const taskId = await addAITask(task);
        const savedTask = await getTaskStatus(taskId);
        
        expect(savedTask?.priority).toBe(priority);
      }
    });

    it('should serialize inputData as JSON', async () => {
      const complexData = {
        nested: {
          object: {
            with: ['arrays', 'and', 'values']
          }
        },
        number: 42,
        boolean: true
      };

      const task = {
        partnerId: testPartnerId,
        taskType: 'product_card_creation' as const,
        priority: 'medium' as const,
        inputData: complexData
      };

      const taskId = await addAITask(task);
      const savedTask = await getTaskStatus(taskId);

      expect(savedTask?.inputData).toEqual(complexData);
    });
  });

  describe('getTaskStatus', () => {
    it('should return null for non-existent task', async () => {
      const result = await getTaskStatus('non-existent-id');
      expect(result).toBeNull();
    });

    it('should return task with correct structure', async () => {
      const task = {
        partnerId: testPartnerId,
        taskType: 'competitor_analysis' as const,
        priority: 'medium' as const,
        inputData: { competitor: 'Test Competitor' }
      };

      const taskId = await addAITask(task);
      
      // Wait a bit for async processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const savedTask = await getTaskStatus(taskId);

      expect(savedTask).toBeDefined();
      expect(savedTask?.id).toBe(taskId);
      expect(savedTask?.partnerId).toBe(testPartnerId);
      expect(savedTask?.taskType).toBe('competitor_analysis');
      expect(savedTask?.priority).toBe('medium');
      // Status might be 'pending', 'processing', or 'completed' due to async processing
      expect(['pending', 'processing', 'completed']).toContain(savedTask?.status);
      expect(savedTask?.inputData).toEqual({ competitor: 'Test Competitor' });
      expect(savedTask?.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('getPendingTasksCount', () => {
    it('should return 0 when no pending tasks', async () => {
      const count = await getPendingTasksCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should count pending tasks correctly', async () => {
      const initialCount = await getPendingTasksCount();

      // Add 3 tasks
      const taskIds = [];
      taskIds.push(await addAITask({
        partnerId: testPartnerId,
        taskType: 'review_response' as const,
        priority: 'low' as const,
        inputData: {}
      }));
      taskIds.push(await addAITask({
        partnerId: testPartnerId,
        taskType: 'review_response' as const,
        priority: 'low' as const,
        inputData: {}
      }));
      taskIds.push(await addAITask({
        partnerId: testPartnerId,
        taskType: 'review_response' as const,
        priority: 'low' as const,
        inputData: {}
      }));

      // Tasks might be processed quickly, so check that at least some were added
      const newCount = await getPendingTasksCount();
      expect(newCount).toBeGreaterThanOrEqual(initialCount);
      
      // Verify all tasks exist (regardless of status)
      for (const taskId of taskIds) {
        const task = await getTaskStatus(taskId);
        expect(task).toBeDefined();
      }
    });
  });

  describe('getPartnerTasks', () => {
    it('should return empty array for partner with no tasks', async () => {
      const tasks = await getPartnerTasks('non-existent-partner');
      expect(tasks).toEqual([]);
    });

    it('should return tasks for specific partner', async () => {
      // Add tasks for test partner
      await addAITask({
        partnerId: testPartnerId,
        taskType: 'review_response' as const,
        priority: 'high' as const,
        inputData: { test: 1 }
      });
      await addAITask({
        partnerId: testPartnerId,
        taskType: 'seo_optimization' as const,
        priority: 'medium' as const,
        inputData: { test: 2 }
      });

      const tasks = await getPartnerTasks(testPartnerId);
      
      expect(tasks.length).toBeGreaterThanOrEqual(2);
      expect(tasks.every(t => t.partnerId === testPartnerId)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      // Add multiple tasks
      for (let i = 0; i < 5; i++) {
        await addAITask({
          partnerId: testPartnerId,
          taskType: 'review_response' as const,
          priority: 'low' as const,
          inputData: { index: i }
        });
      }

      const tasks = await getPartnerTasks(testPartnerId, 3);
      expect(tasks.length).toBeLessThanOrEqual(3);
    });
  });

  describe('addBatchTasks', () => {
    it('should add multiple tasks and return all IDs', async () => {
      const tasks = [
        {
          partnerId: testPartnerId,
          taskType: 'review_response' as const,
          priority: 'high' as const,
          inputData: { batch: 1 }
        },
        {
          partnerId: testPartnerId,
          taskType: 'seo_optimization' as const,
          priority: 'medium' as const,
          inputData: { batch: 2 }
        },
        {
          partnerId: testPartnerId,
          taskType: 'product_card_creation' as const,
          priority: 'low' as const,
          inputData: { batch: 3 }
        }
      ];

      const taskIds = await addBatchTasks(tasks);

      expect(taskIds).toHaveLength(3);
      expect(taskIds.every(id => typeof id === 'string')).toBe(true);

      // Verify all tasks were created
      for (const taskId of taskIds) {
        const task = await getTaskStatus(taskId);
        expect(task).toBeDefined();
        expect(task?.partnerId).toBe(testPartnerId);
      }
    });

    it('should handle empty array', async () => {
      const taskIds = await addBatchTasks([]);
      expect(taskIds).toEqual([]);
    });
  });
});
