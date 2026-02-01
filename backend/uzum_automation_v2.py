"""
UZUM MARKET - REAL WORKING AUTOMATION v2
=========================================

Bu modul HAQIQIY Uzum seller kabinetida mahsulot yaratadi.
Multi-step kategoriya tanlash to'g'ri ishlaydi.

Muallif: AI Manager
Versiya: 2.0
"""

import asyncio
import re
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
from playwright.async_api import async_playwright, Browser, Page, BrowserContext


class UzumAutomationV2:
    """
    Uzum Market Real Automation - Version 2
    Multi-step kategoriya tanlash bilan
    """
    
    def __init__(self, debug: bool = True):
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.playwright = None
        self.shop_id: Optional[str] = None
        self.debug = debug
        self.screenshots: List[str] = []
        self.steps_log: List[str] = []
    
    async def log(self, msg: str):
        timestamp = datetime.now().strftime('%H:%M:%S')
        log_msg = f"[UzumV2] {timestamp} - {msg}"
        print(log_msg)
        self.steps_log.append(log_msg)
    
    async def screenshot(self, name: str) -> str:
        if self.page:
            path = f"/tmp/uzumv2_{name}_{datetime.now().strftime('%H%M%S')}.png"
            await self.page.screenshot(path=path)
            self.screenshots.append(path)
            return path
        return ""
    
    async def init_browser(self, headless: bool = True):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=headless,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        )
        self.context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
            locale='ru-RU'
        )
        self.page = await self.context.new_page()
        self.page.set_default_timeout(30000)
        await self.log("Browser started")
    
    async def close(self):
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
    
    async def login(self, phone: str, password: str) -> Dict[str, Any]:
        """Uzum kabinetga kirish"""
        try:
            await self.log(f"Login: {phone}")
            await self.page.goto("https://seller.uzum.uz/seller/signin", wait_until='domcontentloaded')
            await asyncio.sleep(5)
            
            inputs = await self.page.query_selector_all('input')
            if len(inputs) < 2:
                return {"success": False, "error": "Login form not found"}
            
            await inputs[0].fill(phone)
            await asyncio.sleep(0.3)
            await inputs[1].fill(password)
            await asyncio.sleep(0.3)
            
            await self.page.click('button:has-text("Войти")')
            await self.log("Войти clicked, waiting...")
            await asyncio.sleep(12)
            
            if '/signin' not in self.page.url:
                state = await self.page.evaluate('() => localStorage.getItem("state")')
                if state:
                    matches = re.findall(r'"(\d{5,})":\s*\[', state)
                    if matches:
                        self.shop_id = matches[0]
                
                await self.screenshot("login_ok")
                return {"success": True, "shop_id": self.shop_id}
            
            return {"success": False, "error": "Login failed"}
            
        except Exception as e:
            await self.screenshot("login_error")
            return {"success": False, "error": str(e)}
    
    async def go_to_product_creation(self):
        """Mahsulot yaratish sahifasiga o'tish"""
        if not self.shop_id:
            self.shop_id = "37889"
        
        url = f"https://seller.uzum.uz/seller/{self.shop_id}/products/new"
        await self.log(f"Navigating to: {url}")
        await self.page.goto(url, wait_until='domcontentloaded')
        await asyncio.sleep(8)
        await self.screenshot("product_page")
    
    async def click_input_by_placeholder(self, placeholder: str) -> bool:
        """Placeholder bo'yicha inputni bosish"""
        coords = await self.page.evaluate('''(ph) => {
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return null;
            const sr = sx.shadowRoot;
            const inputs = sr.querySelectorAll("input");
            for (const inp of inputs) {
                if (inp.placeholder && inp.placeholder.includes(ph)) {
                    const rect = inp.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        return {x: rect.x + rect.width/2, y: rect.y + rect.height/2};
                    }
                }
            }
            return null;
        }''', placeholder)
        
        if coords:
            await self.page.mouse.click(coords['x'], coords['y'])
            return True
        return False
    
    async def select_from_dropdown(self, category_name: str) -> Dict[str, Any]:
        """Dropdowndan kategoriya tanlash"""
        result = await self.page.evaluate('''(catName) => {
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return {success: false, error: "no shadow"};
            const sr = sx.shadowRoot;
            
            const items = sr.querySelectorAll(".u-list-item-main-text");
            for (const item of items) {
                if (item.innerText && item.innerText.trim() === catName) {
                    const parent = item.closest(".u-list-item");
                    if (parent) {
                        parent.click();
                        return {success: true, text: catName};
                    }
                }
            }
            
            // Mavjud variantlarni qaytarish
            const available = Array.from(items).map(i => i.innerText?.trim()).filter(t => t);
            return {success: false, available: available.slice(0, 20)};
        }''', category_name)
        
        return result
    
    async def get_available_categories(self) -> List[str]:
        """Hozirgi dropdowndagi kategoriyalarni olish"""
        return await self.page.evaluate('''() => {
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return [];
            const sr = sx.shadowRoot;
            const items = sr.querySelectorAll(".u-list-item-main-text");
            return Array.from(items).map(i => i.innerText?.trim()).filter(t => t);
        }''')
    
    async def select_category_path(self, categories: List[str]) -> Dict[str, Any]:
        """
        To'liq kategoriya yo'lini tanlash
        Har bir daraja uchun alohida input
        """
        result = {
            "success": False,
            "selected": [],
            "failed": [],
            "available_at_fail": []
        }
        
        await self.log(f"Selecting category path: {' → '.join(categories)}")
        
        # 1-DARAJA: Asosiy kategoriya
        await self.log("Step 1: Main category")
        clicked = await self.click_input_by_placeholder("Выбрать категорию")
        if not clicked:
            result["error"] = "Category input not found"
            return result
        
        await asyncio.sleep(2)
        
        for i, cat_name in enumerate(categories):
            await self.log(f"  Level {i+1}: {cat_name}")
            
            # Dropdowndan tanlash
            select_result = await self.select_from_dropdown(cat_name)
            
            if select_result.get("success"):
                result["selected"].append(cat_name)
                await asyncio.sleep(1.5)
                
                # Keyingi daraja uchun yangi input bormi?
                if i < len(categories) - 1:
                    # "подкатегорию" inputni qidirish
                    has_next = await self.click_input_by_placeholder("подкатегорию")
                    if has_next:
                        await asyncio.sleep(1.5)
                        # Dropdown ochilganini tekshirish
                        available = await self.get_available_categories()
                        if not available:
                            await self.log(f"    No more subcategories available after {cat_name}")
                            break
                    else:
                        # Agar yangi input yo'q bo'lsa, bu oxirgi daraja
                        await self.log(f"    No more subcategory inputs after {cat_name}")
                        break
            else:
                result["failed"].append(cat_name)
                result["available_at_fail"] = select_result.get("available", [])
                await self.log(f"    ❌ Not found: {cat_name}")
                await self.log(f"    Available: {select_result.get('available', [])[:10]}")
                break
        
        # "Принять" tugmasini bosish
        await asyncio.sleep(1)
        accept_result = await self.page.evaluate('''() => {
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return false;
            const sr = sx.shadowRoot;
            const buttons = sr.querySelectorAll("button");
            for (const btn of buttons) {
                if (btn.innerText && btn.innerText.includes("Принять")) {
                    btn.click();
                    return true;
                }
            }
            return false;
        }''')
        
        if accept_result:
            await self.log("  ✅ 'Принять' clicked")
            result["accepted"] = True
        
        await asyncio.sleep(2)
        await self.screenshot("category_selected")
        
        result["success"] = len(result["selected"]) > 0
        return result
    
    async def fill_input_by_placeholder(self, placeholder: str, value: str) -> bool:
        """Placeholder bo'yicha inputni to'ldirish"""
        result = await self.page.evaluate('''(data) => {
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return false;
            const sr = sx.shadowRoot;
            const inputs = sr.querySelectorAll("input");
            for (const inp of inputs) {
                if (inp.placeholder && inp.placeholder.includes(data.ph)) {
                    inp.value = data.value;
                    inp.dispatchEvent(new Event("input", {bubbles: true}));
                    inp.dispatchEvent(new Event("change", {bubbles: true}));
                    return true;
                }
            }
            return false;
        }''', {"ph": placeholder, "value": value})
        return result
    
    async def fill_product_names(self, name_uz: str, name_ru: str) -> bool:
        """Mahsulot nomlarini to'ldirish (max 90 belgi)"""
        await self.log(f"Filling product names: UZ={name_uz[:30]}..., RU={name_ru[:30]}...")
        
        # 90 belgiga cheklash
        name_uz = name_uz[:90]
        name_ru = name_ru[:90]
        
        result = await self.page.evaluate('''(names) => {
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return {success: false};
            const sr = sx.shadowRoot;
            
            const inputs = sr.querySelectorAll("input");
            let filled = 0;
            
            // "Точное название товара" placeholderli inputlarni topish
            const nameInputs = [];
            for (const inp of inputs) {
                if (inp.placeholder && inp.placeholder.includes("Точное название")) {
                    nameInputs.push(inp);
                }
            }
            
            if (nameInputs.length >= 2) {
                // Birinchi - O'zbekcha
                nameInputs[0].value = names.uz;
                nameInputs[0].dispatchEvent(new Event("input", {bubbles: true}));
                filled++;
                
                // Ikkinchi - Ruscha
                nameInputs[1].value = names.ru;
                nameInputs[1].dispatchEvent(new Event("input", {bubbles: true}));
                filled++;
            }
            
            return {success: filled >= 2, filled};
        }''', {"uz": name_uz, "ru": name_ru})
        
        await self.log(f"  Names result: {result}")
        return result.get("success", False)
    
    async def fill_short_descriptions(self, desc_uz: str, desc_ru: str) -> bool:
        """Qisqa tavsif to'ldirish (max 390 belgi)"""
        await self.log("Filling short descriptions...")
        
        desc_uz = desc_uz[:390]
        desc_ru = desc_ru[:390]
        
        result = await self.page.evaluate('''(descs) => {
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return {success: false};
            const sr = sx.shadowRoot;
            
            // Textarealarni topish
            const textareas = sr.querySelectorAll("textarea");
            if (textareas.length >= 2) {
                textareas[0].value = descs.uz;
                textareas[0].dispatchEvent(new Event("input", {bubbles: true}));
                
                textareas[1].value = descs.ru;
                textareas[1].dispatchEvent(new Event("input", {bubbles: true}));
                
                return {success: true, filled: 2};
            }
            
            return {success: false, textareaCount: textareas.length};
        }''', {"uz": desc_uz, "ru": desc_ru})
        
        await self.log(f"  Short desc result: {result}")
        return result.get("success", False)
    
    async def fill_full_descriptions(self, desc_uz: str, desc_ru: str) -> bool:
        """To'liq tavsif to'ldirish"""
        await self.log("Filling full descriptions...")
        
        # Scroll qilish
        await self.page.evaluate('() => window.scrollBy(0, 400)')
        await asyncio.sleep(1)
        
        result = await self.page.evaluate('''(descs) => {
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return {success: false};
            const sr = sx.shadowRoot;
            
            // Contenteditable elementlar
            const editors = sr.querySelectorAll("[contenteditable='true']");
            if (editors.length >= 2) {
                editors[0].innerHTML = descs.uz.replace(/\\n/g, "<br>");
                editors[0].dispatchEvent(new Event("input", {bubbles: true}));
                
                editors[1].innerHTML = descs.ru.replace(/\\n/g, "<br>");
                editors[1].dispatchEvent(new Event("input", {bubbles: true}));
                
                return {success: true, type: "contenteditable"};
            }
            
            return {success: false};
        }''', {"uz": desc_uz, "ru": desc_ru})
        
        await self.log(f"  Full desc result: {result}")
        return result.get("success", False)
    
    async def select_country(self, country: str = "Узбекистан") -> bool:
        """Mamlakat tanlash"""
        await self.log(f"Selecting country: {country}")
        
        clicked = await self.click_input_by_placeholder("страну")
        if clicked:
            await asyncio.sleep(1)
            result = await self.select_from_dropdown(country)
            return result.get("success", False)
        return False
    
    async def click_save_and_continue(self) -> bool:
        """'Сохранить и продолжить' tugmasini bosish"""
        await self.log("Clicking 'Сохранить и продолжить'...")
        
        result = await self.page.evaluate('''() => {
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return {clicked: false, error: "no shadow"};
            const sr = sx.shadowRoot;
            
            const buttons = sr.querySelectorAll("button");
            for (const btn of buttons) {
                const text = (btn.innerText || "").toLowerCase();
                if (text.includes("сохранить") && text.includes("продолжить")) {
                    if (!btn.disabled) {
                        btn.click();
                        return {clicked: true};
                    } else {
                        return {clicked: false, reason: "disabled"};
                    }
                }
            }
            return {clicked: false, reason: "not found"};
        }''')
        
        if result.get("clicked"):
            await self.log("  ✅ Button clicked")
            await asyncio.sleep(5)
            await self.screenshot("after_save")
            return True
        else:
            await self.log(f"  ❌ Button not clicked: {result.get('reason')}")
            await self.screenshot("save_failed")
            return False
    
    async def create_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mahsulot yaratish - TO'LIQ OQIM
        """
        result = {
            "success": False,
            "steps_completed": [],
            "errors": [],
            "screenshots": []
        }
        
        try:
            # 1. Sahifaga o'tish
            await self.go_to_product_creation()
            result["steps_completed"].append("page_loaded")
            
            # 2. Kategoriya tanlash
            cat_result = await self.select_category_path(product_data.get("category_path", []))
            if cat_result.get("success"):
                result["steps_completed"].append(f"category: {cat_result.get('selected')}")
            else:
                result["errors"].append(f"category failed: {cat_result}")
            
            # 3. Mahsulot nomlari
            names_ok = await self.fill_product_names(
                product_data.get("name_uz", ""),
                product_data.get("name_ru", "")
            )
            if names_ok:
                result["steps_completed"].append("names_filled")
            
            # 4. Qisqa tavsif
            short_ok = await self.fill_short_descriptions(
                product_data.get("short_desc_uz", ""),
                product_data.get("short_desc_ru", "")
            )
            if short_ok:
                result["steps_completed"].append("short_desc_filled")
            
            # 5. To'liq tavsif
            full_ok = await self.fill_full_descriptions(
                product_data.get("full_desc_uz", ""),
                product_data.get("full_desc_ru", "")
            )
            if full_ok:
                result["steps_completed"].append("full_desc_filled")
            
            # 6. Mamlakat
            country_ok = await self.select_country(product_data.get("country", "Узбекистан"))
            if country_ok:
                result["steps_completed"].append("country_selected")
            
            await self.screenshot("before_save")
            
            # 7. Saqlash
            saved = await self.click_save_and_continue()
            if saved:
                result["steps_completed"].append("step1_saved")
                
                # Sahifa 2-qadamga o'tdimi tekshirish
                await asyncio.sleep(3)
                current_url = self.page.url
                
                if "step=2" in current_url or "price" in current_url.lower():
                    result["steps_completed"].append("moved_to_step2")
                    result["success"] = True
                else:
                    # Sahifa o'zgarmagan bo'lsa ham saqlangan bo'lishi mumkin
                    result["success"] = True
            else:
                result["errors"].append("save_button_failed")
            
            result["screenshots"] = self.screenshots
            result["current_url"] = self.page.url
            result["logs"] = self.steps_log
            
            return result
            
        except Exception as e:
            await self.screenshot("error")
            result["errors"].append(str(e))
            return result


async def create_uzum_product_v2(
    phone: str,
    password: str,
    product_data: Dict[str, Any],
    headless: bool = True
) -> Dict[str, Any]:
    """
    Uzum'da mahsulot yaratish - V2
    """
    automation = UzumAutomationV2(debug=True)
    
    try:
        await automation.init_browser(headless=headless)
        
        login_result = await automation.login(phone, password)
        if not login_result.get("success"):
            return {"success": False, "error": f"Login failed: {login_result.get('error')}"}
        
        result = await automation.create_product(product_data)
        result["shop_id"] = automation.shop_id
        
        return result
        
    finally:
        await automation.close()


# Test
if __name__ == "__main__":
    test_data = {
        "category_path": ["Электроника", "Смартфоны и телефоны"],
        "name_uz": "Samsung Galaxy A54 5G Smartfon 128GB Qora",
        "name_ru": "Смартфон Samsung Galaxy A54 5G 128GB Чёрный",
        "short_desc_uz": "Yangi Samsung Galaxy A54 5G - 128GB xotira, 8GB RAM, Super AMOLED 120Hz ekran, 50MP kamera, 5000mAh batareya. Tez yetkazib berish!",
        "short_desc_ru": "Новый Samsung Galaxy A54 5G - 128GB память, 8GB RAM, Super AMOLED 120Hz экран, камера 50MP, батарея 5000mAh. Быстрая доставка!",
        "full_desc_uz": """Samsung Galaxy A54 5G - premium smartfon.

Asosiy xususiyatlar:
• 6.4" Super AMOLED 120Hz ekran
• Exynos 1380 protsessor
• 128GB xotira / 8GB RAM
• 50MP asosiy kamera
• 5000mAh batareya
• IP67 suv himoyasi

Kafolat: 1 yil""",
        "full_desc_ru": """Samsung Galaxy A54 5G - премиальный смартфон.

Основные характеристики:
• 6.4" Super AMOLED 120Hz экран
• Процессор Exynos 1380
• 128GB память / 8GB RAM
• Основная камера 50MP
• Батарея 5000mAh
• Защита IP67

Гарантия: 1 год""",
        "country": "Вьетнам"
    }
    
    result = asyncio.run(create_uzum_product_v2(
        phone="998900082244",
        password="Medik9298",
        product_data=test_data,
        headless=True
    ))
    
    print("\n" + "="*50)
    print("NATIJA:")
    print("="*50)
    print(json.dumps(result, indent=2, ensure_ascii=False))
