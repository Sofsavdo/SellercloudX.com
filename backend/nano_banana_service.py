"""
Nano Banana Infographic Generator Service
Gemini 3 Pro Image Preview - for PROFESSIONAL marketplace infographics

Uses Emergent LLM Key with emergentintegrations library
Generates 6 SALES-BOOSTING product infographics for Yandex Market/Wildberries

Reference: Professional marketplace infographics with:
- Product hero shot with floating ingredients
- Features/benefits with icons
- Ingredient composition visualization
- Usage instructions
- "Does NOT contain" badges
- 100% natural/organic badges
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


def get_marketplace_infographic_prompt(
    product_name: str,
    brand: str,
    features: List[str],
    category: str,
    index: int = 1
) -> str:
    """
    Generate professional marketplace infographic prompts
    Based on top-selling Wildberries/Yandex Market card designs
    
    Each index creates different type of infographic:
    1. Hero shot with floating ingredients/elements
    2. Features & benefits with icons
    3. Ingredient composition visualization
    4. Usage instructions step-by-step
    5. "Does NOT contain" / purity badges
    6. Premium lifestyle/context shot
    """
    
    features_text = ", ".join(features[:5]) if features else "premium quality, effective formula"
    
    # Determine product category for appropriate styling
    is_cosmetic = any(word in category.lower() or word in product_name.lower() 
                     for word in ['serum', 'cream', 'skincare', 'vitamin', 'сыворотка', 'крем', 'косметика', 'уход'])
    is_food = any(word in category.lower() or word in product_name.lower() 
                 for word in ['bar', 'snack', 'food', 'chocolate', 'батончик', 'еда', 'шоколад', 'орех'])
    is_electronics = any(word in category.lower() or word in product_name.lower() 
                        for word in ['phone', 'headphones', 'speaker', 'телефон', 'наушники', 'электроника'])
    is_perfume = any(word in category.lower() or word in product_name.lower() 
                    for word in ['perfume', 'парфюм', 'духи', 'аромат', 'atir', 'parfum'])
    
    # Select content based on category
    if is_cosmetic:
        floating_elements = "Floating vitamin capsules, citrus slices, plant leaves around product"
        benefits_list = "Увлажняет и питает кожу, Разглаживает морщины, Осветляет пигментацию, Антиоксидантная защита"
        ingredients = "ГИАЛУРОНОВАЯ КИСЛОТА with water drop icon, ВИТАМИН Е with capsule, ВИТАМИН С with orange slice"
        usage_demo = "Beautiful woman applying product to face"
        usage_steps = "1. После умывания нанесите на чистую кожу, 2. Распределите массажными движениями, 3. Используйте утром и вечером"
        purity_badges = "НЕ СОДЕРЖИТ: СУЛЬФАТОВ, ПАРАБЕНОВ, СПИРТА, ОТДУШЕК (crossed out icons)"
        lifestyle_setting = "Spa/bathroom aesthetic with plants, water droplets, spa stones"
    elif is_food:
        floating_elements = "Floating ingredients: nuts, chocolate pieces, dried fruits around product"
        benefits_list = "100% натуральный состав, Без сахара, Богат белком, Заряд энергии"
        ingredients = "ФИНИК date image, АРАХИС peanut, ШОКОЛАД chocolate pieces"
        usage_demo = "Person enjoying the snack"
        usage_steps = "1. Откройте упаковку, 2. Наслаждайтесь вкусом, 3. Идеально для перекуса"
        purity_badges = "НЕ СОДЕРЖИТ: САХАРА, ГМО, КОНСЕРВАНТОВ, КРАСИТЕЛЕЙ (crossed out icons)"
        lifestyle_setting = "Healthy lifestyle with nuts, dried fruits scattered artistically"
    elif is_electronics:
        floating_elements = "Tech elements, sound waves, connectivity icons floating"
        benefits_list = "Активное шумоподавление, Долгое время работы, Bluetooth 5.0, Водонепроницаемость"
        ingredients = "Tech specs: ДРАЙВЕР 40мм, БАТАРЕЯ 800mAh, BLUETOOTH 5.0"
        usage_demo = "Person wearing/using the product"
        usage_steps = "1. Включите устройство, 2. Подключите по Bluetooth, 3. Наслаждайтесь звуком"
        purity_badges = "Quality badges: ОРИГИНАЛ, ГАРАНТИЯ, СЕРТИФИКАТ, КАЧЕСТВО (with checkmarks)"
        lifestyle_setting = "Modern tech lifestyle, clean desk, travel case"
    else:  # perfume or general
        floating_elements = "Perfume molecules, flower petals floating elegantly"
        benefits_list = "Стойкий аромат 24 часа, Премиальный флакон, Натуральные масла, Подходит для чувствительной кожи"
        ingredients = "ВЕРХНИЕ НОТЫ citrus, СЕРДЕЧНЫЕ НОТЫ flowers, БАЗОВЫЕ НОТЫ wood/musk"
        usage_demo = "Person applying perfume elegantly"
        usage_steps = "1. Нанесите на точки пульса, 2. Не растирайте, 3. Аромат раскрывается постепенно"
        purity_badges = "Quality badges: ОРИГИНАЛ, СТОЙКОСТЬ, БЕЗ АЛЛЕРГЕНОВ, ПРЕМИУМ (with checkmarks)"
        lifestyle_setting = "Elegant perfume bottles, flowers, luxury accessories"
    
    prompts = {
        1: f"""Create a PROFESSIONAL e-commerce marketplace infographic for {brand} {product_name}.

