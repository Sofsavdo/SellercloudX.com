"""
Trend Hunter Service - Real 1688 & AliExpress API Integration
Uses RapidAPI for accessing Chinese wholesale data
"""
import os
import httpx
from typing import List, Dict, Optional
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)

# RapidAPI configuration
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY", "")
RAPIDAPI_1688_HOST = os.getenv("RAPIDAPI_1688_HOST", "1688-product-data.p.rapidapi.com")
RAPIDAPI_ALIEXPRESS_HOST = os.getenv("RAPIDAPI_ALIEXPRESS_HOST", "aliexpress-datahub.p.rapidapi.com")

# USD to UZS exchange rate
USD_TO_UZS = 12800


def is_api_configured() -> bool:
    """Check if RapidAPI is configured"""
    return bool(RAPIDAPI_KEY)


async def search_1688_products(query: str, limit: int = 10) -> List[Dict]:
    """
    Search products on 1688.com via RapidAPI
    Returns real product data with direct links
    """
    if not RAPIDAPI_KEY:
        logger.warning("RapidAPI key not configured, using mock data")
        return []
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = f"https://{RAPIDAPI_1688_HOST}/search"
            
            headers = {
                "X-RapidAPI-Key": RAPIDAPI_KEY,
                "X-RapidAPI-Host": RAPIDAPI_1688_HOST
            }
            
            params = {
                "keyword": query,
                "page": 1,
                "pageSize": limit
            }
            
            response = await client.get(url, headers=headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                products = []
                
                for item in data.get("items", [])[:limit]:
                    product = {
                        "id": item.get("id", ""),
                        "name": item.get("title", "Unknown Product"),
                        "price": float(item.get("price", 0)),
                        "price_usd": float(item.get("price", 0)) / 7.2,  # CNY to USD
                        "image_url": item.get("imageUrl", ""),
                        "product_url": item.get("productUrl", f"https://1688.com/offer/{item.get('id', '')}.html"),
                        "source": "1688",
                        "sales_volume": item.get("salesVolume", 0),
                        "rating": item.get("rating", 4.5),
                        "min_order": item.get("minOrder", 1),
                        "supplier": item.get("supplierName", "Unknown")
                    }
                    products.append(product)
                
                return products
            else:
                logger.error(f"1688 API error: {response.status_code}")
                return []
                
    except Exception as e:
        logger.error(f"1688 API exception: {e}")
        return []


async def search_aliexpress_products(query: str, limit: int = 10) -> List[Dict]:
    """
    Search products on AliExpress via RapidAPI
    Returns real product data with direct links
    """
    if not RAPIDAPI_KEY:
        logger.warning("RapidAPI key not configured, using mock data")
        return []
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = f"https://{RAPIDAPI_ALIEXPRESS_HOST}/item_search"
            
            headers = {
                "X-RapidAPI-Key": RAPIDAPI_KEY,
                "X-RapidAPI-Host": RAPIDAPI_ALIEXPRESS_HOST
            }
            
            params = {
                "q": query,
                "page": 1,
                "sort": "default"
            }
            
            response = await client.get(url, headers=headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                products = []
                
                for item in data.get("result", {}).get("resultList", [])[:limit]:
                    product = {
                        "id": item.get("item", {}).get("itemId", ""),
                        "name": item.get("item", {}).get("title", "Unknown Product"),
                        "price": float(item.get("item", {}).get("sku", {}).get("def", {}).get("price", 0)),
                        "price_usd": float(item.get("item", {}).get("sku", {}).get("def", {}).get("price", 0)),
                        "image_url": item.get("item", {}).get("image", ""),
                        "product_url": f"https://aliexpress.com/item/{item.get('item', {}).get('itemId', '')}.html",
                        "source": "aliexpress",
                        "sales_volume": int(item.get("item", {}).get("sales", "0").replace("+", "")),
                        "rating": float(item.get("item", {}).get("starRating", 4.5)),
                        "min_order": 1,
                        "supplier": "AliExpress Seller"
                    }
                    products.append(product)
                
                return products
            else:
                logger.error(f"AliExpress API error: {response.status_code}")
                return []
                
    except Exception as e:
        logger.error(f"AliExpress API exception: {e}")
        return []


async def get_product_details_1688(product_id: str) -> Optional[Dict]:
    """
    Get detailed product information from 1688
    """
    if not RAPIDAPI_KEY:
        return None
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = f"https://{RAPIDAPI_1688_HOST}/product"
            
            headers = {
                "X-RapidAPI-Key": RAPIDAPI_KEY,
                "X-RapidAPI-Host": RAPIDAPI_1688_HOST
            }
            
            params = {"id": product_id}
            
            response = await client.get(url, headers=headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "id": data.get("id", product_id),
                    "name": data.get("title", ""),
                    "description": data.get("description", ""),
                    "price": float(data.get("price", 0)),
                    "price_usd": float(data.get("price", 0)) / 7.2,
                    "images": data.get("images", []),
                    "product_url": f"https://1688.com/offer/{product_id}.html",
                    "specifications": data.get("specifications", {}),
                    "supplier": data.get("supplier", {})
                }
            return None
            
    except Exception as e:
        logger.error(f"1688 product details error: {e}")
        return None


def calculate_opportunity_score(product: Dict, local_competitors: int = 30) -> Dict:
    """
    Calculate profit opportunity for a product
    """
    source_price_usd = product.get("price_usd", 0)
    
    # Cost calculations
    import_cost = source_price_usd * USD_TO_UZS
    shipping_cost = 15000  # Average shipping per item
    customs_tax = import_cost * 0.15  # 15% customs
    marketplace_fee = import_cost * 0.15  # 15% marketplace commission
    
    total_cost = import_cost + shipping_cost + customs_tax + marketplace_fee
    
    # Local market pricing (2-3x markup)
    local_avg_price = total_cost * 2.2
    recommended_price = total_cost * 2.5
    
    # Profit calculations
    profit_per_unit = recommended_price - total_cost
    profit_margin = (profit_per_unit / recommended_price) * 100 if recommended_price > 0 else 0
    
    # Monthly estimates
    monthly_sales = 30
    monthly_profit = profit_per_unit * monthly_sales
    roi = (monthly_profit / total_cost) * 100 if total_cost > 0 else 0
    break_even = max(1, int(total_cost / profit_per_unit)) if profit_per_unit > 0 else 999
    
    # Opportunity score
    sales_volume = product.get("sales_volume", 0)
    rating = product.get("rating", 4.5)
    growth_factor = min(100, sales_volume / 100) if sales_volume > 0 else 50
    
    score = min(100, (
        growth_factor * 0.3 +
        profit_margin * 0.3 +
        (rating * 20) * 0.2 +
        (100 - min(100, local_competitors)) * 0.2
    ))
    
    # Strengths and risks
    strengths = []
    risks = []
    
    if sales_volume > 1000:
        strengths.append(f"🚀 Yuqori sotuv: {sales_volume}+ dona")
    if profit_margin > 50:
        strengths.append(f"💰 Yuqori foyda: {profit_margin:.0f}%")
    if rating >= 4.6:
        strengths.append(f"⭐ Yuqori reyting: {rating}/5")
    if local_competitors < 30:
        strengths.append(f"🎯 Kam raqobat: {local_competitors} sotuvchi")
    
    if local_competitors > 60:
        risks.append(f"⚠️ Yuqori raqobat: {local_competitors} sotuvchi")
    if source_price_usd > 50:
        risks.append("💵 Yuqori boshlang'ich investitsiya")
    if sales_volume < 100:
        risks.append("📉 Past sotuvlar")
    
    # Recommendation
    if score >= 80:
        recommendation = "🟢 JUDA YAXSHI imkoniyat! Darhol boshlash tavsiya etiladi."
    elif score >= 65:
        recommendation = "🟡 YAXSHI imkoniyat. Bozorni o'rganib, boshlash mumkin."
    elif score >= 50:
        recommendation = "🟠 O'RTACHA imkoniyat. Ehtiyotkorlik bilan yondashish kerak."
    else:
        recommendation = "🔴 PAST imkoniyat. Boshqa mahsulotlarni ko'rib chiqing."
    
    return {
        "product": {
            "productName": product.get("name", ""),
            "category": product.get("category", "general"),
            "imageUrl": product.get("image_url", ""),
            "sourceMarket": product.get("source", "china"),
            "sourcePrice": round(source_price_usd, 2),
            "sourceCurrency": "USD",
            "salesVolume": sales_volume,
            "salesGrowth": growth_factor,
            "avgRating": rating,
            "productUrl": product.get("product_url", "")  # Direct link to 1688/AliExpress
        },
        "totalCost": round(total_cost),
        "localCompetitors": local_competitors,
        "localAvgPrice": round(local_avg_price),
        "recommendedPrice": round(recommended_price),
        "profitMargin": round(profit_margin, 1),
        "monthlyProfitEstimate": round(monthly_profit),
        "roi": round(roi, 1),
        "breakEvenUnits": break_even,
        "opportunityScore": round(score),
        "strengths": strengths if strengths else ["✅ Barqaror mahsulot"],
        "risks": risks if risks else ["Sezilarli xavf yo'q"],
        "recommendation": recommendation
    }


async def search_trending_products(query: str, limit: int = 10) -> Dict:
    """
    Search for trending products from both 1688 and AliExpress
    Returns combined and analyzed results
    """
    results = []
    sources = []
    
    # Try 1688 first
    products_1688 = await search_1688_products(query, limit)
    if products_1688:
        sources.append("1688.com")
        for product in products_1688:
            opportunity = calculate_opportunity_score(product)
            results.append(opportunity)
    
    # Then AliExpress
    products_ali = await search_aliexpress_products(query, limit - len(results))
    if products_ali:
        sources.append("AliExpress")
        for product in products_ali:
            opportunity = calculate_opportunity_score(product)
            results.append(opportunity)
    
    # If no real data, return mock data indicator
    if not results:
        return {
            "success": False,
            "error": "API kaliti sozlanmagan yoki serverga ulanib bo'lmadi",
            "data": [],
            "source": "none",
            "api_configured": is_api_configured()
        }
    
    # Sort by opportunity score
    results.sort(key=lambda x: x.get("opportunityScore", 0), reverse=True)
    
    return {
        "success": True,
        "data": results[:limit],
        "total": len(results),
        "source": " + ".join(sources),
        "api_configured": True
    }


# Export service functions
trend_hunter_service = {
    "search_1688": search_1688_products,
    "search_aliexpress": search_aliexpress_products,
    "search_all": search_trending_products,
    "get_1688_details": get_product_details_1688,
    "calculate_opportunity": calculate_opportunity_score,
    "is_configured": is_api_configured
}
