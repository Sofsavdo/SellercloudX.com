/**
 * Yandex Market Complete Card Creator Service
 * 
 * Mahsulot kartasini 100% sifat indeksi bilan yaratish:
 * - SEO optimallashtirilgan nom (RU/UZ)
 * - To'liq tavsif (RU/UZ)
 * - Kategoriya avtomatik aniqlash
 * - SKU generatsiya (Nom + Model)
 * - MXIK kod integratsiyasi
 * - Rasmlar yuklash (10+ rasm)
 * - Narx hisoblash (tannarx + komissiya + soliq + margin)
 * - Barcha majburiy maydonlar
 */

import axios from 'axios';
import mxikService from './mxikService';
import { yandexMarketService } from './yandexMarketService';
import nanoBananaService from './nanoBananaService';

// API Keys
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || 'ae8d1c66d2c3b97a5fbed414c9ee4b4f';
const EMERGENT_LLM_KEY = process.env.EMERGENT_LLM_KEY || 'sk-emergent-c0d5c506030Fa49400';

// Yandex Category Map
const YANDEX_CATEGORIES: Record<string, { id: number; name: string; nameUz: string }> = {
  // Parfyumeriya
  'perfume': { id: 15927546, name: 'Парфюмерия', nameUz: 'Parfyumeriya' },
  'parfyum': { id: 15927546, name: 'Парфюмерия', nameUz: 'Parfyumeriya' },
  'atir': { id: 15927546, name: 'Парфюмерия', nameUz: 'Parfyumeriya' },
  
  // Elektronika
  'electronics': { id: 91491, name: 'Электроника', nameUz: 'Elektronika' },
  'phone': { id: 91461, name: 'Смартфоны', nameUz: 'Smartfonlar' },
  'telefon': { id: 91461, name: 'Смартфоны', nameUz: 'Smartfonlar' },
  'laptop': { id: 91013, name: 'Ноутбуки', nameUz: 'Noutbuklar' },
  'kompyuter': { id: 91013, name: 'Ноутбуки', nameUz: 'Kompyuterlar' },
  'headphones': { id: 90555, name: 'Наушники', nameUz: 'Quloqchinlar' },
  
  // Maishiy texnika
  'appliances': { id: 90586, name: 'Бытовая техника', nameUz: 'Maishiy texnika' },
  'hairdryer': { id: 90590, name: 'Фены', nameUz: 'Fenlar' },
  'iron': { id: 90589, name: 'Утюги', nameUz: 'Dazmollar' },
  
  // Kosmetika
  'cosmetics': { id: 91153, name: 'Косметика', nameUz: 'Kosmetika' },
  'skincare': { id: 91156, name: 'Уход за кожей', nameUz: 'Teri parvarishi' },
  'makeup': { id: 91154, name: 'Макияж', nameUz: 'Makiyaj' },
  
  // Kiyim
  'clothing': { id: 7811873, name: 'Одежда', nameUz: 'Kiyim' },
  'kiyim': { id: 7811873, name: 'Одежда', nameUz: 'Kiyim' },
  'shoes': { id: 7811903, name: 'Обувь', nameUz: 'Poyabzal' },
  'poyabzal': { id: 7811903, name: 'Обувь', nameUz: 'Poyabzal' },
  
  // Uy-ro'zg'or
  'home': { id: 90719, name: 'Товары для дома', nameUz: 'Uy uchun tovarlar' },
  'furniture': { id: 90732, name: 'Мебель', nameUz: 'Mebel' },
  'mebel': { id: 90732, name: 'Мебель', nameUz: 'Mebel' },
  
  // Bolalar
  'toys': { id: 90764, name: 'Игрушки', nameUz: 'O\'yinchoqlar' },
  'baby': { id: 90746, name: 'Детские товары', nameUz: 'Bolalar tovarlari' },
  
  // Sport
  'sport': { id: 91512, name: 'Спорт', nameUz: 'Sport' },
  
  // Default
  'general': { id: 90401, name: 'Товары', nameUz: 'Tovarlar' },
};

// Country names mapping
const COUNTRIES: Record<string, { ru: string; uz: string }> = {
  'france': { ru: 'Франция', uz: 'Fransiya' },
  'usa': { ru: 'США', uz: 'AQSH' },
  'china': { ru: 'Китай', uz: 'Xitoy' },
  'korea': { ru: 'Корея', uz: 'Koreya' },
  'japan': { ru: 'Япония', uz: 'Yaponiya' },
  'italy': { ru: 'Италия', uz: 'Italiya' },
  'germany': { ru: 'Германия', uz: 'Germaniya' },
  'uk': { ru: 'Великобритания', uz: 'Buyuk Britaniya' },
  'uzbekistan': { ru: 'Узбекистан', uz: 'O\'zbekiston' },
  'turkey': { ru: 'Турция', uz: 'Turkiya' },
  'russia': { ru: 'Россия', uz: 'Rossiya' },
};

