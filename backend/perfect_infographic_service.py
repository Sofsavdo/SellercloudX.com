"""
PERFECT INFOGRAPHIC SERVICE
============================
2-bosqichli infografika yaratish - XATOSIZ matn

BOSQICH 1: AI - Fon rasm yaratish (matnsiz)
BOSQICH 2: Pillow - Matnni qo'shish (to'g'ri font, xatosiz)

Marketplace talablari:
- Uzum Market: 1080x1440px (3:4)
- Yandex Market: 1000x1000px (1:1)
"""

import os
import io
import base64
import asyncio
import httpx
from typing import List, Dict, Any, Optional
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# API Keys
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


class PerfectInfographicService:
    """
    2-bosqichli infografika yaratish:
    1. AI rasm yaratish (matnsiz)
    2. Pillow matn qo'shish (xatosiz)
    """
    
    def __init__(self):
        self.fonts_dir = os.path.join(os.path.dirname(__file__), 'fonts')
        os.makedirs(self.fonts_dir, exist_ok=True)
        
        # Default font (fallback)
        self.default_font_path = None
        self._load_fonts()
    
    def _load_fonts(self):
        """Load available fonts"""
        # Try to find a good font
        font_options = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
            os.path.join(self.fonts_dir, "Roboto-Bold.ttf"),
        ]
        
        for font_path in font_options:
            if os.path.exists(font_path):
                self.default_font_path = font_path
                print(f"✅ Font loaded: {font_path}")
                break
        
        if not self.default_font_path:
            print("⚠️ No custom font found, using default")
    
    async def generate_infographic(
        self,
        product_name: str,
        features: List[str],
        image_url: Optional[str] = None,
        size: tuple = (1080, 1440),
        style: str = "modern",
        language: str = "uz"
    ) -> Dict[str, Any]:
        """
        Mukammal infografika yaratish
        
        Args:
            product_name: Mahsulot nomi
            features: Xususiyatlar ro'yxati (3-6 ta)
            image_url: Mahsulot rasmi URL (optional)
            size: Rasm o'lchami (1080x1440 default)
            style: Dizayn uslubi (modern, minimal, bold)
            language: Til (uz, ru)
        
        Returns:
            {"success": True, "image_base64": "...", "image_url": "..."}
        """
        try:
            # BOSQICH 1: AI bilan fon rasm yaratish
            print(f"🎨 Generating background for: {product_name}")
            background = await self._generate_ai_background(
                product_name=product_name,
                style=style,
                size=size
            )
            
            if not background:
                # Fallback: Gradient fon yaratish
                background = self._create_gradient_background(size, style)
            
            # BOSQICH 2: Pillow bilan matn qo'shish
            print(f"✍️ Adding text overlay...")
            final_image = self._add_text_overlay(
                background=background,
                product_name=product_name,
                features=features,
                style=style,
                language=language
            )
            
            # Base64 ga convert
            buffered = io.BytesIO()
            final_image.save(buffered, format="PNG", quality=95)
            image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
            
            return {
                "success": True,
                "image_base64": image_base64,
                "width": size[0],
                "height": size[1],
                "format": "PNG"
            }
            
        except Exception as e:
            print(f"❌ Infographic error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _generate_ai_background(
        self,
        product_name: str,
        style: str,
        size: tuple
    ) -> Optional[Image.Image]:
        """AI bilan fon rasm yaratish (MATNSIZ)"""
        
        # Prompt - MATNSIZ rasm
        prompt = f"""Professional e-commerce product background image:

Product type: {product_name}
Style: {style}, clean, minimalist
Requirements:
- Pure gradient or abstract background
- NO text, NO words, NO letters, NO numbers
- Soft professional lighting
- Subtle geometric patterns or gradients
- Colors: professional blues, whites, soft grays
- High quality, 4K look
- Clean and modern aesthetic
- Empty space for text overlay later

IMPORTANT: Absolutely NO text or letters in the image!"""

        # Try Replicate (Flux Pro) first
        if REPLICATE_API_TOKEN:
            try:
                result = await self._generate_with_replicate(prompt, size)
                if result:
                    return result
            except Exception as e:
                print(f"⚠️ Replicate failed: {e}")
        
        # Try OpenAI DALL-E
        if OPENAI_API_KEY:
            try:
                result = await self._generate_with_dalle(prompt, size)
                if result:
                    return result
            except Exception as e:
                print(f"⚠️ DALL-E failed: {e}")
        
        # Fallback: local gradient
        return None
    
    async def _generate_with_replicate(
        self,
        prompt: str,
        size: tuple
    ) -> Optional[Image.Image]:
        """Replicate Flux Pro bilan rasm yaratish"""
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                # Create prediction
                response = await client.post(
                    "https://api.replicate.com/v1/predictions",
                    headers={
                        "Authorization": f"Token {REPLICATE_API_TOKEN}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "version": "black-forest-labs/flux-schnell",
                        "input": {
                            "prompt": prompt,
                            "width": min(size[0], 1024),
                            "height": min(size[1], 1024),
                            "num_outputs": 1,
                            "guidance_scale": 3.5
                        }
                    }
                )
                
                if response.status_code != 201:
                    return None
                
                prediction = response.json()
                prediction_id = prediction.get("id")
                
                # Poll for result
                for _ in range(30):  # Max 30 seconds
                    await asyncio.sleep(1)
                    
                    status_response = await client.get(
                        f"https://api.replicate.com/v1/predictions/{prediction_id}",
                        headers={"Authorization": f"Token {REPLICATE_API_TOKEN}"}
                    )
                    
                    status_data = status_response.json()
                    
                    if status_data.get("status") == "succeeded":
                        output = status_data.get("output", [])
                        if output:
                            image_url = output[0] if isinstance(output, list) else output
                            
                            # Download image
                            img_response = await client.get(image_url)
                            img = Image.open(io.BytesIO(img_response.content))
                            
                            # Resize to target size
                            img = img.resize(size, Image.Resampling.LANCZOS)
                            return img
                    
                    elif status_data.get("status") == "failed":
                        return None
                
                return None
                
        except Exception as e:
            print(f"Replicate error: {e}")
            return None
    
    async def _generate_with_dalle(
        self,
        prompt: str,
        size: tuple
    ) -> Optional[Image.Image]:
        """OpenAI DALL-E bilan rasm yaratish"""
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                # DALL-E 3 sizes: 1024x1024, 1024x1792, 1792x1024
                dalle_size = "1024x1024"
                if size[1] > size[0]:  # Portrait
                    dalle_size = "1024x1792"
                elif size[0] > size[1]:  # Landscape
                    dalle_size = "1792x1024"
                
                response = await client.post(
                    "https://api.openai.com/v1/images/generations",
                    headers={
                        "Authorization": f"Bearer {OPENAI_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "dall-e-3",
                        "prompt": prompt,
                        "n": 1,
                        "size": dalle_size,
                        "quality": "standard",
                        "response_format": "b64_json"
                    }
                )
                
                if response.status_code != 200:
                    return None
                
                data = response.json()
                b64_image = data["data"][0]["b64_json"]
                
                img = Image.open(io.BytesIO(base64.b64decode(b64_image)))
                img = img.resize(size, Image.Resampling.LANCZOS)
                
                return img
                
        except Exception as e:
            print(f"DALL-E error: {e}")
            return None
    
    def _create_gradient_background(
        self,
        size: tuple,
        style: str = "modern"
    ) -> Image.Image:
        """Lokal gradient fon yaratish (fallback)"""
        
        # Stilga qarab ranglar
        color_schemes = {
            "modern": [(41, 128, 185), (44, 62, 80)],      # Blue gradient
            "minimal": [(255, 255, 255), (236, 240, 241)],  # White-gray
            "bold": [(142, 68, 173), (41, 128, 185)],       # Purple-blue
            "warm": [(243, 156, 18), (231, 76, 60)],        # Orange-red
            "fresh": [(46, 204, 113), (26, 188, 156)],      # Green
        }
        
        colors = color_schemes.get(style, color_schemes["modern"])
        
        # Create gradient
        img = Image.new('RGB', size, colors[0])
        draw = ImageDraw.Draw(img)
        
        # Vertical gradient
        for y in range(size[1]):
            ratio = y / size[1]
            r = int(colors[0][0] * (1 - ratio) + colors[1][0] * ratio)
            g = int(colors[0][1] * (1 - ratio) + colors[1][1] * ratio)
            b = int(colors[0][2] * (1 - ratio) + colors[1][2] * ratio)
            draw.line([(0, y), (size[0], y)], fill=(r, g, b))
        
        return img
    
    def _add_text_overlay(
        self,
        background: Image.Image,
        product_name: str,
        features: List[str],
        style: str,
        language: str
    ) -> Image.Image:
        """Pillow bilan XATOSIZ matn qo'shish"""
        
        img = background.copy()
        draw = ImageDraw.Draw(img)
        
        width, height = img.size
        
        # Font sizes
        title_size = int(height * 0.05)  # 5% of height
        feature_size = int(height * 0.025)  # 2.5% of height
        
        # Load fonts
        try:
            if self.default_font_path:
                title_font = ImageFont.truetype(self.default_font_path, title_size)
                feature_font = ImageFont.truetype(self.default_font_path, feature_size)
            else:
                title_font = ImageFont.load_default()
                feature_font = ImageFont.load_default()
        except:
            title_font = ImageFont.load_default()
            feature_font = ImageFont.load_default()
        
        # Colors based on style
        if style in ["minimal", "fresh"]:
            text_color = (33, 33, 33)  # Dark text
            shadow_color = (200, 200, 200)
        else:
            text_color = (255, 255, 255)  # White text
            shadow_color = (0, 0, 0)
        
        # === TITLE ===
        title_y = int(height * 0.08)
        
        # Title with shadow
        title_bbox = draw.textbbox((0, 0), product_name, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_x = (width - title_width) // 2
        
        # Shadow
        draw.text((title_x + 2, title_y + 2), product_name, font=title_font, fill=shadow_color)
        # Main text
        draw.text((title_x, title_y), product_name, font=title_font, fill=text_color)
        
        # === FEATURES ===
        feature_start_y = int(height * 0.25)
        feature_spacing = int(height * 0.08)
        
        for i, feature in enumerate(features[:6]):  # Max 6 features
            feature_y = feature_start_y + (i * feature_spacing)
            
            # Feature icon (checkmark)
            icon = "✓ " if language == "uz" else "✓ "
            feature_text = f"{icon}{feature}"
            
            # Center or left align
            feature_bbox = draw.textbbox((0, 0), feature_text, font=feature_font)
            feature_width = feature_bbox[2] - feature_bbox[0]
            feature_x = (width - feature_width) // 2
            
            # Shadow
            draw.text((feature_x + 1, feature_y + 1), feature_text, font=feature_font, fill=shadow_color)
            # Main text
            draw.text((feature_x, feature_y), feature_text, font=feature_font, fill=text_color)
        
        # === DECORATIVE ELEMENTS ===
        # Top bar
        draw.rectangle([(0, 0), (width, 5)], fill=text_color)
        # Bottom bar
        draw.rectangle([(0, height - 5), (width, height)], fill=text_color)
        
        return img
    
    async def generate_6_infographics(
        self,
        product_name: str,
        features: List[str],
        brand: str = "",
        marketplace: str = "yandex"
    ) -> Dict[str, Any]:
        """6 ta mukammal infografika yaratish - ImgBB'ga avtomatik yuklash"""
        
        # ImgBB yuklash funksiyasini import qilish
        try:
            from nano_banana_service import upload_to_imgbb
            IMGBB_AVAILABLE = True
        except ImportError:
            IMGBB_AVAILABLE = False
            print("⚠️ ImgBB upload not available, will return base64")
        
        # Marketplace o'lchamlari
        sizes = {
            "yandex": (1000, 1000),
            "uzum": (1080, 1440),
            "wildberries": (900, 1200),
            "ozon": (1000, 1000)
        }
        
        size = sizes.get(marketplace, (1080, 1440))
        
        # 6 xil stil
        styles = ["modern", "minimal", "bold", "fresh", "warm", "modern"]
        
        # Feature variations
        feature_sets = []
        for i in range(6):
            if i == 0:
                feature_sets.append(features[:4])  # First 4
            elif i == 1:
                feature_sets.append(features[2:6] if len(features) > 4 else features)  # Different set
            else:
                # Rotate features
                rotated = features[i % len(features):] + features[:i % len(features)]
                feature_sets.append(rotated[:4])
        
        images = []
        
        for i in range(6):
            print(f"📸 Generating infographic {i+1}/6...")
            
            result = await self.generate_infographic(
                product_name=f"{brand} {product_name}".strip() if brand else product_name,
                features=feature_sets[i],
                size=size,
                style=styles[i],
                language="ru" if marketplace == "yandex" else "uz"
            )
            
            if result.get("success"):
                image_base64 = result["image_base64"]
                image_url = None
                
                # ImgBB'ga yuklash (Yandex API uchun zarur - 500 KB limit)
                if IMGBB_AVAILABLE and image_base64:
                    try:
                        # Remove data:image prefix if present
                        base64_data = image_base64
                        if "base64," in base64_data:
                            base64_data = base64_data.split("base64,")[1]
                        
                        print(f"📤 Uploading image {i+1}/6 to ImgBB...")
                        image_url = await upload_to_imgbb(base64_data)
                        if image_url:
                            print(f"✅ Image {i+1}/6 uploaded: {image_url[:50]}...")
                        else:
                            print(f"⚠️ ImgBB upload failed for image {i+1}, using base64")
                    except Exception as e:
                        print(f"❌ ImgBB upload error for image {i+1}: {e}")
                
                images.append({
                    "index": i + 1,
                    "image_base64": image_base64,  # Keep for fallback
                    "image_url": image_url,  # NEW: ImgBB URL
                    "url": image_url,  # Alias for compatibility
                    "style": styles[i]
                })
            else:
                print(f"⚠️ Failed to generate image {i+1}")
        
        return {
            "success": len(images) > 0,
            "images": images,
            "total": len(images),
            "marketplace": marketplace,
            "size": f"{size[0]}x{size[1]}"
        }


# Singleton instance
perfect_infographic_service = PerfectInfographicService()


# Export functions
async def generate_perfect_infographic(
    product_name: str,
    features: List[str],
    **kwargs
) -> Dict[str, Any]:
    """Single infographic yaratish"""
    return await perfect_infographic_service.generate_infographic(
        product_name=product_name,
        features=features,
        **kwargs
    )


async def generate_6_perfect_infographics(
    product_name: str,
    features: List[str],
    brand: str = "",
    marketplace: str = "yandex"
) -> Dict[str, Any]:
    """6 ta infografika yaratish"""
    return await perfect_infographic_service.generate_6_infographics(
        product_name=product_name,
        features=features,
        brand=brand,
        marketplace=marketplace
    )
