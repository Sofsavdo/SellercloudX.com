"""
Yandex Market Rules & Regulations Database
Real data from official Yandex Market documentation (2024-2025)
"""

# ========================================
# YANDEX MARKET KOMISSIYALARI (2024-2025)
# Kategoriya va narxga asoslangan
# ========================================

# Kategoriyaga asoslangan komissiya (foizda)
YANDEX_COMMISSION_RATES = {
    # Elektronika - past komissiya
    "electronics": {
        "smartphones": {"base": 6, "max": 10},
        "tablets": {"base": 6, "max": 10},
        "laptops": {"base": 5, "max": 8},
        "accessories": {"base": 10, "max": 15},
        "headphones": {"base": 8, "max": 12},
        "smartwatch": {"base": 8, "max": 12},
        "cameras": {"base": 6, "max": 10},
        "tv": {"base": 5, "max": 8},
        "appliances_large": {"base": 5, "max": 8},
        "appliances_small": {"base": 10, "max": 15},
        "default": {"base": 7, "max": 12}
    },
    
    # Maishiy texnika
    "appliances": {
        "refrigerators": {"base": 5, "max": 8},
        "washing_machines": {"base": 5, "max": 8},
        "air_conditioners": {"base": 5, "max": 8},
        "vacuum_cleaners": {"base": 8, "max": 12},
        "kitchen_large": {"base": 6, "max": 10},
        "kitchen_small": {"base": 12, "max": 18},
        "default": {"base": 7, "max": 12}
    },
    
    # Kiyim-kechak - yuqori komissiya
    "clothing": {
        "men": {"base": 14, "max": 24},
        "women": {"base": 14, "max": 24},
        "children": {"base": 12, "max": 20},
        "underwear": {"base": 16, "max": 24},
        "sportswear": {"base": 12, "max": 20},
        "shoes": {"base": 14, "max": 24},
        "default": {"base": 14, "max": 24}
    },
    
    # Go'zallik
    "beauty": {
        "cosmetics": {"base": 12, "max": 20},
        "skincare": {"base": 10, "max": 18},
        "haircare": {"base": 10, "max": 18},
        "perfume": {"base": 12, "max": 18},
        "default": {"base": 12, "max": 20}
    },
    
    # Uy-ro'zg'or
    "home": {
        "furniture": {"base": 10, "max": 15},
        "decor": {"base": 12, "max": 18},
        "kitchen": {"base": 10, "max": 16},
        "textile": {"base": 14, "max": 22},
        "lighting": {"base": 10, "max": 16},
        "default": {"base": 12, "max": 18}
    },
    
    # Oziq-ovqat
    "food": {
        "grocery": {"base": 8, "max": 12},
        "drinks": {"base": 10, "max": 14},
        "snacks": {"base": 10, "max": 14},
        "default": {"base": 9, "max": 13}
    },
    
    # O'yinchoqlar
    "toys": {
        "children": {"base": 14, "max": 22},
        "educational": {"base": 12, "max": 18},
        "outdoor": {"base": 12, "max": 18},
        "default": {"base": 13, "max": 20}
    },
    
    # Sport
    "sports": {
        "equipment": {"base": 10, "max": 15},
        "clothing": {"base": 12, "max": 20},
        "accessories": {"base": 12, "max": 18},
        "default": {"base": 11, "max": 17}
    },
    
    # Avtomobil
    "auto": {
        "parts": {"base": 8, "max": 12},
        "accessories": {"base": 10, "max": 15},
        "tools": {"base": 8, "max": 12},
        "default": {"base": 9, "max": 13}
    },
    
    # Default
    "default": {"base": 12, "max": 18}
}

# ========================================
# YANDEX MARKET TO'LOV KOMISSIYASI
# Pul chiqarish chastotasiga bog'liq
# ========================================

YANDEX_PAYOUT_COMMISSION = {
    "daily": 3.3,      # Har kuni
    "weekly": 2.8,     # Haftada 1 marta
    "biweekly": 2.3,   # 2 haftada 1 marta
    "monthly": 1.8,    # Oyda 1 marta
}

# ========================================
# LOGISTIKA XARAJATLARI (RUB -> so'm)
# 1 RUB ≈ 140 so'm (taxminiy)
# ========================================

RUB_TO_UZS = 140  # Taxminiy kurs

