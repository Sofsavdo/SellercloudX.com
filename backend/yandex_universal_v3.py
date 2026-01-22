"""
YANDEX MARKET - UNIVERSAL MUKAMMAL KARTOCHKA v3
===============================================

Universal kategoriyalar uchun ishlaydi:
- Parfyumeriya
- Elektronika
- Kiyim-kechak
- Uy-ro'zg'or
- Kosmetika
- va boshqalar

SKU: Mahsulot nomi + Model asosida
Tillar: Ruscha (asosiy) + O'zbekcha (qo'shimcha)
"""

import os
import uuid
import json
import re
import asyncio
from typing import Optional, List, Dict, Any
from datetime import datetime
import httpx

# Constants
YANDEX_API_BASE = "https://api.partner.market.yandex.ru"
IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload"

# Universal kategoriya xaritasi (Yandex Market ID lari)
CATEGORY_MAP = {
    # Parfyumeriya
    "perfume": {"id": 15927546, "name": "Парфюмерия", "ikpu": "20420100001000000"},
    "parfyum": {"id": 15927546, "name": "Парфюмерия", "ikpu": "20420100001000000"},
    "atir": {"id": 15927546, "name": "Парфюмерия", "ikpu": "20420100001000000"},
    
    # Elektronika
    "electronics": {"id": 91491, "name": "Электроника", "ikpu": "26400000001000000"},
    "phone": {"id": 91461, "name": "Смартфоны", "ikpu": "26200000001000000"},
    "laptop": {"id": 91013, "name": "Ноутбуки", "ikpu": "26200000001000000"},
    "headphones": {"id": 90555, "name": "Наушники", "ikpu": "26400000001000000"},
    
    # Maishiy texnika
    "appliances": {"id": 90586, "name": "Бытовая техника", "ikpu": "27500000001000000"},
    "hairdryer": {"id": 90590, "name": "Фены", "ikpu": "27500000001000000"},
    "iron": {"id": 90589, "name": "Утюги", "ikpu": "27500000001000000"},
    
    # Kosmetika
    "cosmetics": {"id": 91153, "name": "Косметика", "ikpu": "20420000001000000"},
    "skincare": {"id": 91156, "name": "Уход за кожей", "ikpu": "20420000001000000"},
    "makeup": {"id": 91154, "name": "Макияж", "ikpu": "20420000001000000"},
    
    # Kiyim
    "clothing": {"id": 7811873, "name": "Одежда", "ikpu": "14100000001000000"},
    "shoes": {"id": 7811903, "name": "Обувь", "ikpu": "15200000001000000"},
    
    # Uy-ro'zg'or
    "home": {"id": 90719, "name": "Товары для дома", "ikpu": "27900000001000000"},
    "furniture": {"id": 90732, "name": "Мебель", "ikpu": "31000000001000000"},
    
    # Oziq-ovqat
    "food": {"id": 91307, "name": "Продукты питания", "ikpu": "10000000001000000"},
    
    # Default
    "general": {"id": 90401, "name": "Товары", "ikpu": "00000000001000000"},
}

# Ishlab chiqaruvchi mamlakatlar
COUNTRY_MAP = {
    "france": "Франция",
    "usa": "США",
    "china": "Китай",
    "korea": "Корея",
    "japan": "Япония",
    "italy": "Италия",
    "germany": "Германия",
    "uk": "Великобритания",
    "uzbekistan": "Узбекистан",
    "turkey": "Турция",
}


def transliterate_to_latin(text: str) -> str:
    """Kirill yoki boshqa harflarni lotinga o'zgartirish"""
    cyrillic_map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
        'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
        'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
        'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
        'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
    }
    result = []
    for char in text:
        result.append(cyrillic_map.get(char, char))
    return ''.join(result)


def generate_smart_sku(product_name: str, brand: str, model: str = "") -> str:
    """
    SKU yaratish - mahsulot nomi va modelidan
    
    Format: BRND-MODEL-XXXXX
    Masalan: DIOR-SAUVAGE-A1B2C
    """
    # Brand kodini olish (3-4 harf)
    brand_clean = re.sub(r'[^a-zA-Z0-9]', '', transliterate_to_latin(brand))
    brand_code = brand_clean[:4].upper() if brand_clean else "PROD"
    
    # Model yoki mahsulot nomidan kod olish
    if model:
        model_clean = re.sub(r'[^a-zA-Z0-9]', '', transliterate_to_latin(model))
        model_code = model_clean[:8].upper()
    else:
        # Mahsulot nomidan 2 so'zni olish
        name_clean = transliterate_to_latin(product_name)
        words = re.findall(r'[a-zA-Z0-9]+', name_clean)
        model_code = ''.join([w[:4].upper() for w in words[:2]])
    
    if not model_code:
        model_code = "ITEM"
    
    # Unikal qism (5 belgi)
    unique = uuid.uuid4().hex[:5].upper()
    
    return f"{brand_code}-{model_code}-{unique}"


