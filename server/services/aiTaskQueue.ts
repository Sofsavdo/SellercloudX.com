// AI Task Queue - Parallel task processing
// Handles all AI operations asynchronously

import { db } from '../db';
import { aiTasks } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { 
  generateReviewResponse,
  createProductCard,
  analyzeCompetitor,
  optimizeSEO,
  createAdCampaign,
  generateReport
} from './aiMarketplaceManager';

export type AITaskType =
  | 'review_response'
  | 'question_response'
  | 'product_card_creation'
  | 'seo_optimization'
  | 'competitor_analysis'
  | 'ad_campaign_creation'
  | 'infographic_generation'
  | 'niche_analysis'
  | 'report_generation';

export interface AITask {
  id?: string;
  partnerId: string;
  accountId?: string;
  taskType: AITaskType;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  inputData: any;
  outputData?: any;
  error?: string;
  createdAt?: Date;
  completedAt?: Date;
}

// In-memory queue (production: use Redis/Bull)
const taskQueue: AITask[] = [];
let isProcessing = false;

// Add task to queue
export async function addAITask(task: Omit<AITask, 'id' | 'status' | 'createdAt'>): Promise<string> {
  const taskId = nanoid();
  const createdAt = new Date();
  const newTask: AITask = {
    ...task,
    id: taskId,
    status: 'pending',
    createdAt,
  };

  try {
    // Save to database using Drizzle ORM
    await db.insert(aiTasks).values({
      id: taskId,
      partnerId: newTask.partnerId,
      accountId: newTask.accountId,
      taskType: newTask.taskType,
      priority: newTask.priority,
      status: newTask.status,
      inputData: JSON.stringify(newTask.inputData),
      createdAt: createdAt,
    });
    
    // Add to in-memory queue
    taskQueue.push(newTask);
    
    // Sort by priority (high > medium > low)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    taskQueue.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    
    // Start processing if not already
    if (!isProcessing) {
      processQueue();
    }
    
    console.log(`✅ AI Task added: ${task.taskType} (Priority: ${task.priority})`);
    return taskId;
  } catch (error) {
    console.error('❌ Error adding AI task:', error);
    throw error;
  }
}

