/**
 * Nano Banana Image Generation Service
 * Gemini 3 Pro Image Preview - for product infographics and videos
 * 
 * Uses Emergent LLM Key with emergentintegrations library
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Emergent LLM Key
const EMERGENT_LLM_KEY = process.env.EMERGENT_LLM_KEY || 'sk-emergent-c0d5c506030Fa49400';
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || 'ae8d1c66d2c3b97a5fbed414c9ee4b4f';

interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  base64Data?: string;
  error?: string;
}

interface InfographicGenerationResult {
  success: boolean;
  images: string[];
  error?: string;
}

/**
 * Upload base64 image to ImgBB for permanent URL
 */
async function uploadToImgBB(base64Data: string): Promise<string | null> {
  try {
    const formData = new URLSearchParams();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64Data);
    
    const response = await axios.post(
      'https://api.imgbb.com/1/upload',
      formData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    if (response.data?.success) {
      return response.data.data.url;
    }
    return null;
  } catch (error: any) {
    console.error('ImgBB upload error:', error.message);
    return null;
  }
}

/**
 * Generate product infographic image using Gemini Nano Banana
 * Creates sales-boosting infographics for marketplace product cards
 */
export async function generateProductInfographic(
  productName: string,
  productDescription: string,
  features: string[],
  style: 'modern' | 'elegant' | 'professional' | 'vibrant' = 'professional',
  index: number = 1
): Promise<ImageGenerationResult> {
  try {
    console.log(`🎨 Generating infographic #${index} for: ${productName}`);
    
    // Create detailed prompt for infographic
    const featuresText = features.slice(0, 3).join(', ');
    const prompt = `Create a professional e-commerce product infographic image for: ${productName}.

Style: ${style}, clean, modern marketplace listing
Features to highlight: ${featuresText}

Requirements:
- High-quality product showcase image
- Clean white or gradient background
- Professional typography for features
- Sales-boosting design elements
- Suitable for Yandex Market listing
- ${index === 1 ? 'Main product hero shot' : index <= 3 ? 'Feature highlight image' : 'Lifestyle/usage image'}

Make it visually appealing and conversion-optimized for online marketplace.`;

    // Call Gemini via emergentintegrations proxy
    const response = await axios.post(
      'https://api.emergentai.io/v1/images/generations',
      {
        model: 'gemini-3-pro-image-preview',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json'
      },
      {
        headers: {
          'Authorization': `Bearer ${EMERGENT_LLM_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    if (response.data?.data?.[0]?.b64_json) {
      const base64Data = response.data.data[0].b64_json;
      
      // Upload to ImgBB for permanent URL
      const imageUrl = await uploadToImgBB(base64Data);
      
      if (imageUrl) {
        console.log(`✅ Infographic #${index} generated: ${imageUrl.substring(0, 50)}...`);
        return {
          success: true,
          imageUrl,
          base64Data
        };
      }
    }

    return {
      success: false,
      error: 'Failed to generate image'
    };
  } catch (error: any) {
    console.error(`❌ Infographic generation error:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate multiple infographics for product card (6 images)
 */
export async function generateProductInfographics(
  productName: string,
  productDescription: string,
  features: string[],
  count: number = 6
): Promise<InfographicGenerationResult> {
  try {
    console.log(`🖼️ Generating ${count} infographics for: ${productName}`);
    
    const styles: Array<'modern' | 'elegant' | 'professional' | 'vibrant'> = [
      'professional', 'modern', 'elegant', 'vibrant', 'professional', 'modern'
    ];
    
    const images: string[] = [];
    
    // Generate images sequentially to avoid rate limits
    for (let i = 0; i < count; i++) {
      const result = await generateProductInfographic(
        productName,
        productDescription,
        features,
        styles[i % styles.length],
        i + 1
      );
      
      if (result.success && result.imageUrl) {
        images.push(result.imageUrl);
      }
      
      // Small delay between requests
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`✅ Generated ${images.length}/${count} infographics`);
    
    return {
      success: images.length > 0,
      images,
      error: images.length === 0 ? 'Failed to generate any images' : undefined
    };
  } catch (error: any) {
    console.error('❌ Infographics generation error:', error.message);
    return {
      success: false,
      images: [],
      error: error.message
    };
  }
}

/**
 * Generate 8-second product video using AI
 * Note: Video generation requires specific model support
 */
export async function generateProductVideo(
  productName: string,
  productDescription: string
): Promise<{ success: boolean; videoUrl?: string; error?: string }> {
  try {
    console.log(`🎬 Video generation for: ${productName}`);
    
    // Video generation is complex - for now return placeholder
    // Real implementation would use Sora 2 or similar
    console.log('⚠️ Video generation not yet implemented - requires Sora 2 integration');
    
    return {
      success: false,
      error: 'Video generation requires Sora 2 integration - coming soon'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate product description using AI
 */
export async function generateProductDescription(
  productName: string,
  brand: string,
  features: string[],
  language: 'ru' | 'uz' = 'ru'
): Promise<{ success: boolean; description?: string; error?: string }> {
  try {
    const featuresText = features.join(', ');
    
    const prompt = language === 'ru' 
      ? `Напиши профессиональное описание товара для маркетплейса на русском языке.

Товар: ${brand} ${productName}
Характеристики: ${featuresText}

Требования:
- SEO-оптимизированный текст
- 150-300 слов
- Ключевые преимущества товара
- Призыв к покупке
- Без воды, только полезная информация`
      : `Marketplace uchun professional mahsulot tavsifini o'zbek tilida yozing.

Mahsulot: ${brand} ${productName}
Xususiyatlar: ${featuresText}

Talablar:
- SEO-optimallashtirilgan matn
- 150-300 so'z
- Mahsulotning asosiy afzalliklari
- Sotib olishga chaqiruv
- Faqat foydali ma'lumot`;

    const response = await axios.post(
      'https://api.emergentai.io/v1/chat/completions',
      {
        model: 'gemini-3-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${EMERGENT_LLM_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const description = response.data?.choices?.[0]?.message?.content;
    
    if (description) {
      return {
        success: true,
        description
      };
    }

    return {
      success: false,
      error: 'Failed to generate description'
    };
  } catch (error: any) {
    console.error('Description generation error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate SEO-optimized product title
 */
export async function generateProductTitle(
  productName: string,
  brand: string,
  category: string,
  language: 'ru' | 'uz' = 'ru'
): Promise<{ success: boolean; title?: string; error?: string }> {
  try {
    const prompt = language === 'ru'
      ? `Создай SEO-оптимизированное название товара для Яндекс Маркета.

Товар: ${brand} ${productName}
Категория: ${category}

Требования:
- Максимум 150 символов
- Включить бренд и модель
- Ключевые слова для поиска
- Только название, без пояснений`
      : `Yandex Market uchun SEO-optimallashtirilgan mahsulot nomini yarating.

Mahsulot: ${brand} ${productName}
Kategoriya: ${category}

Talablar:
- Maksimum 150 belgi
- Brend va modelni kiritish
- Qidiruv uchun kalit so'zlar
- Faqat nom, izohsiz`;

    const response = await axios.post(
      'https://api.emergentai.io/v1/chat/completions',
      {
        model: 'gemini-3-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${EMERGENT_LLM_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const title = response.data?.choices?.[0]?.message?.content?.trim();
    
    if (title) {
      return {
        success: true,
        title: title.substring(0, 150) // Ensure max length
      };
    }

    return {
      success: false,
      error: 'Failed to generate title'
    };
  } catch (error: any) {
    console.error('Title generation error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  generateProductInfographic,
  generateProductInfographics,
  generateProductVideo,
  generateProductDescription,
  generateProductTitle,
  uploadToImgBB
};