// Yandex commission rates by category
const COMMISSION_RATES: Record<string, number> = {
  'electronics': 0.08, // 8%
  'clothing': 0.15,    // 15%
  'cosmetics': 0.12,   // 12%
  'perfume': 0.10,     // 10%
  'home': 0.10,        // 10%
  'food': 0.05,        // 5%
  'default': 0.10,     // 10% default
};

// Logistics rates (UZS per kg)
const LOGISTICS_RATES = {
  fbs: 15000,  // Fulfillment by Seller
  fbo: 25000,  // Fulfillment by Operator
};

export interface ProductCardInput {
  // Required
  name: string;           // Product name
  brand: string;          // Brand/vendor
  model?: string;         // Model name
  costPrice: number;      // Tannarx (UZS)
  
  // Optional - will be auto-generated if not provided
  category?: string;      // Category keyword
  description?: string;   // Custom description
  descriptionUz?: string; // Uzbek description
  country?: string;       // Country of origin
  images?: string[];      // Image URLs
  weight?: number;        // Weight in grams
  dimensions?: {          // Dimensions in cm
    length: number;
    width: number;
    height: number;
  };
  
  // AI-generated fields
  features?: string[];    // Product features
  barcode?: string;       // EAN/UPC barcode
  
  // AI Generation options
  generateInfographics?: boolean;  // Generate AI infographics
  generateAIDescription?: boolean; // Generate AI description
  infographicCount?: number;       // Number of infographics (default: 6)
}

export interface ProductCardOutput {
  success: boolean;
  offerId?: string;
  sku: string;
  
  // Generated content
  titleRu: string;
  titleUz: string;
  descriptionRu: string;
  descriptionUz: string;
  
  // Category & codes
  categoryId: number;
  categoryName: string;
  mxikCode: string;
  mxikName?: string;
  
  // Pricing
  suggestedPrice: number;
  priceBreakdown: {
    costPrice: number;
    commission: number;
    logistics: number;
    tax: number;
    margin: number;
    finalPrice: number;
  };
  
  // Images
  uploadedImages: string[];
  generatedInfographics?: string[];
  
  // Quality
  qualityIndex: number;
  missingFields: string[];
  
  // Yandex response
  yandexResponse?: any;
  error?: string;
}

/**
 * Generate SEO-optimized title in Russian
 */
function generateTitleRu(name: string, brand: string, model?: string, features?: string[]): string {
  let title = `${brand} ${name}`;
  if (model) title += ` ${model}`;
  if (features && features.length > 0) {
    title += ` - ${features.slice(0, 2).join(', ')}`;
  }
  // Yandex title limit: 150 chars
  return title.substring(0, 150);
}

/**
 * Generate SEO-optimized title in Uzbek
 */
function generateTitleUz(name: string, brand: string, model?: string, features?: string[]): string {
  let title = `${brand} ${name}`;
  if (model) title += ` ${model}`;
  if (features && features.length > 0) {
    title += ` - ${features.slice(0, 2).join(', ')}`;
  }
  return title.substring(0, 150);
}

/**
 * Generate detailed description in Russian
 */
function generateDescriptionRu(
  name: string, 
  brand: string, 
  model?: string, 
  features?: string[],
  country?: string
): string {
  let desc = `${brand} ${name}`;
  if (model) desc += ` ${model}`;
  desc += ` - высококачественный товар от известного производителя.`;
  
  if (features && features.length > 0) {
    desc += `\n\nОсобенности:\n`;
    features.forEach(f => desc += `• ${f}\n`);
  }
  
  if (country && COUNTRIES[country.toLowerCase()]) {
    desc += `\nСтрана производитель: ${COUNTRIES[country.toLowerCase()].ru}`;
  }
  
  desc += `\n\n✅ Гарантия качества\n✅ Быстрая доставка\n✅ Официальный товар`;
  
  return desc;
}

/**
 * Generate detailed description in Uzbek
 */
