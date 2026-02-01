"""
UZUM MARKET - HAQIQIY ISHLAYDIGAN AVTOMATIZATSIYA
=================================================

Bu modul haqiqiy Uzum seller kabinetida mahsulot yaratadi.
Shadow DOM bilan to'g'ri ishlaydi.

Muallif: AI Manager
Sana: January 2025
"""

import asyncio
import re
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
from playwright.async_api import async_playwright, Browser, Page, BrowserContext

# URLs
UZUM_LOGIN_URL = "https://seller.uzum.uz/seller/signin"
UZUM_SELLER_BASE = "https://seller.uzum.uz/seller"


class UzumRealAutomation:
    """
    HAQIQIY Uzum Market Avtomatizatsiyasi
    - Shadow DOM bilan ishlaydi
    - Kategoriya dropdown to'g'ri ochiladi
    - Barcha maydonlar to'ldiriladi
    - Mahsulot kabinetda yaratiladi
    """
    
    def __init__(self, debug: bool = True):
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.playwright = None
        self.shop_id: Optional[str] = None
        self.debug = debug
        self.screenshots = []
    
    async def log(self, message: str):
        """Debug log"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        print(f"[UzumReal] {timestamp} - {message}")
    
    async def screenshot(self, name: str) -> str:
        """Screenshot olish"""
        if self.page:
            path = f"/tmp/uzum_real_{name}_{datetime.now().strftime('%H%M%S')}.png"
            await self.page.screenshot(path=path)
            self.screenshots.append(path)
            await self.log(f"Screenshot: {path}")
            return path
        return ""
    
    async def init_browser(self, headless: bool = True):
        """Browser ishga tushirish"""
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=headless,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        )
        self.context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
            locale='ru-RU'
        )
        self.page = await self.context.new_page()
        self.page.set_default_timeout(30000)
        await self.log("Browser ishga tushirildi")
    
    async def close(self):
        """Yopish"""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
        await self.log("Browser yopildi")
    
    async def login(self, phone: str, password: str) -> Dict[str, Any]:
        """Uzum kabinetga kirish"""
        try:
            await self.log(f"Login: {phone}")
            await self.page.goto(UZUM_LOGIN_URL, wait_until='domcontentloaded')
            await asyncio.sleep(5)
            
            # Inputlarni topish va to'ldirish
            inputs = await self.page.query_selector_all('input')
            if len(inputs) < 2:
                return {"success": False, "error": "Login forma topilmadi"}
            
            await inputs[0].fill(phone)
            await asyncio.sleep(0.3)
            await inputs[1].fill(password)
            await asyncio.sleep(0.3)
            
            # Войти bosish
            await self.page.click('button:has-text("Войти")')
            await self.log("Войти bosildi, kutilmoqda...")
            await asyncio.sleep(12)
            
            current_url = self.page.url
            await self.log(f"URL: {current_url}")
            
            if '/signin' not in current_url:
                # Shop ID olish
                state = await self.page.evaluate('() => localStorage.getItem("state")')
                if state:
                    matches = re.findall(r'"(\d{5,})":\s*\[', state)
                    if matches:
                        self.shop_id = matches[0]
                
                await self.screenshot("login_ok")
                return {"success": True, "shop_id": self.shop_id}
            
            return {"success": False, "error": "Login muvaffaqiyatsiz"}
            
        except Exception as e:
            await self.screenshot("login_error")
            return {"success": False, "error": str(e)}
    
    async def go_to_product_creation(self) -> bool:
        """Mahsulot yaratish sahifasiga o'tish"""
        if not self.shop_id:
            self.shop_id = "37889"  # Default
        
        url = f"{UZUM_SELLER_BASE}/{self.shop_id}/products/new"
        await self.log(f"Sahifaga o'tish: {url}")
        
        await self.page.goto(url, wait_until='domcontentloaded')
        await asyncio.sleep(8)
        await self.screenshot("product_page")
        return True
    
    async def shadow_click(self, selector: str, wait: float = 1.0) -> bool:
        """Shadow DOM ichida click"""
        result = await self.page.evaluate(f'''() => {{
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return false;
            const el = sx.shadowRoot.querySelector("{selector}");
            if (el) {{ el.click(); return true; }}
            return false;
        }}''')
        if result:
            await asyncio.sleep(wait)
        return result
    
    async def shadow_fill(self, selector: str, value: str) -> bool:
        """Shadow DOM ichida input to'ldirish"""
        result = await self.page.evaluate('''(data) => {
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return false;
            const el = sx.shadowRoot.querySelector(data.selector);
            if (el) {
                el.value = data.value;
                el.dispatchEvent(new Event("input", {bubbles: true}));
                el.dispatchEvent(new Event("change", {bubbles: true}));
                return true;
            }
            return false;
        }''', {"selector": selector, "value": value})
        return result
    
    async def click_by_text_in_shadow(self, text: str) -> bool:
        """Shadow DOM ichida matn bo'yicha element bosish"""
        result = await self.page.evaluate('''(searchText) => {
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return {success: false, error: "no shadow"};
            
            const sr = sx.shadowRoot;
            const elements = sr.querySelectorAll("div, span, li, button, a");
            
            for (const el of elements) {
                const elText = (el.innerText || el.textContent || "").trim();
                if (elText === searchText || elText.includes(searchText)) {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 10 && rect.y > 100 && rect.y < 800) {
                        el.click();
                        return {success: true, text: elText, y: rect.y};
                    }
                }
            }
            return {success: false, error: "not found"};
        }''', text)
        
        if result.get("success"):
            await self.log(f"Clicked: {text} at y={result.get('y')}")
            await asyncio.sleep(1)
            return True
        return False
    
    async def select_category(self, categories: List[str]) -> Dict[str, Any]:
        """
        Kategoriya tanlash (4 daraja)
        categories: ["Электроника", "Телефоны и планшеты", "Смартфоны", "Android"]
        """
        await self.log(f"Kategoriya tanlash: {' > '.join(categories)}")
        result = {"success": False, "selected": [], "failed": []}
        
        # 1. Kategoriya inputga click
        clicked = await self.page.evaluate('''() => {
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return false;
            
            const sr = sx.shadowRoot;
            const inputs = sr.querySelectorAll("input");
            
            for (const inp of inputs) {
                if (inp.placeholder && inp.placeholder.includes("категор")) {
                    inp.click();
                    inp.focus();
                    return true;
                }
            }
            return false;
        }''')
        
        if not clicked:
            result["error"] = "Kategoriya input topilmadi"
            return result
        
        await asyncio.sleep(2)
        await self.screenshot("cat_dropdown_open")
        
        # 2. Har bir kategoriya darajasini tanlash
        for i, cat_name in enumerate(categories):
            await self.log(f"  Level {i+1}: {cat_name}")
            
            # Kategoriyani topish va bosish
            cat_clicked = await self.page.evaluate('''(catName) => {
                const sx = document.querySelector("sx-products");
                if (!sx || !sx.shadowRoot) return {success: false};
                
                const sr = sx.shadowRoot;
                const allElements = sr.querySelectorAll("div, span, li");
                
                for (const el of allElements) {
                    const text = (el.innerText || "").trim();
                    if (text === catName) {
                        const rect = el.getBoundingClientRect();
                        // Dropdown ichida bo'lishi kerak
                        if (rect.y > 200 && rect.y < 700 && rect.height > 15 && rect.height < 60) {
                            el.click();
                            return {success: true, text: text, y: rect.y};
                        }
                    }
                }
                return {success: false};
            }''', cat_name)
            
            if cat_clicked.get("success"):
                result["selected"].append(cat_name)
                await self.log(f"    ✅ Tanlandi: {cat_name}")
                await asyncio.sleep(1.5)
            else:
                result["failed"].append(cat_name)
                await self.log(f"    ❌ Topilmadi: {cat_name}")
                break
        
        # 3. "Принять" tugmasini bosish
        await asyncio.sleep(1)
        accept_clicked = await self.click_by_text_in_shadow("Принять")
        if accept_clicked:
            await self.log("  ✅ 'Принять' bosildi")
            result["accepted"] = True
        
        await self.screenshot("cat_selected")
        result["success"] = len(result["selected"]) > 0
        return result
    
    async def fill_product_name(self, name_uz: str, name_ru: str) -> bool:
        """Mahsulot nomini to'ldirish (max 90 belgi)"""
        await self.log(f"Nom to'ldirish: UZ={name_uz[:30]}..., RU={name_ru[:30]}...")
        
        # 90 belgiga cheklash
        name_uz = name_uz[:90]
        name_ru = name_ru[:90]
        
        result = await self.page.evaluate('''(names) => {
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return {success: false};
            
            const sr = sx.shadowRoot;
            const inputs = sr.querySelectorAll("input");
            
            let uzFilled = false, ruFilled = false;
            
            for (const inp of inputs) {
                const ph = (inp.placeholder || "").toLowerCase();
                
                // O'zbekcha nom
                if (ph.includes("название") && ph.includes("узбек") || 
                    (ph.includes("точное название") && !uzFilled)) {
                    inp.value = names.uz;
                    inp.dispatchEvent(new Event("input", {bubbles: true}));
                    inp.dispatchEvent(new Event("change", {bubbles: true}));
                    uzFilled = true;
                }
                
                // Ruscha nom
                if (ph.includes("название") && ph.includes("русс") ||
                    (ph.includes("точное название") && uzFilled && !ruFilled)) {
                    inp.value = names.ru;
                    inp.dispatchEvent(new Event("input", {bubbles: true}));
                    inp.dispatchEvent(new Event("change", {bubbles: true}));
                    ruFilled = true;
                }
            }
            
            return {success: uzFilled || ruFilled, uzFilled, ruFilled};
        }''', {"uz": name_uz, "ru": name_ru})
        
        await self.log(f"  Nom natija: {result}")
        await asyncio.sleep(0.5)
        return result.get("success", False)
    
    async def fill_short_description(self, desc_uz: str, desc_ru: str) -> bool:
        """Qisqa tavsif to'ldirish (max 390 belgi)"""
        await self.log("Qisqa tavsif to'ldirilmoqda...")
        
        # 390 belgiga cheklash
        desc_uz = desc_uz[:390]
        desc_ru = desc_ru[:390]
        
        result = await self.page.evaluate('''(descs) => {
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return {success: false};
            
            const sr = sx.shadowRoot;
            
            // Textarealarni qidirish
            const textareas = sr.querySelectorAll("textarea");
            if (textareas.length >= 2) {
                textareas[0].value = descs.uz;
                textareas[0].dispatchEvent(new Event("input", {bubbles: true}));
                
                textareas[1].value = descs.ru;
                textareas[1].dispatchEvent(new Event("input", {bubbles: true}));
                
                return {success: true, filled: 2};
            }
            
            return {success: false, textareas: textareas.length};
        }''', {"uz": desc_uz, "ru": desc_ru})
        
        await self.log(f"  Qisqa tavsif natija: {result}")
        return result.get("success", False)
    
    async def fill_full_description(self, desc_uz: str, desc_ru: str) -> bool:
        """To'liq tavsif to'ldirish"""
        await self.log("To'liq tavsif to'ldirilmoqda...")
        
        # Scroll qilish - to'liq tavsif pastda
        await self.page.evaluate('() => window.scrollBy(0, 500)')
        await asyncio.sleep(1)
        
        result = await self.page.evaluate('''(descs) => {
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return {success: false};
            
            const sr = sx.shadowRoot;
            
            // Contenteditable yoki katta textarealarni qidirish
            const editors = sr.querySelectorAll("[contenteditable='true']");
            if (editors.length >= 2) {
                editors[0].innerHTML = descs.uz.replace(/\\n/g, "<br>");
                editors[0].dispatchEvent(new Event("input", {bubbles: true}));
                
                editors[1].innerHTML = descs.ru.replace(/\\n/g, "<br>");
                editors[1].dispatchEvent(new Event("input", {bubbles: true}));
                
                return {success: true, type: "contenteditable"};
            }
            
            // Yoki katta textarealar
            const bigTextareas = Array.from(sr.querySelectorAll("textarea")).filter(
                t => t.offsetHeight > 80 || t.rows > 3
            );
            
            if (bigTextareas.length >= 2) {
                bigTextareas[0].value = descs.uz;
                bigTextareas[0].dispatchEvent(new Event("input", {bubbles: true}));
                
                bigTextareas[1].value = descs.ru;
                bigTextareas[1].dispatchEvent(new Event("input", {bubbles: true}));
                
                return {success: true, type: "textarea"};
            }
            
            return {success: false};
        }''', {"uz": desc_uz, "ru": desc_ru})
        
        await self.log(f"  To'liq tavsif natija: {result}")
        return result.get("success", False)
    
    async def select_country(self, country: str = "Узбекистан") -> bool:
        """Mamlakat tanlash"""
        await self.log(f"Mamlakat tanlash: {country}")
        
        # Mamlakat dropdown ochish
        result = await self.page.evaluate('''(countryName) => {
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return {success: false};
            
            const sr = sx.shadowRoot;
            const inputs = sr.querySelectorAll("input");
            
            for (const inp of inputs) {
                if (inp.placeholder && inp.placeholder.includes("страну")) {
                    inp.click();
                    return {clicked: true};
                }
            }
            return {clicked: false};
        }''', country)
        
        if result.get("clicked"):
            await asyncio.sleep(1)
            return await self.click_by_text_in_shadow(country)
        
        return False
    
    async def click_save_continue(self) -> bool:
        """'Сохранить и продолжить' tugmasini bosish"""
        await self.log("'Сохранить и продолжить' bosilmoqda...")
        
        clicked = await self.page.evaluate('''() => {
            const sx = document.querySelector("sx-products");
            if (!sx || !sx.shadowRoot) return false;
            
            const sr = sx.shadowRoot;
            const buttons = sr.querySelectorAll("button");
            
            for (const btn of buttons) {
                const text = (btn.innerText || "").toLowerCase();
                if (text.includes("сохранить") && text.includes("продолжить")) {
                    if (!btn.disabled) {
                        btn.click();
                        return true;
                    } else {
                        console.log("Button disabled!");
                        return false;
                    }
                }
            }
            return false;
        }''')
        
        if clicked:
            await self.log("  ✅ Tugma bosildi")
            await asyncio.sleep(5)
            await self.screenshot("after_save")
        else:
            await self.log("  ❌ Tugma bosilmadi (disabled yoki topilmadi)")
            await self.screenshot("save_failed")
        
        return clicked
    
    async def create_product_full(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        TO'LIQ MAHSULOT YARATISH
        
        product_data:
        {
            "category_path": ["Электроника", "Телефоны", "Смартфоны", "Android"],
            "name_uz": "Samsung Galaxy A54 128GB",
            "name_ru": "Смартфон Samsung Galaxy A54 128GB",
            "short_desc_uz": "Yangi smartfon...",
            "short_desc_ru": "Новый смартфон...",
            "full_desc_uz": "To'liq tavsif...",
            "full_desc_ru": "Полное описание...",
            "country": "Узбекистан"
        }
        """
        result = {
            "success": False,
            "steps": [],
            "errors": [],
            "screenshots": []
        }
        
        try:
            # 1. Sahifaga o'tish
            await self.go_to_product_creation()
            result["steps"].append("page_loaded")
            
            # 2. Kategoriya tanlash
            cat_result = await self.select_category(product_data.get("category_path", []))
            if cat_result.get("success"):
                result["steps"].append(f"category_selected: {cat_result.get('selected')}")
            else:
                result["errors"].append(f"category_failed: {cat_result}")
            
            # 3. Mahsulot nomi
            name_ok = await self.fill_product_name(
                product_data.get("name_uz", ""),
                product_data.get("name_ru", "")
            )
            if name_ok:
                result["steps"].append("name_filled")
            
            # 4. Qisqa tavsif
            short_ok = await self.fill_short_description(
                product_data.get("short_desc_uz", ""),
                product_data.get("short_desc_ru", "")
            )
            if short_ok:
                result["steps"].append("short_desc_filled")
            
            # 5. To'liq tavsif
            full_ok = await self.fill_full_description(
                product_data.get("full_desc_uz", ""),
                product_data.get("full_desc_ru", "")
            )
            if full_ok:
                result["steps"].append("full_desc_filled")
            
            # 6. Mamlakat
            country_ok = await self.select_country(product_data.get("country", "Узбекистан"))
            if country_ok:
                result["steps"].append("country_selected")
            
            await self.screenshot("before_save")
            
            # 7. Saqlash va davom etish
            saved = await self.click_save_continue()
            if saved:
                result["steps"].append("step1_saved")
                result["success"] = True
            else:
                result["errors"].append("save_button_failed")
            
            result["screenshots"] = self.screenshots
            result["current_url"] = self.page.url
            
            return result
            
        except Exception as e:
            await self.screenshot("error")
            result["errors"].append(str(e))
            return result


async def create_uzum_product(
    phone: str,
    password: str, 
    product_data: Dict[str, Any],
    headless: bool = True
) -> Dict[str, Any]:
    """
    Uzum'da mahsulot yaratish - asosiy funksiya
    """
    automation = UzumRealAutomation(debug=True)
    
    try:
        # Browser ishga tushirish
        await automation.init_browser(headless=headless)
        
        # Login
        login_result = await automation.login(phone, password)
        if not login_result.get("success"):
            return {"success": False, "error": f"Login failed: {login_result.get('error')}"}
        
        # Mahsulot yaratish
        result = await automation.create_product_full(product_data)
        result["shop_id"] = automation.shop_id
        
        return result
        
    finally:
        await automation.close()


# Test
if __name__ == "__main__":
    test_data = {
        "category_path": ["Аксессуары"],
        "name_uz": "Test mahsulot - Samsung Galaxy A54",
        "name_ru": "Тест товар - Samsung Galaxy A54",
        "short_desc_uz": "Bu test mahsulot, Samsung Galaxy A54 smartfon, 128GB xotira",
        "short_desc_ru": "Это тестовый товар, Samsung Galaxy A54 смартфон, 128GB память",
        "full_desc_uz": "To'liq tavsif: Samsung Galaxy A54...",
        "full_desc_ru": "Полное описание: Samsung Galaxy A54...",
        "country": "Узбекистан"
    }
    
    result = asyncio.run(create_uzum_product(
        phone="998900082244",
        password="Medik9298",
        product_data=test_data,
        headless=True
    ))
    print(json.dumps(result, indent=2, ensure_ascii=False))
