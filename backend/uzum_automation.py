"""
Uzum Market Browser Automation Service
Playwright orqali seller.uzum.uz da avtomatik mahsulot yaratish

MUHIM: Uzum Shadow DOM (Web Components) ishlatadi.
Barcha elementlar sx-products, sx-sidebar, top-header Shadow DOM ichida.
"""

import os
import asyncio
import re
from typing import Optional, Dict, Any, List
from datetime import datetime
from playwright.async_api import async_playwright, Browser, Page, BrowserContext

# Uzum Seller Portal URLs
UZUM_SELLER_URL = "https://seller.uzum.uz"
UZUM_LOGIN_URL = "https://seller.uzum.uz/seller/signin"


class UzumAutomation:
    """
    Uzum Market Browser Automation - Shadow DOM bilan ishlash
    """
    
    def __init__(self):
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.logged_in = False
        self.shop_id = None
        self.playwright = None
    
    async def initialize(self, headless: bool = True):
        """Browser va context yaratish"""
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=headless,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        )
        self.context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale='ru-RU'
        )
        self.page = await self.context.new_page()
        self.page.set_default_timeout(30000)
        return True
    
    async def close(self):
        """Browser yopish"""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
        self.logged_in = False
        self.shop_id = None
    
    async def login(self, phone: str, password: str) -> Dict[str, Any]:
        """Uzum Seller kabinetiga kirish"""
        try:
            if not self.page:
                await self.initialize()
            
            await self.page.goto(UZUM_LOGIN_URL, wait_until='load')
            await asyncio.sleep(4)
            
            inputs = await self.page.query_selector_all('input')
            if len(inputs) < 2:
                return {"success": False, "error": "Login form topilmadi"}
            
            await inputs[0].fill(phone)
            await inputs[1].fill(password)
            await self.page.click('button:has-text("Войти")')
            await asyncio.sleep(12)
            
            current_url = self.page.url
            
            if '/signin' not in current_url and '/login' not in current_url:
                self.logged_in = True
                
                # Shop ID olish
                state_str = await self.page.evaluate('() => localStorage.getItem("state")')
                if state_str:
                    matches = re.findall(r'"(\d{5,})":\s*\[', state_str)
                    if matches:
                        self.shop_id = matches[0]
                
                return {
                    "success": True,
                    "message": "Muvaffaqiyatli kirildi!",
                    "shop_id": self.shop_id
                }
            else:
                return {"success": False, "error": "Login muvaffaqiyatsiz"}
                
        except Exception as e:
            return {"success": False, "error": f"Login xatosi: {str(e)}"}
    
    async def _get_shadow_input_coords(self) -> Optional[Dict]:
        """Shadow DOM ichidagi kategoriya input koordinatalarini olish"""
        return await self.page.evaluate('''() => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return null;
            
            const sr = sxProducts.shadowRoot;
            const inp = sr.querySelector("input[placeholder=\\"Выбрать категорию\\"]");
            
            if (inp) {
                const rect = inp.getBoundingClientRect();
                return {
                    x: rect.x + rect.width / 2,
                    y: rect.y + rect.height / 2
                };
            }
            return null;
        }''')
    
    async def _get_category_input_value(self) -> str:
        """Kategoriya input qiymatini olish"""
        return await self.page.evaluate('''() => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return "";
            const inp = sxProducts.shadowRoot.querySelector("input[placeholder=\\"Выбрать категорию\\"]");
            return inp ? inp.value : "";
        }''')
    
    async def _get_visible_categories(self) -> List[Dict]:
        """Shadow DOM ichidan ko'rinadigan kategoriyalarni olish"""
        return await self.page.evaluate('''() => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return [];
            
            const sr = sxProducts.shadowRoot;
            const items = sr.querySelectorAll(".u-list-item");
            const cats = [];
            const seen = new Set();
            
            items.forEach(item => {
                const text = (item.innerText || "").trim();
                const rect = item.getBoundingClientRect();
                
                if (text && rect.y > 200 && rect.y < 700 && !seen.has(text)) {
                    seen.add(text);
                    cats.push({
                        text: text,
                        x: rect.x + rect.width / 2,
                        y: rect.y + rect.height / 2
                    });
                }
            });
            
            return cats;
        }''')
    
    async def _click_category_by_name(self, cat_name: str) -> bool:
        """Kategoriyani nom bo'yicha bosish"""
        cats = await self._get_visible_categories()
        
        for cat in cats:
            if cat['text'] == cat_name:
                await self.page.mouse.click(cat['x'], cat['y'])
                await asyncio.sleep(2)
                return True
        
        return False
    
    async def _select_category(self, category_path: List[str]) -> bool:
        """
        Multi-level kategoriya tanlash (Shadow DOM orqali)
        
        Args:
            category_path: ["Аксессуары", "Сумки и рюкзаки", "Женские сумки"]
        """
        # Kategoriya inputni mouse click bilan bosish
        input_coords = await self._get_shadow_input_coords()
        if not input_coords:
            return False
        
        await self.page.mouse.click(input_coords['x'], input_coords['y'])
        await asyncio.sleep(3)
        
        # LEVEL 1: Asosiy kategoriya
        cats = await self._get_visible_categories()
        if not cats:
            return False
        
        # Birinchi kategoriyani tanlash
        target_cat = category_path[0] if category_path else cats[0]['text']
        target = next((c for c in cats if c['text'] == target_cat), cats[0])
        await self.page.mouse.click(target['x'], target['y'])
        await asyncio.sleep(3)
        
        # LEVEL 2: Sub-kategoriya
        sub_coords = await self.page.evaluate('''() => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return null;
            const inp = sxProducts.shadowRoot.querySelector("input[placeholder=\\"Выбрать подкатегорию\\"]");
            if (inp) {
                const rect = inp.getBoundingClientRect();
                return {x: rect.x + rect.width / 2, y: rect.y + rect.height / 2};
            }
            return null;
        }''')
        
        if sub_coords:
            await self.page.mouse.click(sub_coords['x'], sub_coords['y'])
            await asyncio.sleep(3)
            
            sub_cats = await self._get_visible_categories()
            if sub_cats:
                target2 = category_path[1] if len(category_path) > 1 else sub_cats[0]['text']
                target2_el = next((c for c in sub_cats if target2 in c['text']), sub_cats[0])
                await self.page.mouse.click(target2_el['x'], target2_el['y'])
                await asyncio.sleep(3)
        
        # LEVEL 3: Sub-sub kategoriya (agar mavjud bo'lsa)
        sub_sub_coords = await self.page.evaluate('''() => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return null;
            const allInputs = sxProducts.shadowRoot.querySelectorAll("input");
            for (const inp of allInputs) {
                if (inp.placeholder && inp.placeholder.includes("подкатегорию") && !inp.value) {
                    const rect = inp.getBoundingClientRect();
                    return {x: rect.x + rect.width / 2, y: rect.y + rect.height / 2};
                }
            }
            return null;
        }''')
        
        if sub_sub_coords:
            await self.page.mouse.click(sub_sub_coords['x'], sub_sub_coords['y'])
            await asyncio.sleep(3)
            
            sub_sub_cats = await self._get_visible_categories()
            if sub_sub_cats:
                target3 = category_path[2] if len(category_path) > 2 else sub_sub_cats[0]['text']
                target3_el = next((c for c in sub_sub_cats if target3 in c['text']), sub_sub_cats[0])
                await self.page.mouse.click(target3_el['x'], target3_el['y'])
                await asyncio.sleep(3)
        
        # "Принять" tugmasini bosish (agar ko'rinsa)
        await self.page.evaluate('''() => {
            const sxProducts = document.querySelector("sx-products");
            if (sxProducts && sxProducts.shadowRoot) {
                const btns = sxProducts.shadowRoot.querySelectorAll("button");
                for (const btn of btns) {
                    if (btn.innerText && btn.innerText.includes("Принять")) {
                        btn.click();
                        return true;
                    }
                }
            }
            return false;
        }''')
        await asyncio.sleep(2)
        
        return True
    
    async def _fill_form_fields(
        self,
        name_uz: str,
        name_ru: str,
        description_uz: str,
        description_ru: str,
        property_uz: str,
        property_ru: str
    ):
        """Shadow DOM ichidagi forma maydonlarini to'ldirish"""
        await self.page.evaluate('''(data) => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return;
            
            const sr = sxProducts.shadowRoot;
            
            // Mahsulot nomi
            const nameInputs = sr.querySelectorAll("input[placeholder*=\\"название товара\\"]");
            if (nameInputs.length >= 2) {
                nameInputs[0].value = data.name_uz;
                nameInputs[0].dispatchEvent(new Event("input", {bubbles: true}));
                nameInputs[1].value = data.name_ru;
                nameInputs[1].dispatchEvent(new Event("input", {bubbles: true}));
            }
            
            // Tavsif
            const textareas = sr.querySelectorAll("textarea");
            if (textareas.length >= 2) {
                textareas[0].value = data.description_uz;
                textareas[0].dispatchEvent(new Event("input", {bubbles: true}));
                textareas[1].value = data.description_ru;
                textareas[1].dispatchEvent(new Event("input", {bubbles: true}));
            }
            
            // Xususiyatlar
            const propInputs = sr.querySelectorAll("input[placeholder*=\\"свойство\\"]");
            if (propInputs.length >= 2) {
                propInputs[0].value = data.property_uz;
                propInputs[0].dispatchEvent(new Event("input", {bubbles: true}));
                propInputs[1].value = data.property_ru;
                propInputs[1].dispatchEvent(new Event("input", {bubbles: true}));
            }
        }''', {
            'name_uz': name_uz,
            'name_ru': name_ru,
            'description_uz': description_uz,
            'description_ru': description_ru,
            'property_uz': property_uz,
            'property_ru': property_ru
        })
        
        # Davlat tanlash - "Выберите страну" dropdown
        await asyncio.sleep(1)
        
        # Davlat dropdown'ni topish va bosish
        country_clicked = await self.page.evaluate('''() => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return false;
            
            const sr = sxProducts.shadowRoot;
            
            // "Выберите страну" placeholder bilan input yoki select
            const countryInput = sr.querySelector("input[placeholder*=\\"страну\\"], select[placeholder*=\\"страну\\"]");
            if (countryInput) {
                countryInput.click();
                return true;
            }
            
            // Yoki barcha inputlardan qidirish
            const allInputs = sr.querySelectorAll("input, select");
            for (const inp of allInputs) {
                if (inp.placeholder && inp.placeholder.includes("страну")) {
                    inp.click();
                    return true;
                }
            }
            
            return false;
        }''')
        
        if country_clicked:
            await asyncio.sleep(2)
            
            # Birinchi davlatni tanlash (odatda "Узбекистан" yoki "Китай")
            await self.page.evaluate('''() => {
                const sxProducts = document.querySelector("sx-products");
                if (!sxProducts || !sxProducts.shadowRoot) return;
                
                const sr = sxProducts.shadowRoot;
                const items = sr.querySelectorAll(".u-list-item");
                
                for (const item of items) {
                    const text = (item.innerText || "").trim();
                    if (text && (text.includes("Узбекистан") || text.includes("Китай") || text.includes("Россия"))) {
                        item.click();
                        return;
                    }
                }
                
                // Birinchi itemni bosish
                if (items.length > 0) {
                    items[0].click();
                }
            }''')
            await asyncio.sleep(1)
    
    async def _check_save_button(self) -> Dict:
        """Saqlash tugmasi holatini tekshirish"""
        return await self.page.evaluate('''() => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return {found: false};
            
            const sr = sxProducts.shadowRoot;
            const btn = sr.querySelector("button[data-test-id=\\"button__save-continue\\"]");
            
            if (btn) {
                const classes = btn.className || "";
                return {
                    found: true,
                    disabled: classes.includes("disabled"),
                    text: btn.innerText
                };
            }
            return {found: false};
        }''')
    
    async def _click_save_button(self) -> bool:
        """Saqlash tugmasini bosish"""
        return await self.page.evaluate('''() => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return false;
            
            const sr = sxProducts.shadowRoot;
            const btn = sr.querySelector("button[data-test-id=\\"button__save-continue\\"]");
            
            if (btn) {
                btn.click();
                return true;
            }
            return false;
        }''')
    
    async def create_product(
        self,
        name_uz: str,
        name_ru: str,
        description_uz: str,
        description_ru: str,
        property_uz: str,
        property_ru: str,
        category_path: List[str],
        price: int,
        quantity: int = 10,
        sku: str = None,
        images: List[str] = None
    ) -> Dict[str, Any]:
        """
        Uzum Market'da mahsulot yaratish - multi-step form
        """
        if not self.logged_in:
            return {"success": False, "error": "Avval login qiling"}
        
        if not self.shop_id:
            return {"success": False, "error": "Shop ID topilmadi"}
        
        result = {
            "steps_completed": [],
            "steps_failed": [],
            "current_step": None
        }
        
        try:
            # ========== STEP 1: Sahifaga o'tish ==========
            create_url = f"https://seller.uzum.uz/seller/{self.shop_id}/products/new"
            await self.page.goto(create_url, wait_until='load')
            await asyncio.sleep(10)
            result["current_step"] = "page_loaded"
            result["steps_completed"].append("page_loaded")
            
            # ========== STEP 2: Kategoriya tanlash ==========
            category_selected = await self._select_category(category_path)
            if category_selected:
                result["steps_completed"].append("category_selected")
            else:
                result["steps_failed"].append({"step": "category_selection", "error": "Kategoriya tanlanmadi"})
            
            # ========== STEP 3: Forma to'ldirish ==========
            await asyncio.sleep(2)
            await self._fill_form_fields(
                name_uz, name_ru,
                description_uz, description_ru,
                property_uz, property_ru
            )
            result["steps_completed"].append("form_filled")
            
            # ========== STEP 4: Saqlash ==========
            save_status = await self._check_save_button()
            
            if save_status.get('found') and not save_status.get('disabled'):
                await self._click_save_button()
                await asyncio.sleep(10)
                result["steps_completed"].append("step1_saved")
                
                # ========== STEP 5: Narx va Zaxira (Step 2) ==========
                await self._fill_price_and_stock(price, quantity, sku)
                result["steps_completed"].append("price_stock_filled")
                
                # Step 2 saqlash
                save_status2 = await self._check_save_button()
                if save_status2.get('found') and not save_status2.get('disabled'):
                    await self._click_save_button()
                    await asyncio.sleep(10)
                    result["steps_completed"].append("step2_saved")
                    
                    return {
                        "success": True,
                        "message": "Mahsulot muvaffaqiyatli yaratildi!",
                        "data": result,
                        "final_url": self.page.url
                    }
            else:
                result["steps_failed"].append({
                    "step": "step1_save",
                    "error": "Saqlash tugmasi disabled - kategoriya to'liq tanlanmagan"
                })
            
            return {
                "success": "step1_saved" in result["steps_completed"],
                "message": "Mahsulot yaratish jarayoni",
                "data": result,
                "final_url": self.page.url
            }
            
        except Exception as e:
            return {"success": False, "error": f"Xatolik: {str(e)}", "data": result}
    
    async def _fill_price_and_stock(self, price: int, quantity: int, sku: str = None):
        """Step 2: Narx va zaxira"""
        await asyncio.sleep(3)
        
        await self.page.evaluate('''(data) => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return;
            
            const sr = sxProducts.shadowRoot;
            
            // Narx
            const priceInputs = sr.querySelectorAll("input[placeholder*=\\"цена\\"], input[name*=\\"price\\"]");
            priceInputs.forEach(inp => {
                inp.value = data.price;
                inp.dispatchEvent(new Event("input", {bubbles: true}));
            });
            
            // Zaxira
            const stockInputs = sr.querySelectorAll("input[placeholder*=\\"количество\\"], input[name*=\\"stock\\"]");
            stockInputs.forEach(inp => {
                inp.value = data.quantity;
                inp.dispatchEvent(new Event("input", {bubbles: true}));
            });
            
            // SKU
            if (data.sku) {
                const skuInputs = sr.querySelectorAll("input[placeholder*=\\"артикул\\"], input[name*=\\"sku\\"]");
                skuInputs.forEach(inp => {
                    inp.value = data.sku;
                    inp.dispatchEvent(new Event("input", {bubbles: true}));
                });
            }
        }''', {
            'price': str(price),
            'quantity': str(quantity),
            'sku': sku or ''
        })


# ========== HELPER FUNCTIONS ==========

async def create_product_on_uzum(
    phone: str,
    password: str,
    product_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Uzum'da mahsulot yaratish - asosiy funksiya
    """
    automation = UzumAutomation()
    
    try:
        await automation.initialize(headless=True)
        
        login_result = await automation.login(phone, password)
        if not login_result.get("success"):
            return login_result
        
        result = await automation.create_product(
            name_uz=product_data.get("name_uz", ""),
            name_ru=product_data.get("name_ru", ""),
            description_uz=product_data.get("description_uz", ""),
            description_ru=product_data.get("description_ru", ""),
            property_uz=product_data.get("property_uz", ""),
            property_ru=product_data.get("property_ru", ""),
            category_path=product_data.get("category_path", ["Аксессуары"]),
            price=product_data.get("price", 100000),
            quantity=product_data.get("quantity", 10),
            sku=product_data.get("sku"),
            images=product_data.get("images", [])
        )
        
        return result
        
    finally:
        await automation.close()


def get_uzum_automation() -> UzumAutomation:
    """Yangi automation instance yaratish"""
    return UzumAutomation()
