/**
 * Yandex Product Card API Routes
 * Complete product card creation with 100% quality index
 */

import { Router, Request, Response } from 'express';
import yandexCardCreator, { ProductCardInput } from '../services/yandexCardCreatorService';
import mxikService from '../services/mxikService';

const router = Router();

/**
 * POST /api/yandex-card/preview
 * Preview product card without creating on Yandex
 */
router.post('/preview', async (req: Request, res: Response) => {
  try {
    const input: ProductCardInput = req.body;

    // Validate required fields
    if (!input.name || !input.brand || !input.costPrice) {
      return res.status(400).json({
        success: false,
        error: 'name, brand va costPrice talab qilinadi'
      });
    }

    const preview = await yandexCardCreator.previewProductCard(input);

    res.json({
      success: true,
      preview
    });
  } catch (error: any) {
    console.error('Preview error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/yandex-card/create
 * Create complete product card on Yandex Market
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const input: ProductCardInput = req.body;

    // Validate required fields
    if (!input.name || !input.brand || !input.costPrice) {
      return res.status(400).json({
        success: false,
        error: 'name, brand va costPrice talab qilinadi'
      });
    }

    console.log('🚀 Creating product card:', input.name);

    const result = await yandexCardCreator.createCompleteProductCard(input);

    res.json({
      success: result.success,
      data: result
    });
  } catch (error: any) {
    console.error('Create error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/yandex-card/calculate-price
 * Calculate optimal price for product
 */
router.post('/calculate-price', async (req: Request, res: Response) => {
  try {
    const { costPrice, category, weight } = req.body;

    if (!costPrice) {
      return res.status(400).json({
        success: false,
        error: 'costPrice talab qilinadi'
      });
    }

    const breakdown = yandexCardCreator.calculateOptimalPrice(
      costPrice,
      category || 'general',
      weight || 500
    );

    res.json({
      success: true,
      data: {
        ...breakdown,
        profitMarginPercent: Math.round((breakdown.margin / breakdown.costPrice) * 100)
      }
    });
  } catch (error: any) {
    console.error('Price calculation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/yandex-card/generate-sku
 * Generate unique SKU for product
 */
router.post('/generate-sku', async (req: Request, res: Response) => {
  try {
    const { brand, name, model } = req.body;

    if (!brand || !name) {
      return res.status(400).json({
        success: false,
        error: 'brand va name talab qilinadi'
      });
    }

    const sku = yandexCardCreator.generateSku(brand, name, model);

    res.json({
      success: true,
      sku
    });
  } catch (error: any) {
    console.error('SKU generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/yandex-card/detect-category
 * Auto-detect product category
 */
router.post('/detect-category', async (req: Request, res: Response) => {
  try {
    const { name, brand } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'name talab qilinadi'
      });
    }

    const category = yandexCardCreator.detectCategory(name, brand || '');
    
    // Also get MXIK code
    const mxik = mxikService.getBestMxikCode(name, category.nameUz);

    res.json({
      success: true,
      category: {
        id: category.id,
        nameRu: category.name,
        nameUz: category.nameUz
      },
      mxik: mxik || { code: '47190000', nameUz: 'Boshqa chakana savdo', similarity: 30 }
    });
  } catch (error: any) {
    console.error('Category detection error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/yandex-card/quality-check
 * Check quality index of card data
 */
router.post('/quality-check', async (req: Request, res: Response) => {
  try {
    const cardData = req.body;

    const { index, missing } = yandexCardCreator.calculateQualityIndex(cardData);

    res.json({
      success: true,
      qualityIndex: index,
      missingFields: missing,
      recommendation: index >= 90 
        ? 'Ajoyib! Kartangiz 90%+ sifatga ega.' 
        : index >= 70 
          ? 'Yaxshi! Bir necha maydonni to\'ldiring.' 
          : 'Diqqat! Ko\'p maydonlar to\'ldirilmagan.'
    });
  } catch (error: any) {
    console.error('Quality check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/yandex-card/categories
 * Get all available categories
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    // Return simplified category list
    const categories = [
      { key: 'phone', id: 91461, nameRu: 'Смартфоны', nameUz: 'Smartfonlar' },
      { key: 'laptop', id: 91013, nameRu: 'Ноутбуки', nameUz: 'Noutbuklar' },
      { key: 'electronics', id: 91491, nameRu: 'Электроника', nameUz: 'Elektronika' },
      { key: 'clothing', id: 7811873, nameRu: 'Одежда', nameUz: 'Kiyim' },
      { key: 'shoes', id: 7811903, nameRu: 'Обувь', nameUz: 'Poyabzal' },
      { key: 'cosmetics', id: 91153, nameRu: 'Косметика', nameUz: 'Kosmetika' },
      { key: 'perfume', id: 15927546, nameRu: 'Парфюмерия', nameUz: 'Parfyumeriya' },
      { key: 'home', id: 90719, nameRu: 'Товары для дома', nameUz: 'Uy uchun tovarlar' },
      { key: 'toys', id: 90764, nameRu: 'Игрушки', nameUz: 'O\'yinchoqlar' },
      { key: 'sport', id: 91512, nameRu: 'Спорт', nameUz: 'Sport' },
      { key: 'general', id: 90401, nameRu: 'Товары', nameUz: 'Tovarlar' },
    ];

    res.json({
      success: true,
      categories
    });
  } catch (error: any) {
    console.error('Categories error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
