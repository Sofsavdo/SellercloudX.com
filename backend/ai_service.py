"""
SellerCloudX AI Service - Emergent LLM Integration
Real AI functionality using Emergent LLM Key
"""
import os
import json
import base64
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

# Get Emergent LLM Key
EMERGENT_KEY = os.getenv("EMERGENT_LLM_KEY", "")

async def generate_product_card(
    name: str,
    category: str = "general",
    description: str = "",
    price: float = 100000,
    marketplace: str = "uzum"
) -> dict:
    """Generate AI-powered product card"""
    
    if not EMERGENT_KEY:
        return {
            "success": False,
            "error": "EMERGENT_LLM_KEY not configured"
        }
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        # Initialize chat
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"card-{name[:20]}",
            system_message="Siz professional marketplace SEO mutaxassisisiz. Faqat JSON formatda javob bering."
        ).with_model("openai", "gpt-4o")
        
        # Marketplace rules
        rules = {
            "uzum": "Uzum Market: O'zbek tilida, 80 belgigacha sarlavha",
            "wildberries": "Wildberries: Rus tilida, SEO kalit so'zlar muhim",
            "yandex": "Yandex Market: Rus tilida, texnik xususiyatlar",
            "ozon": "Ozon: Rus tilida, batafsil tavsif"
        }
        
        prompt = f"""MAHSULOT: {name}
KATEGORIYA: {category}
TAVSIF: {description if description else "yo'q"}
NARX: {price} so'm
MARKETPLACE: {marketplace}
QOIDALAR: {rules.get(marketplace, rules['uzum'])}

Quyidagi JSON formatda professional mahsulot kartochkasi yarat:

{{
  "title": "SEO-optimizatsiya qilingan sarlavha",
  "description": "Toliq SEO tavsif (300-500 soz)",
  "shortDescription": "Qisqa tavsif (150 belgi)",
  "keywords": ["kalit1", "kalit2", "...10 tagacha"],
  "bulletPoints": ["Xususiyat 1", "Xususiyat 2", "...5 tagacha"],
  "seoScore": 85,
  "suggestedPrice": {price},
  "categoryPath": ["Kategoriya", "Subkategoriya"]
}}"""
        
        # Send message
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Parse JSON
        try:
            # Try to extract JSON from response
            json_text = response
            if "```json" in response:
                json_text = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_text = response.split("```")[1].split("```")[0]
            
            card = json.loads(json_text)
            return {
                "success": True,
                "card": card,
                "message": f"Kartochka yaratildi. SEO ball: {card.get('seoScore', 0)}/100"
            }
        except json.JSONDecodeError:
            # Try to find JSON in response
            import re
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                card = json.loads(json_match.group())
                return {
                    "success": True,
                    "card": card,
                    "message": f"Kartochka yaratildi. SEO ball: {card.get('seoScore', 0)}/100"
                }
            return {
                "success": False,
                "error": "Could not parse AI response",
                "raw_response": response[:500]
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


async def scan_product_image(image_base64: str) -> dict:
    """Scan product from image using AI vision"""
    
    if not EMERGENT_KEY:
        return {
            "success": False,
            "error": "EMERGENT_LLM_KEY not configured"
        }
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
        
        # Initialize chat with vision model
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id="scanner",
            system_message="Siz mahsulot tahlil qiluvchi AI assistentsiz."
        ).with_model("openai", "gpt-4o")
        
        prompt = """Bu rasmda ko'rsatilgan mahsulotni aniqlang va quyidagi JSON formatda javob bering:

{
  "name": "Mahsulot nomi (O'zbek tilida)",
  "category": "Kategoriya (electronics, clothing, home, beauty, food, other)",
  "description": "Batafsil tavsif (100-200 so'z)",
  "brand": "Brend nomi (agar aniq bo'lsa)",
  "estimatedPrice": 100000,
  "specifications": ["Xususiyat 1", "Xususiyat 2"],
  "keywords": ["kalit1", "kalit2"],
  "confidence": 85
}"""
        
        # Create message with image
        image_content = ImageContent(image_base64=image_base64)
        user_message = UserMessage(text=prompt, file_contents=[image_content])
        
        # Send message
        response = await chat.send_message(user_message)
        
        # Parse JSON
        try:
            import re
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                result = json.loads(json_match.group())
                return {
                    "success": True,
                    "product": result,
                    "message": f"Mahsulot aniqlandi: {result.get('name', 'Unknown')}"
                }
            return {
                "success": False,
                "error": "Could not parse scan result"
            }
        except json.JSONDecodeError:
            return {
                "success": False,
                "error": "Invalid JSON in response"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


async def optimize_price(
    product_name: str,
    current_price: float,
    cost_price: float,
    category: str = "general",
    marketplace: str = "uzum"
) -> dict:
    """AI-powered price optimization"""
    
    if not EMERGENT_KEY:
        return {
            "success": False,
            "error": "EMERGENT_LLM_KEY not configured"
        }
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        margin = ((current_price - cost_price) / current_price * 100)
        
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"price-{product_name[:20]}",
            system_message="Siz narx optimizatsiya mutaxassisisiz."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""Narx optimizatsiyasi:

MAHSULOT: {product_name}
HOZIRGI NARX: {current_price} so'm
TANNARX: {cost_price} so'm  
FOYDA: {margin:.1f}%
KATEGORIYA: {category}
MARKETPLACE: {marketplace}

JSON formatda tavsiya ber:

{{
  "recommendedPrice": {current_price},
  "minPrice": {int(cost_price * 1.15)},
  "maxPrice": {int(current_price * 1.2)},
  "reasoning": "Narx strategiyasi",
  "confidence": 80
}}"""
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            result = json.loads(json_match.group())
            return {
                "success": True,
                "optimization": result,
                "message": f"Tavsiya: {result.get('recommendedPrice', current_price)} so'm"
            }
        
        return {
            "success": False,
            "error": "Could not parse optimization"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# Test function
async def test_ai_service():
    """Test AI service"""
    print("🧪 Testing AI Service...")
    
    result = await generate_product_card(
        name="Samsung Galaxy A54",
        category="electronics",
        description="Yangi smartfon",
        price=4500000,
        marketplace="uzum"
    )
    
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return result


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_ai_service())
