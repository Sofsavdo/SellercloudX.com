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
