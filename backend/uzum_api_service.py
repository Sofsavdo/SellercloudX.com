"""
Uzum Market API Service
Direct API integration (NOT browser automation)

IMPORTANT: Uzum API uses API Key in Authorization header WITHOUT "Bearer" prefix!

API Documentation: https://api-seller.uzum.uz/api/seller-openapi/swagger/swagger-ui/

Endpoints:
- GET /v2/fbs/orders - Get orders
- GET /v2/fbs/sku/stocks - Get stocks
- POST /v1/fbs/product - Create product (if available)
"""

import httpx
import asyncio
from typing import Optional, Dict, Any, List
from datetime import datetime

UZUM_API_BASE = "https://api-seller.uzum.uz/api/seller-openapi"


class UzumMarketAPI:
    """
    Uzum Market Direct API Client
    
    IMPORTANT: Authorization header uses ONLY the API key, no "Bearer" prefix!
    """
    
    def __init__(self, api_key: str):
        """
        Initialize Uzum Market API client
        
        Args:
            api_key: API key from seller cabinet (e.g., "kGyjF4DBWO0/upOHI4TGwLWgmVahstv6wqnR62u5qkA=")
        """
        self.api_key = api_key
        # IMPORTANT: No "Bearer" prefix!
        self.headers = {
            "Authorization": api_key,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    async def test_connection(self) -> Dict[str, Any]:
        """Test API connection by getting stocks"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{UZUM_API_BASE}/v2/fbs/sku/stocks",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    payload = data.get("payload", {})
                    sku_list = payload.get("skuAmountList", [])
                    
                    return {
                        "success": True,
                        "message": f"Muvaffaqiyatli ulandi! {len(sku_list)} ta SKU topildi.",
                        "sku_count": len(sku_list),
                        "first_products": [
                            {
                                "skuId": sku.get("skuId"),
                                "title": sku.get("productTitle"),
                                "barcode": sku.get("barcode"),
                                "amount": sku.get("amount")
                            }
                            for sku in sku_list[:5]
                        ]
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
    
    async def get_stocks(self) -> Dict[str, Any]:
        """Get all SKU stocks"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{UZUM_API_BASE}/v2/fbs/sku/stocks",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "data": data.get("payload", {})
                    }
                else:
                    return {
                        "success": False,
                        "error": response.text
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_orders(self, limit: int = 10, offset: int = 0) -> Dict[str, Any]:
        """Get FBS orders"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{UZUM_API_BASE}/v2/fbs/orders",
                    headers=self.headers,
                    params={"limit": limit, "offset": offset}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "data": data.get("payload", {})
                    }
                else:
                    return {
                        "success": False,
                        "error": response.text
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_order_by_id(self, order_id: str) -> Dict[str, Any]:
        """Get specific order by ID"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{UZUM_API_BASE}/v1/fbs/order/{order_id}",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "data": data.get("payload", {})
                    }
                else:
                    return {
                        "success": False,
                        "error": response.text
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def update_stock(self, sku_id: int, amount: int) -> Dict[str, Any]:
        """Update SKU stock amount"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{UZUM_API_BASE}/v1/fbs/sku/{sku_id}/stocks",
                    headers=self.headers,
                    json={"amount": amount}
                )
                
                if response.status_code == 200:
                    return {
                        "success": True,
                        "message": f"SKU {sku_id} zaxirasi {amount} ga yangilandi"
                    }
                else:
                    return {
                        "success": False,
                        "error": response.text
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def update_price(self, sku_id: int, price: int) -> Dict[str, Any]:
        """Update SKU price"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{UZUM_API_BASE}/v1/fbs/sku/{sku_id}/selling-price",
                    headers=self.headers,
                    json={"sellingPrice": price}
                )
                
                if response.status_code == 200:
                    return {
                        "success": True,
                        "message": f"SKU {sku_id} narxi {price} so'mga yangilandi"
                    }
                else:
                    return {
                        "success": False,
                        "error": response.text
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_product_cards(self, limit: int = 100, offset: int = 0) -> Dict[str, Any]:
        """Get product cards (if endpoint exists)"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{UZUM_API_BASE}/v1/product-card",
                    headers=self.headers,
                    params={"limit": limit, "offset": offset}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "data": data.get("payload", {})
                    }
                else:
                    return {
                        "success": False,
                        "error": response.text,
                        "status_code": response.status_code
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Convenience function
async def test_uzum_api(api_key: str) -> Dict[str, Any]:
    """Quick test of Uzum API with given key"""
    api = UzumMarketAPI(api_key)
    return await api.test_connection()
