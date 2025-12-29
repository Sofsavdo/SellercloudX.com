// AI Scanner Routes - Product recognition from images
import express, { Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import multer from 'multer';
import OpenAI from 'openai';
import { imageAIService } from '../services/imageAIService';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/temp/', limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

// Recognize product from image
router.post('/recognize', upload.single('image'), asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Rasm talab qilinadi' });
  }

  try {
    // Step 1: Analyze image with OpenAI Vision
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Bu rasmda ko'rsatilgan mahsulotni aniqlang va quyidagi JSON formatda javob bering:
{
  "name": "Mahsulot nomi (O'zbek tilida)",
  "category": "Kategoriya",
  "description": "Batafsil tavsif",
  "brand": "Brend (agar ko'rsatilgan bo'lsa)",
  "price": "Taxminiy narx (so'm)",
  "specifications": ["Xususiyat 1", "Xususiyat 2"],
  "keywords": ["kalit so'z 1", "kalit so'z 2"],
  "barcode": "Barkod (agar ko'rsatilgan bo'lsa)",
  "confidence": 85
}

Mahsulotni internetdan qidirib, aniq ma'lumotlarni toping.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const content = visionResponse.choices[0].message.content || '{}';
    let productData;
    
    try {
      // Try to parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        productData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON topilmadi');
      }
    } catch (parseError) {
      // Fallback: Extract information from text
      productData = {
        name: extractField(content, 'name') || 'Noma\'lum mahsulot',
        category: extractField(content, 'category') || 'Umumiy',
        description: extractField(content, 'description') || content.substring(0, 200),
        price: extractField(content, 'price') || '0',
        confidence: 70
      };
    }

    // Step 2: Search internet for more details (using AI)
    const searchPrompt = `Internetdan "${productData.name}" mahsuloti haqida qo'shimcha ma'lumot toping:
- Aniq narx (O'zbekiston bozori)
- Xususiyatlar
- O'xshash mahsulotlar
- Bozor tendentsiyalari

JSON formatda javob bering.`;

    const searchResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Siz professional e-commerce mahsulot tahlilchisisiz. Internetdan real ma\'lumotlarni toping.'
        },
        {
          role: 'user',
          content: searchPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const searchData = JSON.parse(searchResponse.choices[0].message.content || '{}');
    
    // Merge data
    const finalProductData = {
      ...productData,
      ...searchData,
      imageUrl: `/uploads/temp/${req.file.filename}`,
      recognizedAt: new Date().toISOString()
    };

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.json(finalProductData);

  } catch (error: any) {
    console.error('AI Scanner error:', error);
    
    // Clean up temp file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    res.status(500).json({
      error: 'Mahsulotni aniqlashda xatolik',
      message: error.message
    });
  }
}));

// Helper function to extract field from text
function extractField(text: string, field: string): string | null {
  const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`, 'i');
  const match = text.match(regex);
  return match ? match[1] : null;
}

export default router;

