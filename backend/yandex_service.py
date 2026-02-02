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
        """Test API connection and get account info with shop names"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{YANDEX_API_BASE}/v2/campaigns",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    campaigns = data.get("campaigns", [])
                    
                    # Extract business_id and shop names from campaigns
                    shop_info = []
                    business_id = self.business_id
                    
                    for campaign in campaigns:
                        campaign_id = campaign.get("id")
                        domain = campaign.get("domain", "")
                        shop_name = campaign.get("name") or domain or f"Do'kon #{campaign_id}"
                        
                        # Get business_id from first campaign if not provided
                        if not business_id:
                            business_id = str(campaign.get("business", {}).get("id", ""))
                        
                        shop_info.append({
                            "id": campaign_id,
                            "name": shop_name,
                            "domain": domain,
                            "status": campaign.get("status", "unknown"),
                            "business_id": str(campaign.get("business", {}).get("id", ""))
                        })
                    
                    return {
                        "success": True,
                        "message": "Muvaffaqiyatli ulandi!",
                        "campaigns": campaigns,
                        "shop_info": shop_info,  # NEW: Shop names and details
                        "shop_count": len(campaigns),
                        "business_id": business_id or self.business_id,
                        "can_create_products": True,
                        "primary_shop": shop_info[0] if shop_info else None  # First shop as primary
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
    
    async def check_connection(self) -> bool:
        """Quick health check - returns True if connected"""
        try:
            result = await self.test_connection()
            return result.get("success", False)
        except:
            return False
    
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
            # Validate required fields
            if not pictures or len(pictures) == 0:
                return {
                    "success": False,
                    "error": "Kamida 1 ta rasm kerak (pictures)",
                    "help": "AI Manager infografika generatsiya qilishi yoki siz rasm yuklashingiz kerak"
                }
            
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
            
            # REQUIRED: Weight and dimensions - Yandex requires all 4 values
            offer_data["weightDimensions"] = {
                "weight": weight_kg if weight_kg else 0.5,  # Default 500g
                "length": dimensions.get("length", 20) if dimensions else 20,  # Default 20cm
                "width": dimensions.get("width", 15) if dimensions else 15,    # Default 15cm
                "height": dimensions.get("height", 10) if dimensions else 10   # Default 10cm
            }
            
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
            
            # Add price if provided (must be integer for Yandex)
            if price:
                offer_data["basicPrice"] = {
                    "value": int(price),  # Yandex requires integer price
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
    
    async def get_offer_status(self, offer_id: str) -> dict:
        """
        Get real-time status of a specific offer/product
        
        Statuses:
        - READY_TO_SUPPLY: Tayyor sotuvga
        - IN_WORK: Moderatsiyada
        - NEED_CONTENT: Kontent kerak
        - NEED_INFO: Ma'lumot kerak
        - REJECTED: Rad etilgan
        - SUSPENDED: To'xtatilgan
        - OTHER: Boshqa
        """
        if not self.business_id:
            return {"success": False, "error": "business_id required"}
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Get offer details
                response = await client.post(
                    f"{YANDEX_API_BASE}/v2/businesses/{self.business_id}/offer-mappings",
                    headers=self.headers,
                    json={
                        "offerIds": [offer_id]
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    offers = data.get("result", {}).get("offerMappings", [])
                    
                    if offers:
                        offer = offers[0].get("offer", {})
                        mapping = offers[0].get("mapping", {})
                        
                        # Determine status
                        status = "UNKNOWN"
                        status_uz = "Noma'lum"
                        
                        if mapping.get("marketSku"):
                            status = "READY_TO_SUPPLY"
                            status_uz = "✅ Sotuvga tayyor"
                        elif offer.get("processingState", {}).get("status") == "IN_WORK":
                            status = "IN_WORK"
                            status_uz = "⏳ Moderatsiyada"
                        elif offer.get("processingState", {}).get("status") == "NEED_CONTENT":
                            status = "NEED_CONTENT"
                            status_uz = "📝 Kontent kerak"
                        elif offer.get("processingState", {}).get("status") == "REJECTED":
                            status = "REJECTED"
                            status_uz = "❌ Rad etildi"
                        else:
                            status = offer.get("processingState", {}).get("status", "PENDING")
                            status_uz = "🔄 Kutilmoqda"
                        
                        return {
                            "success": True,
                            "offer_id": offer_id,
                            "status": status,
                            "status_uz": status_uz,
                            "name": offer.get("name", ""),
                            "price": offer.get("basicPrice", {}).get("value"),
                            "market_sku": mapping.get("marketSku"),
                            "category_id": mapping.get("marketCategoryId"),
                            "pictures_count": len(offer.get("pictures", [])),
                            "last_updated": datetime.now().isoformat(),
                            "errors": offer.get("processingState", {}).get("notes", [])
                        }
                    else:
                        return {
                            "success": False,
                            "error": "Mahsulot topilmadi",
                            "offer_id": offer_id
                        }
                else:
                    return {
                        "success": False,
                        "error": f"API xatosi: {response.status_code}",
                        "details": response.text[:500]
                    }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_all_offers_status(self, limit: int = 50) -> dict:
        """Get status of all offers for real-time dashboard"""
        if not self.business_id:
            return {"success": False, "error": "business_id required"}
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{YANDEX_API_BASE}/v2/businesses/{self.business_id}/offer-mappings",
                    headers=self.headers,
                    json={
                        "limit": limit
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    offers = data.get("result", {}).get("offerMappings", [])
                    
                    # Categorize by status
                    stats = {
                        "total": len(offers),
                        "ready": 0,
                        "in_moderation": 0,
                        "need_content": 0,
                        "rejected": 0,
                        "other": 0
                    }
                    
                    offer_list = []
                    for item in offers:
                        offer = item.get("offer", {})
                        mapping = item.get("mapping", {})
                        
                        status = "OTHER"
                        if mapping.get("marketSku"):
                            status = "READY"
                            stats["ready"] += 1
                        elif offer.get("processingState", {}).get("status") == "IN_WORK":
                            status = "IN_MODERATION"
                            stats["in_moderation"] += 1
                        elif offer.get("processingState", {}).get("status") == "NEED_CONTENT":
                            status = "NEED_CONTENT"
                            stats["need_content"] += 1
                        elif offer.get("processingState", {}).get("status") == "REJECTED":
                            status = "REJECTED"
                            stats["rejected"] += 1
                        else:
                            stats["other"] += 1
                        
                        offer_list.append({
                            "offer_id": offer.get("offerId"),
                            "name": offer.get("name", "")[:50],
                            "status": status,
                            "price": offer.get("basicPrice", {}).get("value"),
                            "market_sku": mapping.get("marketSku")
                        })
                    
                    return {
                        "success": True,
                        "stats": stats,
                        "offers": offer_list,
                        "last_updated": datetime.now().isoformat()
                    }
                else:
                    return {
                        "success": False,
                        "error": response.text
                    }
        except Exception as e:
            return {"success": False, "error": str(e)}


    async def get_orders(self, page: int = 1, status: str = None) -> dict:
        """Get orders from Yandex Market"""
        if not self.campaign_id:
            return {"success": False, "error": "campaign_id required"}
        
        try:
            params = {
                "page": page,
                "pageSize": 50
            }
            if status:
                params["status"] = status
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{YANDEX_API_BASE}/v2/campaigns/{self.campaign_id}/orders",
                    headers=self.headers,
                    params=params
                )
                
                if response.status_code == 200:
                    data = response.json()
                    orders = data.get("orders", [])
                    
                    # Transform orders
                    order_list = []
                    for order in orders:
                        order_list.append({
                            "id": order.get("id"),
                            "status": order.get("status"),
                            "substatus": order.get("substatus"),
                            "created_at": order.get("creationDate"),
                            "total": order.get("total"),
                            "items_count": len(order.get("items", [])),
                            "buyer_region": order.get("delivery", {}).get("region", {}).get("name"),
                            "delivery_type": order.get("delivery", {}).get("type")
                        })
                    
                    return {
                        "success": True,
                        "orders": order_list,
                        "paging": data.get("pager", {})
                    }
                else:
                    return {
                        "success": False,
                        "error": response.text,
                        "status_code": response.status_code
                    }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_sales_statistics(self, date_from: str = None, date_to: str = None) -> dict:
        """Get sales statistics from Yandex Market"""
        if not self.campaign_id:
            return {"success": False, "error": "campaign_id required"}
        
        try:
            # Use today if not specified
            from datetime import datetime, timedelta
            if not date_to:
                date_to = datetime.now().strftime("%Y-%m-%d")
            if not date_from:
                date_from = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{YANDEX_API_BASE}/v2/campaigns/{self.campaign_id}/stats/main",
                    headers=self.headers,
                    params={
                        "fromDate": date_from,
                        "toDate": date_to
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    main_stats = data.get("mainStats", [])
                    
                    # Aggregate stats
                    total_orders = 0
                    total_revenue = 0
                    total_items = 0
                    
                    for stat in main_stats:
                        total_orders += stat.get("ordersCount", 0)
                        total_revenue += stat.get("revenue", 0)
                        total_items += stat.get("itemsCount", 0)
                    
                    return {
                        "success": True,
                        "data": {
                            "total_orders": total_orders,
                            "total_revenue": total_revenue,
                            "total_items": total_items,
                            "period": f"{date_from} - {date_to}",
                            "daily_stats": main_stats
                        }
                    }
                else:
                    return {
                        "success": False,
                        "error": response.text
                    }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_offer_quality(self, offer_id: str) -> dict:
        """Get product quality score and errors from Yandex Market"""
        if not self.business_id:
            return {"success": False, "error": "business_id required"}
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Get offer mapping to check quality
                response = await client.get(
                    f"{YANDEX_API_BASE}/v2/businesses/{self.business_id}/offer-mappings",
                    headers=self.headers,
                    params={"offerId": offer_id}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    mappings = data.get("result", {}).get("offerMappingEntries", [])
                    
                    if mappings:
                        mapping = mappings[0]
                        offer = mapping.get("offer", {})
                        processing = offer.get("processingState", {})
                        
                        # Calculate quality score (0-100)
                        quality_score = 100
                        errors = []
                        warnings = []
                        
                        # Check required fields
                        if not offer.get("name"):
                            quality_score -= 20
                            errors.append("Mahsulot nomi yo'q")
                        if not offer.get("description"):
                            quality_score -= 15
                            errors.append("Tavsif yo'q")
                        if not offer.get("pictures") or len(offer.get("pictures", [])) < 3:
                            quality_score -= 10
                            errors.append(f"Rasmlar yetarli emas (kerak: 3+, bor: {len(offer.get('pictures', []))})")
                        if not offer.get("weightDimensions"):
                            quality_score -= 10
                            errors.append("Og'irlik va o'lchamlar yo'q")
                        if not offer.get("basicPrice"):
                            quality_score -= 15
                            errors.append("Narx yo'q")
                        if not offer.get("commodityCodes"):
                            quality_score -= 10
                            warnings.append("MXIK/IKPU kodi yo'q")
                        
                        # Check processing status
                        status = processing.get("status", "")
                        if status == "NEED_CONTENT":
                            quality_score -= 30
                            errors.append("Kontent yetarli emas")
                        elif status == "REJECTED":
                            quality_score = 0
                            errors.append("Mahsulot rad etilgan")
                        
                        quality_score = max(0, quality_score)
                        
                        return {
                            "success": True,
                            "quality_score": quality_score,
                            "errors": errors,
                            "warnings": warnings,
                            "status": status,
                            "offer_id": offer_id
                        }
                    else:
                        return {
                            "success": False,
                            "error": "Offer topilmadi"
                        }
                else:
                    return {
                        "success": False,
                        "error": response.text,
                        "status_code": response.status_code
                    }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def fix_product_quality(
        self,
        offer_id: str,
        errors: List[str],
        product_name: str,
        brand: str = "",
        category: str = ""
    ) -> dict:
        """Auto-fix product quality issues"""
        if not self.business_id:
            return {"success": False, "error": "business_id required"}
        
        try:
            # Get current offer
            async with httpx.AsyncClient(timeout=30.0) as client:
                get_response = await client.get(
                    f"{YANDEX_API_BASE}/v2/businesses/{self.business_id}/offer-mappings",
                    headers=self.headers,
                    params={"offerId": offer_id}
                )
                
                if get_response.status_code != 200:
                    return {"success": False, "error": "Offer topilmadi"}
                
                data = get_response.json()
                mappings = data.get("result", {}).get("offerMappingEntries", [])
                if not mappings:
                    return {"success": False, "error": "Offer topilmadi"}
                
                current_offer = mappings[0].get("offer", {})
                
                # Fix missing fields based on errors
                fixed_offer = current_offer.copy()
                
                # Fix name if missing
                if "nom" in str(errors).lower() or "name" in str(errors).lower():
                    fixed_offer["name"] = product_name[:120]
                
                # Fix description if missing
                if "tavsif" in str(errors).lower() or "description" in str(errors).lower():
                    brand_text = brand if brand else "Noma'lum"
                    category_text = category if category else "Umumiy"
                    fixed_offer["description"] = f"{product_name} - yuqori sifatli mahsulot. Brend: {brand_text}. Kategoriya: {category_text}."
                
                # Fix pictures if missing
                if "rasm" in str(errors).lower() or "picture" in str(errors).lower():
                    # Keep existing pictures, add placeholder if none
                    if not fixed_offer.get("pictures"):
                        fixed_offer["pictures"] = []  # Will be filled by infographics
                
                # Update offer
                payload = {
                    "offerMappings": [{
                        "offer": fixed_offer
                    }]
                }
                
                update_response = await client.post(
                    f"{YANDEX_API_BASE}/v2/businesses/{self.business_id}/offer-mappings/update",
                    headers=self.headers,
                    json=payload
                )
                
                if update_response.status_code == 200:
                    # Re-check quality
                    quality_check = await self.get_offer_quality(offer_id)
                    return {
                        "success": True,
                        "quality_score": quality_check.get("quality_score", 0),
                        "fixed_errors": errors,
                        "message": "Mahsulot tuzatildi va qayta saqlandi"
                    }
                else:
                    return {
                        "success": False,
                        "error": update_response.text
                    }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_dashboard_data(self) -> dict:
        """Get full dashboard data - products, orders, statistics"""
        result = {
            "success": True,
            "products": {"total": 0, "active": 0, "pending": 0},
            "orders": {"total": 0, "pending": 0, "completed": 0},
            "revenue": {"total": 0, "this_month": 0},
            "connection_status": "unknown"
        }
        
        try:
            # Check connection
            connection_ok = await self.check_connection()
            result["connection_status"] = "active" if connection_ok else "error"
            
            if not connection_ok:
                return result
            
            # Get products
            products_data = await self.get_all_offers_status()
            if products_data.get("success"):
                stats = products_data.get("stats", {})
                result["products"] = {
                    "total": stats.get("total", 0),
                    "active": stats.get("ready", 0),
                    "pending": stats.get("in_moderation", 0),
                    "need_content": stats.get("need_content", 0),
                    "rejected": stats.get("rejected", 0)
                }
            
            # Get orders
            orders_data = await self.get_orders()
            if orders_data.get("success"):
                orders = orders_data.get("orders", [])
                result["orders"] = {
                    "total": len(orders),
                    "pending": len([o for o in orders if o.get("status") in ["PROCESSING", "PENDING"]]),
                    "completed": len([o for o in orders if o.get("status") == "DELIVERED"])
                }
            
            # Get statistics
            stats_data = await self.get_sales_statistics()
            if stats_data.get("success"):
                data = stats_data.get("data", {})
                result["revenue"] = {
                    "total": data.get("total_revenue", 0),
                    "this_month": data.get("total_revenue", 0)
                }
            
            return result
            
        except Exception as e:
            result["error"] = str(e)
            return result


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