function generateDescriptionUz(
  name: string, 
  brand: string, 
  model?: string, 
  features?: string[],
  country?: string
): string {
  let desc = `${brand} ${name}`;
  if (model) desc += ` ${model}`;
  desc += ` - mashhur ishlab chiqaruvchidan yuqori sifatli tovar.`;
  
  if (features && features.length > 0) {
    desc += `\n\nXususiyatlari:\n`;
    features.forEach(f => desc += `• ${f}\n`);
  }
  
  if (country && COUNTRIES[country.toLowerCase()]) {
    desc += `\nIshlab chiqaruvchi mamlakat: ${COUNTRIES[country.toLowerCase()].uz}`;
  }
  
  desc += `\n\n✅ Sifat kafolati\n✅ Tez yetkazib berish\n✅ Rasmiy tovar`;
  
  return desc;
}

/**
 * Generate unique SKU
 */
function generateSku(brand: string, name: string, model?: string): string {
  const brandCode = brand.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
  const nameCode = name.substring(0, 5).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const modelCode = model ? model.substring(0, 5).toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `${brandCode}-${nameCode}${modelCode ? '-' + modelCode : ''}-${random}`;
}

/**
 * Detect category from product name
 */
function detectCategory(name: string, brand: string): { id: number; name: string; nameUz: string; key: string } {
  const searchText = `${name} ${brand}`.toLowerCase();
  
  // Search through category keywords
  for (const [key, cat] of Object.entries(YANDEX_CATEGORIES)) {
    if (searchText.includes(key)) {
      return { ...cat, key };
    }
  }
  
  // Default category
  return { ...YANDEX_CATEGORIES['general'], key: 'general' };
}

/**
 * Calculate optimal price
 */
function calculateOptimalPrice(
  costPrice: number,
  categoryKey: string,
  weight: number = 500
): {
  costPrice: number;
  commission: number;
  logistics: number;
  tax: number;
  margin: number;
  finalPrice: number;
} {
  const commissionRate = COMMISSION_RATES[categoryKey] || COMMISSION_RATES['default'];
  const logisticsPerKg = LOGISTICS_RATES.fbs;
  
  // Calculate components
  const logistics = Math.round((weight / 1000) * logisticsPerKg);
  const tax = Math.round(costPrice * 0.12); // 12% VAT
  const targetMargin = Math.round(costPrice * 0.30); // 30% margin target
  
  // Calculate final price
  // finalPrice = (costPrice + logistics + tax + margin) / (1 - commissionRate)
  const baseTotal = costPrice + logistics + tax + targetMargin;
  const finalPrice = Math.round(baseTotal / (1 - commissionRate));
  
  const commission = Math.round(finalPrice * commissionRate);
  const actualMargin = finalPrice - costPrice - commission - logistics - tax;
  
  return {
    costPrice,
    commission,
    logistics,
    tax,
    margin: actualMargin,
    finalPrice,
  };
}

/**
 * Upload image to ImgBB
 */
async function uploadImageToImgBB(imageUrl: string): Promise<string | null> {
  try {
    // Download image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(response.data).toString('base64');
    
    // Upload to ImgBB
    const formData = new URLSearchParams();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64);
    
    const uploadResponse = await axios.post(
      'https://api.imgbb.com/1/upload',
      formData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    if (uploadResponse.data?.success) {
      return uploadResponse.data.data.url;
    }
    
    return null;
  } catch (error: any) {
    console.error('Image upload error:', error.message);
    return null;
  }
}

/**
 * Calculate quality index based on filled fields
 */
function calculateQualityIndex(card: Partial<ProductCardOutput>): { index: number; missing: string[] } {
  const requiredFields = [
    { field: 'titleRu', weight: 15, name: 'Title (RU)' },
    { field: 'titleUz', weight: 5, name: 'Title (UZ)' },
    { field: 'descriptionRu', weight: 15, name: 'Description (RU)' },
    { field: 'descriptionUz', weight: 5, name: 'Description (UZ)' },
    { field: 'categoryId', weight: 10, name: 'Category' },
    { field: 'mxikCode', weight: 10, name: 'MXIK Code' },
    { field: 'suggestedPrice', weight: 10, name: 'Price' },
    { field: 'uploadedImages', weight: 20, name: 'Images' },
    { field: 'sku', weight: 10, name: 'SKU' },
  ];
  
  let totalWeight = 0;
  let earnedWeight = 0;
  const missing: string[] = [];
  
  for (const { field, weight, name } of requiredFields) {
    totalWeight += weight;
    const value = (card as any)[field];
    
    if (field === 'uploadedImages') {
      if (Array.isArray(value) && value.length > 0) {
        // More images = better score
        const imageScore = Math.min(value.length / 5, 1);
        earnedWeight += weight * imageScore;
        if (value.length < 3) missing.push(`${name} (${value.length}/5 rasm)`);
      } else {
        missing.push(name);
      }
    } else if (value) {
      earnedWeight += weight;
    } else {
      missing.push(name);
    }
  }
  
  return {
    index: Math.round((earnedWeight / totalWeight) * 100),
    missing
  };
}

