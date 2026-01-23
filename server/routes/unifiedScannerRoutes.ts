// Unified Scanner Routes - AI Product Creation Pipeline
// Combined image scan + price analysis + product card generation

import { Router } from 'express';
import multer from 'multer';
import { imageSearchService } from '../services/imageSearchService';
import { geminiService } from '../services/geminiService';

const router = Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Faqat rasm fayllari qabul qilinadi'));
    }
  },
});

/**
 * POST /api/unified-scanner/scan-image
 * Step 1: Scan image and identify product
 */
router.post('/scan-image', upload.single('file'), async (req: any, res: any) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Rasm yuklanmadi'
      });
    }

    console.log('[Unified Scanner] Scanning image, size:', file.size);

    // Convert to base64
    const imageBase64 = file.buffer.toString('base64');
    const imageUrl = `data:${file.mimetype};base64,${imageBase64}`;

    // Use image search service to identify product
    const searchResult = await imageSearchService.searchByImage(imageUrl);

    if (searchResult && searchResult.productInfo) {
      const product = searchResult.productInfo;
      
      return res.json({
        success: true,
        product: {
          name: product.productName || product.name || 'Mahsulot',
          brand: product.brand || 'Unknown',
          category: product.category || 'electronics',
          description: product.description || '',
          specifications: product.features || product.labels || [],
          confidence: product.confidence || 80,
          suggestedPrice: searchResult.avgPrice,
          competitors: searchResult.competitors || [],
        }
      });
    }

    // Fallback: Use Gemini directly
    try {
      const geminiResult = await geminiApiService.analyzeImage(imageBase64, 'uz');
      
      return res.json({
        success: true,
        product: {
          name: geminiResult.productName || 'Mahsulot',
          brand: geminiResult.brand || 'Unknown',
          category: geminiResult.category || 'electronics',
          description: geminiResult.description || '',
          specifications: geminiResult.features || [],
          confidence: 75,
        }
      });
    } catch (geminiError) {
      console.error('[Unified Scanner] Gemini fallback error:', geminiError);
    }

    return res.json({
      success: false,
      error: 'Mahsulot aniqlanmadi'
    });

  } catch (error: any) {
    console.error('[Unified Scanner] Scan error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Skanerlashda xatolik'
    });
  }
});

/**
 * POST /api/unified-scanner/full-process
 * Full pipeline: scan + price + card generation
 */
