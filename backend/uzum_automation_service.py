"""
Uzum Seller Portal Automation Service
Uses Playwright to automate product creation on Uzum Seller Portal
"""
import asyncio
import os
from typing import Dict, Any, Optional
from datetime import datetime

# Note: playwright should be installed: pip install playwright && playwright install chromium

class UzumPortalAutomation:
    """
    Automates product creation on Uzum Seller Portal
    Since Uzum API doesn't support product creation, we use browser automation
    """
    
    def __init__(self):
        self.browser = None
        self.context = None
        self.page = None
        self.logged_in = False
        self.portal_url = "https://seller.uzum.uz"
    
    async def _ensure_playwright(self):
        """Ensure playwright is available"""
        try:
            from playwright.async_api import async_playwright
            return async_playwright
        except ImportError:
            raise ImportError(
                "Playwright not installed. Run: pip install playwright && playwright install chromium"
            )
    
    async def login(self, phone: str, password: str) -> Dict[str, Any]:
        """
        Login to Uzum Seller Portal
        
        Args:
            phone: Partner's phone number (e.g., +998901234567)
            password: Partner's password
        """
        try:
            async_playwright = await self._ensure_playwright()
            
            async with async_playwright() as p:
                # Launch browser in headless mode
                self.browser = await p.chromium.launch(
                    headless=True,
                    args=['--no-sandbox', '--disable-dev-shm-usage']
                )
                
                self.context = await self.browser.new_context(
                    viewport={'width': 1920, 'height': 1080},
                    user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                )
                
                self.page = await self.context.new_page()
                
                # Navigate to login page
                await self.page.goto(f"{self.portal_url}/login", timeout=60000)
                await self.page.wait_for_load_state('networkidle')
                
                # Fill login form
                # Note: Selectors may need to be updated based on actual portal UI
                await self.page.fill('input[name="phone"], input[type="tel"]', phone)
                await self.page.fill('input[name="password"], input[type="password"]', password)
                
                # Click login button
                await self.page.click('button[type="submit"]')
                
                # Wait for navigation
                await self.page.wait_for_load_state('networkidle')
                await asyncio.sleep(3)
                
                # Check if login successful
                current_url = self.page.url
                if 'login' not in current_url.lower():
                    self.logged_in = True
                    return {
                        "success": True,
                        "message": "Uzum Seller Portal'ga muvaffaqiyatli kirildi"
                    }
                else:
                    return {
                        "success": False,
                        "error": "Login muvaffaqiyatsiz. Telefon yoki parolni tekshiring."
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "error": f"Login xatosi: {str(e)}"
            }
    
    async def create_product(
        self,
        product_data: Dict[str, Any],
        credentials: Dict[str, str]
    ) -> Dict[str, Any]:
        """
        Create a product on Uzum Seller Portal
        
        Args:
            product_data: Product information (name, description, price, ikpu_code, etc.)
            credentials: Login credentials (phone, password)
        """
        try:
            async_playwright = await self._ensure_playwright()
            
            async with async_playwright() as p:
                browser = await p.chromium.launch(
                    headless=True,
                    args=['--no-sandbox', '--disable-dev-shm-usage']
                )
                
                context = await browser.new_context(
                    viewport={'width': 1920, 'height': 1080}
                )
                
                page = await context.new_page()
                
                # Step 1: Login
                await page.goto(f"{self.portal_url}/login", timeout=60000)
                await page.wait_for_load_state('networkidle')
                
                phone = credentials.get('login') or credentials.get('phone')
                password = credentials.get('password')
                
                if not phone or not password:
                    return {
                        "success": False,
                        "error": "Login credentials not provided"
                    }
                
                # Fill login form
                phone_input = page.locator('input[type="tel"], input[name="phone"]').first
                await phone_input.fill(phone)
                
                password_input = page.locator('input[type="password"]').first
                await password_input.fill(password)
                
                # Submit
                submit_btn = page.locator('button[type="submit"]').first
                await submit_btn.click()
                
                await page.wait_for_load_state('networkidle')
                await asyncio.sleep(3)
                
                # Check login success
                if 'login' in page.url.lower():
                    await browser.close()
                    return {
                        "success": False,
                        "error": "Login muvaffaqiyatsiz"
                    }
                
                # Step 2: Navigate to product creation
                # Try to find "Add Product" or similar button
                try:
                    await page.goto(f"{self.portal_url}/products/create", timeout=30000)
                except:
                    # Try alternative paths
                    await page.goto(f"{self.portal_url}/seller/products/new", timeout=30000)
                
                await page.wait_for_load_state('networkidle')
                await asyncio.sleep(2)
                
                # Step 3: Fill product form
                # Note: These selectors need to be verified against actual Uzum portal
                
                # Product name
                name_input = page.locator('input[name="name"], input[name="title"]').first
                if await name_input.is_visible():
                    await name_input.fill(product_data.get('name', ''))
                
                # Description
                desc_input = page.locator('textarea[name="description"]').first
                if await desc_input.is_visible():
                    await desc_input.fill(product_data.get('description', ''))
                
                # Price
                price_input = page.locator('input[name="price"]').first
                if await price_input.is_visible():
                    await price_input.fill(str(product_data.get('price', 0)))
                
                # IKPU Code
                ikpu_input = page.locator('input[name="ikpu"], input[name="mxik"]').first
                if await ikpu_input.is_visible():
                    await ikpu_input.fill(product_data.get('ikpu_code', ''))
                
                # Quantity
                qty_input = page.locator('input[name="quantity"], input[name="stock"]').first
                if await qty_input.is_visible():
                    await qty_input.fill(str(product_data.get('quantity', 1)))
                
                # SKU/Barcode
                sku_input = page.locator('input[name="sku"], input[name="barcode"]').first
                if await sku_input.is_visible():
                    await sku_input.fill(product_data.get('sku', ''))
                
                # Screenshot before submit (for debugging)
                screenshot_path = f"/tmp/uzum_product_form_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                await page.screenshot(path=screenshot_path)
                
                # Step 4: Submit form
                # Look for submit button
                submit_selectors = [
                    'button[type="submit"]',
                    'button:has-text("Saqlash")',
                    'button:has-text("Yaratish")',
                    'button:has-text("Qo\'shish")',
                    'button:has-text("Save")',
                    'button:has-text("Create")'
                ]
                
                submitted = False
                for selector in submit_selectors:
                    try:
                        btn = page.locator(selector).first
                        if await btn.is_visible():
                            await btn.click()
                            submitted = True
                            break
                    except:
                        continue
                
                if not submitted:
                    await browser.close()
                    return {
                        "success": False,
                        "error": "Submit button topilmadi",
                        "screenshot": screenshot_path
                    }
                
                await page.wait_for_load_state('networkidle')
                await asyncio.sleep(3)
                
                # Final screenshot
                final_screenshot = f"/tmp/uzum_product_result_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                await page.screenshot(path=final_screenshot)
                
                await browser.close()
                
                return {
                    "success": True,
                    "message": "Mahsulot Uzum Seller Portal'ga yuborildi",
                    "screenshots": [screenshot_path, final_screenshot],
                    "note": "Mahsulot moderatsiyadan o'tishi kerak"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Product creation error: {str(e)}"
            }
    
    async def close(self):
        """Close browser and cleanup"""
        if self.browser:
            await self.browser.close()
            self.browser = None
            self.context = None
            self.page = None
            self.logged_in = False


