"""
Uzum Market TO'LIQ Browser Automation - REAL WORKING STATE
Playwright orqali seller.uzum.uz da avtomatik mahsulot yaratish

TALABLAR:
1. 4 ta ichma-ich kategoriya tanlash
2. Mahsulot nomi (rus/o'zbek, max 90 belgi, SEO)
3. Qisqa tavsif (rus/o'zbek, max 390 belgi, kalit so'zlar)
4. To'liq tavsif (rasmli, rus/o'zbek)
5. Video (1080x1440, max 10MB) - ixtiyoriy
6. Rasmlar (infografika + boshqa, 1080x1440, max 5MB)
7. Xususiyatlar (rang, o'lcham)
8. SKU va IKPU
9. Narx va o'lchamlar
10. Yakuniy "Завершить" tugmasi

Shadow DOM bilan ishlash!
"""

import os
import asyncio
import re
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
from playwright.async_api import async_playwright, Browser, Page, BrowserContext, TimeoutError as PlaywrightTimeout
import httpx

# URLs
UZUM_SELLER_URL = "https://seller.uzum.uz"
UZUM_LOGIN_URL = "https://seller.uzum.uz/seller/signin"

# IKPU API
TASNIF_API_URL = "https://tasnif.soliq.uz/api/cls-api"


