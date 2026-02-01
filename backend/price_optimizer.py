"""
Advanced Price Optimizer for Uzum Market
Real competitor analysis and price optimization
"""
import os
import json
import httpx
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

EMERGENT_KEY = os.getenv("EMERGENT_LLM_KEY", "")


class PriceOptimizer:
    """Narxni optimallashtirish va raqobatchilar tahlili"""
    
    # O'zbekiston bozori uchun bazaviy markuplar
    CATEGORY_MARKUPS = {
        "electronics": {"min": 15, "optimal": 25, "max": 40},
        "clothing": {"min": 40, "optimal": 60, "max": 100},
        "beauty": {"min": 50, "optimal": 80, "max": 150},
        "home": {"min": 30, "optimal": 50, "max": 80},
        "food": {"min": 20, "optimal": 35, "max": 50},
        "toys": {"min": 40, "optimal": 60, "max": 100},
        "sports": {"min": 30, "optimal": 45, "max": 70},
        "auto": {"min": 25, "optimal": 40, "max": 60},
        "default": {"min": 30, "optimal": 50, "max": 80}
    }
    
    # Mavsumiy koeffitsientlar
    SEASONAL_MULTIPLIERS = {
        1: 0.9,   # Yanvar - past
        2: 0.95,  # Fevral
        3: 1.0,   # Mart - Navro'z
        4: 1.05,  # Aprel
        5: 1.0,   # May
        6: 0.95,  # Iyun
        7: 0.9,   # Iyul - yoz
        8: 1.1,   # Avgust - maktab
        9: 1.15,  # Sentabr - maktab
        10: 1.0,  # Oktabr
        11: 1.1,  # Noyabr - sovuq
        12: 1.2   # Dekabr - yangi yil
    }
    
    @classmethod
    async def analyze_competitors(
        cls,
        product_name: str,
        category: str,
        current_price: float
    ) -> dict:
        """
        AI yordamida raqobatchilar tahlili
        """
        if not EMERGENT_KEY:
            # AI bo'lmasa, statik tahlil
            return cls._static_competitor_analysis(product_name, category, current_price)
        
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            chat = LlmChat(
                api_key=EMERGENT_KEY,
                session_id=f"competitor-{product_name[:15]}",
                system_message="""Siz O'zbekiston e-commerce bozori mutaxassisisiz.
                Uzum Market, Sello, va boshqa marketpleyslar haqida bilasiz.
                Faqat JSON formatda javob bering."""
            ).with_model("openai", "gpt-4o")
            
            prompt = f"""O'zbekiston bozorida "{product_name}" mahsuloti uchun raqobat tahlili:

KATEGORIYA: {category}
JORIY NARX: {current_price:,.0f} so'm

Quyidagi JSON formatda raqobatchilar tahlilini ber:

{{
    "market_analysis": {{
        "avg_price": 0,
        "min_price": 0,
        "max_price": 0,
        "price_range": "past/o'rta/yuqori"
    }},
    "competitors": [
        {{
            "name": "Raqobatchi nomi",
            "estimated_price": 0,
            "strengths": ["kuchli tomoni"],
            "weaknesses": ["zaif tomoni"]
        }}
    ],
    "price_position": {{
        "current_position": "arzon/o'rta/qimmat",
        "recommendation": "oshirish/kamaytirish/saqlash",
        "optimal_price": 0,
        "reasoning": "Sabab"
    }},
    "demand_level": "past/o'rta/yuqori",
    "competition_level": "past/o'rta/yuqori",
    "seasonality": {{
        "is_seasonal": true,
        "peak_months": [1, 2],
        "current_multiplier": 1.0
    }},
    "tips": [
        "Sotuvni oshirish uchun maslahat 1",
        "Maslahat 2"
    ]
}}"""
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            # Parse JSON
            import re
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                result = json.loads(json_match.group())
                return {
                    "success": True,
                    "analysis": result,
                    "source": "ai"
                }
            
            return cls._static_competitor_analysis(product_name, category, current_price)
            
        except Exception as e:
            print(f"AI competitor analysis error: {e}")
            return cls._static_competitor_analysis(product_name, category, current_price)
    
    @classmethod
    def _static_competitor_analysis(
        cls,
        product_name: str,
        category: str,
        current_price: float
    ) -> dict:
        """AI bo'lmaganda statik tahlil"""
        import datetime
        
        current_month = datetime.datetime.now().month
        seasonal_mult = cls.SEASONAL_MULTIPLIERS.get(current_month, 1.0)
        
        markups = cls.CATEGORY_MARKUPS.get(category.lower(), cls.CATEGORY_MARKUPS["default"])
        
        # Taxminiy bozor narxlari
        avg_price = current_price * 1.1
        min_price = current_price * 0.85
        max_price = current_price * 1.4
        
        return {
            "success": True,
            "analysis": {
                "market_analysis": {
                    "avg_price": round(avg_price),
                    "min_price": round(min_price),
                    "max_price": round(max_price),
                    "price_range": "o'rta"
                },
                "competitors": [
                    {
                        "name": "Uzum Market o'rtacha",
                        "estimated_price": round(avg_price),
                        "strengths": ["Keng assortiment", "Tez yetkazib berish"],
                        "weaknesses": ["Yuqori raqobat"]
                    }
                ],
                "price_position": {
                    "current_position": "o'rta",
                    "recommendation": "saqlash",
                    "optimal_price": round(current_price * seasonal_mult),
                    "reasoning": f"Mavsumiy koeffitsient: {seasonal_mult}"
                },
                "demand_level": "o'rta",
                "competition_level": "yuqori",
                "seasonality": {
                    "is_seasonal": seasonal_mult != 1.0,
                    "peak_months": [8, 9, 12],
                    "current_multiplier": seasonal_mult
                },
                "tips": [
                    "Sifatli rasmlar qo'ying (1080x1440px)",
                    "SEO kalit so'zlarni sarlavhaga qo'shing",
                    "Batafsil tavsif yozing (300+ so'z)",
                    "Tez yetkazib berish opsiyasini yoqing"
                ]
            },
            "source": "static"
        }
    
    @classmethod
    def calculate_optimal_price(
        cls,
        cost_price: float,
        category: str,
        competitor_avg: float = None,
        weight_kg: float = 1.0,
        fulfillment: str = "fbs"
    ) -> dict:
        """Optimal narxni hisoblash"""
        from uzum_rules import calculate_full_price, get_commission_rate
        
        # Bazaviy hisob
        price_calc = calculate_full_price(
            cost_price=cost_price,
            category=category,
            weight_kg=weight_kg,
            fulfillment=fulfillment,
            target_margin=30
        )
        
        optimal = price_calc["optimal_price"]
        
        # Raqobatchilar bilan solishtirish
        if competitor_avg:
            if optimal > competitor_avg * 1.2:
                # Juda qimmat - kamaytirish
                optimal = competitor_avg * 1.1
            elif optimal < competitor_avg * 0.7:
                # Juda arzon - oshirish mumkin
                optimal = competitor_avg * 0.85
        
        # Mavsumiy tuzatish
        import datetime
        current_month = datetime.datetime.now().month
        seasonal_mult = cls.SEASONAL_MULTIPLIERS.get(current_month, 1.0)
        optimal = optimal * seasonal_mult
        
        # Recalculate actual margin
        commission = get_commission_rate(category) / 100
        from uzum_rules import calculate_logistics_fee
        logistics = calculate_logistics_fee(weight_kg, fulfillment)
        tax = 0.04  # IP uchun
        
        net_profit = optimal - cost_price - (optimal * commission) - logistics - (optimal * tax)
        actual_margin = (net_profit / optimal) * 100 if optimal > 0 else 0
        
        return {
            "cost_price": round(cost_price),
            "min_price": round(price_calc["min_price"]),
            "optimal_price": round(optimal),
            "max_price": round(optimal * 1.25),
            "competitor_avg": round(competitor_avg) if competitor_avg else None,
            "seasonal_multiplier": seasonal_mult,
            "net_profit": round(net_profit),
            "actual_margin": round(actual_margin, 1),
            "is_competitive": competitor_avg is None or optimal <= competitor_avg * 1.15,
            "is_profitable": actual_margin > 15
        }