# Alternative: API-based product preparation (for when API supports it)
class UzumProductPreparer:
    """
    Prepares product data for Uzum Market according to their requirements
    This can be used to generate complete product cards that partners
    can manually upload to Uzum Seller Portal
    """
    
    @staticmethod
    def prepare_product_card(
        name: str,
        description: str,
        price: float,
        category: str,
        ikpu_code: str,
        brand: str = "",
        images: list = None,
        quantity: int = 1,
        barcode: str = "",
        specifications: dict = None
    ) -> Dict[str, Any]:
        """
        Prepare a complete product card according to Uzum requirements
        """
        
        # Uzum requires specific field formatting
        product_card = {
            "title": name[:200],  # Uzum title limit
            "description": description[:5000],  # Description limit
            "price": int(price),  # Price in so'm (integer)
            "category": category,
            "ikpu_code": ikpu_code,
            "brand": brand or "No Brand",
            "quantity": quantity,
            "barcode": barcode,
            "images": images or [],
            "specifications": specifications or {},
            
            # Uzum-specific fields
            "fbs_available": True,  # Fulfillment by Seller
            "dbs_available": False,  # Delivery by Seller
            "vat_included": True,  # VAT included in price
            
            # Status
            "status": "draft",
            "ready_for_upload": True,
            "created_at": datetime.now().isoformat()
        }
        
        # Validation
        validation_errors = []
        
        if len(name) < 5:
            validation_errors.append("Mahsulot nomi kamida 5 ta belgidan iborat bo'lishi kerak")
        
        if len(description) < 50:
            validation_errors.append("Tavsif kamida 50 ta belgidan iborat bo'lishi kerak")
        
        if price < 1000:
            validation_errors.append("Narx kamida 1000 so'm bo'lishi kerak")
        
        if not ikpu_code or len(ikpu_code) < 6:
            validation_errors.append("IKPU kodi noto'g'ri")
        
        return {
            "product_card": product_card,
            "is_valid": len(validation_errors) == 0,
            "validation_errors": validation_errors,
            "upload_instructions": {
                "step1": "Uzum Seller Portal'ga kiring: https://seller.uzum.uz",
                "step2": "Mahsulotlar bo'limiga o'ting",
                "step3": "Yangi mahsulot qo'shish tugmasini bosing",
                "step4": "Quyidagi ma'lumotlarni kiriting",
                "step5": "Saqlash tugmasini bosing"
            }
        }


# Singleton instances
uzum_portal = UzumPortalAutomation()
uzum_preparer = UzumProductPreparer()