router.post('/full-process', async (req: any, res: any) => {
  try {
    const {
      partner_id,
      cost_price,
      quantity = 1,
      category = 'electronics',
      brand = 'Unknown',
      weight_kg = 1,
      fulfillment = 'fbs',
      image_base64,
      product_name,
      description,
      auto_ikpu = true
    } = req.body;

    if (!cost_price || cost_price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Tannarx kiritilmagan'
      });
    }

    console.log('[Unified Scanner] Full process for:', product_name);

    // 1. Price optimization
    const commission = 0.15; // 15% marketplace commission
    const deliveryCost = fulfillment === 'fbo' ? 15000 : 25000;
    const minMargin = 0.20; // 20% minimum margin
    
    const baseCost = cost_price + deliveryCost + (cost_price * 0.05); // packaging
    const minPrice = Math.ceil(baseCost / (1 - commission - minMargin));
    const optimalPrice = Math.ceil(minPrice * 1.15); // 15% above minimum
    const maxPrice = Math.ceil(optimalPrice * 1.3); // 30% above optimal
    
    const netProfit = optimalPrice - baseCost - (optimalPrice * commission);
    const actualMargin = (netProfit / optimalPrice) * 100;

    const priceOptimization = {
      cost_price,
      min_price: minPrice,
      optimal_price: optimalPrice,
      max_price: maxPrice,
      competitor_avg: null,
      net_profit: Math.round(netProfit),
      actual_margin: Math.round(actualMargin * 10) / 10,
      is_profitable: actualMargin >= 15,
      is_competitive: true
    };

    // 2. Price breakdown
    const priceBreakdown = {
      base_cost: cost_price,
      delivery: deliveryCost,
      packaging: Math.round(cost_price * 0.05),
      commission: Math.round(optimalPrice * commission),
      total_costs: Math.round(baseCost + (optimalPrice * commission)),
      revenue: optimalPrice,
      profit: Math.round(netProfit)
    };

    // 3. Generate product card
    let productCard = {
      title_uz: product_name || 'Mahsulot',
      title_ru: product_name || 'Товар',
      description_uz: description || `${brand} ${product_name} - sifatli mahsulot`,
      description_ru: description || `${brand} ${product_name} - качественный товар`,
      keywords: [brand, category, product_name?.split(' ')[0]].filter(Boolean),
      bullet_points_uz: [
        'Yuqori sifat',
        'Tez yetkazib berish',
        'Kafolat mavjud'
      ],
      bullet_points_ru: [
        'Высокое качество',
        'Быстрая доставка', 
        'Гарантия качества'
      ],
      specifications: {
        brand: brand,
        category: category,
        weight: `${weight_kg} kg`
      },
      seo_score: 75
    };

    // Try to enhance with Gemini
    try {
      if (image_base64) {
        const geminiCard = await geminiApiService.generateProductCard({
          productName: product_name,
          brand,
          category,
          description,
          imageBase64: image_base64
        });
        
        if (geminiCard) {
          productCard = {
            ...productCard,
            title_uz: geminiCard.titleUz || productCard.title_uz,
            title_ru: geminiCard.titleRu || productCard.title_ru,
            description_uz: geminiCard.descriptionUz || productCard.description_uz,
            description_ru: geminiCard.descriptionRu || productCard.description_ru,
            keywords: geminiCard.keywords || productCard.keywords,
            seo_score: geminiCard.seoScore || 85
          };
        }
      }
    } catch (geminiError) {
      console.warn('[Unified Scanner] Gemini card generation failed, using fallback');
    }

    // 4. Generate IKPU code (Uzbekistan product code)
    const ikpuCategories: Record<string, string> = {
      'electronics': '8471',
      'clothing': '6109',
      'beauty': '3304',
      'home': '9403',
      'food': '1905',
      'toys': '9503',
      'sports': '9506',
      'auto': '8708'
    };
    
    const ikpuBase = ikpuCategories[category] || '8471';
    const ikpuCode = auto_ikpu ? `${ikpuBase}3000${Math.floor(Math.random() * 9000) + 1000}` : '';

    // 5. Generate SKU
    const skuCode = `${brand.substring(0, 3).toUpperCase()}-${category.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    // 6. Sales tips
    const salesTips = [
      `${category} kategoriyasida o'rtacha narx: ${Math.round(optimalPrice * 0.9).toLocaleString()} - ${Math.round(optimalPrice * 1.1).toLocaleString()} so'm`,
      `Tavsiya: Birinchi 50 ta sotuvda 5% chegirma qiling`,
      'Mahsulot rasmlarini professional qiling - sotuvni 40% oshiradi',
      `${fulfillment === 'fbo' ? 'FBO' : 'FBS'} tanlangani uchun yetkazib berish ${fulfillment === 'fbo' ? 'tezroq' : 'arzonroq'} bo\'ladi`
    ];

    // 7. Card validation
    const cardValidation = {
      title_length: productCard.title_uz.length >= 20,
      description_length: productCard.description_uz.length >= 100,
      keywords_count: productCard.keywords.length >= 3,
      has_specifications: Object.keys(productCard.specifications).length >= 2,
      overall_score: 0
    };
    
    cardValidation.overall_score = [
      cardValidation.title_length,
      cardValidation.description_length, 
      cardValidation.keywords_count,
      cardValidation.has_specifications
    ].filter(Boolean).length * 25;

    return res.json({
      success: true,
      data: {
        price_optimization: priceOptimization,
        price_breakdown: priceBreakdown,
        product_card: productCard,
        ikpu: { code: ikpuCode, category: ikpuBase },
        sku: skuCode,
        sales_tips: salesTips,
        card_validation: cardValidation,
        competitor_analysis: {
          total_competitors: 0,
          avg_price: optimalPrice,
          min_competitor_price: minPrice,
          max_competitor_price: maxPrice
        }
      }
    });

  } catch (error: any) {
    console.error('[Unified Scanner] Full process error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Jarayonda xatolik'
    });
  }
});

/**
 * POST /api/unified-scanner/analyze-base64
 * Analyze image from base64 (for quick scan)
 */
router.post('/analyze-base64', async (req: any, res: any) => {
  try {
    const { image_base64, language = 'uz' } = req.body;

    if (!image_base64) {
      return res.status(400).json({
        success: false,
        error: 'image_base64 talab qilinadi'
      });
    }

    const imageUrl = `data:image/jpeg;base64,${image_base64}`;
    
    // Use image search
    const searchResult = await imageSearchService.searchByImage(imageUrl);

    if (searchResult && searchResult.productInfo) {
      return res.json({
        success: true,
        product_info: {
          brand: searchResult.productInfo.brand || 'Unknown',
          model: searchResult.productInfo.model || '',
          product_name: searchResult.productInfo.productName || 'Mahsulot',
          category: searchResult.productInfo.category || '',
          features: searchResult.productInfo.features || [],
          country_of_origin: searchResult.productInfo.country,
          suggested_price: searchResult.avgPrice,
        },
        suggested_price: searchResult.avgPrice,
        confidence: searchResult.productInfo.confidence || 80,
      });
    }

    return res.json({
      success: false,
      error: 'Mahsulot aniqlanmadi'
    });

  } catch (error: any) {
    console.error('[Unified Scanner] Analyze error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
