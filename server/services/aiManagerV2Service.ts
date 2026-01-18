// AI Manager Service V2 - REAL BUSINESS LOGIC
// Integrates Image Search, Price Optimization, and Marketplace Product Creation

import { db, getDbType } from '../db';
import { storage } from '../storage';
import { aiTasks, aiCostRecords, marketplaceIntegrations, products } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { imageSearchService, ImageSearchResult, CompetitorInfo } from './imageSearchService';
import {
  MarketplaceServiceFactory,
  MarketplaceCredentials,
  ProductCard,
  ProductCreationResult,
} from './marketplaceService';
import { realAIService } from './realAIService';
import { formatDateForDB } from '../../shared/db-utils';

// ==================== TYPES ====================

export interface ScanImageRequest {
  imageUrl: string;
  partnerId: string;
}

export interface ScanImageResponse {
  taskId: string;
  productInfo: {
    name: string;
    brand: string;
    category: string;
    description: string;
    confidence: number;
    labels: string[];
  };
  competitors: Array<{
    seller: string;
    price: number;
    currency: string;
    link: string;
    source: string;
  }>;
  priceAnalysis: {
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    totalResults: number;
  };
  status: 'success' | 'partial' | 'failed';
  message: string;
}

export interface CreateProductRequest {
  taskId?: string;
  partnerId: string;
  marketplace: 'wildberries' | 'ozon' | 'uzum' | 'yandex';
  productData: {
    name: string;
    description: string;
    images: string[];
    costPrice: number; // Tannarx
    category?: string;
    brand?: string;
  };
  priceOptimization?: {
    enabled: boolean;
    minProfit?: number; // Minimal foyda %
  };
}

export interface CreateProductResponse {
  success: boolean;
  taskId: string;
  marketplace: string;
  productId?: string;
  optimizedPrice?: number;
  priceBreakdown?: {
    costPrice: number;
    taxes: number;
    commission: number;
    logistics: number;
    minPrice: number;
    recommendedPrice: number;
    profit: number;
    profitPercent: number;
  };
  status: string;
  message: string;
  error?: string;
}

// ==================== AI TASK MANAGEMENT ====================

async function createTask(partnerId: string, taskType: string, inputData: any): Promise<string> {
  const taskId = uuidv4();
  const dbType = getDbType();
  
  try {
    await db.insert(aiTasks).values({
      id: taskId,
      partnerId,
      taskType,
      status: 'pending',
      priority: 'medium',
      inputData: JSON.stringify(inputData),
      createdAt: formatDateForDB(new Date(), dbType),
    });
    
    return taskId;
  } catch (error) {
    console.error('Failed to create AI task:', error);
    throw error;
  }
}

async function updateTaskStatus(
  taskId: string,
  status: string,
  outputData?: any,
  errorMessage?: string
): Promise<void> {
  const dbType = getDbType();
  
  try {
    await db
      .update(aiTasks)
      .set({
        status,
        outputData: outputData ? JSON.stringify(outputData) : undefined,
        errorMessage,
        completedAt: status === 'completed' || status === 'failed'
          ? formatDateForDB(new Date(), dbType)
          : undefined,
        updatedAt: formatDateForDB(new Date(), dbType),
      })
      .where(eq(aiTasks.id, taskId));
  } catch (error) {
    console.error('Failed to update task status:', error);
  }
}

async function recordAICost(
  partnerId: string,
  operation: string,
  model: string,
  cost: number,
  metadata?: any
): Promise<void> {
  const dbType = getDbType();
  
  try {
    // Get partner tier
    const partner = await storage.getPartnerById(partnerId);
    const tier = partner?.pricingTier || 'free_starter';
    
    await db.insert(aiCostRecords).values({
      id: uuidv4(),
      partnerId,
      operation,
      model,
      cost,
      tier,
      metadata: metadata ? JSON.stringify(metadata) : null,
      createdAt: formatDateForDB(new Date(), dbType),
    });
  } catch (error) {
    console.error('Failed to record AI cost:', error);
  }
}

// ==================== PRICE OPTIMIZATION ====================

