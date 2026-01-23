// AI Scanner Routes - Camera & Image Upload Support
import { Router } from 'express';
import multer from 'multer';
import { imageSearchService } from '../services/imageSearchService';
import { requireAuth } from '../middleware/auth';
import { storage } from '../storage';

const router = Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Faqat rasm fayllari qabul qilinadi'));
    }
  },
});

/**
 * POST /api/ai/scanner/public-analyze
 * Public endpoint for mobile app (no auth required for demo)
 */
router.post('/public-analyze', async (req: any, res: any) => {
  try {
    const { image_base64, language = 'uz' } = req.body;
    
    if (!image_base64) {
      return res.status(400).json({
        success: false,
        error: 'image_base64 talab qilinadi',
      });
    }

    console.log('[AI Scanner] Public analyze request received');

    // Create data URL from base64
    const imageUrl = `data:image/jpeg;base64,${image_base64}`;

    try {
      // Import AI Manager
      const { aiManager } = await import('../services/aiManagerV2Service');

      // Scan image
      const result = await aiManager.scanProductImage({
        imageUrl,
        partnerId: 1, // Demo partner
      });

      console.log('[AI Scanner] Scan result:', JSON.stringify(result).substring(0, 200));

      // Format response for mobile app
      return res.status(200).json({
        success: true,
        product_info: {
          brand: result.brand || 'Unknown',
          model: result.model || '',
          product_name: result.name || result.productName || 'Mahsulot',
          name: result.name || result.productName,
          category: result.category || '',
          category_ru: result.categoryRu || result.category,
          features: result.features || [],
          materials: result.materials || [],
          country_of_origin: result.country || 'Unknown',
          suggested_price: result.suggestedPrice || result.marketPrice,
        },
        suggested_price: result.suggestedPrice || result.marketPrice,
        confidence: result.confidence || 85,
      });
    } catch (aiError: any) {
      console.error('[AI Scanner] AI Manager error:', aiError);
      
      // Fallback: Use Gemini directly
      try {
        const { geminiService } = await import('../services/geminiService');
        
        const analysisResult = await geminiService.analyzeProductImage(imageUrl, language);
        
        return res.status(200).json({
          success: true,
          product_info: {
            brand: analysisResult.brand || 'Unknown',
            model: analysisResult.model || '',
            product_name: analysisResult.name || 'Mahsulot',
            name: analysisResult.name,
            category: analysisResult.category || '',
            category_ru: analysisResult.categoryRu || analysisResult.category,
            features: analysisResult.features || [],
            materials: analysisResult.materials || [],
            country_of_origin: analysisResult.country,
            suggested_price: analysisResult.suggestedPrice,
          },
          suggested_price: analysisResult.suggestedPrice,
          confidence: analysisResult.confidence || 80,
        });
      } catch (geminiError: any) {
        console.error('[AI Scanner] Gemini fallback error:', geminiError);
        return res.status(500).json({
          success: false,
          error: 'AI xizmati vaqtincha ishlamayapti. Keyinroq urinib ko\'ring.',
        });
      }
    }
  } catch (error: any) {
    console.error('[AI Scanner] Public analyze error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Rasmni tahlil qilishda xatolik',
    });
  }
});

/**
 * POST /api/ai/scanner/scan-image
 * Upload and scan image (camera or file upload)
 */
router.post('/scan-image', requireAuth, (req: any, res: any, next: any) => {
  upload.single('image')(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || 'Rasm yuklashda xatolik',
      });
    }
    
    try {
      const userId = req.session?.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Tizimga kirish talab qilinadi',
        });
      }

      // Get partner
      const partner = await storage.getPartnerByUserId(userId);
      if (!partner) {
        return res.status(404).json({
          success: false,
          error: 'Partner topilmadi',
        });
      }

      // Get image from upload or URL
      let imageUrl: string;
      
      if (req.file) {
        // Image uploaded from camera/file
        const base64Image = req.file.buffer.toString('base64');
        imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
      } else if (req.body.imageUrl) {
        // Image URL provided
        imageUrl = req.body.imageUrl;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Rasm yoki URL talab qilinadi',
        });
      }

      // Import AI Manager
      const { aiManager } = await import('../services/aiManagerV2Service');

      // Scan image
      const result = await aiManager.scanProductImage({
        imageUrl,
        partnerId: partner.id,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Image scan error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Rasmni tahlil qilishda xatolik',
      });
    }
  });
});

/**
 * POST /api/ai/scanner/analyze-base64
 * Analyze image from base64 (for mobile app)
 */
router.post('/analyze-base64', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.session?.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Tizimga kirish talab qilinadi',
      });
    }

    const { image_base64, language = 'uz' } = req.body;
    
    if (!image_base64) {
      return res.status(400).json({
        success: false,
        error: 'image_base64 talab qilinadi',
      });
    }

    // Get partner
    const partner = await storage.getPartnerByUserId(userId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partner topilmadi',
      });
    }

    // Create data URL from base64
    const imageUrl = `data:image/jpeg;base64,${image_base64}`;

    // Import AI Manager
    const { aiManager } = await import('../services/aiManagerV2Service');

    // Scan image
    const result = await aiManager.scanProductImage({
      imageUrl,
      partnerId: partner.id,
    });

    // Format response for mobile app
    return res.status(200).json({
      success: true,
      product_info: {
        brand: result.brand || 'Unknown',
        model: result.model || '',
        product_name: result.name || result.productName || 'Mahsulot',
        name: result.name || result.productName,
        category: result.category || '',
        category_ru: result.categoryRu || result.category,
        features: result.features || [],
        materials: result.materials || [],
        country_of_origin: result.country || 'Unknown',
        suggested_price: result.suggestedPrice || result.marketPrice,
      },
      suggested_price: result.suggestedPrice || result.marketPrice,
      confidence: result.confidence || 85,
    });
  } catch (error: any) {
    console.error('Base64 scan error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Rasmni tahlil qilishda xatolik',
    });
  }
});

/**
 * GET /api/ai/scanner/status
 * Check scanner service status
 */
router.get('/status', async (req, res) => {
  try {
    const status = imageSearchService.getStatus();
    
    return res.status(200).json({
      success: true,
      status,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
