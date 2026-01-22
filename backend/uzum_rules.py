"""
Uzum Market Rules & Regulations Database
Real data from official Uzum Market documentation (2024-2025)
"""

# ========================================
# STOP WORDS - Taqiqlangan so'zlar
# ========================================

STOP_WORDS = {
    # Aktsiya/chegirma so'zlari
    "распродажа", "rasprodaja", "sale",
    "скидка", "скидки", "chegirma", "discount",
    "акция", "акции", "aksiya", "promo",
    "кэшбэк", "cashback", "кешбек",
    "выгодно", "выгода", "foydali",
    "дешево", "дешевый", "arzon",
    "бесплатно", "free", "bepul",
    
    # Marketing so'zlari
    "хит", "hit", "xit",
    "новинка", "yangilik", "new",
    "тренд", "trend",
    "топ", "top", "eng yaxshi",
    "лучший", "best",
    "номер 1", "№1", "#1",
    
    # Sifat so'zlari (taqiqlangan)
    "оригинал", "original", "asl",
    "копия", "kopiya", "copy",
    "реплика", "replika", "replica",
    "аналог", "analog",
    "подделка", "fake", "soxta",
    
    # Holat so'zlari
    "б/у", "bu", "ishlatilgan", "used",
    "уценка", "уцененный",
    "секонд", "second", "secondhand",
    
    # Boshqa taqiqlangan
    "купить", "sotib oling", "buy now",
    "заказать", "buyurtma",
    "гарантия", "kafolat", "warranty",
    "возврат", "qaytarish", "return",
    "отзыв", "отзывы", "sharh", "review",
    "китай", "xitoy", "china",
    "супер", "super",
    
    # Contact/reklama
    "телефон", "telefon", "phone",
    "звоните", "qo'ng'iroq",
    "whatsapp", "telegram", "instagram",
    "@", "www.", "http",
}

# ========================================
# UZUM MARKET KOMISSIYALARI (2024-2025)
# 
# MUHIM: Komissiya tovar NARXIGA bog'liq!
# - Arzon tovarlar (50-500k so'm) = yuqori komissiya (20-35%)
# - O'rta tovarlar (500k-2mln) = o'rta komissiya (12-20%)
# - Qimmat tovarlar (2mln+) = past komissiya (8-15%)
# - Juda qimmat (5mln+) = minimal komissiya (3-8%)
# ========================================

# Narxga asoslangan komissiya (foizda)
PRICE_BASED_COMMISSION = {
    # Narx diapazoni: (min, max, commission%)
    "very_cheap": (0, 100000, 30),           # 0-100k: 30%
    "cheap": (100000, 300000, 25),           # 100-300k: 25%
    "low_medium": (300000, 500000, 20),      # 300-500k: 20%
    "medium": (500000, 1000000, 17),         # 500k-1mln: 17%
    "high_medium": (1000000, 2000000, 14),   # 1-2mln: 14%
    "high": (2000000, 5000000, 10),          # 2-5mln: 10%
    "very_high": (5000000, 10000000, 6),     # 5-10mln: 6%
    "premium": (10000000, float('inf'), 3),  # 10mln+: 3%
}

