// Unified Scanner Routes - AI Product Creation Pipeline
// ALL requests are proxied to Python Backend (which uses Emergent LLM Key)

import { Router } from 'express';
import multer from 'multer';

const router = Router();

// Python Backend URL - uses Emergent LLM Key for AI
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8001';

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
 * PROXIED to Python Backend
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

    console.log('[Unified Scanner] Proxying scan-image to Python backend, size:', file.size);

    // Convert to base64
    const imageBase64 = file.buffer.toString('base64');

    // Proxy to Python backend
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/unified-scanner/analyze-base64`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        image_base64: imageBase64, 
        language: 'uz' 
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      const product = data.product_info || data.data || {};
      console.log('[Unified Scanner] Python backend success:', product.product_name || product.name);
      
      return res.json({
        success: true,
        product: {
          name: product.product_name || product.name || 'Mahsulot',
          brand: product.brand || 'Unknown',
          category: product.category || 'electronics',
          description: product.description || '',
          specifications: product.features || product.specifications || [],
          confidence: product.confidence || data.confidence || 80,
          suggestedPrice: product.suggested_price || product.estimatedPrice || 100000,
        }
      });
    }

    console.warn('[Unified Scanner] Python backend failed:', data.error);
    return res.json({
      success: false,
      error: data.error || 'Mahsulot aniqlanmadi'
    });

  } catch (error: any) {
    console.error('[Unified Scanner] Proxy error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'AI xizmati vaqtincha ishlamayapti'
    });
  }
});

/**
 * POST /api/unified-scanner/full-process
 * Full pipeline: scan + price + card generation
 * PROXIED to Python Backend
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

    // If we have image, first scan it with Python backend
    let scannedProduct: any = null;
    if (image_base64) {
      try {
        const scanResponse = await fetch(`${PYTHON_BACKEND_URL}/api/unified-scanner/analyze-base64`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64, language: 'uz' }),
        });
        const scanData = await scanResponse.json();
        if (scanData.success) {
          scannedProduct = scanData.product_info || scanData.data;
          console.log('[Unified Scanner] Scanned product:', scannedProduct?.product_name || scannedProduct?.name);
        }
      } catch (scanError) {
        console.warn('[Unified Scanner] Scan failed, using provided data');
      }
    }

    // Use scanned data or provided data
    const finalProductName = scannedProduct?.product_name || scannedProduct?.name || product_name || 'Mahsulot';
    const finalBrand = scannedProduct?.brand || brand;
    const finalCategory = scannedProduct?.category || category;
    const finalDescription = scannedProduct?.description || description || '';

    // Price optimization calculation
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

    // Price breakdown
    const priceBreakdown = {
      base_cost: cost_price,
      delivery: deliveryCost,
      packaging: Math.round(cost_price * 0.05),
      commission: Math.round(optimalPrice * commission),
      total_costs: Math.round(baseCost + (optimalPrice * commission)),
      revenue: optimalPrice,
      profit: Math.round(netProfit)
    };

    // Generate product card using Python backend AI
    let productCard = {
      title_uz: finalProductName,
      title_ru: finalProductName,
      description_uz: finalDescription || `${finalBrand} ${finalProductName} - sifatli mahsulot`,
      description_ru: finalDescription || `${finalBrand} ${finalProductName} - качественный товар`,
      keywords: [finalBrand, finalCategory, finalProductName.split(' ')[0]].filter(Boolean),
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
        brand: finalBrand,
        category: finalCategory,
        weight: `${weight_kg} kg`
      },
      seo_score: 75
    };

    // Try to get AI-generated card from Python backend
    try {
      const cardResponse = await fetch(`${PYTHON_BACKEND_URL}/api/ai/generate-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: finalProductName,
          category: finalCategory,
          description: finalDescription,
          price: optimalPrice,
          marketplace: 'yandex'
        }),
      });
      const cardData = await cardResponse.json();
      if (cardData.success && cardData.card) {
        const aiCard = cardData.card;
        productCard = {
          ...productCard,
          title_uz: aiCard.title || productCard.title_uz,
          title_ru: aiCard.title || productCard.title_ru,
          description_uz: aiCard.description || productCard.description_uz,
          description_ru: aiCard.description || productCard.description_ru,
          keywords: aiCard.keywords || productCard.keywords,
          bullet_points_uz: aiCard.bulletPoints || productCard.bullet_points_uz,
          bullet_points_ru: aiCard.bulletPoints || productCard.bullet_points_ru,
          seo_score: aiCard.seoScore || 85
        };
        console.log('[Unified Scanner] AI card generated, SEO score:', productCard.seo_score);
      }
    } catch (cardError) {
      console.warn('[Unified Scanner] AI card generation failed, using default');
    }

    // Generate IKPU code (Uzbekistan product code)
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
    
    const ikpuBase = ikpuCategories[finalCategory] || '8471';
    const ikpuCode = auto_ikpu ? `${ikpuBase}3000${Math.floor(Math.random() * 9000) + 1000}` : '';

    // Generate SKU
    const skuCode = `${finalBrand.substring(0, 3).toUpperCase()}-${finalCategory.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    // Sales tips
    const salesTips = [
      `${finalCategory} kategoriyasida o'rtacha narx: ${Math.round(optimalPrice * 0.9).toLocaleString()} - ${Math.round(optimalPrice * 1.1).toLocaleString()} so'm`,
      `Tavsiya: Birinchi 50 ta sotuvda 5% chegirma qiling`,
      'Mahsulot rasmlarini professional qiling - sotuvni 40% oshiradi',
      `${fulfillment === 'fbo' ? 'FBO' : 'FBS'} tanlangani uchun yetkazib berish ${fulfillment === 'fbo' ? 'tezroq' : 'arzonroq'} bo\'ladi`
    ];

    // Card validation
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
        },
        scanned_product: scannedProduct // Include AI scan results
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
 * PROXIED to Python Backend for Emergent LLM Key support
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

    console.log('[Unified Scanner] Proxying analyze-base64 to Python backend...');
    
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/unified-scanner/analyze-base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_base64, language }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('[Unified Scanner] Python backend success:', data.product_info?.product_name || data.product_info?.name);
      return res.json(data);
    }

    console.warn('[Unified Scanner] Python backend failed:', data.error);
    return res.json({
      success: false,
      error: data.error || 'AI tahlil qilishda xatolik'
    });

  } catch (error: any) {
    console.error('[Unified Scanner] Proxy error:', error.message);
    
    // Return error - don't fallback to fake data
    return res.status(500).json({
      success: false,
      error: 'AI xizmati vaqtincha ishlamayapti. Iltimos keyinroq urinib ko\'ring.'
    });
  }
});