/**
 * Main function: Create complete product card with AI enhancements
 */
export async function createCompleteProductCard(input: ProductCardInput): Promise<ProductCardOutput> {
  console.log('🚀 Creating complete product card with AI...');
  console.log(`Product: ${input.brand} ${input.name}`);
  
  try {
    // 1. Generate SKU
    const sku = generateSku(input.brand, input.name, input.model);
    console.log(`📝 SKU: ${sku}`);
    
    // 2. Detect category
    const category = detectCategory(input.name, input.brand);
    console.log(`📂 Category: ${category.name} (${category.id})`);
    
    // 3. Get MXIK code from full database
    const mxikResult = mxikService.getBestMxikCode(input.name, category.nameUz);
    const mxikCode = mxikResult?.code || '47190000';
    const mxikName = mxikResult?.nameUz || 'Boshqa chakana savdo';
    console.log(`🏷️ MXIK: ${mxikCode} - ${mxikName}`);
    
    // 4. Generate AI-enhanced titles
    let titleRu = '';
    let titleUz = '';
    
    if (input.generateAIDescription) {
      console.log('🤖 Generating AI titles...');
      const titleResultRu = await nanoBananaService.generateProductTitle(
        input.name, input.brand, category.name, 'ru'
      );
      const titleResultUz = await nanoBananaService.generateProductTitle(
        input.name, input.brand, category.nameUz, 'uz'
      );
      
      titleRu = titleResultRu.success && titleResultRu.title 
        ? titleResultRu.title 
        : generateTitleRu(input.name, input.brand, input.model, input.features);
      titleUz = titleResultUz.success && titleResultUz.title 
        ? titleResultUz.title 
        : generateTitleUz(input.name, input.brand, input.model, input.features);
    } else {
      titleRu = input.description 
        ? `${input.brand} ${input.name}${input.model ? ' ' + input.model : ''}`
        : generateTitleRu(input.name, input.brand, input.model, input.features);
      titleUz = input.descriptionUz 
        ? `${input.brand} ${input.name}${input.model ? ' ' + input.model : ''}`
        : generateTitleUz(input.name, input.brand, input.model, input.features);
    }
    
    // 5. Generate AI-enhanced descriptions
    let descriptionRu = '';
    let descriptionUz = '';
    
    if (input.generateAIDescription && !input.description) {
      console.log('🤖 Generating AI descriptions...');
      const descResultRu = await nanoBananaService.generateProductDescription(
        input.name, input.brand, input.features || [], 'ru'
      );
      const descResultUz = await nanoBananaService.generateProductDescription(
        input.name, input.brand, input.features || [], 'uz'
      );
      
      descriptionRu = descResultRu.success && descResultRu.description 
        ? descResultRu.description 
        : generateDescriptionRu(input.name, input.brand, input.model, input.features, input.country);
      descriptionUz = descResultUz.success && descResultUz.description 
        ? descResultUz.description 
        : generateDescriptionUz(input.name, input.brand, input.model, input.features, input.country);
    } else {
      descriptionRu = input.description || generateDescriptionRu(
        input.name, input.brand, input.model, input.features, input.country
      );
      descriptionUz = input.descriptionUz || generateDescriptionUz(
        input.name, input.brand, input.model, input.features, input.country
      );
    }
    
    // 6. Calculate competitive price
    const priceBreakdown = calculateOptimalPrice(
      input.costPrice, 
      category.key,
      input.weight || 500
    );
    console.log(`💰 Price: ${priceBreakdown.finalPrice} UZS`);
    
    // 7. Process images
    let uploadedImages: string[] = [];
    let generatedInfographics: string[] = [];
    
    // Upload provided images
    if (input.images && input.images.length > 0) {
      console.log(`📷 Uploading ${input.images.length} images...`);
      for (const imageUrl of input.images.slice(0, 10)) {
        const uploaded = await uploadImageToImgBB(imageUrl);
        if (uploaded) uploadedImages.push(uploaded);
      }
      console.log(`✅ Uploaded ${uploadedImages.length} images`);
    }
    
    // Generate AI infographics if requested
    if (input.generateInfographics) {
      console.log('🎨 Generating AI infographics with Nano Banana...');
      const infographicCount = input.infographicCount || 6;
      const infographicResult = await nanoBananaService.generateProductInfographics(
        `${input.brand} ${input.name}`,
        descriptionRu,
        input.features || [],
        infographicCount
      );
      
      if (infographicResult.success) {
        generatedInfographics = infographicResult.images;
        uploadedImages = [...uploadedImages, ...generatedInfographics];
        console.log(`✅ Generated ${generatedInfographics.length} infographics`);
      }
    }
    
    // 8. Calculate quality index
    const partialCard = {
      titleRu, titleUz, descriptionRu, descriptionUz,
      categoryId: category.id, mxikCode, sku,
      suggestedPrice: priceBreakdown.finalPrice,
      uploadedImages
    };
    const quality = calculateQualityIndex(partialCard);
    console.log(`⭐ Quality Index: ${quality.index}%`);
    
    // 9. Create card on Yandex Market
    let yandexResponse: any = null;
    let yandexError: string | undefined;
    
    try {
      console.log('📤 Sending to Yandex Market API...');
      yandexResponse = await yandexMarketService.createProduct({
        offer_id: sku,
        name: titleRu,
        description: descriptionRu,
        price: priceBreakdown.finalPrice,
        currency: 'UZS',
        category_id: category.id,
        vendor: input.brand,
        pictures: uploadedImages,
        vat: 6, // VAT ID for 12%
      });
      
      if (!yandexResponse.success) {
        yandexError = yandexResponse.error;
        console.log(`⚠️ Yandex API warning: ${yandexError}`);
      } else {
        console.log('✅ Product card created on Yandex Market!');
      }
    } catch (error: any) {
      yandexError = error.message;
      console.error('❌ Yandex API error:', error.message);
    }
    
    // 10. Return complete result
    return {
      success: yandexResponse?.success || false,
      offerId: sku,
      sku,
      titleRu,
      titleUz,
      descriptionRu,
      descriptionUz,
      categoryId: category.id,
      categoryName: category.name,
      mxikCode,
      mxikName,
      suggestedPrice: priceBreakdown.finalPrice,
      priceBreakdown,
      uploadedImages,
      generatedInfographics,
      qualityIndex: quality.index,
      missingFields: quality.missing,
      yandexResponse,
      error: yandexError
    };
    
  } catch (error: any) {
    console.error('❌ Card creation failed:', error.message);
    return {
      success: false,
      offerId: undefined,
      sku: '',
      titleRu: '',
      titleUz: '',
      descriptionRu: '',
      descriptionUz: '',
      categoryId: 0,
      categoryName: '',
      mxikCode: '',
      suggestedPrice: 0,
      priceBreakdown: {
        costPrice: input.costPrice,
        commission: 0,
        logistics: 0,
        tax: 0,
        margin: 0,
        finalPrice: 0
      },
      uploadedImages: [],
      qualityIndex: 0,
      missingFields: ['All fields'],
      error: error.message
    };
  }
}