STYLE: Premium Wildberries/Yandex Market product card design
LAYOUT: Product in center with floating ingredients/elements around it
BACKGROUND: Clean gradient (soft colors matching product)
TEXT LANGUAGE: Russian

MUST INCLUDE:
- Large product image in center on elegant pedestal/platform
- {floating_elements}
- Product name in bold Russian typography at top
- "100% НАТУРАЛЬНО" or quality badge
- Clean, professional marketplace aesthetic
- High contrast, eye-catching design

This is slide 1 of 6 - HERO SHOT with floating elements.""",

        2: f"""Create a PROFESSIONAL marketplace infographic showing PRODUCT BENEFITS for {brand} {product_name}.

STYLE: Wildberries/Yandex Market benefits card
LAYOUT: Product on left side, benefits list on right with icons
BACKGROUND: Clean white/light gradient
TEXT LANGUAGE: Russian

MUST INCLUDE:
- Product image (smaller, on left side)
- 4-5 benefit icons with Russian text: {benefits_list}
- Clean icons next to each benefit
- Professional typography

This is slide 2 of 6 - BENEFITS with icons.""",

        3: f"""Create a PROFESSIONAL marketplace infographic showing INGREDIENTS/COMPOSITION for {brand} {product_name}.

STYLE: Wildberries/Yandex Market composition card
LAYOUT: Product in center, ingredient circles around it with connecting lines
BACKGROUND: Light, clean
TEXT LANGUAGE: Russian

MUST INCLUDE:
- Product image in center
- Ingredient circles: {ingredients}
- Small icons/images for each ingredient
- Connecting lines from ingredients to product
- Clean, informative design

This is slide 3 of 6 - COMPOSITION visualization.""",

        4: f"""Create a PROFESSIONAL marketplace infographic showing USAGE INSTRUCTIONS for {brand} {product_name}.

STYLE: Wildberries/Yandex Market how-to-use card
LAYOUT: Product on left, numbered steps on right with model/demonstration
BACKGROUND: Soft, warm tones
TEXT LANGUAGE: Russian

MUST INCLUDE:
- Product image on left side
- {usage_demo}
- "Способ применения" header
- Numbered steps in Russian: {usage_steps}
- Clean step-by-step layout

This is slide 4 of 6 - USAGE INSTRUCTIONS.""",

        5: f"""Create a PROFESSIONAL marketplace infographic showing PURITY/QUALITY for {brand} {product_name}.

STYLE: Wildberries/Yandex Market purity/safety card
LAYOUT: Product on one side, quality badges on other
BACKGROUND: Clean white
TEXT LANGUAGE: Russian

MUST INCLUDE:
- Product image
- {purity_badges}
- Clean badge icons (circles with X or checkmark)
- Professional, trustworthy design

This is slide 5 of 6 - PURITY/SAFETY badges.""",

        6: f"""Create a PROFESSIONAL marketplace infographic - PREMIUM LIFESTYLE shot for {brand} {product_name}.

STYLE: Wildberries/Yandex Market luxury/lifestyle card  
LAYOUT: Product in elegant setting with premium feel
BACKGROUND: {lifestyle_setting}
TEXT LANGUAGE: Russian

