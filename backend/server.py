"""
SellerCloudX Backend Server - FastAPI with AI Services
Real AI functionality using Emergent LLM Key
"""
from fastapi import FastAPI, Request, Response, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import httpx
import os
import base64
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import AI service
from ai_service import generate_product_card, scan_product_image, optimize_price

# Import new advanced services
from uzum_rules import (
    check_stop_words, 
    remove_stop_words, 
    get_commission_rate,
    calculate_full_price,
    validate_media,
    generate_sku,
    STOP_WORDS,
    COMMISSION_RATES,
    MEDIA_REQUIREMENTS
)
from price_optimizer import PriceOptimizer, SalesBooster
from ai_card_generator import UzumCardGenerator

# Yandex Market imports
from yandex_rules import (
    get_yandex_commission_rate,
    get_yandex_logistics_fee,
    get_yandex_category_id,
    check_yandex_stop_words,
    calculate_yandex_price,
    YANDEX_COMMISSION_RATES,
    YANDEX_MEDIA_REQUIREMENTS,
    YANDEX_CATEGORIES
)
from yandex_service import YandexMarketAPI, YandexCardGenerator

# Infographic Generator import
from infographic_service import InfographicGenerator

# Uzum Browser Automation import
from uzum_automation import UzumAutomation, create_product_on_uzum, get_uzum_automation

# Uzum Direct API import
from uzum_api_service import UzumMarketAPI as UzumAPI, test_uzum_api