# Kategoriyaga asoslangan bazaviy komissiya (minimal)
COMMISSION_RATES = {
    # Elektronika - qimmat tovarlar, past komissiya
    "electronics": {
        "smartphones": {"base": 10, "min_price_factor": True},
        "tablets": {"base": 10, "min_price_factor": True},
        "laptops": {"base": 8, "min_price_factor": True},
        "accessories": {"base": 15, "min_price_factor": True},
        "headphones": {"base": 12, "min_price_factor": True},
        "smartwatch": {"base": 12, "min_price_factor": True},
        "cameras": {"base": 10, "min_price_factor": True},
        "tv": {"base": 8, "min_price_factor": True},
        "appliances_large": {"base": 8, "min_price_factor": True},  # Katta maishiy texnika
        "appliances_small": {"base": 15, "min_price_factor": True}, # Kichik maishiy texnika
        "default": {"base": 12, "min_price_factor": True}
    },
    
    # Maishiy texnika
    "appliances": {
        "refrigerators": {"base": 8, "min_price_factor": True},
        "washing_machines": {"base": 8, "min_price_factor": True},
        "air_conditioners": {"base": 8, "min_price_factor": True},
        "vacuum_cleaners": {"base": 12, "min_price_factor": True},
        "kitchen_large": {"base": 10, "min_price_factor": True},
        "kitchen_small": {"base": 17, "min_price_factor": True},
        "default": {"base": 12, "min_price_factor": True}
    },
    
    # Kiyim-kechak - arzon, yuqori komissiya
    "clothing": {
        "men": {"base": 20, "min_price_factor": True},
        "women": {"base": 20, "min_price_factor": True},
        "children": {"base": 18, "min_price_factor": True},
        "underwear": {"base": 22, "min_price_factor": True},
        "sportswear": {"base": 18, "min_price_factor": True},
        "shoes": {"base": 20, "min_price_factor": True},
        "default": {"base": 20, "min_price_factor": True}
    },
    
    # Go'zallik
    "beauty": {
        "cosmetics": {"base": 22, "min_price_factor": True},
        "skincare": {"base": 20, "min_price_factor": True},
        "haircare": {"base": 20, "min_price_factor": True},
        "perfume": {"base": 18, "min_price_factor": True},
        "default": {"base": 20, "min_price_factor": True}
    },
    
    # Uy-ro'zg'or
    "home": {
        "furniture": {"base": 15, "min_price_factor": True},
        "decor": {"base": 20, "min_price_factor": True},
        "kitchen": {"base": 18, "min_price_factor": True},
        "textile": {"base": 22, "min_price_factor": True},
        "lighting": {"base": 17, "min_price_factor": True},
        "default": {"base": 18, "min_price_factor": True}
    },
    
    # Oziq-ovqat
    "food": {
        "grocery": {"base": 15, "min_price_factor": True},
        "drinks": {"base": 17, "min_price_factor": True},
        "snacks": {"base": 18, "min_price_factor": True},
        "default": {"base": 16, "min_price_factor": True}
    },
    
    # O'yinchoqlar
    "toys": {
        "children": {"base": 22, "min_price_factor": True},
        "educational": {"base": 18, "min_price_factor": True},
        "outdoor": {"base": 18, "min_price_factor": True},
        "default": {"base": 20, "min_price_factor": True}
    },
    
    # Sport
    "sports": {
        "equipment": {"base": 15, "min_price_factor": True},
        "clothing": {"base": 18, "min_price_factor": True},
        "accessories": {"base": 20, "min_price_factor": True},
        "default": {"base": 17, "min_price_factor": True}
    },
    
    # Avtomobil
    "auto": {
        "parts": {"base": 12, "min_price_factor": True},
        "accessories": {"base": 15, "min_price_factor": True},
        "tools": {"base": 14, "min_price_factor": True},
        "default": {"base": 13, "min_price_factor": True}
    },
    
    # Default
    "default": {"base": 17, "min_price_factor": True}
}

# ========================================
# SOLIQLAR
# ========================================

TAX_RATES = {
    "vat": 12,  # QQS - 12%
    "income_tax_ip": 4,  # YaTT uchun daromad solig'i
    "income_tax_llc": 15,  # MChJ uchun daromad solig'i
}

# ========================================
# LOGISTIKA XARAJATLARI (so'm)
# ========================================

LOGISTICS_FEES = {
    "fbs": {
        "small": 2000,      # Kichik tovar (<1kg)
        "medium": 4000,     # O'rta tovar (1-5kg)
        "large": 8000,      # Katta tovar (5-15kg)
        "oversized": 15000  # Katta gabarit (>15kg)
    },
    "fbo": {
        "small": 3000,
        "medium": 5000,
        "large": 10000,
        "oversized": 20000
    }
}

# ========================================
# MEDIA TALABLARI
# ========================================

MEDIA_REQUIREMENTS = {
    "image": {
        "width": 1080,
        "height": 1440,
        "aspect_ratio": "3:4",
        "max_size_mb": 5,
        "formats": ["jpg", "jpeg", "png", "webp"],
        "min_count": 3,
        "max_count": 15,
        "background": "white_preferred"
    },
    "video": {
        "width": 1080,
        "height": 1440,
        "max_size_mb": 10,
        "max_duration_sec": 60,
        "formats": ["mp4", "mov"]
    }
}

