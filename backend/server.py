"""
SellerCloudX Backend Server - FastAPI with AI Services
Real AI functionality using Emergent LLM Key
"""
from fastapi import FastAPI, Request, Response, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import httpx
import os
import base64
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import AI service
from ai_service import generate_product_card, scan_product_image, optimize_price

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
# PROXY TO MAIN SERVER (for other routes)
# ========================================

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