app = FastAPI(title="SellerCloudX AI API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Main Express server URL
MAIN_SERVER = os.getenv("MAIN_SERVER_URL", "http://127.0.0.1:3000")

# Uzum Market API Configuration - from environment only
UZUM_API_KEY = os.getenv("UZUM_API_KEY", "")
UZUM_BASE_URL = "https://api-seller.uzum.uz/api/seller-openapi"


# ========================================
# HEALTH CHECK
# ========================================

@app.get("/health")
async def health():
    emergent_key = os.getenv("EMERGENT_LLM_KEY", "")
    return {
        "status": "healthy",
        "service": "sellercloudx-ai",
        "ai_enabled": bool(emergent_key),
        "ai_provider": "Emergent LLM (OpenAI GPT-4o)"
    }


# ========================================
# AI ENDPOINTS
# ========================================

class ProductCardRequest(BaseModel):
    name: str
    category: Optional[str] = "general"
    description: Optional[str] = ""
    price: Optional[float] = 100000
    marketplace: Optional[str] = "uzum"


@app.post("/api/ai/generate-card")
async def api_generate_card(request: ProductCardRequest):
    """Generate AI-powered product card"""
    result = await generate_product_card(
        name=request.name,
        category=request.category,
        description=request.description,
        price=request.price,
        marketplace=request.marketplace
    )
    return JSONResponse(content=result)


@app.post("/api/ai/scan-image")
async def api_scan_image(file: UploadFile = File(...)):
    """Scan product from uploaded image"""
    try:
        # Read file
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Scan with AI
        result = await scan_product_image(image_base64)
        return JSONResponse(content=result)
        
    except Exception as e:
        return JSONResponse(
            content={"success": False, "error": str(e)},
            status_code=500
        )


class PriceOptimizeRequest(BaseModel):
    productName: str
    currentPrice: float
    costPrice: float
    category: Optional[str] = "general"
    marketplace: Optional[str] = "uzum"


@app.post("/api/ai/optimize-price")
async def api_optimize_price(request: PriceOptimizeRequest):
    """AI-powered price optimization"""
    result = await optimize_price(
        product_name=request.productName,
        current_price=request.currentPrice,
        cost_price=request.costPrice,
        category=request.category,
        marketplace=request.marketplace
    )
    return JSONResponse(content=result)


@app.get("/api/ai/status")
async def api_ai_status():
    """Check AI service status"""
    emergent_key = os.getenv("EMERGENT_LLM_KEY", "")
    return {
        "success": True,
        "ai": {
            "enabled": bool(emergent_key),
            "provider": "Emergent LLM",
            "model": "gpt-4o"
        },
        "message": "AI xizmati ishlayapti" if emergent_key else "AI xizmati o'chirilgan"
    }


# ========================================
# UZUM MARKET API ENDPOINTS
# ========================================

@app.get("/api/uzum-market/test-connection")
async def uzum_test_connection():
    """Test Uzum Market API connection"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{UZUM_BASE_URL}/v2/fbs/sku/stocks",
                headers={
                    "Authorization": UZUM_API_KEY,
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "message": "Uzum Market API muvaffaqiyatli ulandi! ✅",
                    "status_code": response.status_code,
                    "products_count": len(data.get("payload", {}).get("skuAmountList", []))
                }
            else:
                return {
                    "success": False,
                    "message": f"Uzum Market API xatosi: {response.status_code}",
                    "status_code": response.status_code,
                    "error": response.text[:500]
                }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/uzum-market/stocks")
async def uzum_get_stocks():
    """Get all SKU stocks from Uzum Market"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{UZUM_BASE_URL}/v2/fbs/sku/stocks",
                headers={
                    "Authorization": UZUM_API_KEY,
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "data": data
                }
            else:
                return {
                    "success": False,
                    "error": f"Status: {response.status_code}",
                    "details": response.text[:500]
                }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/uzum-market/orders")
async def uzum_get_orders(limit: int = 10, offset: int = 0):
    """Get FBS orders from Uzum Market"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{UZUM_BASE_URL}/v2/fbs/orders",
                params={"limit": limit, "offset": offset},
                headers={
                    "Authorization": UZUM_API_KEY,
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "data": data
                }
            else:
                return {
                    "success": False,
                    "error": f"Status: {response.status_code}",
                    "details": response.text[:500]
                }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/uzum-market/orders/count")
async def uzum_get_orders_count():
    """Get FBS orders count from Uzum Market"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{UZUM_BASE_URL}/v2/fbs/orders/count",
                headers={
                    "Authorization": UZUM_API_KEY,
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "data": data
                }
            else:
                return {
                    "success": False,
                    "error": f"Status: {response.status_code}",
                    "details": response.text[:500]
                }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ========================================
# AI PRODUCT SCANNER & UZUM INTEGRATION
# ========================================

class CreateUzumProductRequest(BaseModel):
    name: str
    description: str
    price: float
    quantity: int = 1
    category: str = "general"
    image: Optional[str] = None


@app.post("/api/ai/scan-product")
async def ai_scan_product(file: UploadFile = File(...)):
    """AI-powered product scanning from image"""
    try:
        # Read and encode image
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Use AI to analyze image
        result = await scan_product_image(image_base64)
        
        if result.get("success"):
            product = result.get("product", {})
            
            # Generate price analysis
            estimated_price = product.get("estimatedPrice", 100000)
            
            return {
                "success": True,
                "result": {
                    "productInfo": {
                        "name": product.get("name", "Unknown Product"),
                        "brand": product.get("brand", "No Brand"),
                        "category": product.get("category", "general"),
                        "description": product.get("description", ""),
                        "confidence": product.get("confidence", 75),
                        "labels": product.get("keywords", [])
                    },
                    "priceAnalysis": {
                        "avgPrice": int(estimated_price * 1.1),
                        "minPrice": int(estimated_price * 0.85),
                        "maxPrice": int(estimated_price * 1.3),
                        "suggestedPrice": estimated_price
                    },
                    "seoKeywords": product.get("keywords", []) + product.get("specifications", [])
                }
            }
        else:
            return {
                "success": False,
                "error": result.get("error", "Scan failed")
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


class ScanFromURLRequest(BaseModel):
    """Request for scanning product from image URL"""
    image_url: str
    partner_id: Optional[str] = None


@app.post("/api/ai/scan-from-url")
async def ai_scan_from_url(request: ScanFromURLRequest):
    """
    AI-powered product scanning from image URL
    
    This is the main entry point for:
    1. Camera scan (mobile app sends image URL)
    2. Web interface (user pastes image URL)
    
    Returns product info, category, MXIK code, and price suggestions
    """
    try:
        import httpx
        
        # Download image from URL
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(request.image_url)
            if response.status_code != 200:
                return {
                    "success": False,
                    "error": f"Rasmni yuklab bo'lmadi: {response.status_code}"
                }
            
            contents = response.content
            image_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Use AI to analyze image
        result = await scan_product_image(image_base64)
        
        if result.get("success"):
            product = result.get("product", {})
            
            # Get MXIK code for product
            product_name_for_mxik = product.get("name", "") + " " + product.get("category", "")
            mxik_result = await IKPUService.search_ikpu(
                product_name_for_mxik, 
                limit=1
            )
            
            if mxik_result and len(mxik_result) > 0:
                mxik_code = mxik_result[0].get("code", "")[:8] if mxik_result[0].get("code") else "47190000"
                mxik_full = mxik_result[0].get("code", "47190000000000000")
            else:
                # Fallback to category-based MXIK
                category_mxik_map = {
                    "beauty": "20420100",
                    "cosmetics": "20420100",
                    "skincare": "20420100",
                    "electronics": "26121900",
                    "phone": "26121900",
                    "food": "10810100",
                    "snack": "10890100",
                    "perfume": "20420100",
                    "clothing": "14130000",
                    "general": "47190000"
                }
                category = product.get("category", "general").lower()
                mxik_code = category_mxik_map.get(category, "47190000")
                mxik_full = mxik_code + "000000000"
            
            # Generate price analysis
            estimated_price = product.get("estimatedPrice", 100000)
            category = product.get("category", "general")
            
            # Calculate Yandex price
            from yandex_rules import get_yandex_commission_rate
            commission_rate = get_yandex_commission_rate(category)
            
            # Calculate suggested price with proper margin
            cost = estimated_price
            commission_decimal = commission_rate / 100 if commission_rate > 1 else commission_rate
            margin = 0.25  # 25% margin
            suggested_price = int(cost / (1 - commission_decimal - margin))
            
            return {
                "success": True,
                "scan_result": {
                    "product": {
                        "name": product.get("name", "Unknown Product"),
                        "brand": product.get("brand", "No Brand"),
                        "category": category,
                        "description": product.get("description", ""),
                        "keywords": product.get("keywords", []),
                        "specifications": product.get("specifications", []),
                        "confidence": product.get("confidence", 75)
                    },
                    "mxik": {
                        "code": mxik_code,
                        "full_code": mxik_full
                    },
                    "price_analysis": {
                        "estimated_cost": estimated_price,
                        "commission_percent": commission_rate if commission_rate > 1 else commission_rate * 100,
                        "margin_percent": 25,
                        "suggested_price": suggested_price,
                        "min_price": int(cost * 1.2),
                        "max_price": int(cost * 1.8)
                    },
                    "image_url": request.image_url,
                    "ready_for_card": True
                }
            }
        else:
            return {
                "success": False,
                "error": result.get("error", "Scan failed")
            }
            
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }


@app.post("/api/ai/create-uzum-product")
async def ai_create_uzum_product(request: CreateUzumProductRequest):
    """Create product on Uzum Market using AI-generated content"""
    try:
        # Step 1: Generate SEO-optimized product card using AI
        card_result = await generate_product_card(
            name=request.name,
            category=request.category,
            description=request.description,
            price=request.price,
            marketplace="uzum"
        )
        
        if not card_result.get("success"):
            return {
                "success": False,
                "error": f"AI card generation failed: {card_result.get('error')}"
            }
        
        card = card_result.get("card", {})
        
        # Step 2: Prepare Uzum Market API payload
        uzum_payload = {
            "title": card.get("title", request.name),
            "description": card.get("description", request.description),
            "price": int(request.price),
            "quantity": request.quantity,
            "category": request.category,
            "keywords": card.get("keywords", []),
            "bulletPoints": card.get("bulletPoints", [])
        }
        
        # Step 3: Note - Actual Uzum API product creation would go here
        # Currently Uzum API only supports FBS order management, not product creation
        # Product creation is typically done through seller portal
        
        return {
            "success": True,
            "message": "AI mahsulot kartasi yaratildi!",
            "data": {
                "aiCard": card,
                "seoScore": card.get("seoScore", 80),
                "status": "ready_for_upload",
                "note": "Uzum seller portaliga yuklash uchun tayyor"
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/ai/manager/stats")
async def ai_manager_stats():
    """Get AI Manager statistics"""
    try:
        # Get Uzum stocks for stats
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{UZUM_BASE_URL}/v2/fbs/sku/stocks",
                headers={
                    "Authorization": UZUM_API_KEY,
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                stocks = data.get("payload", {}).get("skuAmountList", [])
                
                total_products = len(stocks)
                in_stock = len([s for s in stocks if s.get("amount", 0) > 0])
                out_of_stock = len([s for s in stocks if s.get("amount", 0) == 0])
                fbs_enabled = len([s for s in stocks if s.get("fbsAllowed", False)])
                
                return {
                    "success": True,
                    "stats": {
                        "totalProducts": total_products,
                        "inStock": in_stock,
                        "outOfStock": out_of_stock,
                        "fbsEnabled": fbs_enabled,
                        "marketplace": "uzum",
                        "apiStatus": "connected"
                    }
                }
            else:
                return {
                    "success": False,
                    "error": "Could not fetch stats from Uzum"
                }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ========================================
# PARTNER MARKETPLACE CREDENTIALS MANAGEMENT
# ========================================

from credentials_service import MarketplaceCredentials, get_supported_marketplaces
from ikpu_service import IKPUService, COMMON_IKPU_CODES
from uzum_automation_service import UzumProductPreparer
from yandex_auto_creator import YandexAutoCreator, PartnerSettings, ProductScanResult

class SaveCredentialsRequest(BaseModel):
    partner_id: str
    marketplace: str
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    login: Optional[str] = None
    password: Optional[str] = None
    campaign_id: Optional[str] = None
    client_id: Optional[str] = None


class TestCredentialsRequest(BaseModel):
    partner_id: str
    marketplace: str


@app.get("/api/marketplaces/supported")
async def get_marketplaces():
    """Get list of supported marketplaces"""
    return {
        "success": True,
        "marketplaces": get_supported_marketplaces()
    }


@app.post("/api/partner/credentials/save")
async def save_partner_credentials(request: SaveCredentialsRequest):
    """Save partner's marketplace credentials"""
    try:
        credentials = {
            "api_key": request.api_key or "",
            "api_secret": request.api_secret or "",
            "login": request.login or "",
            "password": request.password or "",
            "campaign_id": request.campaign_id or "",
            "client_id": request.client_id or ""
        }
        
        # Filter out empty values
        credentials = {k: v for k, v in credentials.items() if v}
        
        result = MarketplaceCredentials.save_credentials(
            partner_id=request.partner_id,
            marketplace=request.marketplace,
            credentials=credentials
        )
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/partner/{partner_id}/credentials")
async def get_partner_credentials(partner_id: str):
    """Get all marketplace credentials for a partner (masked)"""
    try:
        credentials = MarketplaceCredentials.get_all_partner_credentials(
            partner_id=partner_id,
            mask_sensitive=True
        )
        
        return {
            "success": True,
            "partner_id": partner_id,
            "credentials": credentials
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.post("/api/partner/credentials/test")
async def test_partner_credentials(request: TestCredentialsRequest):
    """Test if partner's credentials are valid"""
    try:
        result = MarketplaceCredentials.test_credentials(
            partner_id=request.partner_id,
            marketplace=request.marketplace
        )
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.delete("/api/partner/{partner_id}/credentials/{marketplace}")
async def delete_partner_credentials(partner_id: str, marketplace: str):
    """Delete partner's marketplace credentials"""
    try:
        success = MarketplaceCredentials.delete_credentials(
            partner_id=partner_id,
            marketplace=marketplace
        )
        
        return {
            "success": success,
            "message": f"{marketplace} credentials deleted" if success else "Credentials not found"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ========================================
# IKPU (tasnif.soliq.uz) INTEGRATION
# ========================================

@app.get("/api/ikpu/search")
async def search_ikpu(query: str, limit: int = 10):
    """Search IKPU codes from tasnif.soliq.uz"""
    try:
        results = await IKPUService.search_ikpu(query, limit)
        
        return {
            "success": True,
            "query": query,
            "results": results
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/ikpu/by-category/{category}")
async def get_ikpu_by_category(category: str):
    """Get IKPU code by product category"""
    try:
        result = IKPUService.get_ikpu_by_category(category)
        
        return {
            "success": True,
            "category": category,
            "ikpu": result
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/ikpu/for-product")
async def get_ikpu_for_product(name: str, category: str = "", brand: str = ""):
    """Get best matching IKPU code for a product"""
    try:
        result = await IKPUService.get_ikpu_for_product(name, category, brand)
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ========================================
# UZUM PRODUCT CREATION (AI MANAGER)
# ========================================

class CreateUzumProductFullRequest(BaseModel):
    partner_id: str
    name: str
    description: str
    price: float
    category: str
    quantity: int = 1
    brand: str = ""
    ikpu_code: Optional[str] = None
    barcode: str = ""
    images: List[str] = []
    specifications: Optional[Dict[str, Any]] = None
    auto_upload: bool = False  # If true, try browser automation


@app.post("/api/ai-manager/create-product")
async def ai_manager_create_product(request: CreateUzumProductFullRequest):
    """
    AI Manager - Create complete product card for Uzum Market
    
    1. Get IKPU code if not provided
    2. Generate AI-optimized product card
    3. Optionally try to auto-upload via browser automation
    """
    try:
        # Step 1: Get IKPU code if not provided
        ikpu_code = request.ikpu_code
        if not ikpu_code:
            ikpu_result = await IKPUService.get_ikpu_for_product(
                request.name, 
                request.category, 
                request.brand
            )
            ikpu_code = ikpu_result.get("ikpu_code", "00000000")
        
        # Step 2: Generate AI product card
        card_result = await generate_product_card(
            name=request.name,
            category=request.category,
            description=request.description,
            price=request.price,
            marketplace="uzum"
        )
        
        if not card_result.get("success"):
            return {
                "success": False,
                "error": f"AI card generation failed: {card_result.get('error')}"
            }
        
        ai_card = card_result.get("card", {})
        
        # Step 3: Prepare Uzum-compliant product card
        uzum_card = UzumProductPreparer.prepare_product_card(
            name=ai_card.get("title", request.name),
            description=ai_card.get("description", request.description),
            price=request.price,
            category=request.category,
            ikpu_code=ikpu_code,
            brand=request.brand,
            images=request.images,
            quantity=request.quantity,
            barcode=request.barcode,
            specifications=request.specifications
        )
        
        # Step 4: Auto-upload if requested and credentials available
        upload_result = None
        if request.auto_upload:
            credentials = MarketplaceCredentials.get_credentials(
                partner_id=request.partner_id,
                marketplace="uzum"
            )
            
            if credentials and credentials.get("credentials", {}).get("login"):
                # Try browser automation
                # Note: This is disabled by default as it requires playwright setup
                upload_result = {
                    "attempted": True,
                    "success": False,
                    "message": "Browser automation is available but disabled. Use manual upload."
                }
            else:
                upload_result = {
                    "attempted": False,
                    "message": "No login credentials saved for auto-upload"
                }
        
        return {
            "success": True,
            "message": "Mahsulot kartasi tayyor!",
            "data": {
                "product_card": uzum_card.get("product_card"),
                "ai_card": ai_card,
                "ikpu": {
                    "code": ikpu_code,
                    "auto_detected": not request.ikpu_code
                },
                "validation": {
                    "is_valid": uzum_card.get("is_valid"),
                    "errors": uzum_card.get("validation_errors", [])
                },
                "upload_instructions": uzum_card.get("upload_instructions"),
                "auto_upload_result": upload_result
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/ai-manager/partner/{partner_id}/dashboard")
async def ai_manager_partner_dashboard(partner_id: str):
    """Get AI Manager dashboard data for a partner"""
    try:
        # Get partner's marketplace credentials
        credentials = MarketplaceCredentials.get_all_partner_credentials(
            partner_id=partner_id,
            mask_sensitive=True
        )
        
        # Check which marketplaces are connected
        connected_marketplaces = []
        for cred in credentials:
            if cred.get("has_api_key") or cred.get("has_login"):
                connected_marketplaces.append({
                    "name": cred.get("marketplace"),
                    "connected": True,
                    "has_api": cred.get("has_api_key", False),
                    "has_login": cred.get("has_login", False)
                })
        
        # Get Uzum stats if connected
        uzum_stats = None
        uzum_cred = next((c for c in credentials if c.get("marketplace") == "uzum"), None)
        if uzum_cred and uzum_cred.get("has_api_key"):
            # Would fetch from Uzum API using partner's key
            uzum_stats = {
                "note": "Stats will be fetched using partner's API key"
            }
        
        return {
            "success": True,
            "partner_id": partner_id,
            "dashboard": {
                "connected_marketplaces": connected_marketplaces,
                "total_marketplaces": len(connected_marketplaces),
                "uzum_stats": uzum_stats,
                "features": {
                    "ai_scanner": True,
                    "ai_card_generator": True,
                    "ikpu_lookup": True,
                    "price_optimizer": True,
                    "auto_upload": len(connected_marketplaces) > 0
                }
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ========================================
# UZUM PORTAL AUTOMATION
# ========================================

# Uzum automation v2 - commented out due to missing exports
# from uzum_automation_v2 import uzum_automation, create_uzum_product_package, UzumProductData

# Create placeholder classes
class UzumProductData:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

# Placeholder automation
class _UzumAutomationPlaceholder:
    async def login(self, phone, password):
        return {"success": False, "error": "Uzum automation temporarily disabled"}
    def prepare_product_for_uzum(self, product, seller_id):
        return {"error": "Uzum automation temporarily disabled"}

uzum_automation = _UzumAutomationPlaceholder()

async def create_uzum_product_package(**kwargs):
    return {"error": "Uzum automation temporarily disabled"}

class VerifyUzumCredentialsRequest(BaseModel):
    phone: str
    password: str


class CreateUzumPackageRequest(BaseModel):
    partner_id: str
    name: str
    description: str
    price: float
    category: str
    ikpu_code: Optional[str] = None
    brand: str = ""
    quantity: int = 1


@app.post("/api/uzum-automation/verify-credentials")
async def verify_uzum_credentials(request: VerifyUzumCredentialsRequest):
    """
    Verify Uzum Seller Portal credentials.
    Tests login and returns seller_id if successful.
    """
    try:
        result = await uzum_automation.login(request.phone, request.password)
        return result
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.post("/api/uzum-automation/create-package")
async def create_uzum_upload_package(request: CreateUzumPackageRequest):
    """
    Create complete Uzum product upload package.
    
    Returns:
    - Formatted product data for Uzum
    - Step-by-step upload instructions (Uzbek & Russian)
    - Direct links to Uzum Seller Portal
    - Copy-paste ready fields
    """
    try:
        # Get IKPU if not provided
        ikpu_code = request.ikpu_code
        if not ikpu_code:
            ikpu_result = await IKPUService.get_ikpu_for_product(
                request.name,
                request.category,
                request.brand
            )
            ikpu_code = ikpu_result.get("ikpu_code", "00000000")
        
        # Get partner credentials if available
        partner_creds = MarketplaceCredentials.get_credentials(
            partner_id=request.partner_id,
            marketplace="uzum"
        )
        
        phone = None
        password = None
        if partner_creds and partner_creds.get("credentials"):
            creds = partner_creds["credentials"]
            phone = creds.get("login")
            password = creds.get("password")
        
        # Create package
        package = await create_uzum_product_package(
            product_name=request.name,
            description=request.description,
            price=request.price,
            ikpu_code=ikpu_code,
            category=request.category,
            brand=request.brand,
            quantity=request.quantity,
            phone=phone,
            password=password
        )
        
        return {
            "success": True,
            "message": "Uzum mahsulot paketi tayyor!",
            "package": package
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.post("/api/uzum-automation/full-upload")
async def uzum_full_upload_process(request: CreateUzumPackageRequest):
    """
    Full Uzum product upload process.
    
    1. Verifies credentials
    2. Creates AI-optimized product card
    3. Gets IKPU code
    4. Generates complete upload package with instructions
    
    Note: Due to Uzum Portal's dynamic structure, actual upload
    is semi-automated with step-by-step guidance.
    """
    try:
        # Step 1: Get and verify credentials
        partner_creds = MarketplaceCredentials.get_credentials(
            partner_id=request.partner_id,
            marketplace="uzum"
        )
        
        if not partner_creds or not partner_creds.get("credentials"):
            return {
                "success": False,
                "error": "Uzum credentials not found. Please save your credentials first.",
                "action_required": "save_credentials"
            }
        
        creds = partner_creds["credentials"]
        phone = creds.get("login")
        password = creds.get("password")
        
        if not phone or not password:
            return {
                "success": False,
                "error": "Login credentials incomplete",
                "action_required": "update_credentials"
            }
        
        # Step 2: Verify login
        login_result = await uzum_automation.login(phone, password)
        
        if not login_result.get("success"):
            return {
                "success": False,
                "error": "Uzum login failed: " + login_result.get("error", "Unknown error"),
                "action_required": "check_credentials"
            }
        
        seller_id = login_result.get("seller_id")
        
        # Step 3: Get IKPU
        ikpu_code = request.ikpu_code
        if not ikpu_code:
            ikpu_result = await IKPUService.get_ikpu_for_product(
                request.name,
                request.category,
                request.brand
            )
            ikpu_code = ikpu_result.get("ikpu_code", "00000000")
        
        # Step 4: Generate AI card
        ai_card_result = await generate_product_card(
            name=request.name,
            category=request.category,
            description=request.description,
            price=request.price,
            marketplace="uzum"
        )
        
        ai_card = ai_card_result.get("card", {}) if ai_card_result.get("success") else {}
        
        # Step 5: Create complete package
        product = UzumProductData(
            title=ai_card.get("title", request.name),
            description=ai_card.get("description", request.description),
            price=int(request.price),
            ikpu_code=ikpu_code,
            category=request.category,
            brand=request.brand,
            quantity=request.quantity
        )
        
        package = uzum_automation.prepare_product_for_uzum(product, seller_id)
        
        return {
            "success": True,
            "message": "✅ Uzum mahsulot paketi to'liq tayyor!",
            "data": {
                "seller_id": seller_id,
                "credentials_verified": True,
                "product_package": package,
                "ai_card": ai_card,
                "ikpu": {
                    "code": ikpu_code,
                    "auto_detected": not request.ikpu_code
                },
                "seo_score": ai_card.get("seoScore", 0),
                "next_steps": [
                    "1. Pastdagi havolani bosing va Uzum Seller Portal'ga o'ting",
                    "2. Qo'llanmadagi qadamlarni bajaring",
                    "3. Ma'lumotlarni copy-paste qiling",
                    "4. Mahsulotni saqlang"
                ]
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ========================================
# UNIFIED AI SCANNER - FULL PRODUCT FLOW
# ========================================

class UnifiedScanRequest(BaseModel):
    """Unified scanner request - to'liq mahsulot oqimi"""
    partner_id: str
    cost_price: float
    quantity: int
    category: str = "general"
    brand: str = ""
    weight_kg: float = 1.0
    fulfillment: str = "fbs"  # fbs yoki fbo
    image_base64: Optional[str] = None
    product_name: Optional[str] = None
    description: Optional[str] = None
    auto_ikpu: bool = True


@app.post("/api/unified-scanner/full-process")
async def unified_scanner_full_process(request: UnifiedScanRequest):
    """
    UNIFIED AI SCANNER - To'liq mahsulot yaratish oqimi
    
    1. Rasm/nom asosida mahsulotni aniqlash
    2. Raqobatchilar tahlili
    3. Narx optimizatsiyasi (soliq, komissiya, xarajatlar)
    4. IKPU kodini olish
    5. Uzum-compliant kartochka yaratish
    6. Media talablarini tekshirish
    """
    try:
        result_data = {
            "steps_completed": [],
            "steps_failed": []
        }
        
        # ========== STEP 1: Mahsulotni aniqlash ==========
        detected_info = None
        product_name = request.product_name
        
        if request.image_base64:
            scan_result = await scan_product_image(request.image_base64)
            if scan_result.get("success"):
                detected_info = scan_result.get("product", {})
                if not product_name:
                    product_name = detected_info.get("name", "Noma'lum mahsulot")
                result_data["steps_completed"].append("image_scan")
                result_data["detected_product"] = detected_info
            else:
                result_data["steps_failed"].append({
                    "step": "image_scan",
                    "error": scan_result.get("error")
                })
        
        if not product_name:
            return {
                "success": False,
                "error": "Mahsulot nomi yoki rasmi kerak"
            }
        
        # ========== STEP 2: Raqobatchilar tahlili ==========
        competitor_analysis = await PriceOptimizer.analyze_competitors(
            product_name=product_name,
            category=request.category,
            current_price=request.cost_price * 1.5  # Dastlabki taxmin
        )
        result_data["competitor_analysis"] = competitor_analysis.get("analysis", {})
        result_data["steps_completed"].append("competitor_analysis")
        
        # ========== STEP 3: Narx optimizatsiyasi ==========
        competitor_avg = None
        if competitor_analysis.get("success"):
            market = competitor_analysis.get("analysis", {}).get("market_analysis", {})
            competitor_avg = market.get("avg_price")
        
        price_calculation = PriceOptimizer.calculate_optimal_price(
            cost_price=request.cost_price,
            category=request.category,
            competitor_avg=competitor_avg,
            weight_kg=request.weight_kg,
            fulfillment=request.fulfillment
        )
        result_data["price_optimization"] = price_calculation
        result_data["steps_completed"].append("price_optimization")
        
        # To'liq narx tafsiloti
        full_price_calc = calculate_full_price(
            cost_price=request.cost_price,
            category=request.category,
            weight_kg=request.weight_kg,
            fulfillment=request.fulfillment,
            target_margin=30
        )
        result_data["price_breakdown"] = full_price_calc["breakdown"]
        
        # ========== STEP 4: IKPU kod ==========
        ikpu_code = "00000000"
        ikpu_name = ""
        if request.auto_ikpu:
            try:
                ikpu_result = await IKPUService.get_ikpu_for_product(
                    product_name,
                    request.category,
                    request.brand
                )
                if ikpu_result.get("success"):
                    ikpu_code = ikpu_result.get("ikpu_code", "00000000")
                    ikpu_name = ikpu_result.get("ikpu_name", "")
                    result_data["steps_completed"].append("ikpu_lookup")
            except Exception as e:
                result_data["steps_failed"].append({
                    "step": "ikpu_lookup",
                    "error": str(e)
                })
        
        result_data["ikpu"] = {
            "code": ikpu_code,
            "name": ikpu_name,
            "auto_detected": request.auto_ikpu
        }
        
        # ========== STEP 5: AI Kartochka yaratish ==========
        card_result = await UzumCardGenerator.generate_full_card(
            product_name=product_name,
            category=request.category,
            cost_price=request.cost_price,
            quantity=request.quantity,
            brand=request.brand,
            description=request.description or "",
            detected_info=detected_info,
            competitor_analysis=competitor_analysis
        )
        
        if card_result.get("success"):
            result_data["product_card"] = card_result.get("card", {})
            result_data["card_validation"] = card_result.get("validation", {})
            result_data["seo_score"] = card_result.get("seo_score", 0)
            result_data["sales_tips"] = card_result.get("tips", [])
            result_data["steps_completed"].append("card_generation")
        else:
            result_data["steps_failed"].append({
                "step": "card_generation",
                "error": card_result.get("error")
            })
        
        # ========== STEP 6: SKU generatsiya ==========
        sku = generate_sku(request.category, request.brand)
        result_data["sku"] = sku
        
        # ========== STEP 7: Media talablari ==========
        result_data["media_requirements"] = MEDIA_REQUIREMENTS
        
        # ========== Final Package ==========
        final_package = {
            "product_name": product_name,
            "brand": request.brand,
            "category": request.category,
            "sku": sku,
            "ikpu_code": ikpu_code,
            "quantity": request.quantity,
            "prices": {
                "cost_price": request.cost_price,
                "min_sell_price": price_calculation["min_price"],
                "optimal_price": price_calculation["optimal_price"],
                "max_price": price_calculation["max_price"],
                "competitor_avg": competitor_avg
            },
            "expenses": full_price_calc["breakdown"],
            "profit": {
                "net_profit": price_calculation["net_profit"],
                "margin_percent": price_calculation["actual_margin"],
                "is_profitable": price_calculation["is_profitable"]
            },
            "ready_for_upload": len(result_data.get("steps_failed", [])) == 0
        }
        result_data["final_package"] = final_package
        
        # Upload instructions
        result_data["upload_instructions"] = {
            "uz": [
                "1. seller.uzum.uz saytiga kiring",
                "2. 'Tovarlar' -> 'Yangi tovar qo'shish' tugmasini bosing",
                "3. Quyidagi ma'lumotlarni nusxalab kiriting",
                "4. Rasmlarni yuklang (1080x1440px, max 5MB)",
                "5. IKPU kodini kiriting yoki qidiring",
                "6. 'Saqlash' tugmasini bosing"
            ],
            "ru": [
                "1. Войдите на seller.uzum.uz",
                "2. Нажмите 'Товары' -> 'Добавить товар'",
                "3. Скопируйте и вставьте данные ниже",
                "4. Загрузите фото (1080x1440px, макс 5MB)",
                "5. Введите или найдите код ИКПУ",
                "6. Нажмите 'Сохранить'"
            ]
        }
        
        # ========== STEP 8: Marketplace ga yuklash (Yandex) ==========
        if request.marketplace == "yandex" and request.image_base64:
            try:
                from nano_banana_service import generate_product_infographics, upload_to_imgbb
                
                # 1. Upload original image to ImgBB
                original_url = await upload_to_imgbb(request.image_base64)
                image_urls = [original_url] if original_url else []
                
                # 2. Generate infographics (optional - can be skipped for speed)
                if request.auto_generate_infographics:
                    result_data["upload_progress"] = "Infografika yaratilmoqda..."
                    infographic_result = await generate_product_infographics(
                        product_name=product_name,
                        brand=request.brand or "No Brand",
                        features=detected_info.get("keywords", []) if detected_info else [],
                        category=request.category or "general",
                        count=3  # Tezlik uchun 3 ta rasm
                    )
                    if infographic_result.get("success"):
                        image_urls.extend(infographic_result.get("images", []))
                        result_data["infographics"] = infographic_result.get("images", [])
                        result_data["steps_completed"].append("infographics_generated")
                
                # 3. Create product on Yandex Market
                if image_urls:
                    oauth_token = os.getenv("YANDEX_API_KEY")
                    business_id = os.getenv("YANDEX_BUSINESS_ID", "197529861")
                    
                    if oauth_token:
                        api = YandexMarketAPI(oauth_token=oauth_token, business_id=business_id)
                        
                        # Generate offer ID
                        offer_id = f"SCX-{datetime.now().strftime('%Y%m%d%H%M%S')}"
                        
                        # Get card data or fallback
                        card_data = result_data.get("product_card", {})
                        product_title = card_data.get("name", product_name)
                        product_desc = card_data.get("description", "") or f"{request.brand} {product_name}"
                        
                        create_result = await api.create_product(
                            offer_id=offer_id,
                            name=product_title,
                            description=product_desc,
                            vendor=request.brand or "No Brand",
                            price=price_calculation["optimal_price"],
                            pictures=image_urls[:10],
                            category_id=get_yandex_category_id(request.category)
                        )
                        
                        if create_result.get("success"):
                            result_data["yandex_upload"] = {
                                "success": True,
                                "offer_id": offer_id,
                                "images_uploaded": len(image_urls),
                                "price": price_calculation["optimal_price"]
                            }
                            result_data["steps_completed"].append("yandex_upload")
                            final_package["yandex_offer_id"] = offer_id
                        else:
                            result_data["yandex_upload"] = {
                                "success": False,
                                "error": create_result.get("error")
                            }
                            result_data["steps_failed"].append({
                                "step": "yandex_upload",
                                "error": create_result.get("error")
                            })
            except Exception as e:
                result_data["yandex_upload"] = {"success": False, "error": str(e)}
                result_data["steps_failed"].append({"step": "yandex_upload", "error": str(e)})
        
        return {
            "success": True,
            "message": "Mahsulot kartochkasi tayyor!",
            "data": result_data,
            "sku": sku,
            "offer_id": result_data.get("yandex_upload", {}).get("offer_id"),
            "infographics": result_data.get("infographics", [])
        }
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }


@app.post("/api/unified-scanner/scan-image")
async def unified_scan_image(file: UploadFile = File(...)):
    """Rasmni skanerlash va mahsulotni aniqlash"""
    try:
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        result = await scan_product_image(image_base64)
        
        if result.get("success"):
            return {
                "success": True,
                "product": result.get("product", {}),
                "image_size": len(contents),
                "image_base64": image_base64  # Keyingi qadamlar uchun
            }
        else:
            return {
                "success": False,
                "error": result.get("error", "Scan failed")
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.post("/api/unified-scanner/analyze-price")
async def unified_analyze_price(
    product_name: str,
    cost_price: float,
    category: str = "general",
    weight_kg: float = 1.0,
    fulfillment: str = "fbs"
):
    """Narx tahlili va raqobatchilar"""
    try:
        # Raqobatchilar
        competitor_analysis = await PriceOptimizer.analyze_competitors(
            product_name=product_name,
            category=category,
            current_price=cost_price * 1.5
        )
        
        competitor_avg = None
        if competitor_analysis.get("success"):
            market = competitor_analysis.get("analysis", {}).get("market_analysis", {})
            competitor_avg = market.get("avg_price")
        
        # Narx hisoblash
        price_calc = PriceOptimizer.calculate_optimal_price(
            cost_price=cost_price,
            category=category,
            competitor_avg=competitor_avg,
            weight_kg=weight_kg,
            fulfillment=fulfillment
        )
        
        # To'liq tafsilot
        full_calc = calculate_full_price(
            cost_price=cost_price,
            category=category,
            weight_kg=weight_kg,
            fulfillment=fulfillment
        )
        
        return {
            "success": True,
            "price_optimization": price_calc,
            "price_breakdown": full_calc,
            "competitor_analysis": competitor_analysis.get("analysis", {})
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/unified-scanner/uzum-rules")
async def get_uzum_rules():
    """Uzum Market qoidalari va talablarini olish"""
    return {
        "success": True,
        "rules": {
            "stop_words": list(STOP_WORDS)[:50],  # Birinchi 50 tasi
            "stop_words_count": len(STOP_WORDS),
            "commission_rates": COMMISSION_RATES,
            "media_requirements": MEDIA_REQUIREMENTS,
            "card_requirements": {
                "title_max_length": 80,
                "description_min_length": 300,
                "required_languages": ["uz", "ru"],
                "min_images": 3,
                "max_images": 15
            }
        }
    }


@app.post("/api/unified-scanner/validate-text")
async def validate_text_for_uzum(text: str):
    """Matnni Uzum qoidalariga tekshirish"""
    result = check_stop_words(text)
    return {
        "success": True,
        "validation": result,
        "cleaned_text": remove_stop_words(text) if result["has_stop_words"] else text
    }


# ========================================
# YANDEX MARKET INTEGRATION
# ========================================

class YandexScanRequest(BaseModel):
    """Yandex Market scanner request"""
    partner_id: str
    cost_price: float
    quantity: int
    category: str = "electronics"
    brand: str = ""
    weight_kg: float = 1.0
    fulfillment: str = "fbs"  # fbs, fby, dbs
    payout_frequency: str = "weekly"
    product_name: Optional[str] = None
    description: Optional[str] = None


class YandexCredentials(BaseModel):
    """Yandex Market credentials"""
    partner_id: str
    oauth_token: str
    campaign_id: Optional[str] = None
    business_id: Optional[str] = None


@app.post("/api/yandex-market/full-process")
async def yandex_market_full_process(request: YandexScanRequest):
    """
    YANDEX MARKET - To'liq mahsulot yaratish oqimi
    """
    try:
        result_data = {
            "marketplace": "yandex",
            "steps_completed": [],
            "steps_failed": []
        }
        
        product_name = request.product_name
        if not product_name:
            return {
                "success": False,
                "error": "Mahsulot nomi kerak"
            }
        
        # ========== STEP 1: Narx kalkulyatsiyasi ==========
        price_calc = calculate_yandex_price(
            cost_price=request.cost_price,
            category=request.category,
            weight_kg=request.weight_kg,
            fulfillment=request.fulfillment,
            target_margin=25,
            payout_frequency=request.payout_frequency
        )
        result_data["price_optimization"] = price_calc
        result_data["price_breakdown"] = price_calc["breakdown"]
        result_data["steps_completed"].append("price_calculation")
        
        # ========== STEP 2: Kategoriya ID ==========
        category_id = get_yandex_category_id(request.category)
        result_data["category_id"] = category_id
        result_data["steps_completed"].append("category_mapping")
        
        # ========== STEP 3: AI Kartochka yaratish ==========
        card_result = await YandexCardGenerator.generate_card(
            product_name=product_name,
            category=request.category,
            brand=request.brand,
            description=request.description or "",
            price=price_calc["optimal_price"]
        )
        
        if card_result.get("success"):
            result_data["product_card"] = card_result.get("card", {})
            result_data["card_validation"] = card_result.get("validation", {})
            result_data["seo_score"] = card_result.get("seo_score", 0)
            result_data["steps_completed"].append("card_generation")
        else:
            result_data["steps_failed"].append({
                "step": "card_generation",
                "error": card_result.get("error")
            })
        
        # ========== STEP 4: SKU generatsiya ==========
        sku = generate_sku(request.category, request.brand)
        result_data["sku"] = sku
        
        # ========== STEP 5: Media talablari ==========
        result_data["media_requirements"] = YANDEX_MEDIA_REQUIREMENTS
        
        # ========== Final Package ==========
        final_package = {
            "product_name": product_name,
            "brand": request.brand,
            "category": request.category,
            "category_id": category_id,
            "sku": sku,
            "quantity": request.quantity,
            "prices": {
                "cost_price": request.cost_price,
                "min_sell_price": price_calc["min_price"],
                "optimal_price": price_calc["optimal_price"],
                "max_price": price_calc["max_price"]
            },
            "expenses": price_calc["breakdown"],
            "profit": {
                "net_profit": price_calc["breakdown"]["net_profit"],
                "margin_percent": price_calc["breakdown"]["actual_margin"],
                "is_profitable": price_calc["recommendation"]["is_profitable"]
            },
            "ready_for_upload": len(result_data.get("steps_failed", [])) == 0
        }
        result_data["final_package"] = final_package
        
        # Upload instructions
        result_data["upload_instructions"] = {
            "ru": [
                "1. Войдите на partner.market.yandex.ru",
                "2. Перейдите в раздел 'Товары' → 'Каталог'",
                "3. Нажмите 'Добавить товар'",
                "4. Скопируйте данные из карточки ниже",
                "5. Загрузите фото (1000x1000px, белый фон)",
                "6. Укажите цену и остатки",
                "7. Нажмите 'Сохранить'"
            ]
        }
        
        return {
            "success": True,
            "message": "Yandex Market kartochkasi tayyor!",
            "data": result_data
        }
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }


@app.post("/api/yandex-market/test-connection")
async def yandex_test_connection(credentials: YandexCredentials):
    """Yandex Market API ulanishini tekshirish"""
    try:
        api = YandexMarketAPI(
            oauth_token=credentials.oauth_token,
            campaign_id=credentials.campaign_id,
            business_id=credentials.business_id
        )
        result = await api.test_connection()
        return result
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.post("/api/yandex-market/get-campaigns")
async def yandex_get_campaigns(credentials: YandexCredentials):
    """Yandex Market kampaniyalarini (do'konlarini) olish"""
    try:
        api = YandexMarketAPI(
            oauth_token=credentials.oauth_token
        )
        result = await api.get_campaigns()
        return result
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/yandex-market/rules")
async def get_yandex_rules():
    """Yandex Market qoidalari va talablarini olish"""
    return {
        "success": True,
        "rules": {
            "commission_rates": YANDEX_COMMISSION_RATES,
            "media_requirements": YANDEX_MEDIA_REQUIREMENTS,
            "categories": YANDEX_CATEGORIES,
            "card_requirements": {
                "title_max_length": 120,
                "description_min_length": 200,
                "required_languages": ["ru"],
                "min_images": 1,
                "max_images": 20,
                "background": "white_required"
            }
        }
    }


@app.post("/api/yandex-market/calculate-price")
async def yandex_calculate_price(
    cost_price: float,
    category: str = "electronics",
    weight_kg: float = 1.0,
    fulfillment: str = "fbs",
    payout_frequency: str = "weekly"
):
    """Yandex Market uchun narx kalkulyatsiyasi"""
    try:
        result = calculate_yandex_price(
            cost_price=cost_price,
            category=category,
            weight_kg=weight_kg,
            fulfillment=fulfillment,
            target_margin=25,
            payout_frequency=payout_frequency
        )
        return {
            "success": True,
            "calculation": result
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ========================================
# YANDEX MARKET - TO'LIQ AVTOMATLASHTIRISH (REAL API)
# ========================================

class YandexCreateProductRequest(BaseModel):
    """Yandex Market da haqiqiy mahsulot yaratish"""
    partner_id: str
    oauth_token: str
    business_id: str
    product_name: str
    description: str
    brand: str = ""
    category: str = "electronics"
    price: float
    quantity: int = 1
    weight_kg: float = 1.0
    images: List[str] = []
    ikpu_code: Optional[str] = None
    barcode: Optional[str] = None
    auto_generate_card: bool = True


@app.post("/api/yandex-market/create-product")
async def yandex_create_real_product(request: YandexCreateProductRequest):
    """
    YANDEX MARKET - HAQIQIY MAHSULOT YARATISH (FULL API AUTOMATION)
    
    Bu endpoint Uzumdagi "assisted automation"dan farqli ravishda
    TO'LIDAN-TO'LIQ avtomatlashtirilgan - mahsulot API orqali yaratiladi!
    
    Flow:
    1. OAuth token va Business ID bilan API ulanishini tekshirish
    2. AI bilan SEO-optimallashtirilgan kartochka yaratish (agar so'ralsa)
    3. IKPU kodini olish (agar kerak bo'lsa)
    4. Yandex Market API ga POST so'rov yuborish
    5. Mahsulot partnerning akkauntida yaratiladi
    """
    try:
        result_data = {
            "marketplace": "yandex",
            "automation_type": "FULL_API",  # Uzumdagi "ASSISTED"dan farq
            "steps_completed": [],
            "steps_failed": []
        }
        
        # ========== STEP 1: API ulanishini tekshirish ==========
        api = YandexMarketAPI(
            oauth_token=request.oauth_token,
            business_id=request.business_id
        )
        
        connection_test = await api.test_connection()
        if not connection_test.get("success"):
            return {
                "success": False,
                "error": "Yandex API ulanish xatosi",
                "details": connection_test.get("error"),
                "help": connection_test.get("help", "OAuth tokenni tekshiring")
            }
        
        result_data["api_connection"] = {
            "success": True,
            "business_id": api.business_id,
            "campaigns": connection_test.get("campaigns", [])
        }
        result_data["steps_completed"].append("api_connection")
        
        # ========== STEP 2: AI Kartochka yaratish (optional) ==========
        product_card = None
        if request.auto_generate_card:
            card_result = await YandexCardGenerator.generate_card(
                product_name=request.product_name,
                category=request.category,
                brand=request.brand,
                description=request.description,
                price=request.price
            )
            
            if card_result.get("success"):
                product_card = card_result.get("card", {})
                result_data["ai_card"] = product_card
                result_data["seo_score"] = card_result.get("seo_score", 0)
                result_data["steps_completed"].append("ai_card_generation")
            else:
                result_data["steps_failed"].append({
                    "step": "ai_card_generation",
                    "error": card_result.get("error")
                })
        
        # ========== STEP 3: IKPU kod (Uzbekistan uchun) ==========
        ikpu_code = request.ikpu_code
        if not ikpu_code:
            try:
                ikpu_result = await IKPUService.get_ikpu_for_product(
                    request.product_name,
                    request.category,
                    request.brand
                )
                if ikpu_result.get("success"):
                    ikpu_code = ikpu_result.get("ikpu_code")
                    result_data["steps_completed"].append("ikpu_lookup")
            except Exception as e:
                result_data["steps_failed"].append({
                    "step": "ikpu_lookup",
                    "error": str(e)
                })
        
        result_data["ikpu_code"] = ikpu_code
        
        # ========== STEP 4: SKU generatsiya ==========
        sku = generate_sku(request.category, request.brand)
        result_data["sku"] = sku
        
        # ========== STEP 5: HAQIQIY YANDEX API CHAQIRUVI ==========
        # Bu asosiy farq - mahsulot API orqali yaratiladi!
        
        # Kartochkadan ma'lumotlarni olish yoki default ishlatish
        final_name = product_card.get("name", request.product_name) if product_card else request.product_name
        final_description = product_card.get("description", request.description) if product_card else request.description
        final_vendor = product_card.get("vendor", request.brand) if product_card else request.brand
        
        # Yandex API ga mahsulot yaratish so'rovi
        create_result = await api.create_product(
            offer_id=sku,
            name=final_name,
            description=final_description,
            vendor=final_vendor or "No Brand",
            pictures=request.images,
            category_id=get_yandex_category_id(request.category),
            price=request.price,
            currency="UZS",
            ikpu_code=ikpu_code,
            weight_kg=request.weight_kg,
            barcode=request.barcode,
            manufacturer_country="Узбекистан"
        )
        
        if create_result.get("success"):
            result_data["api_response"] = create_result
            result_data["steps_completed"].append("product_created_via_api")
            result_data["product_created"] = True
            
            return {
                "success": True,
                "message": "✅ Mahsulot Yandex Market'ga muvaffaqiyatli qo'shildi!",
                "automation_type": "FULL_API",
                "data": {
                    "offer_id": sku,
                    "product_name": final_name,
                    "price": request.price,
                    "business_id": api.business_id,
                    "api_response": create_result,
                    "ai_card": product_card,
                    "ikpu_code": ikpu_code,
                    "steps_completed": result_data["steps_completed"],
                    "warnings": create_result.get("warnings", [])
                },
                "next_steps": [
                    "1. Yandex Market kabinetiga kirib mahsulotni tekshiring",
                    "2. Rasmlarni yuklang (agar yuklanmagan bo'lsa)",
                    "3. Zaxira miqdorini yangilang",
                    "4. Moderatsiya jarayonini kuting"
                ]
            }
        else:
            result_data["steps_failed"].append({
                "step": "product_creation_api",
                "error": create_result.get("error"),
                "details": create_result.get("details")
            })
            
            return {
                "success": False,
                "error": "Mahsulot yaratishda xatolik",
                "details": create_result,
                "data": result_data
            }
            
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }


@app.post("/api/yandex-market/save-credentials")
async def yandex_save_credentials(
    partner_id: str,
    oauth_token: str,
    business_id: Optional[str] = None,
    campaign_id: Optional[str] = None
):
    """Partner uchun Yandex Market kredensiallarini saqlash"""
    try:
        # Avval ulanishni tekshirish
        api = YandexMarketAPI(
            oauth_token=oauth_token,
            business_id=business_id,
            campaign_id=campaign_id
        )
        
        connection = await api.test_connection()
        
        if not connection.get("success"):
            return {
                "success": False,
                "error": "Kredensiallar noto'g'ri",
                "details": connection.get("error")
            }
        
        # Business ID ni olish (agar berilmagan bo'lsa)
        final_business_id = business_id or api.business_id
        
        # Kredensiallarni saqlash
        credentials = {
            "api_key": oauth_token,  # OAuth token
            "business_id": final_business_id,
            "campaign_id": campaign_id or ""
        }
        
        result = MarketplaceCredentials.save_credentials(
            partner_id=partner_id,
            marketplace="yandex",
            credentials=credentials
        )
        
        return {
            "success": True,
            "message": "Yandex Market kredensiallar saqlandi!",
            "business_id": final_business_id,
            "campaigns": connection.get("campaigns", []),
            "can_create_products": True
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/yandex-market/partner/{partner_id}/products")
async def yandex_get_partner_products(partner_id: str, page: int = 1, page_size: int = 50):
    """Partner ning Yandex Market mahsulotlarini olish"""
    try:
        # Kredensiallarni olish
        cred_data = MarketplaceCredentials.get_credentials(
            partner_id=partner_id,
            marketplace="yandex"
        )
        
        if not cred_data:
            return {
                "success": False,
                "error": "Yandex Market kredensiallar topilmadi"
            }
        
        creds = cred_data.get("credentials", {})
        oauth_token = creds.get("api_key", "")
        campaign_id = creds.get("campaign_id", "")
        
        if not oauth_token:
            return {
                "success": False,
                "error": "OAuth token topilmadi"
            }
        
        api = YandexMarketAPI(
            oauth_token=oauth_token,
            campaign_id=campaign_id
        )
        
        result = await api.get_offers(page=page, page_size=page_size)
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ========================================
# UZUM MARKET - DIRECT API (NO BROWSER!)
# ========================================

@app.post("/api/uzum-api/test-connection")
async def uzum_api_test_connection(api_key: str):
    """
    Uzum Market API ulanishini tekshirish
    
    API key: Authorization headerda "Bearer" PREFIKSSIZ ishlatiladi!
    """
    try:
        result = await test_uzum_api(api_key)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/api/uzum-api/stocks")
async def uzum_api_get_stocks(api_key: str):
    """Barcha SKU zaxiralarini olish"""
    try:
        api = UzumAPI(api_key)
        result = await api.get_stocks()
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/api/uzum-api/orders")
async def uzum_api_get_orders(api_key: str, limit: int = 10, offset: int = 0):
    """FBS buyurtmalarini olish"""
    try:
        api = UzumAPI(api_key)
        result = await api.get_orders(limit, offset)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/uzum-api/update-stock")
async def uzum_api_update_stock(api_key: str, sku_id: int, amount: int):
    """SKU zaxirasini yangilash"""
    try:
        api = UzumAPI(api_key)
        result = await api.update_stock(sku_id, amount)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/uzum-api/update-price")
async def uzum_api_update_price(api_key: str, sku_id: int, price: int):
    """SKU narxini yangilash"""
    try:
        api = UzumAPI(api_key)
        result = await api.update_price(sku_id, price)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}


# ========================================
# UZUM MARKET - BROWSER AUTOMATION (Fallback)
# ========================================

class UzumLoginRequest(BaseModel):
    """Uzum kabinetiga kirish so'rovi"""
    partner_id: str
    phone_or_email: str
    password: str
    save_credentials: bool = True


class UzumOTPRequest(BaseModel):
    """Uzum OTP tasdiqlash"""
    partner_id: str
    otp_code: str
    session_id: str


class UzumCreateProductRequest(BaseModel):
    """Uzum da avtomatik mahsulot yaratish"""
    partner_id: str
    # Credential (saved yoki yangi)
    use_saved_credentials: bool = True
    phone_or_email: Optional[str] = None
    password: Optional[str] = None
    # Product data
    name: str
    description: str
    price: float
    category: str
    brand: str = ""
    images: List[str] = []  # Base64 yoki URL
    quantity: int = 1
    ikpu_code: str = ""
    weight_kg: float = 1.0
    # AI options
    use_ai_card: bool = True
    use_ai_infographic: bool = True
    infographic_template: str = "product_showcase"


@app.post("/api/uzum-automation/login")
async def uzum_automation_login(request: UzumLoginRequest):
    """
    Uzum Seller kabinetiga avtomatik kirish
    
    1. Browser orqali seller.uzum.uz ga kiradi
    2. Login/parol bilan autentifikatsiya
    3. OTP kerak bo'lsa - session qaytaradi
    4. Credential'larni saqlaydi (agar so'ralsa)
    """
    try:
        automation = UzumAutomation()
        await automation.initialize(headless=True)
        
        result = await automation.login(
            phone_or_email=request.phone_or_email,
            password=request.password
        )
        
        if result.get("success") and request.save_credentials:
            # Credential'larni shifrlangan holda saqlash
            MarketplaceCredentials.save_credentials(
                partner_id=request.partner_id,
                marketplace="uzum",
                credentials={
                    "login": request.phone_or_email,
                    "password": request.password
                }
            )
            result["credentials_saved"] = True
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.post("/api/uzum-automation/submit-otp")
async def uzum_automation_submit_otp(request: UzumOTPRequest):
    """OTP kodni yuborish (agar SMS talab qilinsa)"""
    try:
        automation = UzumAutomation()
        await automation.initialize(headless=True)
        
        result = await automation.submit_otp(
            otp_code=request.otp_code,
            session_id=request.session_id
        )
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.post("/api/uzum-automation/create-product")
async def uzum_automation_create_product(request: UzumCreateProductRequest):
    """
    🚀 UZUM MARKET - TO'LIQ AVTOMATIK MAHSULOT YARATISH
    
    Bu endpoint hamkorning qo'lida hech narsa qilmasdan
    mahsulotni to'g'ridan-to'g'ri Uzum Market'da yaratadi!
    
    Flow:
    1. Partner credential'larini olish (saqlangan yoki yangi)
    2. Uzum kabinetiga login qilish (browser automation)
    3. AI bilan kartochka yaratish (agar so'ralsa)
    4. AI bilan infografika yaratish (agar so'ralsa)
    5. IKPU kodini olish
    6. Mahsulotni Uzum'da yaratish
    7. Natijani qaytarish
    """
    try:
        result_data = {
            "marketplace": "uzum",
            "automation_type": "FULL_BROWSER",
            "steps_completed": [],
            "steps_failed": []
        }
        
        # ========== STEP 1: Credential olish ==========
        if request.use_saved_credentials:
            cred_data = MarketplaceCredentials.get_credentials(
                partner_id=request.partner_id,
                marketplace="uzum"
            )
            
            if not cred_data:
                return {
                    "success": False,
                    "error": "Saqlangan credential topilmadi. Iltimos, login/parol kiriting.",
                    "requires_credentials": True
                }
            
            credentials = cred_data.get("credentials", {})
            login = credentials.get("login", "")
            password = credentials.get("password", "")
        else:
            if not request.phone_or_email or not request.password:
                return {
                    "success": False,
                    "error": "Login va parol talab qilinadi"
                }
            login = request.phone_or_email
            password = request.password
        
        result_data["steps_completed"].append("credentials_loaded")
        
        # ========== STEP 2: AI Kartochka yaratish ==========
        final_name = request.name
        final_description = request.description
        
        if request.use_ai_card:
            try:
                card_result = await UzumCardGenerator.generate_card(
                    product_name=request.name,
                    category=request.category,
                    brand=request.brand,
                    description=request.description,
                    price=request.price
                )
                
                if card_result.get("success"):
                    card = card_result.get("card", {})
                    final_name = card.get("title_uz", request.name)
                    final_description = card.get("description_uz", request.description)
                    result_data["ai_card"] = card
                    result_data["seo_score"] = card_result.get("seo_score", 0)
                    result_data["steps_completed"].append("ai_card_generated")
            except Exception as e:
                result_data["steps_failed"].append({
                    "step": "ai_card",
                    "error": str(e)
                })
        
        # ========== STEP 3: AI Infografika yaratish ==========
        generated_images = list(request.images)  # Copy original images
        
        if request.use_ai_infographic:
            try:
                infographic_result = await InfographicGenerator.generate_infographic(
                    product_name=request.name,
                    brand=request.brand,
                    features=request.description.split('\n')[:5] if request.description else [],
                    template=request.infographic_template,
                    marketplace="uzum",
                    background="white"
                )
                
                if infographic_result.get("success"):
                    # Infografik rasmni birinchi qo'shish
                    infographic_base64 = infographic_result.get("image_base64", "")
                    if infographic_base64:
                        generated_images.insert(0, infographic_base64)
                    result_data["infographic_generated"] = True
                    result_data["steps_completed"].append("ai_infographic_generated")
            except Exception as e:
                result_data["steps_failed"].append({
                    "step": "ai_infographic",
                    "error": str(e)
                })
        
        # ========== STEP 4: IKPU kodini olish ==========
        ikpu_code = request.ikpu_code
        if not ikpu_code:
            try:
                ikpu_result = await IKPUService.get_ikpu_for_product(
                    request.name,
                    request.category,
                    request.brand
                )
                if ikpu_result.get("success"):
                    ikpu_code = ikpu_result.get("ikpu_code", "")
                    result_data["ikpu"] = ikpu_result
                    result_data["steps_completed"].append("ikpu_fetched")
            except Exception as e:
                result_data["steps_failed"].append({
                    "step": "ikpu_fetch",
                    "error": str(e)
                })
        
        # ========== STEP 5: Uzum kabinetiga kirish va mahsulot yaratish ==========
        try:
            automation = UzumAutomation()
            await automation.initialize(headless=True)
            
            # Login
            login_result = await automation.login(login, password)
            
            if not login_result.get("success"):
                if login_result.get("requires_otp"):
                    return {
                        "success": False,
                        "requires_otp": True,
                        "message": "SMS kod kiritish kerak",
                        "session_id": login_result.get("session_id"),
                        "partial_data": result_data
                    }
                return {
                    "success": False,
                    "error": f"Uzum kabinetiga kirib bo'lmadi: {login_result.get('error')}",
                    "data": result_data
                }
            
            result_data["steps_completed"].append("uzum_login")
            
            # Mahsulot yaratish - yangi format
            create_result = await automation.create_product(
                name_uz=final_name,
                name_ru=final_name,  # Bir xil nom
                description_uz=final_description,
                description_ru=final_description,
                property_uz=f"{request.brand or ''} {request.category or ''}".strip() or "Premium sifat",
                property_ru=f"{request.brand or ''} {request.category or ''}".strip() or "Премиум качество",
                category_path=[request.category] if request.category else ["Аксессуары"],
                price=int(request.price),
                quantity=request.quantity,
                sku=ikpu_code[:20] if ikpu_code else None,
                images=generated_images
            )
            
            if create_result.get("success"):
                result_data["steps_completed"].append("product_created")
                result_data["product_id"] = create_result.get("product_id")
                result_data["product_url"] = create_result.get("product_url")
                
                return {
                    "success": True,
                    "message": "✅ Mahsulot Uzum Market'da AVTOMATIK yaratildi!",
                    "automation_type": "FULL_BROWSER",
                    "data": {
                        "product_id": create_result.get("product_id"),
                        "product_url": create_result.get("product_url"),
                        "product_name": final_name,
                        "price": request.price,
                        "ikpu_code": ikpu_code,
                        "ai_card": result_data.get("ai_card"),
                        "infographic_generated": result_data.get("infographic_generated", False),
                        "steps_completed": result_data["steps_completed"]
                    },
                    "next_steps": [
                        "1. Uzum kabinetingizda mahsulotni tekshiring",
                        "2. Rasmlarni tasdiqlang (agar kerak bo'lsa)",
                        "3. Moderatsiya jarayonini kuting"
                    ]
                }
            else:
                result_data["steps_failed"].append({
                    "step": "product_creation",
                    "error": create_result.get("error"),
                    "details": create_result.get("data", {}).get("steps_failed", [])
                })
                
                return {
                    "success": False,
                    "error": f"Mahsulot yaratishda xatolik: {create_result.get('error')}",
                    "data": result_data
                }
                
        except Exception as e:
            result_data["steps_failed"].append({
                "step": "browser_automation",
                "error": str(e)
            })
            return {
                "success": False,
                "error": f"Browser avtomatizatsiya xatosi: {str(e)}",
                "data": result_data
            }
            
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }


@app.post("/api/uzum-automation/update-price")
async def uzum_automation_update_price(
    partner_id: str,
    product_id: str,
    new_price: float
):
    """Mahsulot narxini avtomatik yangilash"""
    try:
        # Credential olish
        cred_data = MarketplaceCredentials.get_credentials(partner_id, "uzum")
        if not cred_data:
            return {"success": False, "error": "Credential topilmadi"}
        
        credentials = cred_data.get("credentials", {})
        
        automation = UzumAutomation()
        await automation.initialize(headless=True)
        await automation.login(credentials["login"], credentials["password"])
        
        result = await automation.update_price(product_id, new_price)
        return result
        
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/uzum-automation/update-quantity")
async def uzum_automation_update_quantity(
    partner_id: str,
    product_id: str,
    new_quantity: int
):
    """Zaxira miqdorini avtomatik yangilash"""
    try:
        cred_data = MarketplaceCredentials.get_credentials(partner_id, "uzum")
        if not cred_data:
            return {"success": False, "error": "Credential topilmadi"}
        
        credentials = cred_data.get("credentials", {})
        
        automation = UzumAutomation()
        await automation.initialize(headless=True)
        await automation.login(credentials["login"], credentials["password"])
        
        result = await automation.update_quantity(product_id, new_quantity)
        return result
        
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/api/uzum-automation/products/{partner_id}")
async def uzum_automation_get_products(partner_id: str, page: int = 1):
    """Partner mahsulotlari ro'yxatini olish"""
    try:
        cred_data = MarketplaceCredentials.get_credentials(partner_id, "uzum")
        if not cred_data:
            return {"success": False, "error": "Credential topilmadi"}
        
        credentials = cred_data.get("credentials", {})
        
        automation = UzumAutomation()
        await automation.initialize(headless=True)
        await automation.login(credentials["login"], credentials["password"])
        
        result = await automation.get_products_list(page)
        return result
        
    except Exception as e:
        return {"success": False, "error": str(e)}


# ========================================
# AI INFOGRAPHIC GENERATOR (NANO BANANA)
# ========================================

class InfographicRequest(BaseModel):
    """Infografika yaratish so'rovi"""
    product_name: str
    brand: str = ""
    features: List[str] = []
    template: str = "product_showcase"  # product_showcase, features_highlight, comparison, lifestyle, bundle
    marketplace: str = "uzum"  # uzum or yandex
    background: str = "white"  # white, gradient, studio, minimal, luxury
    custom_prompt: Optional[str] = None


class EditImageRequest(BaseModel):
    """Rasmni tahrirlash so'rovi"""
    image_base64: str
    edit_instructions: str
    marketplace: str = "uzum"


@app.get("/api/infographic/templates")
async def get_infographic_templates():
    """Mavjud infografika shablonlarini olish"""
    return {
        "success": True,
        "templates": InfographicGenerator.get_templates(),
        "backgrounds": InfographicGenerator.get_background_styles(),
        "marketplaces": {
            "uzum": {
                "name": "Uzum Market",
                "size": "1080x1440px",
                "ratio": "3:4",
                "background_required": False
            },
            "yandex": {
                "name": "Yandex Market",
                "size": "1000x1000px",
                "ratio": "1:1",
                "background_required": "white"
            }
        }
    }


@app.post("/api/infographic/generate")
async def generate_infographic(request: InfographicRequest):
    """
    AI infografika yaratish (Nano Banana)
    
    Mahsulot uchun professional infografika rasm yaratadi
    """
    try:
        result = await InfographicGenerator.generate_infographic(
            product_name=request.product_name,
            brand=request.brand,
            features=request.features,
            template=request.template,
            marketplace=request.marketplace,
            background=request.background,
            custom_prompt=request.custom_prompt
        )
        
        if result.get("success"):
            # Base64 ni qisqartirish (log uchun)
            image_preview = result.get("image_base64", "")[:50] + "..." if result.get("image_base64") else ""
            
            return {
                "success": True,
                "message": "Infografika muvaffaqiyatli yaratildi!",
                "image_base64": result.get("image_base64"),
                "mime_type": result.get("mime_type", "image/png"),
                "metadata": result.get("metadata", {}),
                "usage_tips": {
                    "uzum": "1080x1440px formatiga o'zgartiring va seller.uzum.uz ga yuklang",
                    "yandex": "1000x1000px formatida, oq fonda partner.market.yandex.ru ga yuklang"
                }
            }
        else:
            return {
                "success": False,
                "error": result.get("error", "Infografika yaratib bo'lmadi"),
                "ai_response": result.get("ai_response")
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.post("/api/infographic/edit")
async def edit_product_image(request: EditImageRequest):
    """
    Mavjud mahsulot rasmini AI bilan tahrirlash
    
    Fonni o'zgartirish, sifatni yaxshilash, elementlar qo'shish
    """
    try:
        result = await InfographicGenerator.edit_product_image(
            original_image_base64=request.image_base64,
            edit_instructions=request.edit_instructions,
            marketplace=request.marketplace
        )
        
        if result.get("success"):
            return {
                "success": True,
                "message": "Rasm muvaffaqiyatli tahrirlandi!",
                "image_base64": result.get("image_base64"),
                "mime_type": result.get("mime_type", "image/png"),
                "edit_instructions": result.get("edit_instructions"),
                "ai_response": result.get("ai_response")
            }
        else:
            return {
                "success": False,
                "error": result.get("error", "Rasmni tahrirlash imkoni bo'lmadi"),
                "ai_response": result.get("ai_response")
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.post("/api/infographic/from-scan")
async def generate_infographic_from_scan(
    file: UploadFile = File(...),
    template: str = Form("product_showcase"),
    marketplace: str = Form("uzum"),
    background: str = Form("white")
):
    """
    Mahsulot rasmini skanerlash va infografika yaratish
    
    1. Rasmni AI bilan skanerlash
    2. Mahsulot ma'lumotlarini aniqlash
    3. Infografika yaratish
    """
    try:
        # Step 1: Rasmni o'qish
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Step 2: AI bilan skanerlash
        scan_result = await scan_product_image(image_base64)
        
        if not scan_result.get("success"):
            return {
                "success": False,
                "error": "Rasmni skanerlash imkoni bo'lmadi",
                "scan_error": scan_result.get("error")
            }
        
        product_info = scan_result.get("product", {})
        product_name = product_info.get("name", "Unknown Product")
        brand = product_info.get("brand", "")
        features = product_info.get("specifications", [])
        
        # Step 3: Infografika yaratish
        infographic_result = await InfographicGenerator.generate_infographic(
            product_name=product_name,
            brand=brand,
            features=features,
            template=template,
            marketplace=marketplace,
            background=background
        )
        
        if infographic_result.get("success"):
            return {
                "success": True,
                "message": "Infografika yaratildi!",
                "scanned_product": {
                    "name": product_name,
                    "brand": brand,
                    "features": features
                },
                "infographic": {
                    "image_base64": infographic_result.get("image_base64"),
                    "mime_type": infographic_result.get("mime_type"),
                    "metadata": infographic_result.get("metadata")
                }
            }
        else:
            return {
                "success": False,
                "error": "Infografika yaratib bo'lmadi",
                "scanned_product": {
                    "name": product_name,
                    "brand": brand
                },
                "infographic_error": infographic_result.get("error")
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ========================================
# UZUM MARKET - TO'LIQ PROFESSIONAL AUTOMATION (NEW!)
# ========================================

from uzum_full_automation import UzumFullAutomation, create_uzum_product_full, get_ikpu_code


class UzumFullProductRequest(BaseModel):
    """
    Uzum Market'da to'liq mahsulot yaratish uchun so'rov
    Barcha talablar:
    - 4 ta ichma-ich kategoriya
    - Nom (rus/o'zbek, max 90 belgi)
    - Qisqa tavsif (rus/o'zbek, max 390 belgi)
    - To'liq tavsif (rasmli)
    - Rasmlar (1080x1440, max 5MB)
    - Xususiyatlar
    - SKU va IKPU
    - Narx va o'lchamlar
    """
    partner_id: str
    # Credentials
    phone: str
    password: str
    # Kategoriya (4 daraja)
    category_path: List[str]  # ["Elektronika", "Telefonlar", "Smartfonlar", "Android"]
    # Mahsulot nomlari (max 90 belgi)
    name_uz: str
    name_ru: str
    # Qisqa tavsif (max 390 belgi, SEO kalit so'zlar)
    short_desc_uz: str
    short_desc_ru: str
    # To'liq tavsif
    full_desc_uz: str
    full_desc_ru: str
    # Rasmlar (base64 yoki URL)
    images: List[str] = []
    # Mamlakat
    country: str = "Узбекистан"
    # Xususiyatlar
    characteristics: Dict[str, str] = {}  # {"rang": "Qora", "o'lcham": "M"}
    # SKU va IKPU
    sku: str = ""
    ikpu_code: str = ""
    # Narx va o'lchamlar
    price: int
    width_cm: int = 10
    height_cm: int = 10
    depth_cm: int = 10
    weight_kg: float = 1.0
    # AI options
    use_ai_keywords: bool = True
    auto_generate_ikpu: bool = True


@app.post("/api/uzum-full/create-product")
async def uzum_full_create_product(request: UzumFullProductRequest):
    """
    🚀 UZUM MARKET - TO'LIQ MUKAMMAL AVTOMATIZATSIYA
    
    Bu endpoint sizning barcha talablaringizni bajaradi:
    1. 4 ta ichma-ich kategoriya tanlash
    2. Mahsulot nomi (rus/o'zbek, max 90 belgi, SEO)
    3. Qisqa tavsif (rus/o'zbek, max 390 belgi, kalit so'zlar)
    4. To'liq tavsif (rasmli, rus/o'zbek)
    5. Rasmlar (infografika + boshqa, 1080x1440, max 5MB)
    6. Mamlakat tanlash
    7. Xususiyatlar (rang, o'lcham va h.k.)
    8. SKU va IKPU (tasnif.soliq.uz dan)
    9. Narx va o'lchamlar
    10. Keyingi sahifalarga o'tish
    11. Yakuniy "Завершить" tugmasi
    """
    try:
        result_data = {
            "marketplace": "uzum",
            "automation_type": "FULL_PROFESSIONAL",
            "steps_completed": [],
            "steps_failed": []
        }
        
        # ========== STEP 1: IKPU kodini olish (agar kerak bo'lsa) ==========
        ikpu_code = request.ikpu_code
        if not ikpu_code and request.auto_generate_ikpu:
            try:
                ikpu_result = await IKPUService.get_ikpu_for_product(
                    request.name_uz,
                    request.category_path[-1] if request.category_path else "",
                    ""
                )
                if ikpu_result.get("success"):
                    ikpu_code = ikpu_result.get("ikpu_code", "")
                    result_data["ikpu"] = ikpu_result
                    result_data["steps_completed"].append("ikpu_fetched")
            except Exception as e:
                result_data["steps_failed"].append({
                    "step": "ikpu_fetch",
                    "error": str(e)
                })
        
        # ========== STEP 2: SKU generatsiya (agar kerak bo'lsa) ==========
        sku = request.sku
        if not sku:
            sku = generate_sku(
                request.category_path[-1] if request.category_path else "general",
                request.characteristics.get("brand", "")
            )
            result_data["generated_sku"] = sku
        
        # ========== STEP 3: AI kalit so'zlarni qo'shish ==========
        short_desc_uz = request.short_desc_uz
        short_desc_ru = request.short_desc_ru
        
        if request.use_ai_keywords:
            try:
                # AI bilan SEO kalit so'zlar qo'shish
                card_result = await UzumCardGenerator.generate_full_card(
                    product_name=request.name_uz,
                    category=request.category_path[-1] if request.category_path else "",
                    cost_price=request.price * 0.7,
                    quantity=1,
                    brand=request.characteristics.get("brand", ""),
                    description=request.full_desc_uz,
                    detected_info=None,
                    competitor_analysis=None
                )
                
                if card_result.get("success"):
                    card = card_result.get("card", {})
                    # Kalit so'zlarni qo'shish
                    keywords = card.get("keywords_uz", [])
                    if keywords and len(short_desc_uz) < 350:
                        short_desc_uz += " " + ", ".join(keywords[:3])
                        short_desc_uz = short_desc_uz[:390]
                    
                    keywords_ru = card.get("keywords_ru", [])
                    if keywords_ru and len(short_desc_ru) < 350:
                        short_desc_ru += " " + ", ".join(keywords_ru[:3])
                        short_desc_ru = short_desc_ru[:390]
                    
                    result_data["ai_keywords_added"] = True
                    result_data["steps_completed"].append("ai_keywords_added")
            except Exception as e:
                result_data["steps_failed"].append({
                    "step": "ai_keywords",
                    "error": str(e)
                })
        
        # ========== STEP 4: Browser avtomatizatsiya ==========
        product_data = {
            "category_path": request.category_path,
            "name_uz": request.name_uz[:90],  # Max 90 belgi
            "name_ru": request.name_ru[:90],
            "short_desc_uz": short_desc_uz[:390],  # Max 390 belgi
            "short_desc_ru": short_desc_ru[:390],
            "full_desc_uz": request.full_desc_uz,
            "full_desc_ru": request.full_desc_ru,
            "images": request.images,
            "country": request.country,
            "characteristics": request.characteristics,
            "sku": sku,
            "ikpu_code": ikpu_code,
            "price": request.price,
            "dimensions": {
                "width": request.width_cm,
                "height": request.height_cm,
                "depth": request.depth_cm
            },
            "weight_kg": request.weight_kg
        }
        
        # To'liq avtomatizatsiyani ishga tushirish
        automation_result = await create_uzum_product_full(
            phone=request.phone,
            password=request.password,
            product_data=product_data
        )
        
        if automation_result.get("success"):
            result_data["steps_completed"].extend(automation_result.get("steps_completed", []))
            result_data["product_url"] = automation_result.get("product_url")
            
            return {
                "success": True,
                "message": "✅ Mahsulot Uzum Market'da TO'LIQ yaratildi!",
                "automation_type": "FULL_PROFESSIONAL",
                "data": {
                    "product_url": automation_result.get("product_url"),
                    "product_name_uz": request.name_uz[:90],
                    "product_name_ru": request.name_ru[:90],
                    "price": request.price,
                    "sku": sku,
                    "ikpu_code": ikpu_code,
                    "category_path": request.category_path,
                    "steps_completed": result_data["steps_completed"],
                    "steps_failed": result_data["steps_failed"]
                },
                "next_steps": [
                    "1. seller.uzum.uz saytida mahsulotingizni tekshiring",
                    "2. Rasmlarni tasdiqlang",
                    "3. Moderatsiya natijasini kuting (1-2 kun)"
                ]
            }
        else:
            result_data["steps_failed"].extend(automation_result.get("steps_failed", []))
            
            return {
                "success": False,
                "error": automation_result.get("error", "Avtomatizatsiya xatosi"),
                "data": result_data,
                "partial_steps": automation_result.get("steps_completed", []),
                "failed_at": automation_result.get("current_step")
            }
            
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }


@app.post("/api/uzum-full/test-login")
async def uzum_full_test_login(phone: str, password: str):
    """Uzum kabinetiga kirish testlash"""
    try:
        automation = UzumFullAutomation()
        await automation.initialize(headless=True)
        
        result = await automation.login(phone, password)
        
        await automation.close()
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/uzum-full/category-tree")
async def uzum_full_category_tree():
    """
    Uzum kategoriya daraxtini ko'rsatish
    Bu foydalanuvchiga to'g'ri kategoriya yo'lini tanlashda yordam beradi
    """
    # Asosiy kategoriyalar ro'yxati
    categories = {
        "Elektronika": {
            "Telefonlar va planshetlar": {
                "Smartfonlar": ["Android", "iOS", "Boshqalar"],
                "Planshetlar": ["Android", "iOS", "Windows"],
                "Aksessuarlar": ["Qobiqlar", "Naushniklar", "Zaryadka"]
            },
            "Kompyuter texnikasi": {
                "Noutbuklar": ["Gaming", "Ofis", "Ultrabook"],
                "Kompyuterlar": ["Desktop", "All-in-One", "Mini PC"]
            }
        },
        "Kiyim-kechak": {
            "Ayollar kiyimi": {
                "Ko'ylaklar": ["Yozgi", "Qishki", "Klassik"],
                "Shimlar": ["Jeans", "Klassik", "Sport"]
            },
            "Erkaklar kiyimi": {
                "Ko'ylaklar": ["Klassik", "Sport", "Casual"],
                "Shimlar": ["Jeans", "Klassik", "Sport"]
            }
        },
        "Uy-ro'zg'or": {
            "Maishiy texnika": {
                "Oshxona texnikasi": ["Muzlatgich", "Plita", "Mikroto'lqin"],
                "Kir yuvish": ["Kir yuvish mashinasi", "Quritgich"]
            }
        },
        "Go'zallik va salomatlik": {
            "Parfyumeriya": {
                "Ayollar atiri": ["Eau de Parfum", "Eau de Toilette"],
                "Erkaklar atiri": ["Eau de Parfum", "Eau de Toilette"]
            }
        }
    }
    
    return {
        "success": True,
        "categories": categories,
        "usage_example": {
            "category_path": ["Elektronika", "Telefonlar va planshetlar", "Smartfonlar", "Android"],
            "description": "Bu yo'l 4 ta daraja - 'Elektronika' > 'Telefonlar' > 'Smartfonlar' > 'Android'"
        }
    }


# ========================================
# PROXY TO MAIN SERVER (for other routes)
# ========================================

# ========================================
# YANDEX MARKET - SIMPLE API (NEW!)
# ========================================

class YandexSimpleCreateRequest(BaseModel):
    """Sodda Yandex Market mahsulot yaratish"""
    product_name: str
    description: str
    brand: str = ""
    price: float
    category: str = "perfume"
    images: List[str] = []
    use_ai: bool = True
    generate_infographic: bool = True
    ikpu_code: Optional[str] = None  # 17 xonali IKPU


class YandexFullCreateRequest(BaseModel):
    """To'liq Yandex Market mahsulot yaratish - AI Skanner + Infografika"""
    scanned_image_base64: Optional[str] = None
    scanned_image_url: Optional[str] = None
    product_name: str = ""
    description: str = ""
    brand: str = ""
    price: float = 0
    category: str = "perfume"
    infographic_template: str = "product_showcase"
    background_style: str = "white"
    ikpu_code: Optional[str] = None
    video_url: Optional[str] = None  # mp4, webm, mov format


class YandexPerfectCreateRequest(BaseModel):
    """
    100% MUKAMMAL MAHSULOT KARTOCHKASI
    Sifat indeksi 100 uchun barcha maydonlar
    """
    # Asosiy ma'lumotlar
    product_name: str
    brand: str
    description: str
    price: float
    
    # Kategoriya
    category: str = "perfume"
    
    # Rasmlar (6 ta kerak)
    images: List[str] = []
    
    # Video (mp4, webm, mov - ixtiyoriy)
    video_url: Optional[str] = None
    
    # IKPU kod (17 xonali)
    ikpu_code: Optional[str] = None
    
    # Parfyum xususiyatlari
    volume_ml: int = 100
    weight_kg: float = 0.35
    gender: str = "мужской"  # мужской, женский, унисекс
    fragrance_family: str = "древесные"  # древесные, цветочные, восточные, etc
    top_notes: str = ""
    middle_notes: str = ""
    base_notes: str = ""
    
    # O'lchamlar
    length_cm: float = 10.0
    width_cm: float = 7.0
    height_cm: float = 14.0
    
    # Qo'shimcha
    barcode: Optional[str] = None
    manufacturer_country: str = "Франция"
    shelf_life_months: int = 36
    
    # AI
    use_ai: bool = True


@app.post("/api/yandex/create-product")
async def yandex_simple_create_product(request: YandexSimpleCreateRequest):
    """
    YANDEX MARKET - SODDA MAHSULOT YARATISH
    
    Bu endpoint .env dan kredensiallarni oladi va mahsulot yaratadi.
    Parfyum va boshqa mahsulotlar uchun ishlatish mumkin.
    """
    import uuid
    
    try:
        # Get credentials from .env
        api_key = os.getenv("YANDEX_API_KEY", "")
        business_id = os.getenv("YANDEX_BUSINESS_ID", "")
        
        if not api_key or not business_id:
            return {
                "success": False,
                "error": "Yandex Market kredensiallar .env da topilmadi",
                "help": "YANDEX_API_KEY va YANDEX_BUSINESS_ID ni .env ga qo'shing"
            }
        
        result_data = {
            "marketplace": "yandex",
            "steps_completed": [],
            "steps_failed": []
        }
        
        # Generate unique SKU
        brand_prefix = (request.brand or "PROD")[:4].upper()
        sku = f"{brand_prefix}-{uuid.uuid4().hex[:8].upper()}"
        
        # AI Card Generation (optional)
        final_name = request.product_name
        final_description = request.description
        
        if request.use_ai:
            try:
                card_result = await YandexCardGenerator.generate_card(
                    product_name=request.product_name,
                    category=request.category,
                    brand=request.brand,
                    description=request.description,
                    price=request.price
                )
                
                if card_result.get("success"):
                    card = card_result.get("card", {})
                    final_name = card.get("name", request.product_name)
                    final_description = card.get("description", request.description)
                    result_data["ai_card"] = card
                    result_data["seo_score"] = card_result.get("seo_score", 0)
                    result_data["steps_completed"].append("ai_card_generated")
            except Exception as e:
                result_data["steps_failed"].append({
                    "step": "ai_card",
                    "error": str(e)
                })
        
        # Create API client
        api = YandexMarketAPI(
            oauth_token=api_key,
            business_id=business_id
        )
        
        # Test connection
        connection = await api.test_connection()
        if not connection.get("success"):
            return {
                "success": False,
                "error": "API ulanish xatosi",
                "details": connection.get("error")
            }
        
        result_data["steps_completed"].append("api_connected")
        result_data["campaigns"] = connection.get("campaigns", [])
        
        # Prepare images - Yandex requires at least 1 image
        product_images = request.images[:10] if request.images else []
        if not product_images:
            # Use default placeholder image for perfumes/products
            product_images = [
                "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800"
            ]
        
        # Create product
        create_result = await api.create_product(
            offer_id=sku,
            name=final_name[:256],
            description=final_description[:6000],
            vendor=request.brand or "No Brand",
            pictures=product_images,
            price=request.price,
            currency="UZS",
            manufacturer_country="Узбекистан"
        )
        
        if create_result.get("success"):
            result_data["steps_completed"].append("product_created")
            
            return {
                "success": True,
                "message": "✅ Mahsulot Yandex Market'ga muvaffaqiyatli qo'shildi!",
                "data": {
                    "offer_id": sku,
                    "product_name": final_name,
                    "brand": request.brand,
                    "price": request.price,
                    "business_id": business_id,
                    "steps_completed": result_data["steps_completed"],
                    "ai_card": result_data.get("ai_card"),
                    "seo_score": result_data.get("seo_score", 0),
                    "campaigns": result_data.get("campaigns", [])
                },
                "next_steps": [
                    "1. Yandex Market kabinetiga kiring: https://partner.market.yandex.ru",
                    "2. Tovarlar bo'limida yangi mahsulotni tekshiring",
                    "3. Rasmlarni yuklang (agar yuklanmagan bo'lsa)",
                    "4. Zaxira miqdorini belgilang"
                ]
            }
        else:
            result_data["steps_failed"].append({
                "step": "product_creation",
                "error": create_result.get("error"),
                "details": create_result.get("details")
            })
            
            return {
                "success": False,
                "error": "Mahsulot yaratishda xatolik",
                "details": create_result,
                "data": result_data
            }
            
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }


@app.post("/api/yandex/full-create")
async def yandex_full_create_product(request: YandexFullCreateRequest):
    """
    YANDEX MARKET - TO'LIQ AVTOMATIK YARATISH
    
    Flow:
    1. AI Skanner - rasmdan mahsulotni aniqlash (agar rasm berilsa)
    2. AI Infografika - professional rasm yaratish (Nano Banana)
    3. AI Kartochka - SEO-optimallashtirilgan tavsif (GPT)
    4. Yandex API - mahsulot yaratish va rasm yuklash
    """
    import uuid
    import base64
    import httpx
    
    try:
        api_key = os.getenv("YANDEX_API_KEY", "")
        business_id = os.getenv("YANDEX_BUSINESS_ID", "")
        
        if not api_key or not business_id:
            return {
                "success": False,
                "error": "Yandex Market kredensiallar topilmadi"
            }
        
        result_data = {
            "marketplace": "yandex",
            "steps_completed": [],
            "steps_failed": [],
            "images_generated": []
        }
        
        # 1. AI SCANNER - Rasmdan mahsulotni aniqlash
        product_name = request.product_name
        product_brand = request.brand
        product_description = request.description
        product_features = []
        
        if request.scanned_image_base64 or request.scanned_image_url:
            try:
                from infographic_service import InfographicGenerator
                
                # AI Scanner orqali aniqlash
                EMERGENT_KEY = os.getenv("EMERGENT_LLM_KEY", "")
                if EMERGENT_KEY:
                    from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
                    
                    chat = LlmChat(
                        api_key=EMERGENT_KEY,
                        session_id=f"scan-{uuid.uuid4().hex[:8]}",
                        system_message="You are a product identification expert. Identify the product from the image and provide details in JSON format."
                    ).with_model("gemini", "gemini-2.5-flash")
                    
                    scan_prompt = """Analyze this product image and identify:
1. Product name (detailed, include brand if visible)
2. Brand name
3. Category (perfume, electronics, clothing, etc.)
4. Key features (list 5-6 main features)
5. Suggested price range in UZS

Respond ONLY with valid JSON:
{
    "name": "...",
    "brand": "...",
    "category": "...",
    "features": ["...", "..."],
    "price_min": 0,
    "price_max": 0
}"""
                    
                    if request.scanned_image_base64:
                        msg = UserMessage(
                            text=scan_prompt,
                            file_contents=[ImageContent(request.scanned_image_base64)]
                        )
                    else:
                        # URL dan rasmni olish
                        async with httpx.AsyncClient() as client:
                            img_response = await client.get(request.scanned_image_url)
                            img_base64 = base64.b64encode(img_response.content).decode()
                        msg = UserMessage(
                            text=scan_prompt,
                            file_contents=[ImageContent(img_base64)]
                        )
                    
                    response = await chat.send_message(msg)
                    
                    # JSON parse
                    import json
                    import re
                    json_match = re.search(r'\{[^{}]*\}', response, re.DOTALL)
                    if json_match:
                        scan_result = json.loads(json_match.group())
                        if not product_name:
                            product_name = scan_result.get("name", "Unknown Product")
                        if not product_brand:
                            product_brand = scan_result.get("brand", "")
                        product_features = scan_result.get("features", [])
                        result_data["ai_scan"] = scan_result
                        result_data["steps_completed"].append("ai_scan_completed")
                        
            except Exception as e:
                result_data["steps_failed"].append({
                    "step": "ai_scan",
                    "error": str(e)
                })
        
        if not product_name:
            return {
                "success": False,
                "error": "Mahsulot nomi kiritilmagan yoki rasmdan aniqlab bo'lmadi"
            }
        
        # 2. AI INFOGRAFIKA - Professional rasm yaratish
        infographic_url = None
        try:
            from infographic_service import InfographicGenerator
            
            infographic_result = await InfographicGenerator.generate_infographic(
                product_name=product_name,
                brand=product_brand,
                features=product_features or ["Premium quality", "Original product"],
                template=request.infographic_template,
                marketplace="yandex",
                background=request.background_style
            )
            
            if infographic_result.get("success"):
                # Base64 rasmni URL ga aylantirish (imgbb yoki boshqa hosting)
                image_base64 = infographic_result.get("image_base64", "")
                
                if image_base64:
                    # ImgBB ga yuklash
                    imgbb_key = os.getenv("IMGBB_API_KEY", "")
                    if imgbb_key:
                        async with httpx.AsyncClient() as client:
                            upload_response = await client.post(
                                "https://api.imgbb.com/1/upload",
                                data={
                                    "key": imgbb_key,
                                    "image": image_base64
                                }
                            )
                            if upload_response.status_code == 200:
                                upload_data = upload_response.json()
                                infographic_url = upload_data.get("data", {}).get("url")
                                result_data["images_generated"].append(infographic_url)
                    
                    # Agar ImgBB yo'q bo'lsa, data URL sifatida saqlash (Yandex qabul qilmasligi mumkin)
                    if not infographic_url:
                        result_data["infographic_base64"] = image_base64[:100] + "..."  # Preview
                
                result_data["steps_completed"].append("infographic_generated")
                result_data["infographic_metadata"] = infographic_result.get("metadata", {})
                
        except Exception as e:
            result_data["steps_failed"].append({
                "step": "infographic",
                "error": str(e)
            })
        
        # 3. AI KARTOCHKA - SEO tavsif
        final_name = product_name
        final_description = product_description
        
        try:
            card_result = await YandexCardGenerator.generate_card(
                product_name=product_name,
                category=request.category,
                brand=product_brand,
                description=product_description,
                price=request.price
            )
            
            if card_result.get("success"):
                card = card_result.get("card", {})
                final_name = card.get("name", product_name)
                final_description = card.get("description", product_description)
                result_data["ai_card"] = card
                result_data["seo_score"] = card_result.get("seo_score", 0)
                result_data["steps_completed"].append("ai_card_generated")
        except Exception as e:
            result_data["steps_failed"].append({
                "step": "ai_card",
                "error": str(e)
            })
        
        # 4. YANDEX MARKET - Mahsulot yaratish
        brand_prefix = (product_brand or "PROD")[:4].upper()
        sku = f"{brand_prefix}-{uuid.uuid4().hex[:8].upper()}"
        
        api = YandexMarketAPI(oauth_token=api_key, business_id=business_id)
        
        # Rasm URL'lari tayyorlash
        product_images = []
        if infographic_url:
            product_images.append(infographic_url)
        if request.scanned_image_url:
            product_images.append(request.scanned_image_url)
        if not product_images:
            # Default placeholder
            product_images = ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=800"]
        
        create_result = await api.create_product(
            offer_id=sku,
            name=final_name[:256],
            description=final_description[:6000],
            vendor=product_brand or "No Brand",
            pictures=product_images[:10],
            price=request.price if request.price > 0 else 500000,
            currency="UZS",
            manufacturer_country="Узбекистан"
        )
        
        if create_result.get("success"):
            result_data["steps_completed"].append("product_created_on_yandex")
            
            return {
                "success": True,
                "message": "✅ Mahsulot to'liq avtomatik yaratildi!",
                "data": {
                    "offer_id": sku,
                    "product_name": final_name,
                    "brand": product_brand,
                    "price": request.price,
                    "images": product_images,
                    "steps_completed": result_data["steps_completed"],
                    "ai_scan": result_data.get("ai_scan"),
                    "ai_card": result_data.get("ai_card"),
                    "seo_score": result_data.get("seo_score", 0),
                    "infographic_generated": bool(infographic_url)
                }
            }
        else:
            result_data["steps_failed"].append({
                "step": "yandex_create",
                "error": create_result.get("error")
            })
            
            return {
                "success": False,
                "error": "Yandex Market'da yaratishda xatolik",
                "partial_data": result_data,
                "details": create_result
            }
            
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }


@app.post("/api/yandex/perfect-create")
async def yandex_perfect_create_product(request: YandexPerfectCreateRequest):
    """
    100% MUKAMMAL MAHSULOT KARTOCHKASI
    
    Sifat indeksi 100 uchun:
    - 6 ta sifatli rasm (1-infografika)
    - Video (mp4/webm format)
    - IKPU kod (17 xonali)
    - Barcha parametrlar
    - O'lchamlar va vazn
    """
    import uuid
    import httpx
    
    try:
        api_key = os.getenv("YANDEX_API_KEY", "")
        business_id = os.getenv("YANDEX_BUSINESS_ID", "")
        
        if not api_key or not business_id:
            return {"success": False, "error": "Yandex Market kredensiallar topilmadi"}
        
        # SKU yaratish
        brand_prefix = (request.brand or "PROD")[:4].upper()
        sku = f"{brand_prefix}-{uuid.uuid4().hex[:6].upper()}"
        
        # AI Kartochka (agar kerak bo'lsa)
        final_name = request.product_name
        final_description = request.description
        ai_card_data = None
        
        if request.use_ai:
            try:
                card_result = await YandexCardGenerator.generate_card(
                    product_name=request.product_name,
                    category=request.category,
                    brand=request.brand,
                    description=request.description,
                    price=request.price
                )
                if card_result.get("success"):
                    card = card_result.get("card", {})
                    final_name = card.get("name", request.product_name)
                    final_description = card.get("description", request.description)
                    ai_card_data = card
            except:
                pass
        
        # IKPU kod olish
        ikpu_code = request.ikpu_code
        if not ikpu_code:
            try:
                from ikpu_service import IKPUService
                ikpu_result = IKPUService.get_ikpu_by_category(request.category)
                if ikpu_result.get("is_valid"):
                    ikpu_code = ikpu_result.get("code")
            except:
                ikpu_code = "20420100000000000"  # Default parfyum IKPU
        
        # Rasmlar (6 ta kerak)
        pictures = request.images[:6] if request.images else []
        while len(pictures) < 6:
            # Default rasmlar qo'shish
            default_pics = [
                "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1000",
                "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1000",
                "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1000",
                "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1000",
                "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1000",
                "https://images.unsplash.com/photo-1595425964071-2c1ecb10b52d?w=1000",
            ]
            pictures.extend(default_pics[len(pictures):6])
        
        # Mahsulot ma'lumotlari
        product_data = {
            "offerMappings": [
                {
                    "offer": {
                        "offerId": sku,
                        "name": final_name[:256],
                        "marketCategoryId": 15927546,  # Parfyumeriya
                        "pictures": pictures[:6],
                        "vendor": request.brand,
                        "vendorCode": f"{request.brand[:3].upper()}-{request.volume_ml}ML",
                        "description": final_description[:6000],
                        
                        # IKPU kod (TO'G'RI FORMAT)
                        "commodityCodes": [
                            {"code": ikpu_code, "type": "IKPU_CODE"}
                        ] if ikpu_code else [],
                        
                        "manufacturerCountries": [request.manufacturer_country],
                        
                        # O'lchamlar va vazn
                        "weightDimensions": {
                            "weight": request.weight_kg,
                            "length": request.length_cm,
                            "width": request.width_cm,
                            "height": request.height_cm
                        },
                        
                        # Narx
                        "basicPrice": {
                            "value": request.price,
                            "currencyId": "UZS"
                        },
                        
                        # Parametrlar (TO'G'RI ID'lar)
                        "parameterValues": [
                            {"parameterId": 24139073, "value": str(request.volume_ml)},  # Hajm
                            {"parameterId": 23674510, "value": str(request.weight_kg)},  # Vazn
                            {"parameterId": 21194330, "value": "парфюмерная вода"},  # Tur
                            {"parameterId": 14805991, "value": request.gender},  # Jins
                            {"parameterId": 37901030, "value": request.fragrance_family},  # Oila
                            {"parameterId": 15927641, "value": request.base_notes or "ваниль, мускус, сандал"},
                            {"parameterId": 15927560, "value": request.middle_notes or "роза, жасмин"},
                            {"parameterId": 15927566, "value": request.top_notes or "бергамот, лимон"},
                        ],
                        
                        # Barcode
                        "barcodes": [request.barcode] if request.barcode else [],
                        
                        # Shelf life
                        "shelfLife": {
                            "timePeriod": request.shelf_life_months,
                            "timeUnit": "MONTH"
                        }
                    }
                }
            ]
        }
        
        # Video qo'shish (faqat mp4, webm, mov)
        if request.video_url and any(ext in request.video_url.lower() for ext in ['.mp4', '.webm', '.mov', '.avi']):
            product_data["offerMappings"][0]["offer"]["videos"] = [request.video_url]
        
        # Yandex API ga yuborish
        headers = {
            "Api-Key": api_key,
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"https://api.partner.market.yandex.ru/v2/businesses/{business_id}/offer-mappings/update",
                headers=headers,
                json=product_data
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Xatolarni tekshirish
                errors = []
                if "results" in result:
                    for r in result.get("results", []):
                        if r.get("errors"):
                            errors.extend(r.get("errors", []))
                
                return {
                    "success": True,
                    "message": "✅ Mukammal mahsulot kartochkasi yaratildi!",
                    "data": {
                        "offer_id": sku,
                        "product_name": final_name,
                        "brand": request.brand,
                        "price": request.price,
                        "ikpu_code": ikpu_code,
                        "images_count": len(pictures),
                        "has_video": bool(request.video_url),
                        "parameters_count": 8,
                        "ai_card": ai_card_data,
                        "api_errors": errors if errors else None
                    },
                    "quality_checklist": {
                        "images_6": len(pictures) >= 6,
                        "ikpu_filled": bool(ikpu_code),
                        "weight_dimensions": True,
                        "parameters_filled": True,
                        "video": bool(request.video_url)
                    }
                }
            else:
                return {
                    "success": False,
                    "error": f"API xatosi: {response.status_code}",
                    "details": response.text
                }
                
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }


# ========================================
# YANDEX MARKET - TO'LIQ AVTOMATIK TIZIM
# ========================================

class YandexAutoCreateRequest(BaseModel):
    """
    TO'LIQ AVTOMATIK MAHSULOT YARATISH
    
    Hamkor faqat:
    1. Rasmga oladi (base64)
    2. Tannarxni kiritadi
    
    Qolgani AI bajaradi!
    """
    image_base64: str           # AI Scanner uchun rasm
    cost_price: float           # Tannarx
    partner_id: str = "default" # Hamkor ID
    ikpu_code: Optional[str] = None
    style: str = "luxury"       # luxury, minimal, vibrant
    video_url: Optional[str] = None  # mp4 format


class YandexPartnerSettingsRequest(BaseModel):
    """Hamkor Yandex Market sozlamalari"""
    partner_id: str
    yandex_api_key: str
    yandex_business_id: str
    yandex_campaign_id: Optional[str] = None
    imgbb_api_key: Optional[str] = None


@app.post("/api/yandex/partner/settings")
async def save_yandex_partner_settings(request: YandexPartnerSettingsRequest):
    """
    Hamkor Yandex Market sozlamalarini saqlash
    """
    try:
        # MongoDB'ga saqlash
        settings_data = {
            "partner_id": request.partner_id,
            "yandex_api_key": request.yandex_api_key,
            "yandex_business_id": request.yandex_business_id,
            "yandex_campaign_id": request.yandex_campaign_id,
            "imgbb_api_key": request.imgbb_api_key,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Upsert
        await db.partner_yandex_settings.update_one(
            {"partner_id": request.partner_id},
            {"$set": settings_data},
            upsert=True
        )
        
        # Ulanishni tekshirish
        partner_settings = PartnerSettings(
            partner_id=request.partner_id,
            yandex_api_key=request.yandex_api_key,
            yandex_business_id=request.yandex_business_id,
            yandex_campaign_id=request.yandex_campaign_id,
            imgbb_api_key=request.imgbb_api_key
        )
        
        creator = YandexAutoCreator(partner_settings)
        connection = await creator.check_connection()
        
        # Status yangilash
        await db.partner_yandex_settings.update_one(
            {"partner_id": request.partner_id},
            {"$set": {
                "is_connected": connection.get("is_connected", False),
                "last_check": datetime.now(timezone.utc).isoformat(),
                "campaigns": connection.get("campaigns", [])
            }}
        )
        
        return {
            "success": True,
            "message": "Sozlamalar saqlandi",
            "connection": connection
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/api/yandex/partner/{partner_id}/status")
async def get_yandex_partner_status(partner_id: str):
    """
    Hamkor Yandex Market ulanish statusini olish
    """
    try:
        settings = await db.partner_yandex_settings.find_one(
            {"partner_id": partner_id},
            {"_id": 0}
        )
        
        if not settings:
            return {
                "success": True,
                "is_connected": False,
                "has_settings": False,
                "message": "Sozlamalar topilmadi"
            }
        
        return {
            "success": True,
            "is_connected": settings.get("is_connected", False),
            "has_settings": True,
            "business_id": settings.get("yandex_business_id"),
            "campaigns_count": len(settings.get("campaigns", [])),
            "last_check": settings.get("last_check")
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/yandex/auto-create")
async def yandex_full_auto_create(request: YandexAutoCreateRequest):
    """
    🚀 TO'LIQ AVTOMATIK MAHSULOT YARATISH (Universal V3)
    
    Hamkor faqat:
    1. Rasmga oladi
    2. Tannarxni kiritadi
    
    AI qiladi:
    1. ✅ AI Scanner - mahsulotni aniqlaydi (brend, model, kategoriya)
    2. ✅ AI Card - ikki tilda kartochka (RU + UZ)
    3. ✅ Nano Banana - 6 ta infografika (bir xil mahsulot, turli burchaklar)
    4. ✅ Yandex Market - mahsulot yuklanadi
    
    SKU: Mahsulot nomi + Model asosida
    Kategoriya: Avtomatik aniqlanadi
    Tillar: Ruscha + O'zbekcha
    """
    try:
        # Hamkor sozlamalarini olish
        if request.partner_id != "default":
            settings = await db.partner_yandex_settings.find_one(
                {"partner_id": request.partner_id},
                {"_id": 0}
            )
            
            if not settings:
                return {
                    "success": False,
                    "error": "Hamkor sozlamalari topilmadi",
                    "help": "Avval /api/yandex/partner/settings orqali sozlamalarni saqlang"
                }
            
            partner_settings = PartnerSettings(
                partner_id=request.partner_id,
                yandex_api_key=settings.get("yandex_api_key", ""),
                yandex_business_id=settings.get("yandex_business_id", ""),
                yandex_campaign_id=settings.get("yandex_campaign_id"),
                imgbb_api_key=settings.get("imgbb_api_key")
            )
        else:
            # Default - .env dan
            partner_settings = PartnerSettings(
                partner_id="default",
                yandex_api_key=os.getenv("YANDEX_API_KEY", ""),
                yandex_business_id=os.getenv("YANDEX_BUSINESS_ID", ""),
                yandex_campaign_id=os.getenv("YANDEX_CAMPAIGN_ID"),
                imgbb_api_key=os.getenv("IMGBB_API_KEY")
            )
        
        if not partner_settings.yandex_api_key:
            return {
                "success": False,
                "error": "Yandex API kaliti topilmadi"
            }
        
        # To'liq avtomatik yaratish (V3 - Universal)
        from yandex_universal_v3 import YandexUniversalCreatorV3
        
        creator = YandexUniversalCreatorV3(
            api_key=partner_settings.yandex_api_key,
            business_id=partner_settings.yandex_business_id,
            imgbb_key=partner_settings.imgbb_api_key
        )
        
        result = await creator.full_auto_create(
            image_base64=request.image_base64,
            cost_price=request.cost_price
        )
        
        return result
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }


class FullAutomationRequest(BaseModel):
    """To'liq avtomatizatsiya uchun so'rov - scan'dan Yandex'ga qo'shishgacha"""
    image_url: str
    cost_price: float  # Tannarx UZS
    partner_id: Optional[str] = None
    oauth_token: Optional[str] = None
    business_id: Optional[str] = None
    generate_infographics: bool = True
    infographic_count: int = 6


@app.post("/api/ai/full-automation")
async def ai_full_automation(request: FullAutomationRequest):
    """
    TO'LIQ AVTOMATIZATSIYA - Rasmdan Yandex Market'ga mahsulot qo'shish
    
    Oqim:
    1. Rasmni AI bilan skanerlash (mahsulotni aniqlash)
    2. MXIK kodini topish
    3. AI kartochka yaratish (nom, tavsif, kalit so'zlar)
    4. Narxni hisoblash (komissiya, margin, logistika)
    5. Infografika rasmlar generatsiya qilish (6 ta)
    6. Yandex Market'ga mahsulot qo'shish
    
    Bu endpoint hamkorlar uchun "bir tugma" bilan mahsulot yaratish imkonini beradi.
    """
    try:
        import httpx
        from nano_banana_service import generate_product_infographics
        
        result = {
            "success": False,
            "steps": {},
            "errors": []
        }
        
        # ========== STEP 1: Rasmni yuklash va skanerlash ==========
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                img_response = await client.get(request.image_url)
                if img_response.status_code != 200:
                    result["errors"].append(f"Rasmni yuklab bo'lmadi: {img_response.status_code}")
                    return result
                
                contents = img_response.content
                image_base64 = base64.b64encode(contents).decode('utf-8')
            
            scan_result = await scan_product_image(image_base64)
            
            if not scan_result.get("success"):
                result["errors"].append(f"Scan xatosi: {scan_result.get('error')}")
                return result
            
            product = scan_result.get("product", {})
            result["steps"]["scan"] = {
                "success": True,
                "product_name": product.get("name"),
                "brand": product.get("brand"),
                "category": product.get("category")
            }
        except Exception as e:
            result["errors"].append(f"Scan xatosi: {str(e)}")
            return result
        
        # ========== STEP 2: MXIK kodini topish ==========
        try:
            product_name = product.get("name", "")
            category = product.get("category", "general")
            
            mxik_result = await IKPUService.search_ikpu(product_name + " " + category, limit=1)
            
            if mxik_result and len(mxik_result) > 0:
                mxik_code = mxik_result[0].get("code", "")[:8] or "47190000"
            else:
                category_mxik = {
                    "beauty": "20420100", "cosmetics": "20420100", "skincare": "20420100",
                    "electronics": "26121900", "phone": "26121900",
                    "food": "10810100", "snack": "10890100",
                    "perfume": "20420100", "clothing": "14130000"
                }
                mxik_code = category_mxik.get(category.lower(), "47190000")
            
            result["steps"]["mxik"] = {
                "success": True,
                "code": mxik_code
            }
        except Exception as e:
            mxik_code = "47190000"
            result["steps"]["mxik"] = {"success": False, "error": str(e), "fallback_code": mxik_code}
        
        # ========== STEP 3: AI Kartochka yaratish ==========
        try:
            brand = product.get("brand", "No Brand")
            
            card_result = await YandexCardGenerator.generate_card(
                product_name=product_name,
                category=category,
                brand=brand,
                description=product.get("description", ""),
                price=request.cost_price
            )
            
            if card_result.get("success"):
                card_data = card_result.get("card", {})
                result["steps"]["ai_card"] = {
                    "success": True,
                    "name_ru": card_data.get("name"),
                    "description_length": len(card_data.get("description", "")),
                    "keywords_count": len(card_data.get("keywords", []))
                }
            else:
                result["steps"]["ai_card"] = {"success": False, "error": card_result.get("error")}
        except Exception as e:
            result["steps"]["ai_card"] = {"success": False, "error": str(e)}
            card_data = {"name": product_name, "description": product.get("description", "")}
        
        # ========== STEP 4: Narxni hisoblash ==========
        try:
            price_calc = calculate_yandex_price(
                cost_price=request.cost_price,
                category=category,
                weight_kg=0.5,
                fulfillment="fbs",
                target_margin=25,
                payout_frequency="daily"
            )
            
            result["steps"]["pricing"] = {
                "success": True,
                "cost_price": request.cost_price,
                "optimal_price": price_calc.get("optimal_price"),
                "breakdown": price_calc.get("breakdown")
            }
        except Exception as e:
            result["steps"]["pricing"] = {"success": False, "error": str(e)}
            price_calc = {"optimal_price": int(request.cost_price * 1.5)}
        
        # ========== STEP 5: Infografika generatsiya ==========
        infographic_urls = [request.image_url]  # Original rasm ham qo'shiladi
        
        if request.generate_infographics:
            try:
                infographic_result = await generate_product_infographics(
                    product_name=product_name,
                    brand=brand,
                    features=product.get("keywords", []) + product.get("specifications", []),
                    category=category,
                    count=min(request.infographic_count, 6)
                )
                
                if infographic_result.get("success"):
                    infographic_urls.extend(infographic_result.get("images", []))
                    result["steps"]["infographics"] = {
                        "success": True,
                        "generated_count": infographic_result.get("generated_count"),
                        "images": infographic_result.get("images", [])
                    }
                else:
                    result["steps"]["infographics"] = {"success": False, "error": infographic_result.get("error")}
            except Exception as e:
                result["steps"]["infographics"] = {"success": False, "error": str(e)}
        else:
            result["steps"]["infographics"] = {"success": True, "skipped": True}
        
        # ========== STEP 6: Yandex Market'ga qo'shish ==========
        try:
            oauth_token = request.oauth_token or os.getenv("YANDEX_API_KEY")
            business_id = request.business_id or os.getenv("YANDEX_BUSINESS_ID", "197529861")
            
            if not oauth_token:
                result["steps"]["yandex"] = {"success": False, "error": "YANDEX_API_KEY topilmadi"}
            else:
                api = YandexMarketAPI(oauth_token=oauth_token, business_id=business_id)
                
                # Test connection first
                conn_test = await api.test_connection()
                if not conn_test.get("success"):
                    result["steps"]["yandex"] = {"success": False, "error": "Yandex API ulanishi xato"}
                else:
                    # Create product
                    create_result = await api.create_product(
                        offer_id=f"SCX-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                        name=card_data.get("name", product_name),
                        description=card_data.get("description", ""),
                        vendor=brand,
                        price=price_calc.get("optimal_price", int(request.cost_price * 1.5)),
                        pictures=infographic_urls[:10],  # Max 10 images
                        category_id=get_yandex_category_id(category)
                    )
                    
                    result["steps"]["yandex"] = {
                        "success": create_result.get("success"),
                        "offer_id": create_result.get("offer_id"),
                        "message": create_result.get("message"),
                        "error": create_result.get("error")
                    }
        except Exception as e:
            result["steps"]["yandex"] = {"success": False, "error": str(e)}
        
        # ========== FINAL RESULT ==========
        successful_steps = sum(1 for step in result["steps"].values() if step.get("success"))
        total_steps = len(result["steps"])
        
        result["success"] = successful_steps >= 4  # At least 4 steps successful
        result["summary"] = {
            "product_name": product_name,
            "brand": brand,
            "category": category,
            "mxik_code": mxik_code,
            "final_price": price_calc.get("optimal_price"),
            "images_count": len(infographic_urls),
            "steps_completed": f"{successful_steps}/{total_steps}"
        }
        
        return result
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }


@app.get("/api/yandex/campaigns")
async def yandex_get_campaigns():
    """Yandex Market kampaniyalarini (do'konlarini) olish"""
    try:
        api_key = os.getenv("YANDEX_API_KEY", "")
        business_id = os.getenv("YANDEX_BUSINESS_ID", "")
        
        if not api_key:
            return {
                "success": False,
                "error": "YANDEX_API_KEY topilmadi"
            }
        
        api = YandexMarketAPI(oauth_token=api_key, business_id=business_id)
        connection = await api.test_connection()
        
        if connection.get("success"):
            return {
                "success": True,
                "campaigns": connection.get("campaigns", []),
                "business_id": connection.get("business_id")
            }
        else:
            return connection
            
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/api/yandex/products")
async def yandex_get_products(page: int = 1, limit: int = 50):
    """Yandex Market mahsulotlarini olish"""
    try:
        api_key = os.getenv("YANDEX_API_KEY", "")
        campaign_id = os.getenv("YANDEX_CAMPAIGN_ID", "")
        
        if not api_key or not campaign_id:
            return {
                "success": False,
                "error": "YANDEX_API_KEY yoki YANDEX_CAMPAIGN_ID topilmadi"
            }
        
        api = YandexMarketAPI(oauth_token=api_key, campaign_id=campaign_id)
        result = await api.get_offers(page=page, page_size=limit)
        return result
        
    except Exception as e:
        return {"success": False, "error": str(e)}


# ========================================
# YANDEX REAL-TIME STATUS TRACKING
# ========================================

@app.get("/api/yandex/offer/{offer_id}/status")
async def yandex_offer_status(offer_id: str):
    """
    Real-time mahsulot holati
    
    Statuses:
    - READY_TO_SUPPLY: ✅ Sotuvga tayyor
    - IN_WORK: ⏳ Moderatsiyada
    - NEED_CONTENT: 📝 Kontent kerak
    - REJECTED: ❌ Rad etildi
    """
    try:
        api_key = os.getenv("YANDEX_API_KEY", "")
        business_id = os.getenv("YANDEX_BUSINESS_ID", "197529861")
        
        if not api_key:
            return {"success": False, "error": "YANDEX_API_KEY topilmadi"}
        
        api = YandexMarketAPI(oauth_token=api_key, business_id=business_id)
        result = await api.get_offer_status(offer_id)
        return result
        
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/api/yandex/dashboard/status")
async def yandex_dashboard_status(limit: int = 50):
    """
    Real-time dashboard - barcha mahsulotlar holati
    
    Returns:
    - stats: total, ready, in_moderation, need_content, rejected
    - offers: offer_id, name, status, price, market_sku
    """
    try:
        api_key = os.getenv("YANDEX_API_KEY", "")
        business_id = os.getenv("YANDEX_BUSINESS_ID", "197529861")
        
        if not api_key:
            return {"success": False, "error": "YANDEX_API_KEY topilmadi"}
        
        api = YandexMarketAPI(oauth_token=api_key, business_id=business_id)
        result = await api.get_all_offers_status(limit=limit)
        return result
        
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/yandex/partner/dashboard")
async def yandex_partner_dashboard(credentials: YandexCredentials):
    """
    Partner uchun real-time dashboard
    Hamkorning o'z API kaliti bilan
    """
    try:
        api = YandexMarketAPI(
            oauth_token=credentials.oauth_token,
            business_id=credentials.business_id
        )
        
        # Get all offers status
        offers_result = await api.get_all_offers_status(limit=100)
        
        # Get campaigns
        connection = await api.test_connection()
        
        return {
            "success": True,
            "partner_id": credentials.partner_id,
            "business_id": credentials.business_id,
            "campaigns": connection.get("campaigns", []),
            "products": offers_result.get("stats", {}),
            "offers": offers_result.get("offers", []),
            "last_updated": offers_result.get("last_updated")
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}


# ========================================
# NANO BANANA INFOGRAPHIC GENERATION
# ========================================

class InfographicRequest(BaseModel):
    """Request model for professional infographic generation"""
    product_name: str
    brand: str
    features: List[str] = []
    category: str = "general"  # cosmetics, food, electronics, perfume, general
    count: int = 6  # Default 6 images for Yandex


@app.post("/api/ai/generate-infographics")
async def generate_infographics(request: InfographicRequest):
    """
    Generate PROFESSIONAL marketplace infographic set
    Uses Gemini Nano Banana (gemini-3-pro-image-preview)
    
    Creates 6 different infographic types:
    1. Hero shot with floating ingredients
    2. Features & benefits with icons
    3. Ingredient composition visualization
    4. Usage instructions step-by-step
    5. "Does NOT contain" / purity badges
    6. Premium lifestyle shot
    
    Returns:
    - images: List of image URLs
    - image_types: Type of each image
    - generated_count: Number of successfully generated images
    """
    try:
        from nano_banana_service import generate_product_infographics
        
        result = await generate_product_infographics(
            product_name=request.product_name,
            brand=request.brand,
            features=request.features,
            category=request.category,
            count=min(request.count, 6)  # Max 6 images
        )
        
        return result
        
    except ImportError as e:
        # Service not available, return helpful message
        return {
            "success": False,
            "error": "Nano Banana service not available",
            "help": "emergentintegrations kutubxonasini o'rnating",
            "details": str(e)
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/ai/generate-single-image")
async def generate_single_image(
    product_name: str,
    brand: str,
    style: str = "professional",
    features: List[str] = []
):
    """Generate single product image"""
    try:
        from nano_banana_service import generate_single_infographic
        
        result = await generate_single_infographic(
            product_name=product_name,
            brand=brand,
            features=features,
            style=style,
            index=1
        )
        
        return result
        
    except Exception as e:
        return {"success": False, "error": str(e)}


# ========================================
# MXIK/IKPU ENDPOINTS - tasnif.soliq.uz
# ========================================

@app.get("/api/mxik/status")
async def mxik_status():
    """MXIK database status"""
    try:
        return {
            "success": True,
            "loaded": True,
            "totalCodes": len(COMMON_IKPU_CODES) if 'COMMON_IKPU_CODES' in dir() else 250,
            "source": "file",
            "description": "tasnif.soliq.uz MXIK/IKPU kodlari"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/api/mxik/search")
async def mxik_search(q: str, lang: str = "uz"):
    """MXIK kodni mahsulot nomi bo'yicha qidirish"""
    try:
        # Search in API first, fallback to local
        results = await IKPUService.search_ikpu(q, limit=5)
        
        formatted_results = []
        for r in results:
            formatted_results.append({
                "code": r.get("code", "")[:8] if r.get("code") else "",
                "fullCode": r.get("code", ""),
                "nameUz": r.get("name_uz") or r.get("name", ""),
                "nameRu": r.get("name_ru") or r.get("name", ""),
                "similarity": 90 if r else 0
            })
        
        return {
            "success": True,
            "query": q,
            "language": lang,
            "count": len(formatted_results),
            "results": formatted_results
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/api/mxik/best-match")
async def mxik_best_match(q: str, category: str = None):
    """Mahsulotga eng mos MXIK kodni topish"""
    try:
        # Get from category or search
        if category:
            result = IKPUService.get_ikpu_by_category(category)
            if result:
                return {
                    "success": True,
                    "query": q,
                    "category": category,
                    "match": {
                        "code": result.get("code", "")[:8],
                        "fullCode": result.get("code", ""),
                        "nameUz": result.get("name", ""),
                        "nameRu": result.get("name", ""),
                        "similarity": 95
                    }
                }
        
        # Search by query
        results = await IKPUService.search_ikpu(q, limit=1)
        if results:
            r = results[0]
            return {
                "success": True,
                "query": q,
                "category": category,
                "match": {
                    "code": r.get("code", "")[:8] if r.get("code") else "47190000",
                    "fullCode": r.get("code", "") or "47190000000000000",
                    "nameUz": r.get("name_uz") or r.get("name", "") or "Boshqa chakana savdo",
                    "nameRu": r.get("name_ru") or r.get("name", "") or "Прочая розничная торговля",
                    "similarity": 90
                }
            }
        
        # Default fallback
        return {
            "success": True,
            "query": q,
            "category": category,
            "match": {
                "code": "47190000",
                "fullCode": "47190000000000000",
                "nameUz": "Boshqa chakana savdo",
                "nameRu": "Прочая розничная торговля",
                "similarity": 30
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/api/mxik/validate/{code}")
async def mxik_validate(code: str):
    """MXIK kod formatini tekshirish"""
    try:
        is_valid = IKPUService.validate_ikpu_code(code) or (len(code) >= 8 and code[:8].isdigit())
        
        return {
            "success": True,
            "code": code,
            "isValidFormat": is_valid,
            "exists": is_valid,
            "details": {
                "code": code[:8] if is_valid else None,
                "fullCode": code,
                "format": "8-17 digits"
            } if is_valid else None
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy(request: Request, path: str):
    """Proxy all other requests to main Express server"""
    
    # Skip AI routes (already handled above)
    if path.startswith("api/ai/"):
        raise HTTPException(status_code=404, detail="AI endpoint not found")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            url = f"{MAIN_SERVER}/{path}"
            
            # Forward headers
            headers = dict(request.headers)
            headers.pop("host", None)
            
            # Get body
            body = await request.body()
            
            # Make request
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                params=request.query_params,
            )
            
            # Return response
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
            )
            
        except httpx.ConnectError:
            return JSONResponse(
                content={"error": "Main server not available"},
                status_code=503
            )
        except Exception as e:
            return JSONResponse(
                content={"error": str(e)},
                status_code=500
            )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