# ========================================
# KARTOCHKA TALABLARI
# ========================================

CARD_REQUIREMENTS = {
    "title": {
        "max_length": 80,
        "structure": "Tovar turi + Brend + Model + Asosiy xususiyat",
        "languages": ["uz", "ru"],
        "start_capital": True,
        "no_caps_lock": True
    },
    "description": {
        "min_length": 300,
        "max_length": 5000,
        "languages": ["uz", "ru"],
        "no_emoji": True,
        "no_links": True
    },
    "required_fields": [
        "title",
        "description", 
        "price",
        "category",
        "ikpu_code",
        "sku",
        "images"
    ]
}

# ========================================
# HELPER FUNCTIONS
# ========================================

def check_stop_words(text: str) -> dict:
    """Matnda stop so'zlarni tekshirish"""
    text_lower = text.lower()
    found_words = []
    
    for word in STOP_WORDS:
        if word.lower() in text_lower:
            found_words.append(word)
    
    return {
        "has_stop_words": len(found_words) > 0,
        "found_words": found_words,
        "is_valid": len(found_words) == 0
    }


def remove_stop_words(text: str) -> str:
    """Matndan stop so'zlarni olib tashlash"""
    result = text
    for word in sorted(STOP_WORDS, key=len, reverse=True):
        import re
        pattern = re.compile(re.escape(word), re.IGNORECASE)
        result = pattern.sub("", result)
    
    result = " ".join(result.split())
    return result


def get_commission_by_price(price: float) -> float:
    """Narxga asoslangan komissiyani olish"""
    for level, (min_price, max_price, commission) in PRICE_BASED_COMMISSION.items():
        if min_price <= price < max_price:
            return commission
    return 17  # Default


def get_commission_rate(category: str, subcategory: str = None, price: float = None) -> float:
    """
    Kategoriya va narxga asoslangan komissiya foizini olish
    
    Uzum Market 2024-2025:
    - Komissiya asosan NARXGA bog'liq
    - Arzon tovarlar = yuqori komissiya (20-35%)
    - Qimmat tovarlar = past komissiya (3-10%)
    - Minimal 8% faqat katta maishiy texnika (muzlatgich, konditsioner)
    """
    category_lower = category.lower()
    
    # Agar narx berilgan bo'lsa, asosan narxga asoslangan hisoblash
    if price is not None and price > 0:
        price_commission = get_commission_by_price(price)
        
        # Katta maishiy texnika uchun maxsus - minimal 8%
        if category_lower in ["appliances", "electronics"]:
            if subcategory and subcategory.lower() in ["refrigerators", "washing_machines", "air_conditioners", 
                                                         "appliances_large", "tv", "laptops"]:
                # Katta texnika - minimal 8%
                return max(price_commission, 8)
        
        return price_commission
    
    # Agar narx yo'q bo'lsa, kategoriya bo'yicha default
    base_commission = 17
    
    if category_lower in COMMISSION_RATES:
        cat_data = COMMISSION_RATES[category_lower]
        if subcategory and subcategory.lower() in cat_data:
            sub_data = cat_data[subcategory.lower()]
            if isinstance(sub_data, dict):
                base_commission = sub_data.get("base", 17)
            else:
                base_commission = sub_data
        elif "default" in cat_data:
            default_data = cat_data["default"]
            if isinstance(default_data, dict):
                base_commission = default_data.get("base", 17)
            else:
                base_commission = default_data
    elif isinstance(COMMISSION_RATES.get("default"), dict):
        base_commission = COMMISSION_RATES["default"].get("base", 17)
    
    return base_commission


def calculate_logistics_fee(weight_kg: float, fulfillment: str = "fbs") -> int:
    """Logistika xarajatini hisoblash"""
    fees = LOGISTICS_FEES.get(fulfillment, LOGISTICS_FEES["fbs"])
    
    if weight_kg < 1:
        return fees["small"]
    elif weight_kg < 5:
        return fees["medium"]
    elif weight_kg < 15:
        return fees["large"]
    else:
        return fees["oversized"]


