// @ts-nocheck
// AI Scanner Routes - REAL Product Recognition from Images
// Uses Real AI Service with Emergent LLM Key

import express, { Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { realAIService } from '../services/realAIService';
import { nanoid } from 'nanoid';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'scanner');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `scan_${nanoid()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Faqat rasm fayllari qabul qilinadi (JPEG, PNG, WebP, GIF)'));
    }
  }
});

/**
 * POST /api/ai-scanner/recognize
 * Scan product from uploaded image
 */
router.post('/recognize', upload.single('image'), asyncHandler(async (req: Request, res: Response) => {
  console.log('📸 AI Scanner: Rasm qabul qilindi');

  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      error: 'Rasm talab qilinadi',
      message: 'Iltimos, mahsulot rasmini yuklang'
    });
  }

  // Check if AI service is enabled
  if (!realAIService.isEnabled()) {
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    return res.status(503).json({
      success: false,
      error: 'AI xizmati mavjud emas',
      message: 'EMERGENT_LLM_KEY sozlanmagan. Admin bilan bog\'laning.'
    });
  }

  try {
    console.log('🔍 AI Scanner: Tahlil boshlanmoqda...');
    
    // Read image file
    const imageBuffer = fs.readFileSync(req.file.path);
    
    // Scan product with AI
    const scanResult = await realAIService.scanProduct(imageBuffer);
    
    console.log('✅ AI Scanner: Mahsulot aniqlandi:', scanResult.name);

    // Return result
    res.json({
      success: true,
      product: {
        ...scanResult,
        imageUrl: `/uploads/scanner/${path.basename(req.file.path)}`,
        scannedAt: new Date().toISOString(),
      },
      message: `Mahsulot muvaffaqiyatli aniqlandi: ${scanResult.name}`
    });

  } catch (error: any) {
    console.error('❌ AI Scanner Error:', error.message);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Mahsulotni aniqlashda xatolik',
      message: error.message || 'AI xizmati vaqtinchalik ishlamayapti'
    });
  }
}));

/**
 * POST /api/ai-scanner/generate-card
 * Generate product card from scanned data
 */
router.post('/generate-card', asyncHandler(async (req: Request, res: Response) => {
  const { name, category, description, price, marketplace = 'uzum' } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'Mahsulot nomi talab qilinadi'
    });
  }

  if (!realAIService.isEnabled()) {
    return res.status(503).json({
      success: false,
      error: 'AI xizmati mavjud emas'
    });
  }

  try {
    console.log('🎨 AI: Mahsulot kartochkasi yaratilmoqda...', name);

    const card = await realAIService.generateProductCard({
      name,
      category: category || 'general',
      description: description || '',
      price: parseFloat(price) || 100000,
      marketplace: marketplace as any,
    });

    console.log('✅ AI: Kartochka yaratildi, SEO score:', card.seoScore);

    res.json({
      success: true,
      card,
      message: `Kartochka yaratildi. SEO ball: ${card.seoScore}/100`
    });

  } catch (error: any) {
    console.error('❌ AI Card Generation Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Kartochka yaratishda xatolik',
      message: error.message
    });
  }
}));

/**
 * POST /api/ai-scanner/optimize-price
 * Get AI price optimization
 */
router.post('/optimize-price', asyncHandler(async (req: Request, res: Response) => {
  const { productName, currentPrice, costPrice, category, marketplace = 'uzum' } = req.body;

  if (!productName || !currentPrice || !costPrice) {
    return res.status(400).json({
      success: false,
      error: 'Mahsulot nomi, narxi va tannarxi talab qilinadi'
    });
  }

  if (!realAIService.isEnabled()) {
    return res.status(503).json({
      success: false,
      error: 'AI xizmati mavjud emas'
    });
  }

  try {
    console.log('💰 AI: Narx optimizatsiyasi...', productName);

    const optimization = await realAIService.optimizePrice({
      productName,
      currentPrice: parseFloat(currentPrice),
      costPrice: parseFloat(costPrice),
      category: category || 'general',
      marketplace,
    });

    console.log('✅ AI: Optimal narx:', optimization.recommendedPrice);

    res.json({
      success: true,
      optimization,
      message: `Tavsiya etilgan narx: ${optimization.recommendedPrice.toLocaleString()} so'm`
    });

  } catch (error: any) {
    console.error('❌ AI Price Optimization Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Narx optimizatsiyasida xatolik',
      message: error.message
    });
  }
}));

/**
 * GET /api/ai-scanner/status
 * Check AI service status
 */
router.get('/status', asyncHandler(async (req: Request, res: Response) => {
  const status = realAIService.getStatus();
  
  res.json({
    success: true,
    ai: status,
    message: status.enabled 
      ? `AI xizmati ishlayapti (${status.provider})` 
      : 'AI xizmati o\'chirilgan'
  });
}));

export default router;