MUST INCLUDE:
- Product as hero in premium setting
- Brand name prominently displayed
- Premium, aspirational aesthetic
- Makes customer want to buy immediately

This is slide 6 of 6 - LIFESTYLE/PREMIUM shot."""
    }
    
    return prompts.get(index, prompts[1])


async def generate_single_infographic(
    product_name: str,
    brand: str,
    features: List[str],
    category: str = "general",
    index: int = 1
) -> Dict[str, Any]:
    """
    Generate single PROFESSIONAL marketplace infographic using Gemini Nano Banana
    
    Args:
        product_name: Full product name
        brand: Brand name
        features: List of product features
        category: Product category for appropriate styling
        index: Image number (1-6), each creates different infographic type
    
    Returns:
        {success: bool, image_url: str, error: str}
    """
    try:
        print(f"🎨 Generating professional infographic #{index} for: {brand} {product_name}")
        
        # Get specialized prompt for this index
        prompt = get_marketplace_infographic_prompt(
            product_name=product_name,
            brand=brand,
            features=features,
            category=category,
            index=index
        )
        
        # Try emergentintegrations first
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"infographic-{datetime.now().strftime('%Y%m%d%H%M%S')}-{index}",
                system_message="You are a PROFESSIONAL e-commerce product photographer and infographic designer specializing in Wildberries and Yandex Market product cards. You create sales-boosting, conversion-optimized marketplace images."
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
                    print(f"✅ Professional infographic #{index} generated: {image_url[:50]}...")
                    return {
                        "success": True,
                        "image_url": image_url,
                        "index": index,
                        "type": ["hero_floating", "benefits", "composition", "usage", "purity", "lifestyle"][index-1]
                    }
            
            return {
                "success": False,
                "error": "No image generated from Gemini",
                "index": index
            }
            
        except ImportError:
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
    category: str = "general",
    count: int = 6
) -> Dict[str, Any]:
    """
    Generate COMPLETE SET of professional marketplace infographics (default: 6 images)
    
    Creates sales-boosting infographic set:
    1. Hero shot with floating ingredients/elements
    2. Features & benefits with icons  
    3. Ingredient composition visualization
    4. Usage instructions step-by-step
    5. "Does NOT contain" / purity badges
    6. Premium lifestyle shot
    
    Args:
        product_name: Full product name
        brand: Brand name
        features: List of product features
        category: Product category (cosmetics, food, electronics, perfume, general)
        count: Number of images to generate (1-6)
    
    Returns:
        {
            success: bool,
            images: [url1, url2, ...],
            image_types: [type1, type2, ...],
            generated_count: int,
            errors: []
        }
    """
    try:
        print(f"🖼️ Starting PROFESSIONAL infographic set for: {brand} {product_name}")
        print(f"   Category: {category}")
        print(f"   Features: {features[:3]}...")
        
        images = []
        image_types = []
        errors = []
        
        # Generate images sequentially to avoid rate limits
        for i in range(min(count, 6)):
            result = await generate_single_infographic(
                product_name=product_name,
                brand=brand,
                features=features,
                category=category,
                index=i + 1
            )
            
            if result.get("success") and result.get("image_url"):
                images.append(result["image_url"])
                image_types.append(result.get("type", f"slide_{i+1}"))
            else:
                errors.append({
                    "index": i + 1,
                    "error": result.get("error", "Unknown error")
                })
            
            # Delay between requests to avoid rate limiting
            if i < count - 1:
                await asyncio.sleep(3)
        
        success_count = len(images)
        print(f"✅ Generated {success_count}/{count} professional infographics")
        
        return {
            "success": success_count > 0,
            "images": images,
            "image_types": image_types,
            "generated_count": success_count,
            "requested_count": count,
            "errors": errors if errors else None,
            "product": f"{brand} {product_name}",
            "category": category
        }
        
    except Exception as e:
        print(f"❌ Bulk generation error: {e}")
        return {
            "success": False,
            "images": [],
            "image_types": [],
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
    """Test professional infographic generation"""
    result = await generate_product_infographics(
        product_name="Сыворотка с витамином С",
        brand="Advanced Skincare",
        features=[
            "Увлажняет кожу",
            "Осветляет пигментацию",
            "Антиоксидантная защита",
            "Разглаживает морщины"
        ],
        category="cosmetics",
        count=1  # Test with 1 image
    )
    
    print(f"\nTest result: {result}")
    return result


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_infographic_generation())
