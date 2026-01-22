"""
Advanced AI Product Card Generator for Uzum Market
Generates SEO-optimized, Uzum-compliant product cards
"""
import os
import json
import re
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

EMERGENT_KEY = os.getenv("EMERGENT_LLM_KEY", "")


class UzumCardGenerator:
    """Uzum Market uchun professional kartochka generatori"""
    
    @classmethod
    async def generate_full_card(
        cls,
        product_name: str,
        category: str,
        cost_price: float,
        quantity: int,
        brand: str = "",
        description: str = "",
        detected_info: dict = None,  # AI Scanner natijasi
        competitor_analysis: dict = None
    ) -> dict:
        """
        To'liq mahsulot kartochkasi yaratish
        
        Returns:
            - title_uz: O'zbekcha sarlavha
            - title_ru: Ruscha sarlavha
            - description_uz: O'zbekcha tavsif
            - description_ru: Ruscha tavsif
            - keywords: SEO kalit so'zlar
            - bullet_points: Asosiy xususiyatlar
            - seo_score: SEO bali
            - validation: Uzum qoidalariga mosligi
        """
        from uzum_rules import check_stop_words, remove_stop_words, CARD_REQUIREMENTS
        from price_optimizer import PriceOptimizer, SalesBooster
        
        if not EMERGENT_KEY:
            return {
                "success": False,
                "error": "EMERGENT_LLM_KEY not configured"
            }
        
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            # Raqobatchilar ma'lumoti
            comp_info = ""
            if competitor_analysis:
                analysis = competitor_analysis.get("analysis", {})
                market = analysis.get("market_analysis", {})
                demand = analysis.get('demand_level', 'nomalum')
                avg_price = market.get('avg_price', 0)
                min_price = market.get('min_price', 0)
                comp_info = f"""
RAQOBATCHILAR TAHLILI:
- O'rtacha narx: {avg_price:,.0f} so'm
- Minimal narx: {min_price:,.0f} so'm
- Talab darajasi: {demand}
"""
            
            # AI Scanner ma'lumoti
            detected_text = ""
            if detected_info:
                d_name = detected_info.get('name', '')
                d_cat = detected_info.get('category', '')
                d_brand = detected_info.get('brand', '')
                d_specs = ', '.join(detected_info.get('specifications', []))
                detected_text = f"""
AI SCANNER NATIJASI:
- Aniqlangan nom: {d_name}
- Kategoriya: {d_cat}
- Brend: {d_brand}
- Xususiyatlar: {d_specs}
"""
            
            chat = LlmChat(
                api_key=EMERGENT_KEY,
                session_id=f"card-gen-{product_name[:15]}",
                system_message="""Siz Uzum Market uchun professional SEO-mutaxassisisiz.
                
MUHIM QOIDALAR:
1. TAQIQLANGAN SO'ZLAR ishlatilMAsin: "original", "super", "hit", "top", "chegirma", "aksiya", "yangilik", "eng yaxshi", "arzon", "sifatli" kabi marketing so'zlari
2. Sarlavha: max 80 belgi, "Tovar turi + Brend + Model + Xususiyat" formatida
3. Tavsif: 300-500 so'z, faqat mahsulot haqida faktlar
4. Kalit so'zlar: 8-12 ta, mahsulotga tegishli
5. Emoji va maxsus belgilar ishlatilMAsin
6. Faqat JSON formatda javob bering"""
            ).with_model("openai", "gpt-4o")
            
            prompt = f"""MAHSULOT: {product_name}
BREND: {brand or "ko'rsatilmagan"}
KATEGORIYA: {category}
QISQACHA: {description or "yo'q"}
{detected_text}
{comp_info}

UZUM MARKET UCHUN PROFESSIONAL KARTOCHKA YARAT:

{{
    "title_uz": "O'zbekcha sarlavha (max 80 belgi, LOTIN alifbosida)",
    "title_ru": "Ruscha sarlavha (max 80 belgi, KIRILL alifbosida)",
    "description_uz": "To'liq o'zbekcha tavsif (300-500 so'z, LOTIN). Mahsulot xususiyatlari, afzalliklari, ishlatish usuli haqida professional yoz.",
    "description_ru": "Полное описание на русском (300-500 слов, КИРИЛЛИЦА). Профессионально опиши характеристики, преимущества, способ использования.",
    "short_description_uz": "Qisqa tavsif (max 150 belgi)",
    "short_description_ru": "Краткое описание (max 150 символов)",
    "keywords": ["kalit1", "kalit2", "... 10-12 ta SEO kalit so'z"],
    "bullet_points_uz": [
        "Asosiy xususiyat 1",
        "Asosiy xususiyat 2",
        "... 5-7 ta"
    ],
    "bullet_points_ru": [
        "Основная характеристика 1",
        "... 5-7 штук"
    ],
    "specifications": {{
        "Material": "qiymat",
        "O'lcham": "qiymat",
        "Og'irlik": "qiymat",
        "Rang": "qiymat",
        "Ishlab chiqaruvchi": "qiymat"
    }},
    "seo_score": 85,
    "target_audience": "Kimlar uchun mo'ljallangan"
}}"""
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            # Parse JSON
            json_match = re.search(r'\{[\s\S]*\}', response)
            if not json_match:
                return {
                    "success": False,
                    "error": "AI javobini parse qilib bo'lmadi"
                }
            
            card = json.loads(json_match.group())
            
            # Stop so'zlarni tekshirish va tozalash
            title_check = check_stop_words(card.get("title_uz", "") + " " + card.get("title_ru", ""))
            desc_check = check_stop_words(card.get("description_uz", "") + " " + card.get("description_ru", ""))
            
            if title_check["has_stop_words"]:
                card["title_uz"] = remove_stop_words(card["title_uz"])
                card["title_ru"] = remove_stop_words(card["title_ru"])
            
            if desc_check["has_stop_words"]:
                card["description_uz"] = remove_stop_words(card["description_uz"])
                card["description_ru"] = remove_stop_words(card["description_ru"])
            
            # Sarlavha uzunligini tekshirish
            if len(card.get("title_uz", "")) > 80:
                card["title_uz"] = card["title_uz"][:77] + "..."
            if len(card.get("title_ru", "")) > 80:
                card["title_ru"] = card["title_ru"][:77] + "..."
            
            # Validation
            validation_errors = []
            validation_warnings = []
            
            if len(card.get("description_uz", "")) < 300:
                validation_warnings.append("O'zbekcha tavsif 300 so'zdan kam")
            if len(card.get("keywords", [])) < 8:
                validation_warnings.append("Kalit so'zlar 8 tadan kam")
            
            # Final check
            final_title_check = check_stop_words(card.get("title_uz", "") + " " + card.get("title_ru", ""))
            if final_title_check["has_stop_words"]:
                validation_errors.append(f"Taqiqlangan so'zlar topildi: {', '.join(final_title_check['found_words'])}")
            
            # Maslahatlar
            tips = await SalesBooster.get_ai_tips(product_name, category, cost_price)
            
            return {
                "success": True,
                "card": card,
                "validation": {
                    "is_valid": len(validation_errors) == 0,
                    "errors": validation_errors,
                    "warnings": validation_warnings,
                    "stop_words_removed": title_check["has_stop_words"] or desc_check["has_stop_words"]
                },
                "tips": tips,
                "seo_score": card.get("seo_score", 80)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @classmethod
    async def generate_image_prompts(
        cls,
        product_name: str,
        category: str,
        brand: str = ""
    ) -> dict:
        """Infografik rasmlar uchun promptlar generatsiya qilish"""
        
        if not EMERGENT_KEY:
            return {
                "success": False,
                "error": "EMERGENT_LLM_KEY not configured"
            }
        
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            chat = LlmChat(
                api_key=EMERGENT_KEY,
                session_id=f"img-prompt-{product_name[:15]}",
                system_message="Siz e-commerce mahsulot fotografiyasi mutaxassisisiz."
            ).with_model("openai", "gpt-4o")
            
            prompt = f""""{product_name}" ({brand}) mahsuloti uchun Uzum Marketda
professional infografik rasmlar yaratish uchun 5 ta DALL-E/Midjourney prompt yoz.

Talablar:
- Oq fon
- 3:4 aspect ratio (1080x1440px)
- Professional studio lighting
- E-commerce style

JSON formatda javob ber:
{{
    "main_image": "Asosiy rasm uchun prompt",
    "detail_images": [
        "Detallar uchun prompt 1",
        "Detallar uchun prompt 2"
    ],
    "lifestyle_image": "Hayotiy rasm uchun prompt",
    "infographic_image": "Infografik rasm uchun prompt (xususiyatlar bilan)"
}}"""
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                prompts = json.loads(json_match.group())
                return {
                    "success": True,
                    "prompts": prompts
                }
            
            return {
                "success": False,
                "error": "Promptlarni parse qilib bo'lmadi"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