class YandexUniversalCreatorV3:
    """
    Yandex Market uchun universal mahsulot yaratuvchi
    
    Barcha kategoriyalar uchun ishlaydi
    """
    
    def __init__(self, api_key: str, business_id: str, imgbb_key: str = None):
        self.api_key = api_key
        self.business_id = business_id
        self.imgbb_key = imgbb_key or os.getenv("IMGBB_API_KEY", "")
        self.emergent_key = os.getenv("EMERGENT_LLM_KEY", "")
        
        self.headers = {
            "Api-Key": api_key,
            "Content-Type": "application/json"
        }
    
    def _get_category_info(self, category: str) -> Dict[str, Any]:
        """Kategoriya ma'lumotlarini olish"""
        category_lower = category.lower().strip()
        
        # To'g'ridan-to'g'ri moslik
        if category_lower in CATEGORY_MAP:
            return CATEGORY_MAP[category_lower]
        
        # Qisman moslik
        for key, value in CATEGORY_MAP.items():
            if key in category_lower or category_lower in key:
                return value
        
        # Default
        return CATEGORY_MAP["general"]
    
    async def scan_product(self, image_base64: str) -> Dict[str, Any]:
        """AI Scanner - rasmdan mahsulotni aniqlash (universal)"""
        if not self.emergent_key:
            raise ValueError("EMERGENT_LLM_KEY topilmadi")
        
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
            
            chat = LlmChat(
                api_key=self.emergent_key,
                session_id=f"scan-{uuid.uuid4().hex[:8]}",
                system_message="You are an expert product identifier. Analyze images and provide detailed product information in JSON."
            ).with_model("gemini", "gemini-2.5-flash")
            
            prompt = """Analyze this product image and identify ALL details:

1. **Product name** (full, with brand and model if visible)
2. **Brand** name
3. **Model** name or number (if visible)
4. **Category**: perfume, electronics, clothing, cosmetics, appliances, home, food, etc.
5. **Subcategory**: more specific category
6. **Key features** (6-8 important points)
7. **Materials** (if applicable)
8. **Color** (if visible)
9. **Size/Dimensions** (if visible or can be estimated)
10. **Country of origin** (if can be determined from brand)
11. **Estimated price range** in UZS

For PERFUME: include volume_ml, concentration (EDP/EDT), gender, fragrance family
For ELECTRONICS: include specifications, model number
For CLOTHING: include size type, material, season
For COSMETICS: include skin type, ingredients highlights

Respond ONLY with valid JSON:
{
    "product_name": "Brand Model Name",
    "brand": "Brand",
    "model": "Model123",
    "category": "electronics",
    "subcategory": "smartphones",
    "features": ["Feature 1", "Feature 2", ...],
    "materials": ["material1", "material2"],
    "color": "black",
    "dimensions": {"length": 15, "width": 7, "height": 1, "weight_kg": 0.2},
    "country": "china",
    "price_min": 500000,
    "price_max": 1500000,
    "confidence": 95,
    "additional_info": {}
}"""
            
            msg = UserMessage(
                text=prompt,
                file_contents=[ImageContent(image_base64)]
            )
            
            response = await chat.send_message(msg)
            
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                return json.loads(json_match.group())
            
            raise ValueError("JSON topilmadi")
            
        except Exception as e:
            raise ValueError(f"AI Scanner xatosi: {str(e)}")
    
    async def generate_bilingual_card(
        self,
        scan_result: Dict[str, Any],
        price: float
    ) -> Dict[str, Any]:
        """
        Ikki tilda kartochka yaratish (Ruscha + O'zbekcha)
        Universal kategoriyalar uchun
        """
        if not self.emergent_key:
            raise ValueError("EMERGENT_LLM_KEY topilmadi")
        
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            chat = LlmChat(
                api_key=self.emergent_key,
                session_id=f"card-{uuid.uuid4().hex[:8]}",
                system_message="""You are an expert e-commerce copywriter. 
Create professional product descriptions in BOTH Russian and Uzbek languages.
All descriptions must be SEO-optimized for marketplace search.
For Uzbek, use Latin script (O'zbek tili)."""
            ).with_model("gemini", "gemini-2.5-flash")
            
            product_name = scan_result.get("product_name", "")
            brand = scan_result.get("brand", "")
            model = scan_result.get("model", "")
            category = scan_result.get("category", "general")
            features = scan_result.get("features", [])
            materials = scan_result.get("materials", [])
            color = scan_result.get("color", "")
            
            prompt = f"""Create a complete product card for Yandex Market in BOTH Russian and Uzbek:

Product: {product_name}
Brand: {brand}
Model: {model}
Category: {category}
Features: {features}
Materials: {materials}
Color: {color}
Price: {price:,.0f} UZS

Generate JSON with:
1. **Russian name** (60-80 chars, SEO optimized, include brand and key feature)
2. **Russian description** (500-800 chars, with bullet points, detailed)
3. **Uzbek name** (same format, O'zbek tilida, Latin harflarida)
4. **Uzbek description** (same length, O'zbek tilida, Latin harflarida)
5. **Tags** (10 Russian keywords for SEO)
6. **Key specs** (5-7 key specifications in Russian)

JSON format:
{{
    "name_ru": "Бренд Модель - Основная характеристика для категории",
    "description_ru": "Подробное описание на русском языке с маркированным списком особенностей...",
    "name_uz": "Brend Model - Asosiy xususiyat kategoriya uchun",
    "description_uz": "O'zbek tilida batafsil tavsif, xususiyatlar ro'yxati bilan...",
    "tags": ["тег1", "тег2", "тег3", "тег4", "тег5", "тег6", "тег7", "тег8", "тег9", "тег10"],
    "key_specs": {{
        "Производитель": "Бренд",
        "Модель": "Модель",
        "Материал": "материал",
        "Цвет": "цвет",
        "Страна": "страна"
    }}
}}"""
            
            msg = UserMessage(text=prompt)
            response = await chat.send_message(msg)
            
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                return json.loads(json_match.group())
            
            raise ValueError("JSON topilmadi")
            
        except Exception as e:
            raise ValueError(f"AI Card xatosi: {str(e)}")
    
    async def generate_infographics(
        self,
        scan_result: Dict[str, Any],
        count: int = 6
    ) -> List[str]:
        """
        Nano Banana bilan infografikalar yaratish va ImgBB'ga yuklash
        Bir xil mahsulot, turli burchaklar
        """
        if not self.emergent_key:
            return []
        
        generated_urls = []
        
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            product_name = scan_result.get("product_name", "Product")
            brand = scan_result.get("brand", "Brand")
            category = scan_result.get("category", "product")
            color = scan_result.get("color", "")
            
            # Turli burchaklar uchun prompt'lar
            angles = [
                ("front view, centered", "Old tomondan ko'rinish"),
                ("45 degree angle view", "45 daraja burchakdan"),
                ("side profile view", "Yon tomondan ko'rinish"),
                ("detail close-up shot", "Yaqindan detail"),
                ("lifestyle context shot", "Foydalanish kontekstida"),
                ("packaging with product", "Qadoq bilan birga"),
            ]
            
            base_prompt = f"Professional product photography of {brand} {product_name}"
            if color:
                base_prompt += f" in {color} color"
            
            for i, (angle, desc) in enumerate(angles[:count]):
                try:
                    chat = LlmChat(
                        api_key=self.emergent_key,
                        session_id=f"img-{uuid.uuid4().hex[:8]}",
                        system_message="Generate high quality e-commerce product images."
                    ).with_model("gemini", "gemini-3-pro-image-preview").with_params(modalities=["image", "text"])
                    
                    full_prompt = f"{base_prompt}, {angle}, pure white background, studio lighting, high detail, 1000x1000px, e-commerce style, professional commercial photography"
                    
                    msg = UserMessage(text=full_prompt)
                    text_resp, images = await chat.send_message_multimodal_response(msg)
                    
                    if images and len(images) > 0:
                        img_base64 = images[0].get("data", "")
                        
                        if img_base64 and self.imgbb_key:
                            url = await self._upload_to_imgbb(img_base64, f"{brand}-{i+1}-{angle[:10]}")
                            if url:
                                generated_urls.append(url)
                                print(f"   ✅ Rasm {i+1} ({desc}) yuklandi")
                                
                except Exception as e:
                    print(f"   ⚠️ Rasm {i+1} xatosi: {str(e)[:50]}")
                    continue
            
            return generated_urls
            
        except Exception as e:
            print(f"Infografika xatosi: {str(e)}")
            return generated_urls
    
    async def _upload_to_imgbb(self, image_base64: str, name: str) -> Optional[str]:
        """ImgBB'ga rasm yuklash"""
        if not self.imgbb_key:
            return None
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    IMGBB_UPLOAD_URL,
                    data={
                        "key": self.imgbb_key,
                        "image": image_base64,
                        "name": f"{name}-{uuid.uuid4().hex[:6]}"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("data", {}).get("url")
        except:
            pass
        
        return None
    
    async def create_universal_product(
        self,
        scan_result: Dict[str, Any],
        card_data: Dict[str, Any],
        image_urls: List[str],
        cost_price: float,
        selling_price: float
    ) -> Dict[str, Any]:
        """
        Universal mukammal mahsulot yaratish
        Barcha kategoriyalar uchun ishlaydi
        """
        
        # Kategoriya ma'lumotlari
        category = scan_result.get("category", "general")
        cat_info = self._get_category_info(category)
        
        # Smart SKU
        brand = scan_result.get("brand", "")
        model = scan_result.get("model", "")
        product_name = scan_result.get("product_name", "Product")
        sku = generate_smart_sku(product_name, brand, model)
        
        # Rasmlar (minimum 6 ta)
        pictures = image_urls[:6] if image_urls else []
        if len(pictures) < 1:
            # Agar hech qanday rasm bo'lmasa, xato qaytarish
            return {
                "success": False,
                "error": "Kamida 1 ta rasm kerak"
            }
        
        # O'lchamlar
        dimensions = scan_result.get("dimensions", {})
        weight = dimensions.get("weight_kg", 1.0)
        length = dimensions.get("length", 20.0)
        width = dimensions.get("width", 15.0)
        height = dimensions.get("height", 10.0)
        
        # Ishlab chiqaruvchi mamlakat
        country_key = scan_result.get("country", "china").lower()
        country = COUNTRY_MAP.get(country_key, "Китай")
        
        # IKPU kod
        ikpu_code = cat_info.get("ikpu", "00000000001000000")
        
        # Asosiy ma'lumotlar
        name_ru = card_data.get("name_ru", product_name)[:256]
        name_uz = card_data.get("name_uz", product_name)[:256]
        description_ru = card_data.get("description_ru", "")[:6000]
        description_uz = card_data.get("description_uz", "")[:6000]
        tags = card_data.get("tags", [])[:10]
        
        # Vendor code
        vendor_code = f"{brand[:4].upper() if brand else 'PROD'}-{model if model else uuid.uuid4().hex[:6].upper()}"
        
        # Mahsulot ma'lumotlari
        product_data = {
            "offerMappings": [
                {
                    "offer": {
                        # Asosiy identifikatorlar
                        "offerId": sku,
                        "name": name_ru,
                        
                        # Kategoriya
                        "marketCategoryId": cat_info["id"],
                        
                        # Rasmlar
                        "pictures": pictures,
                        
                        # Brend va model
                        "vendor": brand or "No Brand",
                        "vendorCode": vendor_code,
                        
                        # Tavsif (Ruscha)
                        "description": description_ru,
                        
                        # O'zbekcha ma'lumotlar - qo'shimcha maydon sifatida
                        # Yandex API localizations qismini qo'llab-quvvatlaydi
                        "localizations": [
                            {
                                "languageTag": "uz",
                                "name": name_uz,
                                "description": description_uz
                            }
                        ],
                        
                        # Ishlab chiqaruvchi mamlakat
                        "manufacturerCountries": [country],
                        
                        # O'lchamlar va vazn
                        "weightDimensions": {
                            "weight": weight,
                            "length": length,
                            "width": width,
                            "height": height
                        },
                        
                        # IKPU kod (O'zbekiston uchun)
                        "commodityCodes": [
                            {"code": ikpu_code, "type": "IKPU_CODE"}
                        ],
                        
                        # Tags (SEO uchun)
                        "tags": tags,
                        
                        # Narx
                        "basicPrice": {
                            "value": selling_price,
                            "currencyId": "UZS"
                        },
                        
                        # Yaroqlilik muddati (kategoriyaga qarab)
                        "shelfLife": {
                            "timePeriod": 36,
                            "timeUnit": "MONTH"
                        }
                    }
                }
            ]
        }
        
        # API ga yuborish
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{YANDEX_API_BASE}/v2/businesses/{self.business_id}/offer-mappings/update",
                    headers=self.headers,
                    json=product_data
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    # Xatolarni tekshirish
                    api_errors = []
                    api_warnings = []
                    if "results" in result:
                        for r in result.get("results", []):
                            if r.get("errors"):
                                api_errors.extend(r.get("errors", []))
                            if r.get("warnings"):
                                api_warnings.extend(r.get("warnings", []))
                    
                    return {
                        "success": True,
                        "offer_id": sku,
                        "product_name_ru": name_ru,
                        "product_name_uz": name_uz,
                        "brand": brand,
                        "model": model,
                        "category": cat_info["name"],
                        "category_id": cat_info["id"],
                        "cost_price": cost_price,
                        "selling_price": selling_price,
                        "profit_margin": ((selling_price - cost_price) / cost_price * 100) if cost_price > 0 else 0,
                        "images_count": len(pictures),
                        "ikpu_code": ikpu_code,
                        "weight_kg": weight,
                        "country": country,
                        "api_errors": api_errors if api_errors else None,
                        "api_warnings": api_warnings if api_warnings else None
                    }
                else:
                    error_text = response.text[:500]
                    
                    # localizations qo'llab-quvvatlanmasa, qayta urinish
                    if "localizations" in error_text.lower() or response.status_code == 400:
                        print("⚠️ localizations qo'llab-quvvatlanmaydi, oddiy versiya...")
                        return await self._create_product_simple(
                            scan_result, card_data, image_urls, 
                            cost_price, selling_price, sku, cat_info
                        )
                    
                    return {
                        "success": False,
                        "error": f"API xatosi: {response.status_code}",
                        "details": error_text
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _create_product_simple(
        self,
        scan_result: Dict[str, Any],
        card_data: Dict[str, Any],
        image_urls: List[str],
        cost_price: float,
        selling_price: float,
        sku: str,
        cat_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Oddiy versiya - localizations holda
        O'zbekcha ma'lumotlar description ichiga qo'shiladi
        """
        
        brand = scan_result.get("brand", "")
        model = scan_result.get("model", "")
        product_name = scan_result.get("product_name", "Product")
        
        # O'lchamlar
        dimensions = scan_result.get("dimensions", {})
        weight = dimensions.get("weight_kg", 1.0)
        length = dimensions.get("length", 20.0)
        width = dimensions.get("width", 15.0)
        height = dimensions.get("height", 10.0)
        
        # Mamlakat
        country_key = scan_result.get("country", "china").lower()
        country = COUNTRY_MAP.get(country_key, "Китай")
        
        # Ma'lumotlar
        name_ru = card_data.get("name_ru", product_name)[:256]
        name_uz = card_data.get("name_uz", product_name)[:256]
        description_ru = card_data.get("description_ru", "")
        description_uz = card_data.get("description_uz", "")
        
        # O'zbekcha tavsifni ruscha tavsifga qo'shish
        combined_description = f"""{description_ru}

---
🇺🇿 O'ZBEKCHA / УЗБЕКЧА:

{name_uz}

{description_uz}
"""[:6000]
        
        tags = card_data.get("tags", [])[:10]
        
        # Vendor code
        vendor_code = f"{brand[:4].upper() if brand else 'PROD'}-{model if model else uuid.uuid4().hex[:6].upper()}"
        
        product_data = {
            "offerMappings": [
                {
                    "offer": {
                        "offerId": sku,
                        "name": name_ru,
                        "marketCategoryId": cat_info["id"],
                        "pictures": image_urls[:6] if image_urls else [],
                        "vendor": brand or "No Brand",
                        "vendorCode": vendor_code,
                        "description": combined_description,
                        "manufacturerCountries": [country],
                        "weightDimensions": {
                            "weight": weight,
                            "length": length,
                            "width": width,
                            "height": height
                        },
                        "commodityCodes": [
                            {"code": cat_info.get("ikpu", "00000000001000000"), "type": "IKPU_CODE"}
                        ],
                        "tags": tags,
                        "basicPrice": {
                            "value": selling_price,
                            "currencyId": "UZS"
                        },
                        "shelfLife": {
                            "timePeriod": 36,
                            "timeUnit": "MONTH"
                        }
                    }
                }
            ]
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{YANDEX_API_BASE}/v2/businesses/{self.business_id}/offer-mappings/update",
                    headers=self.headers,
                    json=product_data
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    api_errors = []
                    api_warnings = []
                    if "results" in result:
                        for r in result.get("results", []):
                            if r.get("errors"):
                                api_errors.extend(r.get("errors", []))
                            if r.get("warnings"):
                                api_warnings.extend(r.get("warnings", []))
                    
                    return {
                        "success": True,
                        "offer_id": sku,
                        "product_name_ru": name_ru,
                        "product_name_uz": name_uz,
                        "brand": brand,
                        "model": model,
                        "category": cat_info["name"],
                        "cost_price": cost_price,
                        "selling_price": selling_price,
                        "profit_margin": ((selling_price - cost_price) / cost_price * 100) if cost_price > 0 else 0,
                        "images_count": len(image_urls[:6]),
                        "ikpu_code": cat_info.get("ikpu"),
                        "weight_kg": weight,
                        "api_errors": api_errors if api_errors else None,
                        "api_warnings": api_warnings if api_warnings else None,
                        "note": "O'zbekcha tavsif description ichiga qo'shildi"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"API xatosi: {response.status_code}",
                        "details": response.text[:500]
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def full_auto_create(
        self,
        image_base64: str,
        cost_price: float
    ) -> Dict[str, Any]:
        """
        TO'LIQ AVTOMATIK YARATISH (Universal)
        
        1. AI Scanner - mahsulotni aniqlash (kategoriya, brend, model)
        2. AI Card - ikki tilda kartochka (RU + UZ)
        3. Nano Banana - 6 ta infografika (bir xil mahsulot, turli burchaklar)
        4. Yandex API - mahsulot yaratish
        """
        
        result = {
            "steps_completed": [],
            "steps_failed": [],
            "images_generated": []
        }
        
        try:
            # 1. AI SCANNER
            print("1️⃣ AI Scanner (universal)...")
            scan_result = await self.scan_product(image_base64)
            result["scan_result"] = scan_result
            result["steps_completed"].append("ai_scanner")
            
            # Suggested price (2.5x markup yoki AI tavsiyasi)
            price_max = scan_result.get("price_max") or 0
            selling_price = price_max if price_max and price_max > cost_price else cost_price * 2.5
            
            # 2. AI CARD (ikki tilda)
            print("2️⃣ AI Card (RU + UZ)...")
            card_data = await self.generate_bilingual_card(scan_result, selling_price)
            result["card_data"] = card_data
            result["steps_completed"].append("ai_card_bilingual")
            
            # 3. INFOGRAFIKALAR
            print("3️⃣ Nano Banana infografikalar (bir xil mahsulot)...")
            image_urls = await self.generate_infographics(scan_result, 6)
            result["images_generated"] = image_urls
            if image_urls:
                result["steps_completed"].append(f"infographics_generated_{len(image_urls)}")
            
            # 4. YANDEX YARATISH
            print("4️⃣ Yandex Market'ga yuklash...")
            create_result = await self.create_universal_product(
                scan_result=scan_result,
                card_data=card_data,
                image_urls=image_urls,
                cost_price=cost_price,
                selling_price=selling_price
            )
            
            if create_result.get("success"):
                result["steps_completed"].append("yandex_created")
                
                return {
                    "success": True,
                    "message": "✅ Mahsulot muvaffaqiyatli yaratildi!",
                    "data": {
                        "offer_id": create_result.get("offer_id"),
                        "product_name": create_result.get("product_name_ru"),
                        "product_name_uz": create_result.get("product_name_uz"),
                        "brand": create_result.get("brand"),
                        "model": create_result.get("model"),
                        "category": create_result.get("category"),
                        "cost_price": cost_price,
                        "selling_price": selling_price,
                        "profit_margin": create_result.get("profit_margin"),
                        "images_count": create_result.get("images_count"),
                        "ikpu_code": create_result.get("ikpu_code"),
                        "weight_kg": create_result.get("weight_kg"),
                        "country": create_result.get("country"),
                        "steps_completed": result["steps_completed"],
                        "scan_confidence": scan_result.get("confidence", 0),
                        "api_warnings": create_result.get("api_warnings")
                    }
                }
            else:
                result["steps_failed"].append({
                    "step": "yandex_create",
                    "error": create_result.get("error"),
                    "details": create_result.get("details")
                })
                
                return {
                    "success": False,
                    "error": create_result.get("error"),
                    "details": create_result.get("details"),
                    "partial_data": result
                }
                
        except Exception as e:
            import traceback
            return {
                "success": False,
                "error": str(e),
                "partial_data": result,
                "traceback": traceback.format_exc()
            }
