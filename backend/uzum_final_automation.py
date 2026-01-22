"""
UZUM MARKET - FINAL PROFESSIONAL AUTOMATION
============================================
Mouse click va scroll bilan mukammal ishlaydi.
"""

import asyncio
import re
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
from playwright.async_api import async_playwright, Browser, Page, BrowserContext


class UzumFinalAutomation:
    """Uzum Market Final Automation - Mouse click bilan"""
    
    def __init__(self, debug: bool = True):
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.playwright = None
        self.shop_id: Optional[str] = None
        self.debug = debug
        self.screenshots: List[str] = []
        self.api_errors: List[Dict] = []  # API xatolarini saqlash
        self.api_responses: List[Dict] = []  # Barcha API javoblarini saqlash
    
    async def log(self, msg: str):
        if self.debug:
            print(f"[Uzum] {datetime.now().strftime('%H:%M:%S')} - {msg}")
    
    async def screenshot(self, name: str) -> str:
        if self.page:
            path = f"/tmp/uzum_final_{name}_{datetime.now().strftime('%H%M%S')}.png"
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
        
        # ========== NETWORK RESPONSE LISTENER ==========
        # Bu Uzum API dan qaytgan xato xabarlarini ushlaydi
        async def handle_response(response):
            url = response.url
            status = response.status
            
            # Faqat Uzum API so'rovlarini kuzatish
            if 'api-seller.uzum.uz' in url or 'seller.uzum.uz/api' in url:
                try:
                    # Response body ni olish
                    body = None
                    content_type = response.headers.get('content-type', '')
                    
                    if 'application/json' in content_type:
                        try:
                            body = await response.json()
                        except:
                            try:
                                body = await response.text()
                            except:
                                body = "Could not read response body"
                    
                    response_data = {
                        "url": url,
                        "status": status,
                        "body": body,
                        "method": response.request.method
                    }
                    
                    self.api_responses.append(response_data)
                    
                    # Xato bo'lsa alohida saqlash
                    if status >= 400:
                        self.api_errors.append(response_data)
                        await self.log(f"❌ API XATO [{status}]: {url}")
                        await self.log(f"   Body: {json.dumps(body, ensure_ascii=False) if body else 'N/A'}")
                    elif status >= 200 and status < 300:
                        await self.log(f"✅ API OK [{status}]: {url[:80]}...")
                        
                except Exception as e:
                    await self.log(f"⚠️ Response handle xatosi: {e}")
        
        self.page.on("response", handle_response)
    
    async def close(self):
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
    
    def _analyze_error(self, error_body: Any) -> str:
        """API xatosini tahlil qilish va maslahat berish"""
        if not error_body:
            return "Xato ma'lumoti yo'q"
        
        if isinstance(error_body, dict):
            # Uzum API xato formatlari
            errors = error_body.get("errors", {})
            message = error_body.get("message", "")
            payload = error_body.get("payload", {})
            
            hints = []
            
            # Field validation errors
            if isinstance(errors, dict):
                for field, msg in errors.items():
                    hints.append(f"'{field}' maydoni: {msg}")
            elif isinstance(errors, list):
                for err in errors:
                    if isinstance(err, dict):
                        hints.append(f"{err.get('field', 'unknown')}: {err.get('message', str(err))}")
                    else:
                        hints.append(str(err))
            
            # General message
            if message:
                hints.append(f"Xabar: {message}")
            
            # Payload errors
            if payload and isinstance(payload, dict):
                for key, val in payload.items():
                    if 'error' in key.lower() or 'valid' in key.lower():
                        hints.append(f"{key}: {val}")
            
            return " | ".join(hints) if hints else "Noma'lum xato formati"
        
        return str(error_body)[:200]
    
    async def login(self, phone: str, password: str) -> Dict[str, Any]:
        """Login"""
        try:
            await self.log(f"Login: {phone}")
            await self.page.goto("https://seller.uzum.uz/seller/signin", wait_until='domcontentloaded')
            await asyncio.sleep(5)
            
            inputs = await self.page.query_selector_all('input')
            await inputs[0].fill(phone)
            await asyncio.sleep(0.3)
            await inputs[1].fill(password)
            await asyncio.sleep(0.3)
            
            await self.page.click('button:has-text("Войти")')
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
            return {"success": False, "error": str(e)}
    
    async def get_empty_subcategory_input(self) -> Optional[Dict]:
        """Bo'sh подкатегорию inputini topish"""
        return await self.page.evaluate('''() => {
            const sx = document.querySelector('sx-products');
            if (!sx || !sx.shadowRoot) return null;
            const sr = sx.shadowRoot;
            const inputs = sr.querySelectorAll('input');
            for (const inp of inputs) {
                if (inp.placeholder?.includes('подкатегорию') && !inp.value) {
                    const rect = inp.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        return {x: rect.x + rect.width/2, y: rect.y + rect.height/2};
                    }
                }
            }
            return null;
        }''')
    
    async def get_input_coords(self, placeholder: str) -> Optional[Dict]:
        """Input koordinatalarini olish"""
        return await self.page.evaluate(f'''() => {{
            const sx = document.querySelector('sx-products');
            if (!sx || !sx.shadowRoot) return null;
            const sr = sx.shadowRoot;
            const inputs = sr.querySelectorAll('input');
            for (const inp of inputs) {{
                if (inp.placeholder && inp.placeholder.includes("{placeholder}")) {{
                    const rect = inp.getBoundingClientRect();
                    if (rect.width > 0) {{
                        return {{x: rect.x + rect.width/2, y: rect.y + rect.height/2}};
                    }}
                }}
            }}
            return null;
        }}''')
    
    async def get_dropdown_items(self) -> List[str]:
        """Dropdown ichidagi elementlarni olish"""
        await asyncio.sleep(0.5)  # Dropdown to'liq yuklangandan keyin
        items = await self.page.evaluate('''() => {
            const sx = document.querySelector('sx-products');
            if (!sx || !sx.shadowRoot) return [];
            const sr = sx.shadowRoot;
            
            // [class*="u-list-item"] selectoridan foydalanish
            const listItems = sr.querySelectorAll('[class*="u-list-item"]');
            const items = [];
            const seen = new Set();
            
            listItems.forEach(item => {
                const main = item.querySelector('[class*="main-text"]');
                const text = main?.innerText?.trim() || item.innerText?.trim();
                // Faqat haqiqiy kategoriya nomlarini olish
                if (text && !seen.has(text) && !text.includes('Выбрать') && !text.includes('Принять') && text.length > 1) {
                    seen.add(text);
                    items.push(text);
                }
            });
            
            return items;
        }''')
        return items
    
    async def click_dropdown_item(self, item_name: str) -> bool:
        """Dropdown elementini bosish"""
        result = await self.page.evaluate(f'''() => {{
            const sx = document.querySelector('sx-products');
            if (!sx || !sx.shadowRoot) return false;
            const sr = sx.shadowRoot;
            const items = sr.querySelectorAll('[class*="u-list-item"]');
            for (const item of items) {{
                const main = item.querySelector('[class*="main-text"]');
                const text = main?.innerText?.trim() || '';
                if (text === "{item_name}") {{
                    item.scrollIntoView();
                    item.click();
                    return true;
                }}
            }}
            return false;
        }}''')
        return result
    
    async def select_full_category(self, category_path: List[str]) -> Dict[str, Any]:
        """
        To'liq kategoriya tanlash - barcha darajalar
        Mouse click yordamida
        """
        result = {"success": False, "selected": [], "errors": []}
        
        await self.log(f"Kategoriya: {' → '.join(category_path)}")
        
        # 1-DARAJA: Asosiy kategoriya
        coords = await self.get_input_coords("Выбрать категорию")
        if not coords:
            result["errors"].append("Kategoriya input topilmadi")
            return result
        
        await self.page.mouse.click(coords['x'], coords['y'])
        await asyncio.sleep(2)
        
        # 1-daraja tanlash
        if category_path:
            clicked = await self.click_dropdown_item(category_path[0])
            if clicked:
                result["selected"].append(category_path[0])
                await self.log(f"  ✅ 1-daraja: {category_path[0]}")
                await asyncio.sleep(1.5)
            else:
                result["errors"].append(f"1-daraja topilmadi: {category_path[0]}")
                return result
        
        # 2-DARAJA va undan keyingi darajalar
        for i, cat_name in enumerate(category_path[1:], 2):
            await self.log(f"  {i}-daraja: {cat_name}")
            
            # Bo'sh подкатегорию inputni topish
            coords = await self.get_empty_subcategory_input()
            if not coords:
                await self.log(f"    {i}-daraja input yo'q - oxirgi daraja")
                break
            
            await self.page.mouse.click(coords['x'], coords['y'])
            await asyncio.sleep(3)  # Dropdown ochilishi uchun 3 soniya kutish
            
            # Dropdown itemlarni ko'rish
            items = await self.get_dropdown_items()
            await self.log(f"    Mavjud: {items[:5]}...")
            
            if cat_name in items:
                clicked = await self.click_dropdown_item(cat_name)
                if clicked:
                    result["selected"].append(cat_name)
                    await self.log(f"    ✅ {i}-daraja: {cat_name}")
                    await asyncio.sleep(1.5)
                else:
                    result["errors"].append(f"{i}-daraja click xato: {cat_name}")
                    break
            else:
                # Eng yaqin mosini topish
                await self.log(f"    ⚠️ '{cat_name}' topilmadi, mavjudlardan tanlanadi")
                if items:
                    await self.click_dropdown_item(items[0])
                    result["selected"].append(items[0])
                    await asyncio.sleep(1.5)
                break
        
        # Barcha darajalarni to'ldirish - oxirigacha
        for attempt in range(5):  # Maksimum 5 daraja
            coords = await self.get_empty_subcategory_input()
            if not coords:
                break
            
            await self.log(f"  Qo'shimcha daraja topildi...")
            await self.page.mouse.click(coords['x'], coords['y'])
            await asyncio.sleep(3)
            
            items = await self.get_dropdown_items()
            if items:
                await self.click_dropdown_item(items[0])
                result["selected"].append(items[0])
                await self.log(f"    ✅ Tanlandi: {items[0]}")
                await asyncio.sleep(1.5)
            else:
                break
        
        # "Принять" tugmasi
        accept = await self.page.evaluate('''() => {
            const sx = document.querySelector('sx-products');
            const sr = sx.shadowRoot;
            const buttons = sr.querySelectorAll('button');
            for (const btn of buttons) {
                if (btn.innerText?.includes('Принять')) {
                    btn.click();
                    return true;
                }
            }
            return false;
        }''')
        
        if accept:
            await self.log("  ✅ 'Принять' bosildi")
            result["accepted"] = True
        
        await asyncio.sleep(2)
        result["success"] = len(result["selected"]) > 0
        return result
    
    async def fill_required_filters(self, size: str = "M", color: str = "Белый") -> Dict[str, Any]:
        """
        Majburiy filterlarni to'ldirish (Характеристики товара bo'limi)
        
        Uzum API xatosidan:
        - characteristicId: -1 -> Цвет (MAJBURIY)
        - characteristicIds: [-2...-30] -> Размер variantlari (kamida 1 tasi)
        """
        result = {"success": False, "filled": [], "errors": []}
        
        await self.log(f"Xususiyatlar: o'lcham={size}, rang={color}")
        
        # ========== 1. "Характеристики товара" BO'LIMIGA SCROLL ==========
        await self.page.evaluate('''() => {
            const sx = document.querySelector('sx-products');
            if (!sx || !sx.shadowRoot) return;
            const sr = sx.shadowRoot;
            
            const cards = sr.querySelectorAll('.product-creation-form__card');
            for (const card of cards) {
                if (card.innerText?.includes('Характеристики товара')) {
                    card.scrollIntoView({behavior: 'smooth', block: 'center'});
                    return true;
                }
            }
            window.scrollBy(0, 800);
        }''')
        await asyncio.sleep(1.5)
        
        # ========== 2. XUSUSIYATLAR DROPDOWN DA TANLASH ==========
        # Birinchi "Размер одежды RUS" ni tanlash
        size_char_selected = await self.page.evaluate('''() => {
            const sx = document.querySelector('sx-products');
            if (!sx || !sx.shadowRoot) return null;
            const sr = sx.shadowRoot;
            
            // product-characteristics classli cardni topish
            const charCard = sr.querySelector('.product-characteristics');
            if (!charCard) return {error: 'characteristics card not found'};
            
            // Select elementini topish
            const select = charCard.querySelector('select');
            if (select) {
                // "Размер одежды RUS" optionni tanlash
                for (let i = 0; i < select.options.length; i++) {
                    const opt = select.options[i];
                    if (opt.text.includes('Размер одежды RUS') || opt.text.includes('Размер одежды')) {
                        select.selectedIndex = i;
                        select.dispatchEvent(new Event('change', {bubbles: true}));
                        return {selected: opt.text, index: i};
                    }
                }
            }
            
            return {error: 'select or option not found'};
        }''')
        
        await self.log(f"O'lcham xususiyati tanlandi: {size_char_selected}")
        await asyncio.sleep(2)
        
        if size_char_selected and size_char_selected.get('selected'):
            result["filled"].append(f"size_char: {size_char_selected.get('selected')}")
        
        # ========== 3. O'LCHAM QIYMATLARI POPUP DA TANLASH ==========
        # "Выбрать характеристики" popup ochiladi - unda o'lcham variantlarini tanlash
        size_values_selected = await self.page.evaluate(f'''() => {{
            const sx = document.querySelector('sx-products');
            if (!sx || !sx.shadowRoot) return null;
            const sr = sx.shadowRoot;
            
            const result = {{selected: [], errors: []}};
            
            // Ochiq dialog ni topish - "Выбрать характеристики" yoki "Значения характеристики"
            const dialogs = sr.querySelectorAll('dialog');
            for (const dialog of dialogs) {{
                // Dialog ochiqmi tekshirish
                const isOpen = dialog.open || dialog.hasAttribute('open') || 
                              window.getComputedStyle(dialog).display !== 'none';
                
                if (isOpen) {{
                    console.log('Dialog topildi:', dialog.innerText?.substring(0, 100));
                    
                    // O'lcham checkboxlarini topish va tanlash
                    const checkboxes = dialog.querySelectorAll('input[type="checkbox"]');
                    console.log('Checkboxlar soni:', checkboxes.length);
                    
                    let selectedCount = 0;
                    for (const cb of checkboxes) {{
                        const label = cb.closest('label') || cb.parentElement;
                        const text = label?.innerText?.trim() || cb.value || '';
                        
                        console.log('Checkbox:', text, 'checked:', cb.checked);
                        
                        // M, L, XL yoki raqamli o'lchamlarni (48, 50, 52) tanlash
                        // Yoki biror o'lchamni tanlash
                        if (selectedCount < 3 && !cb.checked) {{
                            // Istalgan o'lchamni tanlash
                            if (text === '{size}' || text.includes('{size}') || 
                                text === 'M' || text === 'L' || text === 'XL' || 
                                text === '48' || text === '50' || text === '52' ||
                                text === '32' || text === '34' || text === '36' ||
                                text === '38' || text === '40' || text === '42' ||
                                text.match(/^\d{{2}}$/)) {{
                                cb.click();
                                result.selected.push(text);
                                selectedCount++;
                            }}
                        }}
                    }}
                    
                    // "Сохранить" tugmasini bosish
                    const saveBtn = [...dialog.querySelectorAll('button')].find(b => 
                        b.innerText?.includes('Сохранить')
                    );
                    if (saveBtn) {{
                        saveBtn.click();
                        result.saved = true;
                    }}
                    
                    if (result.selected.length > 0) break;
                }}
            }}
            
            return result;
        }}''')
        
        await self.log(f"O'lcham qiymatlari: {size_values_selected}")
        await asyncio.sleep(2)
        
        if size_values_selected and size_values_selected.get('selected'):
            result["filled"].extend(size_values_selected['selected'])
        
        # ========== 4. ЦВЕТ (RANG) XUSUSIYATINI QO'SHISH ==========
        # "Rang / Цвет" qatori uchun "Добавить" tugmasini bosish va rang tanlash
        await self.log("Rang xususiyatini qo'shish...")
        
        # Avval "Rang" yoki "Цвет" qatoridagi "Добавить" tugmasini topish va bosish
        color_btn_clicked = await self.page.evaluate('''() => {
            const sx = document.querySelector('sx-products');
            if (!sx || !sx.shadowRoot) return null;
            const sr = sx.shadowRoot;
            
            // Barcha karakteristika qatorlarini ko'rish
            const allElements = sr.querySelectorAll('*');
            
            for (const el of allElements) {
                const text = el.innerText || '';
                
                // "Rang" yoki "Цвет" bo'lgan qatordagi "Добавить" tugmasini topish
                if ((text.includes('Rang') || text.includes('Цвет') || text.includes('цвет')) && 
                    !text.includes('Размер') && el.innerText?.length < 200) {
                    
                    // Ushbu element ichidagi "Добавить" tugmasini topish
                    const btn = el.querySelector('button');
                    if (btn && (btn.innerText?.includes('Добавить') || btn.innerText?.trim() === '+')) {
                        btn.click();
                        return {clicked: true, parentText: text.substring(0, 50)};
                    }
                }
            }
            
            // Alternative: barcha "Добавить" tugmalarini ko'rish va mosini topish
            const charCards = sr.querySelectorAll('.product-characteristics .char-row, .product-characteristics [class*="char"]');
            for (const card of charCards) {
                if (card.innerText?.includes('Цвет') || card.innerText?.includes('Rang')) {
                    const btn = card.querySelector('button');
                    if (btn) {
                        btn.click();
                        return {clicked: true, source: 'charCard'};
                    }
                }
            }
            
            return {clicked: false, error: 'color button not found'};
        }''')
        
        await self.log(f"Rang tugmasi: {color_btn_clicked}")
        await asyncio.sleep(2)
        
        # Endi ochilgan popup da rang tanlash
        if color_btn_clicked and color_btn_clicked.get('clicked'):
            color_selected = await self.page.evaluate(f'''() => {{
                const sx = document.querySelector('sx-products');
                if (!sx || !sx.shadowRoot) return null;
                const sr = sx.shadowRoot;
                
                const result = {{selected: [], saved: false}};
                
                // Ochiq dialog ni topish
                const dialogs = sr.querySelectorAll('dialog');
                for (const dialog of dialogs) {{
                    const isOpen = dialog.open || dialog.hasAttribute('open');
                    
                    if (isOpen) {{
                        // Rang checkboxlarini topish
                        const checkboxes = dialog.querySelectorAll('input[type="checkbox"]');
                        let selectedAny = false;
                        
                        for (const cb of checkboxes) {{
                            const label = cb.closest('label') || cb.parentElement;
                            const text = label?.innerText?.trim() || '';
                            
                            // Istalgan rangni tanlash (Белый, Черный, Синий va h.k.)
                            if (!cb.checked && !selectedAny) {{
                                // Faqat birinchi rangni tanlash
                                if (text.includes('{color}') || text.includes('Белый') || 
                                    text.includes('Черный') || text.includes('Синий') ||
                                    text.includes('Серый') || text.includes('Бежевый') ||
                                    text.includes('белый') || text.includes('черный')) {{
                                    cb.click();
                                    result.selected.push(text);
                                    selectedAny = true;
                                }}
                            }}
                        }}
                        
                        // Agar hech narsa tanlanmagan bo'lsa, birinchisini tanlash
                        if (!selectedAny && checkboxes.length > 0) {{
                            const firstUnchecked = [...checkboxes].find(cb => !cb.checked);
                            if (firstUnchecked) {{
                                firstUnchecked.click();
                                const label = firstUnchecked.closest('label') || firstUnchecked.parentElement;
                                result.selected.push(label?.innerText?.trim() || 'unknown');
                            }}
                        }}
                        
                        // "Сохранить" tugmasini bosish
                        const saveBtn = [...dialog.querySelectorAll('button')].find(b => 
                            b.innerText?.includes('Сохранить')
                        );
                        if (saveBtn) {{
                            saveBtn.click();
                            result.saved = true;
                        }}
                        
                        break;
                    }}
                }}
                
                return result;
            }}''')
            
            await self.log(f"Rang tanlandi: {color_selected}")
            await asyncio.sleep(2)
            
            if color_selected and color_selected.get('selected'):
                result["filled"].append(f"color: {color_selected['selected']}")
        
        # ========== 5. BRAND CHECKBOX ==========
        brand_handled = await self.page.evaluate('''() => {
            const sx = document.querySelector('sx-products');
            if (!sx || !sx.shadowRoot) return false;
            const sr = sx.shadowRoot;
            
            const labels = sr.querySelectorAll('label');
            for (const label of labels) {
                const text = label.innerText || '';
                if (text.includes('Без бренда')) {
                    const checkbox = label.querySelector('input[type="checkbox"]');
                    if (checkbox && !checkbox.checked) {
                        checkbox.click();
                        return true;
                    }
                    return 'already_checked';
                }
            }
            return false;
        }''')
        
        if brand_handled:
            result["filled"].append(f"brand: {brand_handled}")
        
        result["success"] = len(result["filled"]) > 0
        await self.log(f"Xususiyatlar: {'✅' if result['success'] else '❌'} ({', '.join(result['filled'])})")
        return result
    
    async def _fill_characteristic_value(self, char_name: str, value: str) -> bool:
        """Xususiyat qiymatini to'ldirish (popup orqali)"""
        try:
            # Xususiyat nomini topib, uning "Добавить" tugmasini bosish
            clicked = await self.page.evaluate(f'''() => {{
                const sx = document.querySelector('sx-products');
                if (!sx || !sx.shadowRoot) return false;
                const sr = sx.shadowRoot;
                
                // Xususiyatlar ro'yxatidagi elementlarni topish
                const charItems = sr.querySelectorAll('[class*="characteristic"], [class*="char-item"]');
                for (const item of charItems) {{
                    if (item.innerText?.includes('{char_name}')) {{
                        // "Добавить" yoki "+" tugmasini topish
                        const btn = item.querySelector('button');
                        if (btn) {{
                            btn.click();
                            return true;
                        }}
                    }}
                }}
                
                // Alternative: barcha "Добавить" tugmalarini ko'rish
                const buttons = sr.querySelectorAll('button');
                for (const btn of buttons) {{
                    const parent = btn.parentElement;
                    if (parent?.innerText?.includes('{char_name}') && btn.innerText?.includes('Добавить')) {{
                        btn.click();
                        return true;
                    }}
                }}
                
                return false;
            }}''')
            
            if not clicked:
                return False
            
            await asyncio.sleep(1)
            
            # "add-char-popup" dialog da qiymat kiritish
            filled = await self.page.evaluate(f'''() => {{
                const sx = document.querySelector('sx-products');
                if (!sx || !sx.shadowRoot) return false;
                const sr = sx.shadowRoot;
                
                // "Значения характеристики" dialogni topish
                const dialog = sr.querySelector('.add-char-popup');
                if (dialog && dialog.open) {{
                    // Input yoki select ni topish
                    const inputs = dialog.querySelectorAll('input:not([type="checkbox"])');
                    for (const inp of inputs) {{
                        inp.value = '{value}';
                        inp.dispatchEvent(new Event('input', {{bubbles: true}}));
                    }}
                    
                    // Checkbox variantlarini tekshirish
                    const checkboxes = dialog.querySelectorAll('input[type="checkbox"]');
                    for (const cb of checkboxes) {{
                        const label = cb.closest('label') || cb.parentElement;
                        const text = label?.innerText || '';
                        if (text.includes('{value}') || text === '{value}') {{
                            if (!cb.checked) cb.click();
                        }}
                    }}
                    
                    // "Сохранить" tugmasini bosish
                    const saveBtn = [...dialog.querySelectorAll('button')].find(b => 
                        b.innerText?.includes('Сохранить')
                    );
                    if (saveBtn) {{
                        saveBtn.click();
                        return true;
                    }}
                }}
                
                return false;
            }}''')
            
            await asyncio.sleep(1)
            return filled
            
        except Exception as e:
            await self.log(f"Xususiyat to'ldirish xatosi ({char_name}): {e}")
            return False
    
    async def add_variant_size(self, sizes: List[str] = None) -> Dict[str, Any]:
        """
        Variant/SKU yaratish uchun o'lchamlarni qo'shish
        Bu Uzum ning "Добавить размер" funksiyasi
        """
        if sizes is None:
            sizes = ["M", "L", "XL"]
        
        result = {"success": False, "added_sizes": [], "errors": []}
        
        await self.log(f"Variant o'lchamlar: {sizes}")
        
        # Sahifani scroll qilish
        await self.page.evaluate('() => window.scrollBy(0, 400)')
        await asyncio.sleep(1)
        
        for size in sizes:
            try:
                added = await self.page.evaluate(f'''() => {{
                    const sx = document.querySelector('sx-products');
                    if (!sx || !sx.shadowRoot) return null;
                    const sr = sx.shadowRoot;
                    
                    // O'lcham qo'shish tugmasini topish
                    const buttons = sr.querySelectorAll('button');
                    for (const btn of buttons) {{
                        const text = btn.innerText || '';
                        if (text.includes('Добавить') && text.includes('размер')) {{
                            btn.click();
                            return 'add_clicked';
                        }}
                        if (text.includes('{size}') || text === '{size}') {{
                            btn.click();
                            return 'size_clicked';
                        }}
                    }}
                    
                    // O'lcham checkboxini belgilash
                    const checkboxes = sr.querySelectorAll('input[type="checkbox"]');
                    for (const cb of checkboxes) {{
                        const label = cb.closest('label') || cb.nextElementSibling;
                        const labelText = (label?.innerText || '') + (cb.value || '');
                        if (labelText === '{size}' || labelText.includes('{size}')) {{
                            if (!cb.checked) cb.click();
                            return '{size}_checked';
                        }}
                    }}
                    
                    return null;
                }}''')
                
                if added:
                    result["added_sizes"].append(size)
                    await asyncio.sleep(0.5)
                    
            except Exception as e:
                result["errors"].append(f"{size}: {e}")
        
        result["success"] = len(result["added_sizes"]) > 0
        return result

    async def fill_names(self, name_uz: str, name_ru: str) -> bool:
        """Nomlarni to'ldirish (90 belgi)"""
        name_uz = name_uz[:90]
        name_ru = name_ru[:90]
        
        result = await self.page.evaluate('''(names) => {
            const sx = document.querySelector('sx-products');
            const sr = sx.shadowRoot;
            const inputs = sr.querySelectorAll('input');
            let filled = 0;
            const nameInputs = [];
            
            for (const inp of inputs) {
                if (inp.placeholder?.includes('Точное название')) {
                    nameInputs.push(inp);
                }
            }
            
            if (nameInputs.length >= 2) {
                nameInputs[0].value = names.uz;
                nameInputs[0].dispatchEvent(new Event('input', {bubbles: true}));
                nameInputs[1].value = names.ru;
                nameInputs[1].dispatchEvent(new Event('input', {bubbles: true}));
                filled = 2;
            }
            
            return filled >= 2;
        }''', {"uz": name_uz, "ru": name_ru})
        
        await self.log(f"Nom: {'✅' if result else '❌'}")
        return result
    
    async def fill_short_desc(self, desc_uz: str, desc_ru: str) -> bool:
        """Qisqa tavsif (390 belgi)"""
        desc_uz = desc_uz[:390]
        desc_ru = desc_ru[:390]
        
        result = await self.page.evaluate('''(descs) => {
            const sx = document.querySelector('sx-products');
            const sr = sx.shadowRoot;
            const textareas = sr.querySelectorAll('textarea');
            
            if (textareas.length >= 2) {
                textareas[0].value = descs.uz;
                textareas[0].dispatchEvent(new Event('input', {bubbles: true}));
                textareas[1].value = descs.ru;
                textareas[1].dispatchEvent(new Event('input', {bubbles: true}));
                return true;
            }
            return false;
        }''', {"uz": desc_uz, "ru": desc_ru})
        
        await self.log(f"Qisqa tavsif: {'✅' if result else '❌'}")
        return result
    
    async def fill_full_desc(self, desc_uz: str, desc_ru: str) -> bool:
        """To'liq tavsif"""
        await self.page.evaluate('() => window.scrollBy(0, 400)')
        await asyncio.sleep(0.5)
        
        result = await self.page.evaluate('''(descs) => {
            const sx = document.querySelector('sx-products');
            const sr = sx.shadowRoot;
            const editors = sr.querySelectorAll("[contenteditable='true']");
            
            if (editors.length >= 2) {
                editors[0].innerHTML = descs.uz.replace(/\\n/g, '<br>');
                editors[0].dispatchEvent(new Event('input', {bubbles: true}));
                editors[1].innerHTML = descs.ru.replace(/\\n/g, '<br>');
                editors[1].dispatchEvent(new Event('input', {bubbles: true}));
                return true;
            }
            return false;
        }''', {"uz": desc_uz, "ru": desc_ru})
        
        await self.log(f"To'liq tavsif: {'✅' if result else '❌'}")
        return result
    
    async def select_country(self, country: str) -> bool:
        """Mamlakat tanlash"""
        coords = await self.get_input_coords("страну")
        if coords:
            await self.page.mouse.click(coords['x'], coords['y'])
            await asyncio.sleep(1)
            clicked = await self.click_dropdown_item(country)
            await self.log(f"Mamlakat: {'✅' if clicked else '❌'} {country}")
            return clicked
        return False
    
    async def click_save(self) -> bool:
        """Saqlash tugmasi"""
        result = await self.page.evaluate('''() => {
            const sx = document.querySelector('sx-products');
            const sr = sx.shadowRoot;
            const buttons = sr.querySelectorAll('button');
            for (const btn of buttons) {
                const text = (btn.innerText || '').toLowerCase();
                if (text.includes('сохранить') && text.includes('продолжить')) {
                    if (!btn.disabled) {
                        btn.click();
                        return true;
                    }
                }
            }
            return false;
        }''')
        
        if result:
            await self.log("✅ 'Сохранить и продолжить' bosildi")
            await asyncio.sleep(5)
        else:
            await self.log("❌ Tugma disabled yoki topilmadi")
        
        return result
    
    async def create_product(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """To'liq mahsulot yaratish"""
        result = {"success": False, "steps": [], "errors": []}
        
        try:
            # Sahifaga o'tish
            if not self.shop_id:
                self.shop_id = "37889"
            
            url = f"https://seller.uzum.uz/seller/{self.shop_id}/products/new"
            await self.page.goto(url, wait_until='domcontentloaded')
            await asyncio.sleep(8)
            result["steps"].append("page_loaded")
            
            # Kategoriya
            cat_result = await self.select_full_category(data.get("category_path", []))
            if cat_result["success"]:
                result["steps"].append(f"category: {cat_result['selected']}")
            else:
                result["errors"].extend(cat_result.get("errors", []))
            
            # Nom
            if await self.fill_names(data.get("name_uz", ""), data.get("name_ru", "")):
                result["steps"].append("names_filled")
            
            # Qisqa tavsif
            if await self.fill_short_desc(data.get("short_desc_uz", ""), data.get("short_desc_ru", "")):
                result["steps"].append("short_desc_filled")
            
            # To'liq tavsif
            if await self.fill_full_desc(data.get("full_desc_uz", ""), data.get("full_desc_ru", "")):
                result["steps"].append("full_desc_filled")
            
            # Mamlakat
            if await self.select_country(data.get("country", "Узбекистан")):
                result["steps"].append("country_selected")
            
            # ========== MAJBURIY FILTERLAR (XUSUSIYATLAR) ==========
            # Bu asosiy muammo edi - "Required filter was not present"
            filter_result = await self.fill_required_filters(
                size=data.get("size", "M"),
                color=data.get("color", "Белый")
            )
            if filter_result["success"]:
                result["steps"].append(f"filters: {filter_result['filled']}")
            else:
                result["errors"].extend(filter_result.get("errors", []))
            
            # Variant/o'lchamlar qo'shish (agar kerak bo'lsa)
            sizes = data.get("sizes", ["M"])
            if sizes:
                variant_result = await self.add_variant_size(sizes)
                if variant_result["success"]:
                    result["steps"].append(f"variants: {variant_result['added_sizes']}")
            
            await self.screenshot("before_save")
            
            # Saqlash
            if await self.click_save():
                result["steps"].append("saved")
                result["success"] = True
            else:
                result["errors"].append("save_failed")
            
            await self.screenshot("after_save")
            result["url"] = self.page.url
            result["screenshots"] = self.screenshots
            
            # ========== API XATOLARINI QO'SHISH ==========
            result["api_errors"] = self.api_errors
            result["api_responses"] = self.api_responses[-10:]  # Oxirgi 10 ta javob
            
            # Agar API xatolari bo'lsa, success ni false qilish
            if self.api_errors:
                result["success"] = False
                result["errors"].append(f"API errors: {len(self.api_errors)}")
                
                # Eng oxirgi xatoni batafsil ko'rsatish
                last_error = self.api_errors[-1]
                result["last_api_error"] = {
                    "url": last_error.get("url", ""),
                    "status": last_error.get("status", 0),
                    "body": last_error.get("body", {}),
                    "hint": self._analyze_error(last_error.get("body", {}))
                }
            
            return result
            
        except Exception as e:
            result["errors"].append(str(e))
            await self.screenshot("error")
            return result


async def create_uzum_product_final(
    phone: str,
    password: str,
    product_data: Dict[str, Any],
    headless: bool = True
) -> Dict[str, Any]:
    """
    Uzum Market da mahsulot yaratish (final version)
    
    Args:
        phone: Telefon raqami yoki email
        password: Parol
        product_data: Mahsulot ma'lumotlari
        headless: Brauzer ko'rinmasligini
    """
    auto = UzumFinalAutomation(debug=True)
    
    try:
        await auto.init_browser(headless=headless)
        
        login = await auto.login(phone, password)
        if not login.get("success"):
            return {"success": False, "error": f"Login: {login.get('error')}"}
        
        result = await auto.create_product(product_data)
        result["shop_id"] = auto.shop_id
        return result
        
    finally:
        await auto.close()


if __name__ == "__main__":
    test_data = {
        "category_path": ["Одежда", "Мужская одежда", "Рубашки"],
        "name_uz": "Erkaklar klassik ko'ylagi oq rang M o'lcham",
        "name_ru": "Мужская классическая рубашка белый цвет размер M",
        "short_desc_uz": "Yuqori sifatli erkaklar ko'ylagi. 100% paxta. Klassik dizayn. Barcha o'lchamlarda mavjud. Tez yetkazib berish.",
        "short_desc_ru": "Высококачественная мужская рубашка. 100% хлопок. Классический дизайн. Все размеры в наличии. Быстрая доставка.",
        "full_desc_uz": "Erkaklar uchun klassik ko'ylak\\n\\nXususiyatlari:\\n• 100% tabiiy paxta\\n• Klassik dizayn\\n• O'lchamlar: S, M, L, XL\\n• Rangi: Oq\\n\\nParvarish: 40°C da yuvish",
        "full_desc_ru": "Классическая мужская рубашка\\n\\nХарактеристики:\\n• 100% натуральный хлопок\\n• Классический дизайн\\n• Размеры: S, M, L, XL\\n• Цвет: Белый\\n\\nУход: стирка при 40°C",
        "country": "Узбекистан"
    }
    
    result = asyncio.run(create_uzum_product_final(
        phone="998900082244",
        password="Medik9298",
        product_data=test_data,
        headless=True
    ))
    
    print("\n" + "="*60)
    print("NATIJA:")
    print("="*60)
    print(json.dumps(result, indent=2, ensure_ascii=False))