YANDEX_LOGISTICS_FEES = {
    "fbs": {
        "small": 80 * RUB_TO_UZS,      # < 1kg
        "medium": 150 * RUB_TO_UZS,    # 1-5kg
        "large": 400 * RUB_TO_UZS,     # 5-15kg
        "oversized": 800 * RUB_TO_UZS  # > 15kg
    },
    "fby": {
        "small": 100 * RUB_TO_UZS,
        "medium": 200 * RUB_TO_UZS,
        "large": 500 * RUB_TO_UZS,
        "oversized": 1000 * RUB_TO_UZS
    },
    "dbs": {
        "small": 0,  # Seller o'zi yetkazadi
        "medium": 0,
        "large": 0,
        "oversized": 0
    }
}

# ========================================
# MEDIA TALABLARI
# ========================================

YANDEX_MEDIA_REQUIREMENTS = {
    "image": {
        "min_width": 300,
        "min_height": 300,
        "recommended_width": 1000,
        "recommended_height": 1000,
        "aspect_ratio": "1:1",
        "max_size_mb": 10,
        "formats": ["jpg", "jpeg", "png"],
        "min_count": 1,
        "max_count": 20,
        "background": "white_required"
    },
    "video": {
        "max_size_mb": 100,
        "max_duration_sec": 180,
        "formats": ["mp4", "mov", "avi"]
    }
}

# ========================================
# KARTOCHKA TALABLARI
# ========================================

YANDEX_CARD_REQUIREMENTS = {
    "title": {
        "max_length": 120,
        "structure": "Brend + Tovar turi + Model + Xususiyat",
        "languages": ["ru"],  # Yandex faqat ruscha
        "no_caps_lock": True,
        "no_special_chars": True
    },
    "description": {
        "min_length": 200,
        "max_length": 6000,
        "languages": ["ru"],
        "no_emoji": True,
        "no_links": True,
        "no_contacts": True
    },
    "required_fields": [
        "name",
        "description",
        "price",
        "category_id",
        "vendor",  # Brend
        "shop_sku",
        "pictures"
    ]
}

# ========================================
# TAQIQLANGAN SO'ZLAR
# ========================================

YANDEX_STOP_WORDS = {
    # Marketing
    "хит", "бестселлер", "топ", "лучший",
    "номер 1", "№1", "#1",
    
    # Aktsiya
    "распродажа", "скидка", "акция",
    "бесплатно", "дешево",
    
    # Sifat
    "оригинал", "копия", "реплика",
    "подделка", "аналог",
    
    # Holat
    "б/у", "бывший в употреблении",
    
    # Contact
    "телефон", "позвоните", "звоните",
    "whatsapp", "telegram", "viber",
    "@", "www.", "http",
    
    # Boshqa
    "гарантия возврата", "100% гарантия",
}

# ========================================
# KATEGORIYA MAPPING (Yandex Market)
# ========================================

YANDEX_CATEGORIES = {
    "electronics": {
        "id": 91491,
        "name": "Электроника",
        "subcategories": {
            "smartphones": {"id": 91491, "name": "Мобильные телефоны"},
            "tablets": {"id": 6427100, "name": "Планшеты"},
            "laptops": {"id": 91013, "name": "Ноутбуки"},
            "headphones": {"id": 90555, "name": "Наушники"},
            "smartwatch": {"id": 10498025, "name": "Умные часы"},
            "tv": {"id": 90639, "name": "Телевизоры"},
            "hair_care": {"id": 90555, "name": "Приборы для ухода за волосами"},  # Hair care appliances
        }
    },
    "clothing": {
        "id": 7877999,
        "name": "Одежда",
        "subcategories": {
            "men": {"id": 7811873, "name": "Мужская одежда"},
            "women": {"id": 7811877, "name": "Женская одежда"},
            "children": {"id": 7877999, "name": "Детская одежда"},
        }
    },
    "beauty": {
        "id": 90509,
        "name": "Красота",
        "subcategories": {
            # Cosmetics umumiy kategoriya, lekin ko'pincha leaf bo'lmagan bo'lishi mumkin.
            # Perfumelar uchun esa Yandex Market'dagi real leaf kategoriyadan foydalanamiz.
            # Sizning do'koningiz javoblarida "Парфюмерия" uchun marketCategoryId 15927546 sifatida kelgan.
            "cosmetics": {"id": 90509, "name": "Косметика"},
            "perfume": {
                "id": 15927546,  # Leaf category: Парфюмерия (real Yandex javobidan olingan)
                "name": "Парфюмерия"
            },
        }
    },
    "home": {
        "id": 90719,
        "name": "Дом и сад",
        "subcategories": {
            "furniture": {"id": 90719, "name": "Мебель"},
            "kitchen": {"id": 90720, "name": "Кухонные товары"},
        }
    },
    "toys": {
        "id": 90764,
        "name": "Детские товары",
        "subcategories": {
            "toys": {"id": 90764, "name": "Игрушки"},
        }
    },
    "sports": {
        "id": 90713,
        "name": "Спорт и отдых",
        "subcategories": {
            "equipment": {"id": 90713, "name": "Спортивное оборудование"},
        }
    },
    "auto": {
        "id": 90402,
        "name": "Авто",
        "subcategories": {
            "parts": {"id": 90402, "name": "Автозапчасти"},
        }
    },
}