/**
 * POST /api/unified-scanner/validate-text
 * Validate product card text
 */
router.post('/validate-text', async (req: any, res: any) => {
  try {
    const { title, description, keywords } = req.body;
    
    const validation = {
      title: {
        valid: title && title.length >= 20 && title.length <= 80,
        length: title?.length || 0,
        message: title?.length < 20 ? 'Sarlavha juda qisqa (min 20 belgi)' : 
                 title?.length > 80 ? 'Sarlavha juda uzun (max 80 belgi)' : 'OK'
      },
      description: {
        valid: description && description.length >= 100,
        length: description?.length || 0,
        message: description?.length < 100 ? 'Tavsif juda qisqa (min 100 belgi)' : 'OK'
      },
      keywords: {
        valid: keywords && keywords.length >= 3,
        count: keywords?.length || 0,
        message: keywords?.length < 3 ? 'Kamida 3 ta kalit so\'z kerak' : 'OK'
      },
      overall: {
        score: 0,
        grade: 'F'
      }
    };
    
    const score = [validation.title.valid, validation.description.valid, validation.keywords.valid]
      .filter(Boolean).length;
    validation.overall.score = Math.round((score / 3) * 100);
    validation.overall.grade = validation.overall.score >= 80 ? 'A' : 
                               validation.overall.score >= 60 ? 'B' :
                               validation.overall.score >= 40 ? 'C' : 'F';
    
    return res.json({
      success: true,
      validation
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