class UzumFullAutomation:
    """
    Uzum Market TO'LIQ Browser Automation
    Shadow DOM bilan professional ishlash
    """
    
    def __init__(self):
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.logged_in = False
        self.shop_id = None
        self.playwright = None
        self.debug_mode = True
    
    async def initialize(self, headless: bool = True):
        """Browser va context yaratish"""
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=headless,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        )
        self.context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale='ru-RU',
            ignore_https_errors=True
        )
        self.page = await self.context.new_page()
        self.page.set_default_timeout(60000)
        
        # Console loglarni tinglash
        self.page.on("console", lambda msg: print(f"[Browser Console] {msg.text}") if self.debug_mode else None)
        
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
    
    async def _log(self, message: str):
        """Debug log"""
        if self.debug_mode:
            print(f"[Uzum Auto] {datetime.now().strftime('%H:%M:%S')} - {message}")
    
    async def _screenshot(self, name: str):
        """Debug screenshot"""
        if self.debug_mode and self.page:
            await self.page.screenshot(path=f"/tmp/uzum_{name}_{datetime.now().strftime('%H%M%S')}.png")
    
    async def login(self, phone: str, password: str) -> Dict[str, Any]:
        """
        Uzum Seller kabinetiga kirish
        """
        try:
            if not self.page:
                await self.initialize()
            
            await self._log(f"Login sahifasiga o'tish: {UZUM_LOGIN_URL}")
            # Timeout va wait strategiyasini o'zgartirish
            try:
                await self.page.goto(UZUM_LOGIN_URL, wait_until='domcontentloaded', timeout=30000)
            except Exception as nav_error:
                await self._log(f"Birinchi urinish xatosi: {nav_error}, qayta urinilmoqda...")
                await self.page.goto(UZUM_LOGIN_URL, wait_until='load', timeout=45000)
            await asyncio.sleep(5)
            
            # Login formani to'ldirish
            inputs = await self.page.query_selector_all('input')
            await self._log(f"Topilgan inputlar soni: {len(inputs)}")
            
            if len(inputs) < 2:
                await self._screenshot("login_no_inputs")
                return {"success": False, "error": "Login forma topilmadi"}
            
            # Telefon va parol kiritish
            await inputs[0].fill(phone)
            await asyncio.sleep(0.5)
            await inputs[1].fill(password)
            await asyncio.sleep(0.5)
            
            # Войти tugmasini bosish
            await self.page.click('button:has-text("Войти")')
            await self._log("Войти tugmasi bosildi, kutilmoqda...")
            
            # Kirish jarayonini kutish
            await asyncio.sleep(15)
            
            current_url = self.page.url
            await self._log(f"Joriy URL: {current_url}")
            
            if '/signin' not in current_url and '/login' not in current_url:
                self.logged_in = True
                
                # Shop ID olish
                state_str = await self.page.evaluate('() => localStorage.getItem("state")')
                if state_str:
                    matches = re.findall(r'"(\d{5,})":\s*\[', state_str)
                    if matches:
                        self.shop_id = matches[0]
                        await self._log(f"Shop ID topildi: {self.shop_id}")
                
                await self._screenshot("login_success")
                return {
                    "success": True,
                    "message": "Muvaffaqiyatli kirildi!",
                    "shop_id": self.shop_id
                }
            else:
                await self._screenshot("login_failed")
                return {"success": False, "error": "Login muvaffaqiyatsiz - sahifa o'zgarmadi"}
                
        except Exception as e:
            await self._screenshot("login_error")
            return {"success": False, "error": f"Login xatosi: {str(e)}"}
    
    async def _wait_for_shadow_element(self, selector: str, timeout: int = 10000) -> bool:
        """Shadow DOM elementini kutish"""
        try:
            await self.page.wait_for_function(
                f'''() => {{
                    const sxProducts = document.querySelector("sx-products");
                    if (!sxProducts || !sxProducts.shadowRoot) return false;
                    const el = sxProducts.shadowRoot.querySelector("{selector}");
                    return el !== null;
                }}''',
                timeout=timeout
            )
            return True
        except:
            return False
    
    async def _click_shadow_element(self, selector: str, wait_after: float = 1.0) -> bool:
        """Shadow DOM ichidagi elementni bosish"""
        result = await self.page.evaluate(f'''() => {{
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return false;
            const el = sxProducts.shadowRoot.querySelector("{selector}");
            if (el) {{
                el.click();
                return true;
            }}
            return false;
        }}''')
        if result:
            await asyncio.sleep(wait_after)
        return result
    
    async def _fill_shadow_input(self, selector: str, value: str) -> bool:
        """Shadow DOM ichidagi inputni to'ldirish"""
        return await self.page.evaluate(f'''(value) => {{
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return false;
            const el = sxProducts.shadowRoot.querySelector("{selector}");
            if (el) {{
                el.value = value;
                el.dispatchEvent(new Event("input", {{bubbles: true}}));
                el.dispatchEvent(new Event("change", {{bubbles: true}}));
                return true;
            }}
            return false;
        }}''', value)
    
    async def _get_shadow_element_by_text(self, text: str) -> Optional[Dict]:
        """Matn bo'yicha Shadow DOM elementini topish"""
        return await self.page.evaluate(f'''(searchText) => {{
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return null;
            
            const sr = sxProducts.shadowRoot;
            const allElements = sr.querySelectorAll("*");
            
            for (const el of allElements) {{
                if (el.innerText && el.innerText.trim() === searchText) {{
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {{
                        return {{
                            x: rect.x + rect.width / 2,
                            y: rect.y + rect.height / 2,
                            text: el.innerText.trim()
                        }};
                    }}
                }}
            }}
            return null;
        }}''', text)
    
    async def _select_category_level(self, category_name: str, level: int) -> bool:
        """
        Kategoriya darajasini tanlash (Shadow DOM)
        level: 1, 2, 3, 4
        """
        await self._log(f"Kategoriya tanlash: Level {level} - '{category_name}'")
        
        # Kategoriya dropdown ochish (placeholder bo'yicha)
        placeholders = [
            "Выбрать категорию",
            "Выбрать подкатегорию",
            "Выбрать подкатегорию",
            "Выбрать подкатегорию"
        ]
        
        placeholder = placeholders[min(level-1, 3)]
        
        # Input koordinatalarini olish
        coords = await self.page.evaluate(f'''(placeholder) => {{
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return null;
            
            const sr = sxProducts.shadowRoot;
            const inputs = sr.querySelectorAll("input");
            
            for (const inp of inputs) {{
                if (inp.placeholder && inp.placeholder.includes(placeholder)) {{
                    const rect = inp.getBoundingClientRect();
                    if (rect.width > 0) {{
                        return {{
                            x: rect.x + rect.width / 2,
                            y: rect.y + rect.height / 2
                        }};
                    }}
                }}
            }}
            
            // Agar placeholder bilan topilmasa, bo'sh inputni topish
            for (const inp of inputs) {{
                if (!inp.value && inp.placeholder) {{
                    const rect = inp.getBoundingClientRect();
                    if (rect.width > 0 && rect.y > 200) {{
                        return {{
                            x: rect.x + rect.width / 2,
                            y: rect.y + rect.height / 2
                        }};
                    }}
                }}
            }}
            
            return null;
        }}''', placeholder)
        
        if coords:
            await self.page.mouse.click(coords['x'], coords['y'])
            await asyncio.sleep(2)
            
            # Dropdown ochilganini tekshirish
            await self._screenshot(f"category_level_{level}_dropdown")
            
            # Kategoriyani topish va bosish
            cat_found = await self._click_category_item(category_name)
            
            if cat_found:
                await self._log(f"Level {level} kategoriya tanlandi: {category_name}")
                await asyncio.sleep(2)
                return True
        
        await self._log(f"Level {level} kategoriya topilmadi")
        return False
    
    async def _click_category_item(self, category_name: str) -> bool:
        """Kategoriya elementini bosish (dropdown ichidan)"""
        # U-list-item class bilan elementlarni qidirish
        coords = await self.page.evaluate(f'''(catName) => {{
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return null;
            
            const sr = sxProducts.shadowRoot;
            
            // .u-list-item elementlarini qidirish
            const items = sr.querySelectorAll(".u-list-item, [class*='list-item'], li, div[role='option']");
            
            for (const item of items) {{
                const text = (item.innerText || item.textContent || "").trim();
                if (text === catName || text.includes(catName)) {{
                    const rect = item.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0 && rect.y > 100) {{
                        return {{
                            x: rect.x + rect.width / 2,
                            y: rect.y + rect.height / 2,
                            text: text
                        }};
                    }}
                }}
            }}
            
            // Agar topilmasa, barcha matnli elementlarni qidirish
            const allDivs = sr.querySelectorAll("div, span, p");
            for (const div of allDivs) {{
                const text = (div.innerText || "").trim();
                if (text === catName) {{
                    const rect = div.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 20 && rect.y > 100 && rect.y < 800) {{
                        return {{
                            x: rect.x + rect.width / 2,
                            y: rect.y + rect.height / 2,
                            text: text
                        }};
                    }}
                }}
            }}
            
            return null;
        }}''', category_name)
        
        if coords:
            await self._log(f"Kategoriya topildi: {coords['text']} at ({coords['x']}, {coords['y']})")
            await self.page.mouse.click(coords['x'], coords['y'])
            return True
        
        return False
    
    async def select_full_category(self, category_path: List[str]) -> Dict[str, Any]:
        """
        To'liq kategoriya yo'lini tanlash (4 ta daraja)
        
        Args:
            category_path: ["Elektronika", "Telefonlar", "Smartfonlar", "Android"]
        """
        result = {
            "success": False,
            "levels_completed": [],
            "levels_failed": []
        }
        
        await self._log(f"Kategoriya tanlash boshlandi: {' -> '.join(category_path)}")
        
        for i, cat_name in enumerate(category_path, 1):
            success = await self._select_category_level(cat_name, i)
            
            if success:
                result["levels_completed"].append({"level": i, "name": cat_name})
            else:
                result["levels_failed"].append({"level": i, "name": cat_name})
                break
        
        # "Принять" tugmasini bosish
        accept_clicked = await self.page.evaluate('''() => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return false;
            
            const sr = sxProducts.shadowRoot;
            const buttons = sr.querySelectorAll("button");
            
            for (const btn of buttons) {
                const text = (btn.innerText || "").trim();
                if (text.includes("Принять") || text.includes("Применить")) {
                    btn.click();
                    return true;
                }
            }
            return false;
        }''')
        
        if accept_clicked:
            await self._log("'Принять' tugmasi bosildi")
            await asyncio.sleep(2)
        
        result["success"] = len(result["levels_failed"]) == 0
        return result
    
    async def fill_product_names(self, name_uz: str, name_ru: str) -> bool:
        """
        Mahsulot nomlarini to'ldirish (max 90 belgi)
        O'zbek va Rus tilida
        """
        await self._log(f"Mahsulot nomi to'ldirilmoqda: UZ={name_uz[:50]}..., RU={name_ru[:50]}...")
        
        # 90 belgiga qisqartirish
        name_uz = name_uz[:90]
        name_ru = name_ru[:90]
        
        result = await self.page.evaluate('''(names) => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return {success: false, error: "Shadow DOM topilmadi"};
            
            const sr = sxProducts.shadowRoot;
            
            // "Название товара" yoki "название" so'zi bor inputlarni qidirish
            const allInputs = sr.querySelectorAll("input");
            const nameInputs = [];
            
            for (const inp of allInputs) {
                const placeholder = (inp.placeholder || "").toLowerCase();
                const label = inp.closest("div")?.querySelector("label")?.innerText?.toLowerCase() || "";
                
                if (placeholder.includes("название") || placeholder.includes("nomi") || 
                    label.includes("название") || label.includes("nomi")) {
                    nameInputs.push(inp);
                }
            }
            
            // Agar maxsus inputlar topilmasa, barcha text inputlarni olish
            if (nameInputs.length < 2) {
                const textInputs = Array.from(allInputs).filter(inp => 
                    inp.type === "text" && !inp.placeholder?.includes("категор") && 
                    !inp.placeholder?.includes("страну") && !inp.placeholder?.includes("поиск")
                );
                nameInputs.push(...textInputs.slice(0, 2));
            }
            
            if (nameInputs.length >= 2) {
                // Birinchi - O'zbekcha
                nameInputs[0].value = names.uz;
                nameInputs[0].dispatchEvent(new Event("input", {bubbles: true}));
                nameInputs[0].dispatchEvent(new Event("change", {bubbles: true}));
                
                // Ikkinchi - Ruscha
                nameInputs[1].value = names.ru;
                nameInputs[1].dispatchEvent(new Event("input", {bubbles: true}));
                nameInputs[1].dispatchEvent(new Event("change", {bubbles: true}));
                
                return {success: true, filled: 2};
            }
            
            return {success: false, error: "Nom inputlari topilmadi", found: nameInputs.length};
        }''', {"uz": name_uz, "ru": name_ru})
        
        await asyncio.sleep(1)
        return result.get("success", False)
    
    async def fill_short_description(self, desc_uz: str, desc_ru: str) -> bool:
        """
        Qisqa tavsif to'ldirish (Краткое описание товара)
        Max 390 belgi, kalit so'zlar, SEO uchun
        """
        await self._log("Qisqa tavsif to'ldirilmoqda...")
        
        # 390 belgiga qisqartirish
        desc_uz = desc_uz[:390]
        desc_ru = desc_ru[:390]
        
        result = await self.page.evaluate('''(descs) => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return {success: false};
            
            const sr = sxProducts.shadowRoot;
            
            // "Краткое описание" inputlarini qidirish
            const allTextareas = sr.querySelectorAll("textarea, input[type='text']");
            const shortDescInputs = [];
            
            for (const el of allTextareas) {
                const placeholder = (el.placeholder || "").toLowerCase();
                const parent = el.closest("div");
                const label = parent?.querySelector("label, span")?.innerText?.toLowerCase() || "";
                
                if (placeholder.includes("краткое") || label.includes("краткое") ||
                    placeholder.includes("qisqa") || label.includes("qisqa")) {
                    shortDescInputs.push(el);
                }
            }
            
            if (shortDescInputs.length >= 2) {
                shortDescInputs[0].value = descs.uz;
                shortDescInputs[0].dispatchEvent(new Event("input", {bubbles: true}));
                
                shortDescInputs[1].value = descs.ru;
                shortDescInputs[1].dispatchEvent(new Event("input", {bubbles: true}));
                
                return {success: true, filled: 2};
            }
            
            // Agar topilmasa, birinchi textarealarni ishlatish
            const textareas = sr.querySelectorAll("textarea");
            if (textareas.length >= 2) {
                textareas[0].value = descs.uz;
                textareas[0].dispatchEvent(new Event("input", {bubbles: true}));
                
                textareas[1].value = descs.ru;
                textareas[1].dispatchEvent(new Event("input", {bubbles: true}));
                
                return {success: true, filled: 2, note: "textarea ishlatildi"};
            }
            
            return {success: false, textareas: textareas.length};
        }''', {"uz": desc_uz, "ru": desc_ru})
        
        await asyncio.sleep(1)
        return result.get("success", False)
    
    async def fill_full_description(self, desc_uz: str, desc_ru: str) -> bool:
        """
        To'liq tavsif to'ldirish (Описание товара)
        Rasmli va matnli
        """
        await self._log("To'liq tavsif to'ldirilmoqda...")
        
        result = await self.page.evaluate('''(descs) => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return {success: false};
            
            const sr = sxProducts.shadowRoot;
            
            // Rich text editor yoki katta textarea qidirish
            const editors = sr.querySelectorAll("[contenteditable='true'], .editor, .ql-editor, textarea");
            const descInputs = [];
            
            for (const el of editors) {
                const parent = el.closest("div[class*='description'], div[class*='desc'], .form-group");
                const label = parent?.querySelector("label, span, h3, h4")?.innerText?.toLowerCase() || "";
                
                if (label.includes("описание") || label.includes("tavsif") || label.includes("description")) {
                    descInputs.push(el);
                }
            }
            
            // Agar maxsus topilmasa, barcha katta textarealarni olish
            if (descInputs.length < 2) {
                const bigTextareas = Array.from(sr.querySelectorAll("textarea")).filter(
                    t => t.offsetHeight > 100 || t.rows > 5
                );
                descInputs.push(...bigTextareas);
            }
            
            if (descInputs.length >= 2) {
                // Contenteditable uchun
                if (descInputs[0].contentEditable === "true") {
                    descInputs[0].innerHTML = descs.uz.replace(/\\n/g, "<br>");
                } else {
                    descInputs[0].value = descs.uz;
                }
                descInputs[0].dispatchEvent(new Event("input", {bubbles: true}));
                
                if (descInputs[1].contentEditable === "true") {
                    descInputs[1].innerHTML = descs.ru.replace(/\\n/g, "<br>");
                } else {
                    descInputs[1].value = descs.ru;
                }
                descInputs[1].dispatchEvent(new Event("input", {bubbles: true}));
                
                return {success: true};
            }
            
            return {success: false, found: descInputs.length};
        }''', {"uz": desc_uz, "ru": desc_ru})
        
        await asyncio.sleep(1)
        return result.get("success", False)
    
    async def upload_images(self, image_paths: List[str]) -> Dict[str, Any]:
        """
        Rasmlarni yuklash
        Birinchi rasm - infografika
        Format: 1080x1440px, max 5MB
        """
        await self._log(f"Rasmlar yuklanmoqda: {len(image_paths)} ta")
        
        result = {"success": False, "uploaded": 0, "errors": []}
        
        # File input topish
        file_inputs = await self.page.query_selector_all('input[type="file"]')
        
        if not file_inputs:
            # Shadow DOM ichidan qidirish
            await self.page.evaluate('''() => {
                const sxProducts = document.querySelector("sx-products");
                if (sxProducts && sxProducts.shadowRoot) {
                    const fileInputs = sxProducts.shadowRoot.querySelectorAll('input[type="file"]');
                    return fileInputs.length;
                }
                return 0;
            }''')
        
        # Har bir rasm uchun yuklash
        for i, img_path in enumerate(image_paths):
            try:
                # "Загрузить фото" tugmasini bosish
                upload_btn = await self.page.evaluate('''(index) => {
                    const sxProducts = document.querySelector("sx-products");
                    if (!sxProducts || !sxProducts.shadowRoot) return null;
                    
                    const sr = sxProducts.shadowRoot;
                    const uploadBtns = sr.querySelectorAll("button, div[class*='upload'], label[class*='upload']");
                    
                    for (const btn of uploadBtns) {
                        const text = (btn.innerText || "").toLowerCase();
                        if (text.includes("загрузить") || text.includes("yuklash") || text.includes("добавить фото")) {
                            const rect = btn.getBoundingClientRect();
                            return {x: rect.x + rect.width/2, y: rect.y + rect.height/2};
                        }
                    }
                    return null;
                }''', i)
                
                if upload_btn:
                    await self.page.mouse.click(upload_btn['x'], upload_btn['y'])
                    await asyncio.sleep(1)
                
                # File input orqali yuklash
                input_handle = await self.page.query_selector('input[type="file"]')
                if input_handle:
                    await input_handle.set_input_files(img_path)
                    result["uploaded"] += 1
                    await asyncio.sleep(2)
                
            except Exception as e:
                result["errors"].append({"image": img_path, "error": str(e)})
        
        result["success"] = result["uploaded"] > 0
        return result
    
    async def select_country(self, country: str = "Узбекистан") -> bool:
        """Ishlab chiqaruvchi mamlakatni tanlash"""
        await self._log(f"Mamlakat tanlanmoqda: {country}")
        
        # Dropdown ochish
        coords = await self.page.evaluate('''(countryName) => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return null;
            
            const sr = sxProducts.shadowRoot;
            
            // "Выберите страну" inputni topish
            const inputs = sr.querySelectorAll("input, select");
            for (const inp of inputs) {
                const placeholder = (inp.placeholder || "").toLowerCase();
                if (placeholder.includes("страну") || placeholder.includes("mamlakat")) {
                    const rect = inp.getBoundingClientRect();
                    return {x: rect.x + rect.width/2, y: rect.y + rect.height/2};
                }
            }
            return null;
        }''', country)
        
        if coords:
            await self.page.mouse.click(coords['x'], coords['y'])
            await asyncio.sleep(1)
            
            # Mamlakatni tanlash
            selected = await self._click_category_item(country)
            return selected
        
        return False
    
    async def fill_characteristics(self, characteristics: Dict[str, str]) -> Dict[str, Any]:
        """
        Xususiyatlarni to'ldirish
        Masalan: {"rang": "Qora", "o'lcham": "M", "model": "A54"}
        """
        await self._log(f"Xususiyatlar to'ldirilmoqda: {list(characteristics.keys())}")
        
        result = {"success": False, "filled": [], "failed": []}
        
        for key, value in characteristics.items():
            try:
                # Xususiyat nomini topish va tanlash
                char_selected = await self.page.evaluate(f'''(charData) => {{
                    const sxProducts = document.querySelector("sx-products");
                    if (!sxProducts || !sxProducts.shadowRoot) return false;
                    
                    const sr = sxProducts.shadowRoot;
                    
                    // Xususiyat dropdown yoki inputni qidirish
                    const labels = sr.querySelectorAll("label, span, div");
                    
                    for (const label of labels) {{
                        const text = (label.innerText || "").toLowerCase();
                        if (text.includes(charData.key.toLowerCase())) {{
                            // Input yoki select topish
                            const parent = label.closest("div");
                            const input = parent?.querySelector("input, select");
                            if (input) {{
                                if (input.tagName === "SELECT") {{
                                    input.value = charData.value;
                                }} else {{
                                    input.value = charData.value;
                                }}
                                input.dispatchEvent(new Event("input", {{bubbles: true}}));
                                input.dispatchEvent(new Event("change", {{bubbles: true}}));
                                return true;
                            }}
                        }}
                    }}
                    return false;
                }}''', {"key": key, "value": value})
                
                if char_selected:
                    result["filled"].append(key)
                else:
                    result["failed"].append(key)
                    
            except Exception as e:
                result["failed"].append(f"{key}: {str(e)}")
        
        result["success"] = len(result["filled"]) > 0
        await asyncio.sleep(1)
        return result
    
    async def fill_sku_and_ikpu(self, sku: str, ikpu_code: str) -> Dict[str, Any]:
        """
        SKU va IKPU kodini to'ldirish
        IKPU: 17 raqamli kod (tasnif.soliq.uz dan)
        """
        await self._log(f"SKU va IKPU to'ldirilmoqda: SKU={sku}, IKPU={ikpu_code}")
        
        result = await self.page.evaluate('''(data) => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return {success: false, error: "No shadow root"};
            
            const sr = sxProducts.shadowRoot;
            const result = {success: false, sku_filled: false, ikpu_filled: false};
            
            // SKU inputni topish
            const inputs = sr.querySelectorAll("input");
            for (const inp of inputs) {
                const placeholder = (inp.placeholder || "").toLowerCase();
                const label = inp.closest("div")?.querySelector("label")?.innerText?.toLowerCase() || "";
                
                // SKU
                if (placeholder.includes("sku") || placeholder.includes("артикул") || 
                    label.includes("sku") || label.includes("артикул")) {
                    inp.value = data.sku;
                    inp.dispatchEvent(new Event("input", {bubbles: true}));
                    result.sku_filled = true;
                }
                
                // IKPU
                if (placeholder.includes("икпу") || placeholder.includes("ikpu") || 
                    label.includes("икпу") || label.includes("ikpu")) {
                    inp.value = data.ikpu;
                    inp.dispatchEvent(new Event("input", {bubbles: true}));
                    result.ikpu_filled = true;
                }
            }
            
            result.success = result.sku_filled || result.ikpu_filled;
            return result;
        }''', {"sku": sku, "ikpu": ikpu_code})
        
        # Agar IKPU inputda to'g'ridan-to'g'ri ishlamasa, qidirish orqali
        if not result.get("ikpu_filled") and ikpu_code:
            await self._log("IKPU qidirish orqali tanlanmoqda...")
            
            # IKPU inputga yozish va dropdown dan tanlash
            await self.page.evaluate(f'''(ikpu) => {{
                const sxProducts = document.querySelector("sx-products");
                if (!sxProducts || !sxProducts.shadowRoot) return;
                
                const sr = sxProducts.shadowRoot;
                const inputs = sr.querySelectorAll("input");
                
                for (const inp of inputs) {{
                    const placeholder = (inp.placeholder || "").toLowerCase();
                    if (placeholder.includes("икпу") || placeholder.includes("поиск икпу")) {{
                        inp.value = ikpu;
                        inp.dispatchEvent(new Event("input", {{bubbles: true}}));
                        break;
                    }}
                }}
            }}''', ikpu_code)
            
            await asyncio.sleep(2)
            
            # Dropdown dan tanlash
            await self._click_category_item(ikpu_code)
        
        await asyncio.sleep(1)
        return result
    
    async def fill_price_and_dimensions(
        self, 
        price: int, 
        width_cm: int = 10, 
        height_cm: int = 10, 
        depth_cm: int = 10,
        weight_kg: float = 1.0
    ) -> Dict[str, Any]:
        """
        Narx va o'lchamlarni to'ldirish
        """
        await self._log(f"Narx va o'lchamlar: {price} so'm, {width_cm}x{height_cm}x{depth_cm} cm, {weight_kg} kg")
        
        result = await self.page.evaluate('''(data) => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return {success: false};
            
            const sr = sxProducts.shadowRoot;
            const result = {success: false, filled: []};
            
            const inputs = sr.querySelectorAll("input[type='number'], input[type='text']");
            
            for (const inp of inputs) {
                const placeholder = (inp.placeholder || "").toLowerCase();
                const label = inp.closest("div")?.querySelector("label, span")?.innerText?.toLowerCase() || "";
                const combined = placeholder + " " + label;
                
                // Narx
                if (combined.includes("цена") || combined.includes("narx") || combined.includes("price")) {
                    inp.value = data.price;
                    inp.dispatchEvent(new Event("input", {bubbles: true}));
                    result.filled.push("price");
                }
                
                // Kenglik
                if (combined.includes("ширина") || combined.includes("kenglik") || combined.includes("width")) {
                    inp.value = data.width;
                    inp.dispatchEvent(new Event("input", {bubbles: true}));
                    result.filled.push("width");
                }
                
                // Balandlik
                if (combined.includes("высота") || combined.includes("balandlik") || combined.includes("height")) {
                    inp.value = data.height;
                    inp.dispatchEvent(new Event("input", {bubbles: true}));
                    result.filled.push("height");
                }
                
                // Chuqurlik
                if (combined.includes("глубина") || combined.includes("chuqurlik") || combined.includes("depth")) {
                    inp.value = data.depth;
                    inp.dispatchEvent(new Event("input", {bubbles: true}));
                    result.filled.push("depth");
                }
                
                // Og'irlik
                if (combined.includes("вес") || combined.includes("og'irlik") || combined.includes("weight")) {
                    inp.value = data.weight;
                    inp.dispatchEvent(new Event("input", {bubbles: true}));
                    result.filled.push("weight");
                }
            }
            
            result.success = result.filled.length > 0;
            return result;
        }''', {
            "price": str(price),
            "width": str(width_cm),
            "height": str(height_cm),
            "depth": str(depth_cm),
            "weight": str(weight_kg)
        })
        
        await asyncio.sleep(1)
        return result
    
    async def click_save_and_continue(self) -> bool:
        """'Сохранить и продолжить' tugmasini bosish"""
        await self._log("'Сохранить и продолжить' tugmasi bosilmoqda...")
        
        clicked = await self.page.evaluate('''() => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return false;
            
            const sr = sxProducts.shadowRoot;
            const buttons = sr.querySelectorAll("button");
            
            for (const btn of buttons) {
                const text = (btn.innerText || "").toLowerCase();
                if (text.includes("сохранить") && text.includes("продолжить")) {
                    if (!btn.disabled && !btn.classList.contains("disabled")) {
                        btn.click();
                        return true;
                    }
                }
            }
            
            // data-test-id bilan ham qidirish
            const testBtn = sr.querySelector('button[data-test-id="button__save-continue"]');
            if (testBtn && !testBtn.disabled) {
                testBtn.click();
                return true;
            }
            
            return false;
        }''')
        
        if clicked:
            await self._log("Tugma bosildi, keyingi sahifa kutilmoqda...")
            await asyncio.sleep(5)
            await self._screenshot("after_save_continue")
        else:
            await self._log("Tugma topilmadi yoki disabled")
            await self._screenshot("save_button_issue")
        
        return clicked
    
    async def click_finish(self) -> bool:
        """'Завершить' tugmasini bosish"""
        await self._log("'Завершить' tugmasi bosilmoqda...")
        
        clicked = await self.page.evaluate('''() => {
            const sxProducts = document.querySelector("sx-products");
            if (!sxProducts || !sxProducts.shadowRoot) return false;
            
            const sr = sxProducts.shadowRoot;
            const buttons = sr.querySelectorAll("button");
            
            for (const btn of buttons) {
                const text = (btn.innerText || "").toLowerCase();
                if (text.includes("завершить") || text.includes("finish") || text.includes("yakunlash")) {
                    if (!btn.disabled && !btn.classList.contains("disabled")) {
                        btn.click();
                        return true;
                    }
                }
            }
            
            return false;
        }''')
        
        if clicked:
            await self._log("'Завершить' bosildi!")
            await asyncio.sleep(5)
            await self._screenshot("finish_clicked")
        
        return clicked
    
    async def create_full_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        TO'LIQ MAHSULOT YARATISH OQIMI
        
        product_data:
        {
            "category_path": ["Elektronika", "Telefonlar", "Smartfonlar", "Android"],
            "name_uz": "Samsung Galaxy A54 smartfoni",
            "name_ru": "Смартфон Samsung Galaxy A54",
            "short_desc_uz": "Yangi Samsung A54 - 128GB xotira...",
            "short_desc_ru": "Новый Samsung A54 - 128GB памяти...",
            "full_desc_uz": "To'liq tavsif...",
            "full_desc_ru": "Полное описание...",
            "images": ["/path/to/infographic.jpg", "/path/to/photo2.jpg"],
            "country": "Узбекистан",
            "characteristics": {"rang": "Qora", "xotira": "128GB"},
            "sku": "SAM-A54-128",
            "ikpu_code": "12345678901234567",
            "price": 3500000,
            "dimensions": {"width": 15, "height": 7, "depth": 1},
            "weight_kg": 0.2
        }
        """
        result = {
            "success": False,
            "steps_completed": [],
            "steps_failed": [],
            "current_step": None,
            "product_url": None
        }
        
        try:
            if not self.logged_in:
                return {"success": False, "error": "Avval login qiling"}
            
            if not self.shop_id:
                return {"success": False, "error": "Shop ID topilmadi"}
            
            # ========== STEP 1: Mahsulot yaratish sahifasiga o'tish ==========
            create_url = f"https://seller.uzum.uz/seller/{self.shop_id}/products/new"
            await self._log(f"Sahifaga o'tish: {create_url}")
            
            try:
                await self.page.goto(create_url, wait_until='domcontentloaded', timeout=45000)
            except Exception as nav_error:
                await self._log(f"Birinchi urinish xatosi: {nav_error}, qayta urinilmoqda...")
                await self.page.goto(create_url, wait_until='load', timeout=60000)
            
            await asyncio.sleep(8)
            
            result["current_step"] = "page_loaded"
            result["steps_completed"].append("page_loaded")
            await self._screenshot("step1_page_loaded")
            
            # ========== STEP 2: Kategoriya tanlash (4 daraja) ==========
            result["current_step"] = "category_selection"
            category_path = product_data.get("category_path", [])
            
            if category_path:
                cat_result = await self.select_full_category(category_path)
                if cat_result["success"]:
                    result["steps_completed"].append("category_selected")
                else:
                    result["steps_failed"].append({
                        "step": "category_selection",
                        "details": cat_result
                    })
            
            await asyncio.sleep(2)
            await self._screenshot("step2_category")
            
            # ========== STEP 3: Mahsulot nomlari (90 belgi) ==========
            result["current_step"] = "product_names"
            
            name_filled = await self.fill_product_names(
                product_data.get("name_uz", ""),
                product_data.get("name_ru", "")
            )
            
            if name_filled:
                result["steps_completed"].append("names_filled")
            else:
                result["steps_failed"].append({"step": "product_names"})
            
            # ========== STEP 4: Qisqa tavsif (390 belgi) ==========
            result["current_step"] = "short_description"
            
            short_filled = await self.fill_short_description(
                product_data.get("short_desc_uz", ""),
                product_data.get("short_desc_ru", "")
            )
            
            if short_filled:
                result["steps_completed"].append("short_desc_filled")
            else:
                result["steps_failed"].append({"step": "short_description"})
            
            # ========== STEP 5: To'liq tavsif ==========
            result["current_step"] = "full_description"
            
            full_filled = await self.fill_full_description(
                product_data.get("full_desc_uz", ""),
                product_data.get("full_desc_ru", "")
            )
            
            if full_filled:
                result["steps_completed"].append("full_desc_filled")
            else:
                result["steps_failed"].append({"step": "full_description"})
            
            await self._screenshot("step5_descriptions")
            
            # ========== STEP 6: Mamlakat tanlash ==========
            result["current_step"] = "country_selection"
            
            country_selected = await self.select_country(product_data.get("country", "Узбекистан"))
            if country_selected:
                result["steps_completed"].append("country_selected")
            
            # ========== STEP 7: Rasmlar yuklash ==========
            result["current_step"] = "image_upload"
            
            images = product_data.get("images", [])
            if images:
                img_result = await self.upload_images(images)
                if img_result["success"]:
                    result["steps_completed"].append(f"images_uploaded_{img_result['uploaded']}")
                else:
                    result["steps_failed"].append({"step": "image_upload", "details": img_result})
            
            await self._screenshot("step7_images")
            
            # ========== STEP 8: Xususiyatlar ==========
            result["current_step"] = "characteristics"
            
            characteristics = product_data.get("characteristics", {})
            if characteristics:
                char_result = await self.fill_characteristics(characteristics)
                if char_result["success"]:
                    result["steps_completed"].append("characteristics_filled")
            
            # ========== STEP 9: Birinchi sahifani saqlash ==========
            result["current_step"] = "save_step1"
            
            saved = await self.click_save_and_continue()
            if saved:
                result["steps_completed"].append("step1_saved")
            else:
                result["steps_failed"].append({"step": "save_step1"})
                # Agar saqlanmasa ham davom etish
            
            await asyncio.sleep(3)
            
            # ========== STEP 10: SKU va IKPU ==========
            result["current_step"] = "sku_ikpu"
            
            sku_result = await self.fill_sku_and_ikpu(
                product_data.get("sku", ""),
                product_data.get("ikpu_code", "")
            )
            if sku_result.get("success"):
                result["steps_completed"].append("sku_ikpu_filled")
            
            # ========== STEP 11: Narx va o'lchamlar ==========
            result["current_step"] = "price_dimensions"
            
            dims = product_data.get("dimensions", {})
            price_result = await self.fill_price_and_dimensions(
                price=product_data.get("price", 100000),
                width_cm=dims.get("width", 10),
                height_cm=dims.get("height", 10),
                depth_cm=dims.get("depth", 10),
                weight_kg=product_data.get("weight_kg", 1.0)
            )
            
            if price_result.get("success"):
                result["steps_completed"].append("price_filled")
            
            await self._screenshot("step11_price")
            
            # ========== STEP 12: Ikkinchi sahifani saqlash ==========
            result["current_step"] = "save_step2"
            
            saved2 = await self.click_save_and_continue()
            if saved2:
                result["steps_completed"].append("step2_saved")
            
            await asyncio.sleep(3)
            
            # ========== STEP 13: Yakunlash ==========
            result["current_step"] = "finish"
            
            finished = await self.click_finish()
            if finished:
                result["steps_completed"].append("finished")
                result["success"] = True
                result["product_url"] = self.page.url
            else:
                # Agar "Завершить" topilmasa, oxirgi "Сохранить" ni bosish
                final_save = await self.click_save_and_continue()
                if final_save:
                    result["steps_completed"].append("final_saved")
                    result["success"] = True
            
            await self._screenshot("final_result")
            
            return result
            
        except Exception as e:
            await self._screenshot("error")
            result["error"] = str(e)
            return result


async def get_ikpu_code(product_name: str, category: str = "") -> Optional[str]:
    """tasnif.soliq.uz dan IKPU kodini olish"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{TASNIF_API_URL}/search",
                params={"q": product_name, "limit": 5}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    return data[0].get("code", "")
    except:
        pass
    
    return None


async def create_uzum_product_full(
    phone: str,
    password: str,
    product_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Uzum'da TO'LIQ mahsulot yaratish
    """
    automation = UzumFullAutomation()
    
    try:
        await automation.initialize(headless=True)
        
        # Login
        login_result = await automation.login(phone, password)
        if not login_result.get("success"):
            return login_result
        
        # Mahsulot yaratish
        result = await automation.create_full_product(product_data)
        
        return result
        
    finally:
        await automation.close()


def get_uzum_full_automation() -> UzumFullAutomation:
    """Yangi automation instance"""
    return UzumFullAutomation()