# ========================================
# HELPER FUNCTIONS
# ========================================

def get_yandex_commission_rate(category: str, subcategory: str = None) -> float:
    """Kategoriya bo'yicha Yandex komissiyasini olish"""
    category_lower = category.lower()
    
    if category_lower in YANDEX_COMMISSION_RATES:
        cat_data = YANDEX_COMMISSION_RATES[category_lower]
        if subcategory and subcategory.lower() in cat_data:
            return cat_data[subcategory.lower()]["base"]
        return cat_data.get("default", {"base": 12})["base"]
    
    return YANDEX_COMMISSION_RATES["default"]["base"]


def get_yandex_logistics_fee(weight_kg: float, fulfillment: str = "fbs") -> int:
    """Logistika xarajatini hisoblash (so'mda)"""
    fees = YANDEX_LOGISTICS_FEES.get(fulfillment, YANDEX_LOGISTICS_FEES["fbs"])
    
    if weight_kg < 1:
        return fees["small"]
    elif weight_kg < 5:
        return fees["medium"]
    elif weight_kg < 15:
        return fees["large"]
    else:
        return fees["oversized"]


def get_yandex_category_id(category: str, subcategory: str = None) -> int:
    """Yandex Market kategoriya ID sini olish"""
    category_lower = category.lower()
    
    if category_lower in YANDEX_CATEGORIES:
        cat_data = YANDEX_CATEGORIES[category_lower]
        if subcategory and subcategory.lower() in cat_data.get("subcategories", {}):
            return cat_data["subcategories"][subcategory.lower()]["id"]
        return cat_data["id"]
    
    return 91491  # Default: Electronics


def check_yandex_stop_words(text: str) -> dict:
    """Matnda taqiqlangan so'zlarni tekshirish"""
    text_lower = text.lower()
    found_words = []
    
    for word in YANDEX_STOP_WORDS:
        if word.lower() in text_lower:
            found_words.append(word)
    
    return {
        "has_stop_words": len(found_words) > 0,
        "found_words": found_words,
        "is_valid": len(found_words) == 0
    }


def calculate_yandex_price(
    cost_price: float,
    category: str,
    subcategory: str = None,
    weight_kg: float = 1.0,
    fulfillment: str = "fbs",
    target_margin: float = 25,
    payout_frequency: str = "weekly"
) -> dict:
    """
    Yandex Market uchun narx kalkulyatsiyasi
    """
    # Komissiya
    commission_rate = get_yandex_commission_rate(category, subcategory) / 100
    
    # To'lov komissiyasi
    payout_rate = YANDEX_PAYOUT_COMMISSION.get(payout_frequency, 2.8) / 100
    
    # Logistika
    logistics_fee = get_yandex_logistics_fee(weight_kg, fulfillment)
    
    # Jami komissiya
    total_rate = commission_rate + payout_rate
    if total_rate >= 1:
        total_rate = 0.5
    
    # Minimal narx
    min_price = (cost_price + logistics_fee) / (1 - total_rate)
    
    # Optimal narx
    margin_multiplier = 1 + (target_margin / 100)
    optimal_price = min_price * margin_multiplier
    
    # Tafsilot
    commission_amount = optimal_price * commission_rate
    payout_amount = optimal_price * payout_rate
    net_profit = optimal_price - cost_price - commission_amount - payout_amount - logistics_fee
    actual_margin = (net_profit / optimal_price) * 100 if optimal_price > 0 else 0
    
    return {
        "cost_price": round(cost_price),
        "min_price": round(min_price),
        "optimal_price": round(optimal_price),
        "max_price": round(optimal_price * 1.3),
        "breakdown": {
            "cost_price": round(cost_price),
            "commission": {
                "rate": round(commission_rate * 100, 1),
                "amount": round(commission_amount)
            },
            "payout_fee": {
                "rate": round(payout_rate * 100, 1),
                "amount": round(payout_amount),
                "frequency": payout_frequency
            },
            "logistics": {
                "type": fulfillment.upper(),
                "amount": logistics_fee
            },
            "total_expenses": round(cost_price + commission_amount + payout_amount + logistics_fee),
            "net_profit": round(net_profit),
            "actual_margin": round(actual_margin, 1)
        },
        "recommendation": {
            "price": round(optimal_price),
            "margin": round(actual_margin, 1),
            "is_profitable": net_profit > 0
        }
    }