/**
 * Preview card without creating on Yandex (for UI preview)
 */
export async function previewProductCard(input: ProductCardInput): Promise<Omit<ProductCardOutput, 'yandexResponse'>> {
  console.log('👀 Previewing product card...');
  
  // Generate all fields without calling Yandex API
  const sku = generateSku(input.brand, input.name, input.model);
  const category = detectCategory(input.name, input.brand);
  const mxikResult = mxikService.getBestMxikCode(input.name, category.nameUz);
  const mxikCode = mxikResult?.code || '47190000';
  
  const titleRu = generateTitleRu(input.name, input.brand, input.model, input.features);
  const titleUz = generateTitleUz(input.name, input.brand, input.model, input.features);
  const descriptionRu = input.description || generateDescriptionRu(
    input.name, input.brand, input.model, input.features, input.country
  );
  const descriptionUz = input.descriptionUz || generateDescriptionUz(
    input.name, input.brand, input.model, input.features, input.country
  );
  
  const priceBreakdown = calculateOptimalPrice(input.costPrice, category.key, input.weight || 500);
  
  const partialCard = {
    titleRu, titleUz, descriptionRu, descriptionUz,
    categoryId: category.id, mxikCode, sku,
    suggestedPrice: priceBreakdown.finalPrice,
    uploadedImages: input.images || []
  };
  const quality = calculateQualityIndex(partialCard);
  
  return {
    success: true,
    offerId: sku,
    sku,
    titleRu,
    titleUz,
    descriptionRu,
    descriptionUz,
    categoryId: category.id,
    categoryName: category.name,
    mxikCode,
    suggestedPrice: priceBreakdown.finalPrice,
    priceBreakdown,
    uploadedImages: input.images || [],
    qualityIndex: quality.index,
    missingFields: quality.missing
  };
}

export default {
  createCompleteProductCard,
  previewProductCard,
  generateSku,
  detectCategory,
  calculateOptimalPrice,
  calculateQualityIndex
};
