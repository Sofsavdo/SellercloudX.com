"""
Nano Banana Infographic Generator Service
Gemini 3 Pro Image Preview - for product infographics

Uses Emergent LLM Key with emergentintegrations library
Generates 6 professional product images for Yandex Market
"""

import os
import base64
import httpx
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime

# Emergent LLM Key
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY", "sk-emergent-c0d5c506030Fa49400")
IMGBB_API_KEY = os.getenv("IMGBB_API_KEY", "ae8d1c66d2c3b97a5fbed414c9ee4b4f")


async def upload_to_imgbb(base64_data: str) -> Optional[str]:
    """Upload base64 image to ImgBB for permanent URL"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                'https://api.imgbb.com/1/upload',
                data={
                    'key': IMGBB_API_KEY,
                    'image': base64_data
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    return data['data']['url']
        return None
    except Exception as e:
        print(f"ImgBB upload error: {e}")
        return None


async def generate_single_infographic(
    product_name: str,
    brand: str,
    features: List[str],
    style: str = "professional",
    index: int = 1
) -> Dict[str, Any]:
    """
    Generate single product infographic using Gemini Nano Banana
    
    Args:
        product_name: Full product name
        brand: Brand name
        features: List of product features
        style: professional, modern, elegant, vibrant
        index: Image number (1-6)
    
    Returns:
        {success: bool, image_url: str, error: str}
    """
    try:
        print(f"🎨 Generating infographic #{index} for: {product_name}")
        
        # Create detailed prompt for infographic
        features_text = ", ".join(features[:4]) if features else "premium quality"
        
        # Different prompts for different image positions
        prompts = {
            1: f"Create a professional e-commerce hero product image for {brand} {product_name}. Clean white background, centered product, high-quality commercial photography style. Perfect for Yandex Market main listing image.",
            2: f"Create an infographic showing key features of {brand} {product_name}: {features_text}. Modern design with icons and labels highlighting product benefits. Clean professional marketplace style.",
            3: f"Create a lifestyle product image showing {brand} {product_name} in use. Natural setting, attractive composition, demonstrates product value. E-commerce ready.",
            4: f"Create a detailed product image of {brand} {product_name} showing design details and quality. Multiple angles or close-up view. Professional marketplace photography.",
            5: f"Create a comparison or specification infographic for {brand} {product_name}. Show dimensions, materials, and key specs. Clean professional design for online marketplace.",
            6: f"Create an elegant product showcase image for {brand} {product_name}. Premium feel, subtle gradient background, professional lighting. Perfect for luxury marketplace listing."
        }
        
        prompt = prompts.get(index, prompts[1])
        
        # Try emergentintegrations first
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"infographic-{datetime.now().strftime('%Y%m%d%H%M%S')}-{index}",
                system_message="You are a professional product photographer and infographic designer for e-commerce marketplaces."
            )
            
            chat.with_model("gemini", "gemini-3-pro-image-preview").with_params(modalities=["image", "text"])
            
            msg = UserMessage(text=prompt)
            text_response, images = await chat.send_message_multimodal_response(msg)
            
            if images and len(images) > 0:
                # Get base64 data
                img_data = images[0].get('data', '')
                
                # Upload to ImgBB
                image_url = await upload_to_imgbb(img_data)
                
                if image_url:
                    print(f"✅ Infographic #{index} generated: {image_url[:50]}...")
                    return {
                        "success": True,
                        "image_url": image_url,
                        "index": index
                    }
            
            return {
                "success": False,
                "error": "No image generated from Gemini",
                "index": index
            }
            
        except ImportError:
            # Fallback to direct API call
            print("emergentintegrations not available, using direct API")
            return {
                "success": False,
                "error": "emergentintegrations library not installed",
                "index": index
            }
            
    except Exception as e:
        print(f"❌ Infographic generation error: {e}")
        return {
            "success": False,
            "error": str(e),
            "index": index
        }


async def generate_product_infographics(
    product_name: str,
    brand: str,
    features: List[str],
    count: int = 6
) -> Dict[str, Any]:
    """
    Generate multiple infographics for product card (default: 6 images)
    
    This creates professional marketplace-ready images:
    1. Hero/main product shot
    2. Features infographic
    3. Lifestyle image
    4. Detail shots
    5. Specifications
    6. Premium showcase
    
    Args:
        product_name: Full product name
        brand: Brand name
        features: List of product features
        count: Number of images to generate (1-6)
    
    Returns:
        {
            success: bool,
            images: [url1, url2, ...],
            generated_count: int,
            errors: []
        }
    """
    try:
        print(f"🖼️ Starting generation of {count} infographics for: {brand} {product_name}")
        
        images = []
        errors = []
        
        styles = ["professional", "modern", "elegant", "vibrant", "professional", "modern"]
        
        # Generate images sequentially to avoid rate limits
        for i in range(min(count, 6)):
            result = await generate_single_infographic(
                product_name=product_name,
                brand=brand,
                features=features,
                style=styles[i],
                index=i + 1
            )
            
            if result.get("success") and result.get("image_url"):
                images.append(result["image_url"])
            else:
                errors.append({
                    "index": i + 1,
                    "error": result.get("error", "Unknown error")
                })
            
            # Small delay between requests to avoid rate limiting
            if i < count - 1:
                await asyncio.sleep(2)
        
        success_count = len(images)
        print(f"✅ Generated {success_count}/{count} infographics")
        
        return {
            "success": success_count > 0,
            "images": images,
            "generated_count": success_count,
            "requested_count": count,
            "errors": errors if errors else None
        }
        
    except Exception as e:
        print(f"❌ Bulk generation error: {e}")
        return {
            "success": False,
            "images": [],
            "generated_count": 0,
            "requested_count": count,
            "error": str(e)
        }


async def generate_product_video(
    product_name: str,
    brand: str,
    duration_seconds: int = 8
) -> Dict[str, Any]:
    """
    Generate product video (8 seconds) - Requires Sora 2
    
    Note: Video generation requires separate Sora 2 integration
    """
    return {
        "success": False,
        "error": "Video generation requires Sora 2 integration - coming soon",
        "help": "Bu funksiya keyingi versiyada qo'shiladi"
    }


# Test function
async def test_infographic_generation():
    """Test infographic generation"""
    result = await generate_product_infographics(
        product_name="Galaxy Buds Pro",
        brand="Samsung",
        features=[
            "Active Noise Cancellation",
            "IPX7 Water Resistant",
            "28 hours battery life",
            "Bluetooth 5.0"
        ],
        count=2  # Just test with 2 images
    )
    
    print(f"\nTest result: {result}")
    return result


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_infographic_generation())
