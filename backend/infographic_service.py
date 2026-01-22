"""
AI Infographic Image Generator Service
Uses Gemini Nano Banana for creating professional product infographics

Marketplace talablari:
- Uzum Market: 1080x1440px (3:4 ratio)
- Yandex Market: 1000x1000px (1:1 ratio, white background)
"""
import os
import base64
import asyncio
from typing import Optional, List, Dict, Any
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Infografika shablonlari
INFOGRAPHIC_TEMPLATES = {
    "product_showcase": {
        "name": "Mahsulot ko'rsatish",
        "name_ru": "Презентация товара",
        "description": "Professional mahsulot rasmi va xususiyatlar",
        "prompt_template": """Create a professional e-commerce product infographic image:

Product: {product_name}
Brand: {brand}
Key Features: {features}

Style requirements:
- Clean, minimalist design
- {background_style} background
- Product prominently displayed in center
- Feature highlights with icons around the product
- Professional lighting and shadows
- High quality, 4K resolution look
- NO text overlays on the image itself
- Suitable for {marketplace} marketplace"""
    },
    "features_highlight": {
        "name": "Xususiyatlar",
        "name_ru": "Характеристики",
        "description": "Mahsulot xususiyatlarini ko'rsatish",
        "prompt_template": """Create a product features infographic image:

Product: {product_name}
Features to highlight:
{features}

Design requirements:
- Modern, clean layout
- {background_style} background
- Visual icons representing each feature
- Professional product photography style
- Soft shadows and reflections
- High-end e-commerce aesthetic
- NO text on the image
- Format suitable for {marketplace}"""
    },
    "comparison": {
        "name": "Taqqoslash",
        "name_ru": "Сравнение",
        "description": "Raqobatchilar bilan taqqoslash",
        "prompt_template": """Create a product comparison infographic showing advantages:

Product: {product_name}
Brand: {brand}
Advantages: {features}

Design:
- Split or comparison layout style
- {background_style} background
- Highlight product superiority
- Professional, trustworthy appearance
- Clean lines and modern aesthetic
- NO text elements
- Suitable for {marketplace} listings"""
    },
    "lifestyle": {
        "name": "Hayot tarzi",
        "name_ru": "Стиль жизни",
        "description": "Mahsulotni ishlatish ko'rinishi",
        "prompt_template": """Create a lifestyle product image showing the product in use:

Product: {product_name}
Usage context: {features}

Requirements:
- Natural, lifestyle photography style
- Product being used in realistic setting
- Warm, inviting atmosphere
- Professional quality lighting
- Aspirational but relatable scene
- {background_style} environment
- NO text overlays
- Perfect for {marketplace} product card"""
    },
    "bundle": {
        "name": "To'plam",
        "name_ru": "Комплект",
        "description": "Mahsulot to'plami ko'rinishi",
        "prompt_template": """Create a product bundle/kit image:

Main product: {product_name}
Included items: {features}

Style:
- Organized flat-lay or artistic arrangement
- {background_style} background
- All items clearly visible
- Professional product photography
- Elegant shadows and depth
- Premium e-commerce aesthetic
- NO text on image
- Optimized for {marketplace}"""
    }
}

# Fon stillari
BACKGROUND_STYLES = {
    "white": "pure white, clean",
    "gradient": "soft gradient from white to light gray",
    "studio": "professional studio lighting with subtle shadows",
    "minimal": "minimal, neutral colored",
    "luxury": "premium, dark with accent lighting"
}