function calculateOptimalPrice(
  costPrice: number,
  competitors: CompetitorInfo[],
  options: {
    taxRate?: number; // Soliq %
    commissionRate?: number; // Marketplace komissiya %
    logisticsCost?: number; // Logistika
    minProfitPercent?: number; // Minimal foyda %
  } = {}
): {
  minPrice: number;
  recommendedPrice: number;
  maxPrice: number;
  breakdown: any;
} {
  const {
    taxRate = 15, // 15% soliq
    commissionRate = 10, // 10% marketplace komissiya
    logisticsCost = 50, // 50 so'm logistika
    minProfitPercent = 10, // 10% minimal foyda
  } = options;
  
  // Calculate costs
  const taxes = costPrice * (taxRate / 100);
  const commission = costPrice * (commissionRate / 100);
  const logistics = logisticsCost;
  
  // Minimal narx (cost + expenses + minimal profit)
  const totalCost = costPrice + taxes + commission + logistics;
  const minProfit = totalCost * (minProfitPercent / 100);
  const minPrice = Math.ceil(totalCost + minProfit);
  
  // Competitor analysis
  const prices = competitors.map(c => c.price).filter(p => p > 0);
  const avgCompetitorPrice = prices.length > 0
    ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)
    : minPrice * 1.2;
  
  const minCompetitorPrice = prices.length > 0 ? Math.min(...prices) : minPrice;
  
  // Recommended price: 3-5% arzonroq raqobatchilardan, lekin foydali
  const competitivePrice = Math.round(avgCompetitorPrice * 0.97); // 3% arzonroq
  const recommendedPrice = Math.max(minPrice, competitivePrice);
  
  // Max price: eng yuqori raqobatchi narxi
  const maxPrice = prices.length > 0 ? Math.max(...prices) : recommendedPrice * 1.3;
  
  // Profit calculation
  const profit = recommendedPrice - totalCost;
  const profitPercent = (profit / totalCost) * 100;
  
  return {
    minPrice,
    recommendedPrice,
    maxPrice,
    breakdown: {
      costPrice,
      taxes,
      commission,
      logistics,
      totalCost,
      minPrice,
      recommendedPrice,
      profit,
      profitPercent: Math.round(profitPercent),
      competitorAvg: avgCompetitorPrice,
      competitorMin: minCompetitorPrice,
    },
  };
}

// ==================== MAIN AI MANAGER FUNCTIONS ====================

/**
 * AI Scanner: Scan image and find product info + competitors
 */
export async function scanProductImage(request: ScanImageRequest): Promise<ScanImageResponse> {
  const { imageUrl, partnerId } = request;
  
  // Create task
  const taskId = await createTask(partnerId, 'image_scan', { imageUrl });
  
  try {
    // Update task status
    await updateTaskStatus(taskId, 'processing');
    
    // Scan image using imageSearchService
    const searchResult: ImageSearchResult = await imageSearchService.searchByImage(imageUrl);
    
    // Record AI cost (Google Vision API usage)
    await recordAICost(partnerId, 'image_scan', 'google-vision', 0.001, {
      confidence: searchResult.productInfo.confidence,
      resultsFound: searchResult.totalResults,
    });
    
    // Prepare response
    const response: ScanImageResponse = {
      taskId,
      productInfo: {
        name: searchResult.productInfo.productName,
        brand: searchResult.productInfo.brand,
        category: searchResult.productInfo.category,
        description: searchResult.productInfo.description,
        confidence: searchResult.productInfo.confidence,
        labels: searchResult.productInfo.labels,
      },
      competitors: searchResult.competitors.map(c => ({
        seller: c.seller,
        price: c.price,
        currency: c.currency,
        link: c.link,
        source: c.source,
      })),
      priceAnalysis: {
        avgPrice: searchResult.avgPrice,
        minPrice: searchResult.minPrice,
        maxPrice: searchResult.maxPrice,
        totalResults: searchResult.totalResults,
      },
      status: searchResult.totalResults > 0 ? 'success' : 'partial',
      message:
        searchResult.totalResults > 0
          ? `Topildi: ${searchResult.productInfo.productName}. ${searchResult.totalResults} ta raqobatchi aniqlandi.`
          : `Mahsulot aniqlandi: ${searchResult.productInfo.productName}, lekin raqobatchilar topilmadi.`,
    };
    
    // Update task as completed
    await updateTaskStatus(taskId, 'completed', response);
    
    return response;
  } catch (error: any) {
    console.error('AI Scanner error:', error);
    
    await updateTaskStatus(taskId, 'failed', null, error.message);
    
    return {
      taskId,
      productInfo: {
        name: 'Unknown',
        brand: 'Unknown',
        category: 'other',
        description: 'Mahsulotni aniqlashda xatolik',
        confidence: 0,
        labels: [],
      },
      competitors: [],
      priceAnalysis: {
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        totalResults: 0,
      },
      status: 'failed',
      message: `Xatolik: ${error.message}`,
    };
  }
}

/**
 * AI Manager: Create product card on marketplace with optimized price
 */