// Process queue
async function processQueue() {
  if (isProcessing || taskQueue.length === 0) {
    return;
  }

  isProcessing = true;
  console.log(`🔄 Processing AI queue: ${taskQueue.length} tasks`);

  while (taskQueue.length > 0) {
    const task = taskQueue.shift()!;
    
    try {
      await processTask(task);
    } catch (error) {
      console.error(`❌ Task ${task.id} failed:`, error);
      await markTaskFailed(task.id!, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  isProcessing = false;
  console.log(`✅ AI queue processed`);
}

// Process single task
async function processTask(task: AITask) {
  console.log(`⚙️  Processing task ${task.id}: ${task.taskType}`);
  
  if (!task.id) {
    console.error('❌ Task ID is missing');
    return;
  }

  try {
    // Update status to processing
    await db.update(aiTasks)
      .set({ 
        status: 'processing',
        startedAt: new Date()
      })
      .where(eq(aiTasks.id, task.id));

    let result: any;

    switch (task.taskType) {
      case 'review_response':
        result = await handleReviewResponse(task);
        break;
      
      case 'question_response':
        result = await handleQuestionResponse(task);
        break;
      
      case 'product_card_creation':
        result = await handleProductCardCreation(task);
        break;
      
      case 'seo_optimization':
        result = await handleSEOOptimization(task);
        break;
      
      case 'competitor_analysis':
        result = await handleCompetitorAnalysis(task);
        break;
      
      case 'ad_campaign_creation':
        result = await handleAdCampaignCreation(task);
        break;
      
      case 'report_generation':
        result = await handleReportGeneration(task);
        break;
      
      default:
        throw new Error(`Unknown task type: ${task.taskType}`);
    }

    // Mark as completed
    await markTaskCompleted(task.id, result);
    console.log(`✅ Task ${task.id} completed`);
    
  } catch (error) {
    console.error(`❌ Task ${task.id} failed:`, error);
    if (task.id) {
      await markTaskFailed(task.id, error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

// Task handlers
async function handleReviewResponse(task: AITask) {
  const { reviewText, rating, productName, language } = task.inputData;
  
  const response = await generateReviewResponse(
    reviewText,
    rating,
    productName,
    language || 'uz'
  );

  return { response };
}

async function handleQuestionResponse(task: AITask) {
  const { question, productName, language } = task.inputData;
  
  // Similar to review response
  const response = await generateReviewResponse(
    question,
    5, // neutral rating for questions
    productName,
    language || 'uz'
  );

  return { response };
}

async function handleProductCardCreation(task: AITask) {
  const { productInfo, marketplace } = task.inputData;
  
  const card = await createProductCard(productInfo, marketplace);
  
  return card;
}

async function handleSEOOptimization(task: AITask) {
  const { currentTitle, currentDescription, marketplace } = task.inputData;
  
  const optimized = await optimizeSEO(
    currentTitle,
    currentDescription,
    marketplace
  );
  
  return optimized;
}

async function handleCompetitorAnalysis(task: AITask) {
  const { competitorData, myProduct } = task.inputData;
  
  const analysis = await analyzeCompetitor(competitorData, myProduct);
  
  return analysis;
}

async function handleAdCampaignCreation(task: AITask) {
  const { productInfo, budget, marketplace } = task.inputData;
  
  const campaign = await createAdCampaign(productInfo, budget, marketplace);
  
  return campaign;
}

async function handleReportGeneration(task: AITask) {
  const { reportData } = task.inputData;
  
  const report = await generateReport(reportData);
  
  return report;
}

// Mark task as completed
async function markTaskCompleted(taskId: string, result: any) {
  try {
    await db.update(aiTasks)
      .set({
        status: 'completed',
        outputData: JSON.stringify(result),
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(aiTasks.id, taskId));
  } catch (error) {
    console.error('❌ Error marking task as completed:', error);
  }
}

// Mark task as failed
async function markTaskFailed(taskId: string, error: string) {
  try {
    await db.update(aiTasks)
      .set({
        status: 'failed',
        errorMessage: error,
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(aiTasks.id, taskId));
  } catch (err) {
    console.error('❌ Error marking task as failed:', err);
  }
}

// Get task status
export async function getTaskStatus(taskId: string): Promise<AITask | null> {
  try {
    const [task] = await db.select()
      .from(aiTasks)
      .where(eq(aiTasks.id, taskId))
      .limit(1);

    if (!task) return null;

    return {
      id: task.id,
      partnerId: task.partnerId,
      accountId: task.accountId || undefined,
      taskType: task.taskType as AITaskType,
      priority: task.priority as 'low' | 'medium' | 'high',
      status: task.status as 'pending' | 'processing' | 'completed' | 'failed',
      inputData: task.inputData ? JSON.parse(task.inputData) : {},
      outputData: task.outputData ? JSON.parse(task.outputData) : undefined,
      error: task.errorMessage || undefined,
      createdAt: task.createdAt || undefined,
      completedAt: task.completedAt || undefined,
    };
  } catch (error) {
    console.error('❌ Error getting task status:', error);
    return null;
  }
}

// Get pending tasks count
export async function getPendingTasksCount(): Promise<number> {
  try {
    const result = await db.select()
      .from(aiTasks)
      .where(eq(aiTasks.status, 'pending'));
    return result.length;
  } catch (error) {
    console.error('❌ Error getting pending tasks count:', error);
    return 0;
  }
}

// Get tasks by partner
export async function getPartnerTasks(
  partnerId: string,
  limit: number = 50
): Promise<AITask[]> {
  try {
    const tasks = await db.select()
      .from(aiTasks)
      .where(eq(aiTasks.partnerId, partnerId))
      .orderBy(desc(aiTasks.createdAt))
      .limit(limit);

    return tasks.map((task) => ({
      id: task.id,
      partnerId: task.partnerId,
      accountId: task.accountId || undefined,
      taskType: task.taskType as AITaskType,
      priority: task.priority as 'low' | 'medium' | 'high',
      status: task.status as 'pending' | 'processing' | 'completed' | 'failed',
      inputData: task.inputData ? JSON.parse(task.inputData) : {},
      outputData: task.outputData ? JSON.parse(task.outputData) : undefined,
      error: task.errorMessage || undefined,
      createdAt: task.createdAt || undefined,
      completedAt: task.completedAt || undefined,
    }));
  } catch (error) {
    console.error('❌ Error getting partner tasks:', error);
    return [];
  }
}

// Batch add tasks (for multiple marketplaces)
export async function addBatchTasks(tasks: Omit<AITask, 'id' | 'status' | 'createdAt'>[]): Promise<string[]> {
  const taskIds: string[] = [];
  
  for (const task of tasks) {
    try {
      const id = await addAITask(task);
      taskIds.push(id);
    } catch (error) {
      console.error('❌ Error adding batch task:', error);
    }
  }
  
  return taskIds;
}

// Auto-schedule recurring tasks
export function scheduleRecurringTasks() {
  // Every 5 minutes: Check for new reviews
  setInterval(async () => {
    console.log('🔍 Checking for new reviews...');
    // Implementation: Query marketplace APIs for new reviews
  }, 5 * 60 * 1000);

  // Every hour: SEO optimization check
  setInterval(async () => {
    console.log('🔍 Running SEO optimization check...');
    // Implementation: Check products that need SEO update
  }, 60 * 60 * 1000);

  // Every 2 hours: Competitor analysis
  setInterval(async () => {
    console.log('🔍 Running competitor analysis...');
    // Implementation: Analyze top competitors
  }, 2 * 60 * 60 * 1000);

  // Daily: Generate reports
  setInterval(async () => {
    console.log('📊 Generating daily reports...');
    // Implementation: Generate reports for all active partners
  }, 24 * 60 * 60 * 1000);
}

// Initialize queue system
export function initializeAIQueue() {
  console.log('🚀 AI Task Queue initialized');
  scheduleRecurringTasks();
}
