"""
tasnif.soliq.uz IKPU (Identifikatsion Kod Mahsulot/Xizmat) Service
IKPU kodlari 17 honali raqam!

Struktura:
- 1-2: Guruh (sektor)
- 3-5: Sinf
- 6-8: Pozitsiya
- 9-11: Sub-pozitsiya
- 12-14: Brend/marka
- 15-17: Atributlar (rang, shakl, qadoq)

Bazaviy kodlar "000000" bilan tugaydi (brend/atribut yo'q)
"""
import httpx
import json
from typing import Optional, Dict, Any, List

# IKPU API endpoint (tasnif.soliq.uz)
IKPU_BASE_URL = "https://tasnif.soliq.uz/api"

# 17 honali IKPU kodlari - asosiy kategoriyalar
COMMON_IKPU_CODES = {
    # ========================================
    # ELEKTRONIKA - 26 guruh
    # ========================================
    
    # Smartfonlar
    "smartphone": {"code": "26121900000000000", "name": "Smartfonlar"},
    "phone": {"code": "26121900000000000", "name": "Smartfonlar"},
    "iphone": {"code": "26121900100000000", "name": "Apple iPhone smartfonlari"},
    "samsung": {"code": "26121900200000000", "name": "Samsung smartfonlari"},
    "xiaomi": {"code": "26121900300000000", "name": "Xiaomi smartfonlari"},
    "redmi": {"code": "26121900300000000", "name": "Xiaomi/Redmi smartfonlari"},
    "galaxy": {"code": "26121900200000000", "name": "Samsung Galaxy smartfonlari"},
    "huawei": {"code": "26121900400000000", "name": "Huawei smartfonlari"},
    "oppo": {"code": "26121900500000000", "name": "OPPO smartfonlari"},
    "realme": {"code": "26121900600000000", "name": "Realme smartfonlari"},
    
    # Kompyuterlar va planshetlar
    "laptop": {"code": "26201100000000000", "name": "Noutbuklar"},
    "notebook": {"code": "26201100000000000", "name": "Noutbuklar"},
    "macbook": {"code": "26201100100000000", "name": "Apple MacBook noutbuklari"},
    "computer": {"code": "26201000000000000", "name": "Shaxsiy kompyuterlar"},
    "tablet": {"code": "26201200000000000", "name": "Planshetlar"},
    "ipad": {"code": "26201200100000000", "name": "Apple iPad planshetlari"},
    
    # Audio
    "headphones": {"code": "26401100000000000", "name": "Quloqchinlar"},
    "earbuds": {"code": "26401200000000000", "name": "Simsiz quloqchinlar"},
    "airpods": {"code": "26401200100000000", "name": "Apple AirPods"},
    "speaker": {"code": "26402000000000000", "name": "Ovoz kuchaytirgichlar"},
    
    # TV va video
    "tv": {"code": "26301000000000000", "name": "Televizorlar"},
    "television": {"code": "26301000000000000", "name": "Televizorlar"},
    "monitor": {"code": "26302000000000000", "name": "Monitorlar"},
    
    # Soatlar
    "smartwatch": {"code": "26521100000000000", "name": "Smart soatlar"},
    "watch": {"code": "26521000000000000", "name": "Elektron soatlar"},
    "applewatch": {"code": "26521100100000000", "name": "Apple Watch"},
    
    # ========================================
    # MAISHIY TEXNIKA - 27 guruh
    # ========================================
    
    # Katta maishiy texnika
    "refrigerator": {"code": "27521100000000000", "name": "Muzlatgichlar"},
    "washing_machine": {"code": "27511100000000000", "name": "Kir yuvish mashinalari"},
    "air_conditioner": {"code": "27512100000000000", "name": "Konditsionerlar"},
    "vacuum": {"code": "27511500000000000", "name": "Changyutgichlar"},
    "vacuum_cleaner": {"code": "27511500000000000", "name": "Changyutgichlar"},
    
    # Oshxona jihozlari
    "microwave": {"code": "27512200000000000", "name": "Mikroto'lqinli pechlar"},
    "gas_stove": {"code": "27521200000000000", "name": "Gaz plitalar"},
    "electric_stove": {"code": "27521300000000000", "name": "Elektr plitalar"},
    "blender": {"code": "27512300000000000", "name": "Blenderlar"},
    "mixer": {"code": "27512400000000000", "name": "Mikserlar"},
    "kettle": {"code": "27512500000000000", "name": "Elektr choynaklar"},
    "multicooker": {"code": "27512600000000000", "name": "Multiqoziqlar"},
    
    # ========================================
    # GO'ZALLIK VA PARFYUMERIYA - 20 guruh
    # ========================================
    "perfume": {"code": "20420100000000000", "name": "Atirlar"},
    "cosmetics": {"code": "20420200000000000", "name": "Kosmetika mahsulotlari"},
    "shampoo": {"code": "20420300000000000", "name": "Shampunlar"},
    "cream": {"code": "20420400000000000", "name": "Kremlar"},
    "skincare": {"code": "20420500000000000", "name": "Teri parvarishi"},
    
    # ========================================
    # KIYIM-KECHAK - 14 guruh
    # ========================================
    "clothing": {"code": "14130000000000000", "name": "Kiyim-kechak"},
    "shirt": {"code": "14131100000000000", "name": "Ko'ylaklar"},
    "pants": {"code": "14131200000000000", "name": "Shimlar"},
    "dress": {"code": "14132100000000000", "name": "Ko'ylaklar (ayollar)"},
    "jacket": {"code": "14133100000000000", "name": "Kurtka va palto"},
    "tshirt": {"code": "14131300000000000", "name": "Futbolkalar"},
    "jeans": {"code": "14131400000000000", "name": "Jinsi shimlar"},
    "socks": {"code": "14390100000000000", "name": "Paypoqlar"},
    "underwear": {"code": "14140000000000000", "name": "Ichki kiyimlar"},
    
    # ========================================
    # POYABZAL - 15 guruh
    # ========================================
    "shoes": {"code": "15200000000000000", "name": "Poyabzal"},
    "sneakers": {"code": "15201100000000000", "name": "Krossovkalar"},
    "boots": {"code": "15201200000000000", "name": "Etiklar"},
    "sandals": {"code": "15201300000000000", "name": "Sandallar"},
    
    # ========================================
    # BOLALAR TOVARLARI - 32 guruh
    # ========================================
    "toys": {"code": "32400000000000000", "name": "O'yinchoqlar"},
    "baby": {"code": "32990100000000000", "name": "Chaqaloqlar uchun tovarlar"},
    "baby_clothes": {"code": "14200000000000000", "name": "Bolalar kiyimlari"},
    "diapers": {"code": "32990200000000000", "name": "Tagliklar"},
    
    # ========================================
    # OZIQ-OVQAT - 10 guruh
    # ========================================
    "food": {"code": "10890000000000000", "name": "Oziq-ovqat mahsulotlari"},
    "drinks": {"code": "11070000000000000", "name": "Ichimliklar"},
    "snacks": {"code": "10810000000000000", "name": "Shirinliklar"},
    "tea": {"code": "10830100000000000", "name": "Choy"},
    "coffee": {"code": "10830200000000000", "name": "Qahva"},
    
    # ========================================
    # SPORT TOVARLARI - 32 guruh
    # ========================================
    "sports": {"code": "32300000000000000", "name": "Sport anjomlari"},
    "fitness": {"code": "32301000000000000", "name": "Fitnes anjomlari"},
    "bicycle": {"code": "30921000000000000", "name": "Velosipedlar"},
    
    # ========================================
    # UY-RO'ZG'OR - 27, 31 guruhlar
    # ========================================
    "home": {"code": "27000000000000000", "name": "Uy-ro'zg'or buyumlari"},
    "furniture": {"code": "31000000000000000", "name": "Mebel"},
    "bed": {"code": "31091100000000000", "name": "Karavotlar"},
    "sofa": {"code": "31091200000000000", "name": "Divanlar"},
    "table": {"code": "31091300000000000", "name": "Stollar"},
    "chair": {"code": "31091400000000000", "name": "Stullar"},
    
    # ========================================
    # AVTOMOBIL - 29 guruh
    # ========================================
    "auto": {"code": "29320000000000000", "name": "Avtomobil ehtiyot qismlari"},
    "auto_parts": {"code": "29320100000000000", "name": "Ehtiyot qismlar"},
    "tires": {"code": "22110000000000000", "name": "Shinalar"},
    
    # ========================================
    # DEFAULT
    # ========================================
    "general": {"code": "00000000000000000", "name": "Boshqa mahsulotlar"},
    "other": {"code": "00000000000000000", "name": "Boshqa mahsulotlar"},
}