export async function createProductOnMarketplace(
  request: CreateProductRequest
): Promise<CreateProductResponse> {
  const { partnerId, marketplace, productData, priceOptimization } = request;
  
  // Create task
  const taskId = request.taskId || (await createTask(partnerId, 'product_creation', productData));
  
  try {
    await updateTaskStatus(taskId, 'processing');
    
    // Step 1: Get partner's marketplace credentials
    const integrations = await db
      .select()
      .from(marketplaceIntegrations)
      .where(
        and(
          eq(marketplaceIntegrations.partnerId, partnerId),
          eq(marketplaceIntegrations.marketplace, marketplace),
          eq(marketplaceIntegrations.active, true)
        )
      );
    
    if (integrations.length === 0) {
      throw new Error(`${marketplace} marketplace ulanmagan. Iltimos, API kalitlarini kiriting.`);
    }
    
    const integration = integrations[0];
    
    // Step 2: Get competitors for price optimization (if enabled)
    let optimizedPrice = productData.costPrice * 1.5; // Default 50% markup
    let priceBreakdown: any = null;
    
    if (priceOptimization?.enabled && productData.images.length > 0) {
      try {
        const searchResult = await imageSearchService.searchByImage(productData.images[0]);
        
        const priceCalc = calculateOptimalPrice(productData.costPrice, searchResult.competitors, {
          minProfitPercent: priceOptimization.minProfit || 10,
        });
        
        optimizedPrice = priceCalc.recommendedPrice;
        priceBreakdown = priceCalc.breakdown;
      } catch (error) {
        console.warn('Price optimization failed, using default markup:', error);
      }
    }
    
    // Step 3: Generate SEO-optimized title and description using Gemini
    let optimizedTitle = productData.name;
    let optimizedDescription = productData.description;
    
    if (realAIService.isEnabled()) {
      try {
        const seoPrompt = `Marketplace: ${marketplace}\nMahsulot: ${productData.name}\n\nSEO-optimizatsiya qilingan sarlavha (max 100 belgi) va tavsif (max 500 belgi) yarating. JSON formatda javob bering:\n{\"title\": \"...\", \"description\": \"...\"}`;
        
        const seoResult = await realAIService.generateText({
          prompt: seoPrompt,
          jsonMode: true,
        });
        
        const seoData = JSON.parse(seoResult);
        optimizedTitle = seoData.title || optimizedTitle;
        optimizedDescription = seoData.description || optimizedDescription;
        
        await recordAICost(partnerId, 'seo_optimization', 'gemini-flash', 0.0005);
      } catch (error) {
        console.warn('SEO optimization failed, using original content:', error);
      }
    }
    
    // Step 4: Create marketplace service
    const credentials: MarketplaceCredentials = {
      marketplace,
      apiKey: integration.apiKey || undefined,
      apiSecret: integration.apiSecret || undefined,
      clientId: integration.sellerId || undefined,
      accessToken: integration.accessToken || undefined,
      sellerId: integration.sellerId || undefined,
    };
    
    const marketplaceService = MarketplaceServiceFactory.create(credentials);
    
    if (!marketplaceService) {
      throw new Error(`${marketplace} service yaratishda xatolik`);
    }
    
    // Step 5: Create product card
    const productCard: ProductCard = {
      offerId: uuidv4(), // Unique ID
      title: optimizedTitle,
      description: optimizedDescription,
      images: productData.images,
      price: optimizedPrice,
      category: productData.category || 'general',
      brand: productData.brand || 'Unknown',
      keywords: [],
    };
    
    const creationResult: ProductCreationResult = await marketplaceService.createProduct(productCard);
    
    // Step 6: Update task and return result
    const response: CreateProductResponse = {
      success: creationResult.success,
      taskId,
      marketplace,
      productId: creationResult.productId,
      optimizedPrice,
      priceBreakdown,
      status: creationResult.status || 'unknown',
      message: creationResult.success
        ? `Mahsulot ${marketplace} da yaratildi! Product ID: ${creationResult.productId}`
        : `Xatolik: ${creationResult.error}`,
      error: creationResult.error,
    };
    
    await updateTaskStatus(
      taskId,
      creationResult.success ? 'completed' : 'failed',
      response,
      creationResult.error
    );
    
    return response;
  } catch (error: any) {
    console.error('Product creation error:', error);
    
    await updateTaskStatus(taskId, 'failed', null, error.message);
    
    return {
      success: false,
      taskId,
      marketplace,
      status: 'failed',
      message: `Mahsulot yaratishda xatolik: ${error.message}`,
      error: error.message,
    };
  }
}

// ==================== EXPORTS ====================

export const aiManager = {
  scanProductImage,
  createProductOnMarketplace,
};