def calculate_full_price(
    cost_price: float,
    category: str,
    subcategory: str = None,
    weight_kg: float = 1.0,
    fulfillment: str = "fbs",
    target_margin: float = 25,
    business_type: str = "ip",
    selling_price: float = None  # Agar sotuv narxi ma'lum bo'lsa
) -> dict:
    """
    To'liq narx kalkulyatsiyasi
    
    Returns:
        - min_price: Minimal narx (0 foyda)
        - optimal_price: Optimal narx (target_margin bilan)
        - breakdown: Barcha xarajatlar tafsiloti
    """
    # Dastlabki sotuv narxini taxmin qilish
    estimated_price = selling_price if selling_price else cost_price * 1.5
    
    # Komissiya (narxga asoslangan)
    commission_rate = get_commission_rate(category, subcategory, estimated_price) / 100
    
    # Logistika
    logistics_fee = calculate_logistics_fee(weight_kg, fulfillment)
    
    # Soliq
    tax_rate = TAX_RATES["income_tax_ip"] if business_type == "ip" else TAX_RATES["income_tax_llc"]
    tax_rate = tax_rate / 100
    
    # QQS (12%)
    vat_rate = TAX_RATES["vat"] / 100
    
    # Minimal narx (0 foyda)
    total_rate = commission_rate + tax_rate
    if total_rate >= 1:
        total_rate = 0.5
    
    min_price = (cost_price + logistics_fee) / (1 - total_rate)
    
    # Optimal narx
    margin_multiplier = 1 + (target_margin / 100)
    optimal_price = min_price * margin_multiplier
    
    # Komissiyani qayta hisoblash yangi narx bilan
    final_commission_rate = get_commission_rate(category, subcategory, optimal_price) / 100
    
    # Tafsilot
    commission_amount = optimal_price * final_commission_rate
    tax_amount = optimal_price * tax_rate
    vat_amount = optimal_price * vat_rate / (1 + vat_rate)
    net_profit = optimal_price - cost_price - commission_amount - logistics_fee - tax_amount
    actual_margin = (net_profit / optimal_price) * 100 if optimal_price > 0 else 0
    
    return {
        "cost_price": round(cost_price),
        "min_price": round(min_price),
        "optimal_price": round(optimal_price),
        "max_price": round(optimal_price * 1.3),
        "breakdown": {
            "cost_price": round(cost_price),
            "commission": {
                "rate": round(final_commission_rate * 100, 1),
                "amount": round(commission_amount),
                "note": "Narxga asoslangan komissiya"
            },
            "logistics": {
                "type": fulfillment.upper(),
                "amount": logistics_fee
            },
            "tax": {
                "type": business_type.upper(),
                "rate": round(tax_rate * 100, 1),
                "amount": round(tax_amount)
            },
            "vat_included": round(vat_amount),
            "total_expenses": round(cost_price + commission_amount + logistics_fee + tax_amount),
            "net_profit": round(net_profit),
            "actual_margin": round(actual_margin, 1)
        },
        "recommendation": {
            "price": round(optimal_price),
            "margin": round(actual_margin, 1),
            "is_profitable": net_profit > 0
        }
    }


def validate_media(file_size_bytes: int, width: int, height: int, file_type: str = "image") -> dict:
    """Media faylni tekshirish"""
    reqs = MEDIA_REQUIREMENTS[file_type]
    
    errors = []
    warnings = []
    
    max_size_bytes = reqs["max_size_mb"] * 1024 * 1024
    if file_size_bytes > max_size_bytes:
        errors.append(f"Fayl hajmi {reqs['max_size_mb']}MB dan oshmasligi kerak")
    
    if width != reqs["width"] or height != reqs["height"]:
        warnings.append(f"Tavsiya etilgan o'lcham: {reqs['width']}x{reqs['height']}px")
    
    return {
        "is_valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "requirements": reqs
    }


def generate_sku(category: str, brand: str = "", index: int = 1) -> str:
    """SKU generatsiya qilish"""
    import random
    import string
    
    cat_code = category[:3].upper() if category else "GEN"
    brand_code = brand[:3].upper() if brand else "NB"
    random_code = ''.join(random.choices(string.digits, k=6))
    
    return f"{cat_code}-{brand_code}-{random_code}"
