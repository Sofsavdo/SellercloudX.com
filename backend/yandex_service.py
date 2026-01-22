"""
Yandex Market Partner API Service
Full API integration for product management

MUHIM: Yandex Market API to'liq kartochka yaratishni qo'llab-quvvatlaydi!
Bu Uzum Marketdan farq qiladi (Uzum faqat "assisted automation").

API Endpoint: POST /v2/businesses/{businessId}/offer-mappings/update
Auth: OAuth token
"""
import os
import json
import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Yandex Market API endpoints
YANDEX_API_BASE = "https://api.partner.market.yandex.ru"
YANDEX_OAUTH_URL = "https://oauth.yandex.ru"


class YandexMarketAPI:
    """
    Yandex Market Partner API client
    
    YANDEX MARKET API ORQALI KARTOCHKA YARATISH MUMKIN!
    
    Authentication:
    - Api-Key header required (NOT OAuth prefix!)
    - Get token from: https://oauth.yandex.ru/authorize?response_type=token&client_id=b24f02c0bbff4a89beae77a889ed7490
    
    Key differences from Uzum:
    - Full API support for product creation
    - Can create/update products programmatically
    - Supports IKPU codes (17-digit, type: IKPU_CODE)
    """
    
    def __init__(self, oauth_token: str, campaign_id: str = None, business_id: str = None):
        """
        Initialize Yandex Market API client
        
        Args:
            oauth_token: API Key/OAuth access token
            campaign_id: Campaign/Shop ID (for FBS/DBS operations)
            business_id: Business ID (REQUIRED for product creation)
        """
        self.oauth_token = oauth_token
        self.campaign_id = campaign_id
        self.business_id = business_id
        # IMPORTANT: Yandex uses Api-Key header, NOT Authorization: OAuth
        self.headers = {
            "Api-Key": oauth_token,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    async def test_connection(self) -> dict:
        """Test API connection and get account info"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{YANDEX_API_BASE}/v2/campaigns",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    campaigns = data.get("campaigns", [])
                    
                    # Extract business_id from first campaign if not provided
                    if campaigns and not self.business_id:
                        first_campaign = campaigns[0]
                        self.business_id = str(first_campaign.get("business", {}).get("id", ""))
                    
                    return {
                        "success": True,
                        "message": "Muvaffaqiyatli ulandi!",
                        "campaigns": campaigns,
                        "campaign_count": len(campaigns),
                        "business_id": self.business_id,
                        "can_create_products": True  # Yandex API supports this!
                    }
                elif response.status_code == 401:
                    return {
                        "success": False,
                        "error": "OAuth token noto'g'ri yoki muddati o'tgan",
                        "status_code": 401,
                        "help": "Token olish: https://oauth.yandex.ru/authorize?response_type=token&client_id=b24f02c0bbff4a89beae77a889ed7490"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"API xatosi: {response.status_code}",
                        "details": response.text
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_campaigns(self) -> dict:
        """Get list of seller's campaigns (shops)"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{YANDEX_API_BASE}/v2/campaigns",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "campaigns": data.get("campaigns", [])
                    }
                else:
                    return {
                        "success": False,
                        "error": response.text,
                        "status_code": response.status_code
                    }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def create_product(
        self,
        offer_id: str,
        name: str,
        description: str,
        vendor: str,
        pictures: List[str],
        category_id: int = None,
        price: float = None,
        currency: str = "UZS",
        ikpu_code: str = None,
        weight_kg: float = None,
        dimensions: dict = None,
        barcode: str = None,
        manufacturer_country: str = "Узбекистан"
    ) -> dict:
        """
        Create product on Yandex Market via API
        
        This is the KEY difference from Uzum - FULL API SUPPORT!
        
        Args:
            offer_id: Your SKU (unique, max 255 chars)
            name: Product name (50-60 chars optimal, format: Type + Brand + Model + Feature)
            description: Full description (max 6000 chars)
            vendor: Brand name
            pictures: List of image URLs
            category_id: Yandex Market category ID
            price: Price value
            currency: Currency (RUR, UZS, etc.)
            ikpu_code: 17-digit IKPU code for Uzbekistan
            weight_kg: Product weight in kg
            dimensions: {length, width, height} in cm
            barcode: EAN/UPC barcode
            manufacturer_country: Country of manufacture
        """
        if not self.business_id:
            return {
                "success": False,
                "error": "business_id required for product creation. Call test_connection() first."
            }
        
        try:
            # Build offer data
            offer_data = {
                "offerId": offer_id,
                "name": name[:256] if name else "",
                "description": description[:6000] if description else "",
                "vendor": vendor,
                "pictures": pictures[:20] if pictures else [],
                "manufacturerCountries": [manufacturer_country]
            }
            
            # Add category if provided
            if category_id:
                offer_data["marketCategoryId"] = category_id
            
            # Add dimensions if provided
            if weight_kg or dimensions:
                offer_data["weightDimensions"] = {}
                if weight_kg:
                    offer_data["weightDimensions"]["weight"] = weight_kg
                if dimensions:
                    if "length" in dimensions:
                        offer_data["weightDimensions"]["length"] = dimensions["length"]
                    if "width" in dimensions:
                        offer_data["weightDimensions"]["width"] = dimensions["width"]
                    if "height" in dimensions:
                        offer_data["weightDimensions"]["height"] = dimensions["height"]
            
            # Add barcode if provided
            if barcode:
                offer_data["barcodes"] = [barcode]
            
            # Add IKPU code for Uzbekistan (17-digit)
            if ikpu_code:
                offer_data["commodityCodes"] = [
                    {
                        "code": ikpu_code,
                        "type": "IKPU_CODE"  # Special type for Uzbekistan
                    }
                ]
            
            # Add price if provided
            if price:
                offer_data["basicPrice"] = {
                    "value": price,
                    "currencyId": currency
                }
            
            # Build request payload
            payload = {
                "offerMappings": [
                    {
                        "offer": offer_data
                    }
                ]
            }
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{YANDEX_API_BASE}/v2/businesses/{self.business_id}/offer-mappings/update",
                    headers=self.headers,
                    json=payload
                )
                
                response_data = response.json()
                
                if response.status_code == 200:
                    status = response_data.get("status", "")
                    results = response_data.get("results", [])
                    
                    # Check for errors in results
                    errors = []
                    warnings = []
                    for result in results:
                        if result.get("errors"):
                            errors.extend(result["errors"])
                        if result.get("warnings"):
                            warnings.extend(result["warnings"])
                    
                    if status == "ERROR" or errors:
                        return {
                            "success": False,
                            "error": "Mahsulot yaratishda xatolik",
                            "errors": errors,
                            "warnings": warnings,
                            "response": response_data
                        }
                    
                    return {
                        "success": True,
                        "message": "Mahsulot Yandex Market'ga muvaffaqiyatli qo'shildi!",
                        "offer_id": offer_id,
                        "warnings": warnings,
                        "response": response_data
                    }
                else:
                    return {
                        "success": False,
                        "error": f"API xatosi: {response.status_code}",
                        "details": response_data,
                        "status_code": response.status_code
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_offers(self, page: int = 1, page_size: int = 50) -> dict:
        """Get list of offers (products)"""
        if not self.campaign_id:
            return {"success": False, "error": "campaign_id required"}
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{YANDEX_API_BASE}/v2/campaigns/{self.campaign_id}/offer-mapping-entries",
                    headers=self.headers,
                    params={
                        "page": page,
                        "pageSize": page_size
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "offers": data.get("result", {}).get("offerMappingEntries", []),
                        "paging": data.get("result", {}).get("paging", {})
                    }
                else:
                    return {
                        "success": False,
                        "error": response.text,
                        "status_code": response.status_code
                    }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def update_price(self, offer_id: str, price: float, currency: str = "UZS") -> dict:
        """Update price for a specific offer"""
        if not self.business_id:
            return {"success": False, "error": "business_id required"}
        
        try:
            payload = {
                "offerMappings": [
                    {
                        "offer": {
                            "offerId": offer_id,
                            "basicPrice": {
                                "value": price,
                                "currencyId": currency
                            }
                        }
                    }
                ]
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{YANDEX_API_BASE}/v2/businesses/{self.business_id}/offer-mappings/update",
                    headers=self.headers,
                    json=payload
                )
                
                if response.status_code == 200:
                    return {
                        "success": True,
                        "message": f"Narx yangilandi: {offer_id} = {price} {currency}"
                    }
                else:
                    return {
                        "success": False,
                        "error": response.text,
                        "status_code": response.status_code
                    }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_categories(self) -> dict:
        """Get Yandex Market categories tree"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{YANDEX_API_BASE}/v2/categories/tree",
                    headers=self.headers,
                    json={}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "categories": data.get("result", {}).get("children", [])
                    }
                else:
                    return {
                        "success": False,
                        "error": response.text
                    }
        except Exception as e:
            return {"success": False, "error": str(e)}


class YandexCardGenerator:
    """Generate Yandex Market compliant product cards using AI"""
    
    @staticmethod
    async def generate_card(
        product_name: str,
        category: str,
        brand: str = "",
        description: str = "",
        price: float = 0,
        detected_info: dict = None
    ) -> dict:
        """Generate Yandex Market product card using AI"""
        EMERGENT_KEY = os.getenv("EMERGENT_LLM_KEY", "")
        
        if not EMERGENT_KEY:
            return {
                "success": False,
                "error": "EMERGENT_LLM_KEY not configured"
            }
        
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            chat = LlmChat(
                api_key=EMERGENT_KEY,
                session_id=f"yandex-card-{product_name[:15]}",
                system_message="""Siz Yandex Market uchun professional SEO-mutaxassisisiz.

MUHIM QOIDALAR:
1. Faqat RUSCHA yozing (Yandex Market faqat rus tilida)
2. Sarlavha: max 120 belgi, "Brend + Tovar turi + Model + Xususiyat"
3. Tavsif: 200-500 so'z, aniq va professional
4. Taqiqlangan so'zlar: "хит", "лучший", "топ", "оригинал", "скидка", "распродажа"
5. Emoji va kontakt ma'lumotlari taqiqlangan
6. Faqat JSON formatda javob bering"""
            ).with_model("openai", "gpt-4o")
            
            detected_text = ""
            if detected_info:
                d_name = detected_info.get('name', '')
                d_brand = detected_info.get('brand', '')
                d_specs = ', '.join(detected_info.get('specifications', []))
                detected_text = f"""
AI SCANNER NATIJASI:
- Aniqlangan: {d_name}
- Brend: {d_brand}
- Xususiyatlar: {d_specs}
"""
            
            prompt = f"""MAHSULOT: {product_name}
BREND: {brand or "ko'rsatilmagan"}
KATEGORIYA: {category}
QISQACHA: {description or "yo'q"}
{detected_text}

YANDEX MARKET UCHUN PROFESSIONAL KARTOCHKA YARAT (RUSCHA):

{{
    "name": "Полное название товара на русском (max 120 символов, формат: Бренд + Тип + Модель)",
    "description": "Полное описание на русском (200-500 слов). Профессионально опиши характеристики, преимущества, способ использования.",
    "vendor": "{brand or 'Бренд'}",
    "vendorCode": "MODEL-001",
    "category": "{category}",
    "keywords": ["ключевое1", "ключевое2", "... 8-10 ключевых слов"],
    "bullet_points": [
        "Основная характеристика 1",
        "Основная характеристика 2",
        "... 5-7 пунктов"
    ],
    "specifications": {{
        "Материал": "значение",
        "Размер": "значение",
        "Вес": "значение",
        "Цвет": "значение",
        "Страна производства": "Узбекистан"
    }},
    "seo_score": 85
}}"""
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            # Parse JSON
            import re
            json_match = re.search(r'\{[\s\S]*\}', response)
            if not json_match:
                return {
                    "success": False,
                    "error": "AI javobini parse qilib bo'lmadi"
                }
            
            card = json.loads(json_match.group())
            
            # Stop words check
            from yandex_rules import check_yandex_stop_words
            title_check = check_yandex_stop_words(card.get("name", ""))
            
            validation_errors = []
            if title_check["has_stop_words"]:
                validation_errors.append(f"Taqiqlangan so'zlar: {', '.join(title_check['found_words'])}")
            
            if len(card.get("name", "")) > 120:
                card["name"] = card["name"][:117] + "..."
            
            return {
                "success": True,
                "card": card,
                "validation": {
                    "is_valid": len(validation_errors) == 0,
                    "errors": validation_errors
                },
                "seo_score": card.get("seo_score", 80),
                "api_ready": True  # This card can be sent directly to Yandex API!
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# ========================================
# SOLISHTIRMA: UZUM vs YANDEX
# ========================================
"""
UZUM MARKET:
- API orqali kartochka yaratish: ❌ MUMKIN EMAS
- Faqat "assisted automation" (Playwright + copy-paste)
- seller.uzum.uz portalida qo'lda yaratish kerak

YANDEX MARKET:
- API orqali kartochka yaratish: ✅ TO'LIQ QUVVATLANADI
- Endpoint: POST /v2/businesses/{businessId}/offer-mappings/update
- IKPU kodlari quvvatlanadi (type: IKPU_CODE)
- Narx, zaxira, rasmlar - hammasi API orqali

XULOSA:
Yandex Market uchun to'liq avtomatizatsiya mumkin!
Uzum Market uchun faqat "assisted" yondashuv ishlaydi.
"""