class SalesBooster:
    """Sotuvni oshirish bo'yicha maslahatlar"""
    
    TIPS_BY_CATEGORY = {
        "electronics": [
            "Texnik xususiyatlarni jadval shaklida ko'rsating",
            "Kafolat muddatini ta'kidlang",
            "Quti tarkibini to'liq yozing",
            "Video-obzor qo'shing"
        ],
        "clothing": [
            "O'lchamlar jadvalini qo'shing",
            "Material tarkibini ko'rsating",
            "Modelning o'lchamlari bilan rasm qo'ying",
            "Yuvish bo'yicha ko'rsatmalar yozing"
        ],
        "beauty": [
            "Tarkibni to'liq yozing",
            "Ishlatish usulini tushuntiring",
            "Yaroqlilik muddatini ko'rsating",
            "Before/After rasmlar qo'shing"
        ],
        "home": [
            "O'lchamlarni aniq ko'rsating",
            "Materialini yozing",
            "Yig'ish qo'llanmasini qo'shing",
            "Interyer rasmlarini qo'shing"
        ],
        "default": [
            "Sifatli rasmlar (1080x1440px) qo'ying",
            "Batafsil tavsif yozing (300+ so'z)",
            "SEO kalit so'zlardan foydalaning",
            "Savolarga tezkor javob bering"
        ]
    }
    
    @classmethod
    def get_tips(cls, category: str) -> List[str]:
        """Kategoriyaga mos maslahatlarni olish"""
        cat_tips = cls.TIPS_BY_CATEGORY.get(category.lower(), [])
        default_tips = cls.TIPS_BY_CATEGORY["default"]
        
        # Combine and dedupe
        all_tips = cat_tips + [t for t in default_tips if t not in cat_tips]
        return all_tips[:8]  # Max 8 ta
    
    @classmethod
    async def get_ai_tips(cls, product_name: str, category: str, price: float) -> List[str]:
        """AI orqali shaxsiy maslahatlar"""
        if not EMERGENT_KEY:
            return cls.get_tips(category)
        
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            chat = LlmChat(
                api_key=EMERGENT_KEY,
                session_id=f"tips-{product_name[:15]}",
                system_message="Siz Uzum Market sotuvchilar uchun maslahatchi assistentsiz."
            ).with_model("openai", "gpt-4o")
            
            prompt = f""""{product_name}" mahsuloti uchun Uzum Marketda sotuvni oshirish bo'yicha 
5 ta aniq, amaliy maslahat ber.

Kategoriya: {category}
Narx: {price:,.0f} so'm

Faqat JSON array formatda javob ber:
["Maslahat 1", "Maslahat 2", ...]"""
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            import re
            json_match = re.search(r'\[[\s\S]*\]', response)
            if json_match:
                tips = json.loads(json_match.group())
                return tips[:8]
            
            return cls.get_tips(category)
            
        except Exception as e:
            print(f"AI tips error: {e}")
            return cls.get_tips(category)