class InfographicGenerator:
    """Generate product infographics using Nano Banana AI"""
    
    @staticmethod
    async def generate_infographic(
        product_name: str,
        brand: str = "",
        features: List[str] = None,
        template: str = "product_showcase",
        marketplace: str = "uzum",  # uzum or yandex
        background: str = "white",
        custom_prompt: str = None
    ) -> Dict[str, Any]:
        """
        Generate product infographic image
        
        Args:
            product_name: Mahsulot nomi
            brand: Brend nomi
            features: Xususiyatlar ro'yxati
            template: Shablon turi
            marketplace: Marketplace (uzum/yandex)
            background: Fon stili
            custom_prompt: Maxsus prompt (ixtiyoriy)
        
        Returns:
            Dict with success, image_base64, and metadata
        """
        EMERGENT_KEY = os.getenv("EMERGENT_LLM_KEY", "")
        
        if not EMERGENT_KEY:
            return {
                "success": False,
                "error": "EMERGENT_LLM_KEY not configured"
            }
        
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            # Shablon olish
            template_data = INFOGRAPHIC_TEMPLATES.get(template, INFOGRAPHIC_TEMPLATES["product_showcase"])
            background_style = BACKGROUND_STYLES.get(background, BACKGROUND_STYLES["white"])
            
            # Features ro'yxatini string qilish
            features_text = "\n".join([f"- {f}" for f in (features or ["High quality", "Premium design"])])
            
            # Marketplace talablari
            marketplace_info = "Uzum Market (1080x1440px)" if marketplace == "uzum" else "Yandex Market (1000x1000px, white background required)"
            
            # Prompt yaratish
            if custom_prompt:
                final_prompt = custom_prompt
            else:
                final_prompt = template_data["prompt_template"].format(
                    product_name=product_name,
                    brand=brand or "Premium Brand",
                    features=features_text,
                    background_style=background_style,
                    marketplace=marketplace_info
                )
            
            # Nano Banana bilan rasm yaratish
            chat = LlmChat(
                api_key=EMERGENT_KEY,
                session_id=f"infographic-{product_name[:10]}-{datetime.now().strftime('%H%M%S')}",
                system_message="You are a professional product photographer and graphic designer specializing in e-commerce infographics."
            ).with_model("gemini", "gemini-3-pro-image-preview").with_params(modalities=["image", "text"])
            
            msg = UserMessage(text=final_prompt)
            
            text_response, images = await chat.send_message_multimodal_response(msg)
            
            if images and len(images) > 0:
                # Birinchi rasmni olish
                image_data = images[0]
                image_base64 = image_data.get("data", "")
                mime_type = image_data.get("mime_type", "image/png")
                
                return {
                    "success": True,
                    "image_base64": image_base64,
                    "mime_type": mime_type,
                    "metadata": {
                        "product_name": product_name,
                        "brand": brand,
                        "template": template,
                        "template_name": template_data["name"],
                        "marketplace": marketplace,
                        "background": background,
                        "prompt_used": final_prompt[:200] + "...",
                        "ai_response": text_response[:500] if text_response else "",
                        "generated_at": datetime.now().isoformat()
                    }
                }
            else:
                return {
                    "success": False,
                    "error": "No image generated",
                    "ai_response": text_response
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    async def edit_product_image(
        original_image_base64: str,
        edit_instructions: str,
        marketplace: str = "uzum"
    ) -> Dict[str, Any]:
        """
        Edit existing product image with AI
        
        Args:
            original_image_base64: Original image in base64
            edit_instructions: What to change
            marketplace: Target marketplace
        """
        EMERGENT_KEY = os.getenv("EMERGENT_LLM_KEY", "")
        
        if not EMERGENT_KEY:
            return {
                "success": False,
                "error": "EMERGENT_LLM_KEY not configured"
            }
        
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
            
            marketplace_req = "Uzum Market format (1080x1440px)" if marketplace == "uzum" else "Yandex Market format (1000x1000px, white background)"
            
            prompt = f"""Edit this product image according to these instructions:
{edit_instructions}

Requirements:
- Maintain product visibility and quality
- Professional e-commerce appearance
- Suitable for {marketplace_req}
- High quality output"""
            
            chat = LlmChat(
                api_key=EMERGENT_KEY,
                session_id=f"edit-{datetime.now().strftime('%H%M%S')}",
                system_message="You are a professional image editor specializing in e-commerce product photos."
            ).with_model("gemini", "gemini-3-pro-image-preview").with_params(modalities=["image", "text"])
            
            msg = UserMessage(
                text=prompt,
                file_contents=[ImageContent(original_image_base64)]
            )
            
            text_response, images = await chat.send_message_multimodal_response(msg)
            
            if images and len(images) > 0:
                image_data = images[0]
                return {
                    "success": True,
                    "image_base64": image_data.get("data", ""),
                    "mime_type": image_data.get("mime_type", "image/png"),
                    "edit_instructions": edit_instructions,
                    "ai_response": text_response[:300] if text_response else ""
                }
            else:
                return {
                    "success": False,
                    "error": "No edited image generated",
                    "ai_response": text_response
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def get_templates() -> List[Dict[str, Any]]:
        """Get available infographic templates"""
        return [
            {
                "id": key,
                "name": data["name"],
                "name_ru": data["name_ru"],
                "description": data["description"]
            }
            for key, data in INFOGRAPHIC_TEMPLATES.items()
        ]
    
    @staticmethod
    def get_background_styles() -> Dict[str, str]:
        """Get available background styles"""
        return BACKGROUND_STYLES