# Kategoriyadan IKPU ga o'tkazish
CATEGORY_TO_IKPU = {
    "electronics": "26000000000000000",
    "phones": "26121900000000000",
    "smartphones": "26121900000000000",
    "computers": "26200000000000000",
    "laptops": "26201100000000000",
    "appliances": "27510000000000000",
    "clothing": "14130000000000000",
    "shoes": "15200000000000000",
    "beauty": "20420000000000000",
    "perfume": "20420100000000000",
    "toys": "32400000000000000",
    "food": "10890000000000000",
    "sports": "32300000000000000",
    "home": "27000000000000000",
    "furniture": "31000000000000000",
    "auto": "29320000000000000",
}


class IKPUService:
    """Service for getting IKPU codes from tasnif.soliq.uz"""
    
    @staticmethod
    def validate_ikpu_code(code: str) -> bool:
        """IKPU kodini tekshirish (17 honali raqam)"""
        if not code:
            return False
        # Faqat raqamlar va 17 ta belgi
        return code.isdigit() and len(code) == 17
    
    @staticmethod
    async def search_ikpu(query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search IKPU codes by query from tasnif.soliq.uz
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{IKPU_BASE_URL}/cls/search",
                    params={
                        "search": query,
                        "count": limit
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    results = []
                    for item in data.get("data", [])[:limit]:
                        code = item.get("mxik") or item.get("code") or ""
                        # 17 honali qilish
                        if code and len(code) < 17:
                            code = code.ljust(17, '0')
                        
                        results.append({
                            "code": code,
                            "name_uz": item.get("name_uz") or item.get("name"),
                            "name_ru": item.get("name_ru"),
                            "group": item.get("group_name"),
                            "units": item.get("units"),
                            "is_valid": IKPUService.validate_ikpu_code(code)
                        })
                    return results
                else:
                    return IKPUService._get_from_local_mapping(query)
                    
        except Exception as e:
            print(f"IKPU API error: {e}")
            return IKPUService._get_from_local_mapping(query)
    
    @staticmethod
    def _get_from_local_mapping(query: str) -> List[Dict[str, Any]]:
        """Get IKPU from local mapping based on keywords"""
        query_lower = query.lower()
        results = []
        
        # Qidiruv so'zlariga qarab eng yaxshi moslikni topish
        best_matches = []
        
        for keyword, ikpu_data in COMMON_IKPU_CODES.items():
            if keyword in query_lower:
                best_matches.append({
                    "keyword": keyword,
                    "code": ikpu_data["code"],
                    "name": ikpu_data["name"],
                    "match_score": len(keyword)  # Uzunroq moslik = yaxshiroq
                })
        
        # Eng yaxshi mosliklarni saralash
        best_matches.sort(key=lambda x: x["match_score"], reverse=True)
        
        for match in best_matches[:5]:
            results.append({
                "code": match["code"],
                "name_uz": match["name"],
                "name_ru": match["name"],
                "group": "Local mapping",
                "match_keyword": match["keyword"],
                "is_valid": IKPUService.validate_ikpu_code(match["code"])
            })
        
        # Agar moslik topilmasa, default qaytarish
        if not results:
            results.append({
                "code": "00000000000000000",
                "name_uz": "Boshqa mahsulotlar",
                "name_ru": "Прочие товары",
                "group": "Default",
                "match_keyword": "general",
                "is_valid": True
            })
        
        return results
    
    @staticmethod
    def get_ikpu_by_category(category: str) -> Dict[str, Any]:
        """Get IKPU code by product category"""
        category_lower = category.lower()
        
        # Kategoriya mapping
        if category_lower in CATEGORY_TO_IKPU:
            code = CATEGORY_TO_IKPU[category_lower]
            # Kategoriya nomini topish
            for keyword, ikpu_data in COMMON_IKPU_CODES.items():
                if ikpu_data["code"] == code:
                    return {
                        "code": code,
                        "name": ikpu_data["name"],
                        "is_valid": True
                    }
            return {
                "code": code,
                "name": category,
                "is_valid": True
            }
        
        # Partial match
        for cat_key, code in CATEGORY_TO_IKPU.items():
            if cat_key in category_lower or category_lower in cat_key:
                return {
                    "code": code,
                    "name": cat_key,
                    "is_valid": True
                }
        
        return {
            "code": "00000000000000000",
            "name": "Boshqa mahsulotlar",
            "is_valid": True
        }
    
    @staticmethod
    async def get_ikpu_for_product(
        product_name: str,
        category: str = "",
        brand: str = ""
    ) -> Dict[str, Any]:
        """
        Get best matching IKPU code for a product
        
        Returns 17-digit IKPU code
        """
        # Build search query
        search_query = product_name.lower()
        if brand:
            search_query = f"{brand.lower()} {search_query}"
        
        # Try API search first
        results = await IKPUService.search_ikpu(search_query, limit=5)
        
        if results and results[0].get("is_valid"):
            best_match = results[0]
            return {
                "success": True,
                "ikpu_code": best_match.get("code"),
                "ikpu_name": best_match.get("name_uz") or best_match.get("name"),
                "confidence": "high" if len(results) == 1 else "medium",
                "alternatives": results[1:] if len(results) > 1 else [],
                "is_17_digit": len(best_match.get("code", "")) == 17
            }
        
        # Fallback to category-based
        if category:
            ikpu_data = IKPUService.get_ikpu_by_category(category)
            return {
                "success": True,
                "ikpu_code": ikpu_data["code"],
                "ikpu_name": ikpu_data["name"],
                "confidence": "low",
                "source": "category_mapping",
                "is_17_digit": len(ikpu_data["code"]) == 17
            }
        
        # Default
        return {
            "success": True,
            "ikpu_code": "00000000000000000",
            "ikpu_name": "Boshqa mahsulotlar",
            "confidence": "default",
            "is_17_digit": True
        }


# Singleton instance
ikpu_service = IKPUService()
