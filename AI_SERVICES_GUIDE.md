# 🤖 SellerCloudX - AI Xizmatlari To'liq Ro'yxati

## ⚠️ MUHIM: AI Kalitlari Faqat Admin Tomonidan Sozlanadi!

**Biznes Modeli:**
- ✅ **Hamkorlar** → Faqat **Marketplace API** kalitlarini kiritadi (Uzum, WB, Ozon, Yandex)
- ✅ **Admin** → **AI API kalitlari**ni BIR MARTA platformaga sozlaydi
- ✅ **AI xizmatlari** → Barcha hamkorlar uchun **PARALLEL** ishlaydi
- ✅ **AI xarajatlari** → Platformaga tegishli (SaaS modeliga kiritilgan)

---

## Loyihada Ishlatilgan AI Xizmatlari

### 📊 AI SERVICE HIERARCHY

```
AI Manager (aiManagerService.ts)
├── Text Generation
│   ├── Gemini Flash (gemini-2.5-flash) - PRIMARY (eng arzon, tez)
│   ├── Gemini Pro (gemini-2.5-pro) - murakkab vazifalar
│   ├── Claude 3.5 Sonnet - advanced reasoning
│   └── GPT-4 Turbo - fallback
│
├── Image Generation
│   ├── Nano Banana (Google) - infografikalar
│   ├── Flux 1.1 Pro (Replicate) - mahsulot fotolari (eng arzon)
│   ├── Ideogram AI - matnli infografikalar (eng yaxshi matn)
│   └── DALL-E 3 - fallback
│
├── Video Generation
│   ├── Veo 2 (Google) - PRIMARY
│   └── Runway ML Gen-3 Alpha - fallback
│
└── Special Services
    ├── Perplexity AI - web search, research
    ├── Canva API - design generation
    └── Anthropic Claude - advanced analysis
```

---

## 🔑 API KALITLARI TUZILMASI

### ADMIN Sozlaydi (Bir Marta, Platformaga):
| Xizmat | Environment Variable | Olish | Vazifasi |
|--------|---------------------|-------|----------|
| **Google Gemini** | `GEMINI_API_KEY` | [makersuite.google.com](https://makersuite.google.com) | Text + Image AI |
| **Replicate (Flux)** | `REPLICATE_API_KEY` | [replicate.com](https://replicate.com) | Mahsulot rasmlari |
| **OpenAI** | `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) | Fallback AI |
| **Anthropic** | `ANTHROPIC_API_KEY` | [anthropic.com](https://anthropic.com) | Advanced AI |

### HAMKORLAR Sozlaydi (Har bir hamkor o'zi):
| Marketplace | API kaliti | Olish joyi |
|-------------|------------|------------|
| **Uzum Market** | API Token | seller.uzum.uz → Sozlamalar → API |
| **Wildberries** | API Token | seller.wildberries.ru → API |
| **Ozon** | Client ID + API Key | seller.ozon.ru → Sozlamalar → API |
| **Yandex Market** | OAuth Token | partner.market.yandex.ru → API |

---

## 🔑 KERAKLI API KEYS (ADMIN UCHUN)

### Asosiy (REQUIRED)
| Xizmat | Environment Variable | Olish |
|--------|---------------------|-------|
| **Google Gemini** | `GEMINI_API_KEY` | [makersuite.google.com](https://makersuite.google.com) |
| **OpenAI** | `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |

### Qo'shimcha (OPTIONAL)
| Xizmat | Environment Variable | Olish | Funksiyasi |
|--------|---------------------|-------|------------|
| **Replicate (Flux)** | `REPLICATE_API_KEY` | [replicate.com](https://replicate.com) | Arzon rasm generation |
| **Anthropic Claude** | `ANTHROPIC_API_KEY` | [anthropic.com](https://anthropic.com) | Advanced reasoning |
| **Ideogram** | `IDEOGRAM_API_KEY` | [ideogram.ai](https://ideogram.ai) | Matnli infografikalar |
| **Runway ML** | `RUNWAY_API_KEY` | [runwayml.com](https://runwayml.com) | Video generation |
| **Perplexity** | `PERPLEXITY_API_KEY` | [perplexity.ai](https://perplexity.ai) | Web search |
| **Canva** | `CANVA_API_KEY` | [canva.dev](https://canva.dev) | Design API |

---

## 📁 AI Service Fayllari

### Core Services
```
/app/server/services/
├── aiManagerService.ts      # Main AI Manager (40KB)
├── geminiService.ts         # Google Gemini integration
├── openaiService.ts         # OpenAI GPT-4 integration
├── emergentAI.ts            # Unified AI (Claude + OpenAI)
├── imageAIService.ts        # Flux, Ideogram, Nano Banana
├── videoGenerationService.ts # Veo 2, Runway ML
```

### Specialized Services
```
├── aiOrchestrator.ts        # Multi-AI orchestration
├── multiAIOOrchestrator.ts  # Advanced multi-AI
├── aiCostOptimizer.ts       # Cost optimization
├── aiTaskQueue.ts           # Task queue management
├── autonomousAIManager.ts   # Autonomous operations
├── smartAIManager.ts        # Smart AI decisions
├── productCardAI.ts         # Product card generation
├── aiMarketingService.ts    # Marketing AI
├── aiCustomerService.ts     # Customer service AI
```

---

## 💰 AI NARXLARI (Cost per Request)

### Text Generation
| Model | Input | Output | 1K token |
|-------|-------|--------|----------|
| Gemini 2.5 Flash | $0.075/1M | $0.30/1M | ~$0.0003 |
| Gemini 2.5 Flash-Lite | $0.0375/1M | $0.15/1M | ~$0.0001 |
| Gemini 2.5 Pro | $0.50/1M | $1.25/1M | ~$0.001 |
| GPT-4 Turbo | $10/1M | $30/1M | ~$0.02 |
| Claude 3.5 Sonnet | $3/1M | $15/1M | ~$0.01 |

### Image Generation
| Model | Cost per Image |
|-------|----------------|
| **Nano Banana** | ~$0.02 |
| **Flux 1.1 Pro** | ~$0.04 |
| **Ideogram V2** | ~$0.08 |
| **DALL-E 3** | ~$0.04-0.08 |

### Video Generation
| Model | Cost per Video |
|-------|----------------|
| **Veo 2** | ~$0.20 (5s) |
| **Runway Gen-3** | ~$0.50 (5s) |

---

## ⚙️ ADMIN ENV FAYLI (Server-side)

```bash
# =====================================================
# AI SERVICES - ADMIN BIR MARTA SOZLAYDI
# Barcha hamkorlar uchun parallel ishlaydi
# =====================================================

# PRIMARY - Google Gemini (Text + Image)
GEMINI_API_KEY=AIzaSy...

# IMAGE GENERATION - Flux (Replicate)
REPLICATE_API_KEY=r8_...

# FALLBACK - OpenAI (Gemini ishlamasa)
OPENAI_API_KEY=sk-...

# ADVANCED (Optional)
ANTHROPIC_API_KEY=sk-ant-...
IDEOGRAM_API_KEY=api_key_...

# =====================================================
# DATABASE & SERVER (Admin sozlaydi)
# =====================================================
DATABASE_URL=postgresql://...
SESSION_SECRET=min-32-character-secret
NODE_ENV=production
```

**⚠️ Hamkorlar bu kalitlarni ko'rmaydi va ularga kirish yo'q!**

---

## 🏪 HAMKOR MARKETPLACE API SOZLASH

Hamkorlar **Partner Dashboard → Integratsiyalar** bo'limida:

### Uzum Market
```
1. seller.uzum.uz ga kiring
2. Sozlamalar → API → Token yaratish
3. SellerCloudX → Integratsiyalar → Uzum → API Key kiritish
```

### Wildberries
```
1. seller.wildberries.ru ga kiring
2. Profil → API → Token olish
3. SellerCloudX → Integratsiyalar → WB → API Key kiritish
```

### Ozon
```
1. seller.ozon.ru ga kiring
2. Sozlamalar → API → Client ID va API Key olish
3. SellerCloudX → Integratsiyalar → Ozon → Ma'lumotlarni kiritish
```

### Yandex Market
```
1. partner.market.yandex.ru ga kiring
2. Sozlamalar → API → OAuth token olish
3. SellerCloudX → Integratsiyalar → Yandex → Token kiritish
```

---

## 🔄 AI Service Priority (Fallback Chain)

### Text Generation:
```
1. Gemini 2.5 Flash (cheapest, fastest)
   ↓ (if fails)
2. Gemini 2.5 Pro (complex tasks)
   ↓ (if fails)
3. Claude 3.5 Sonnet (advanced reasoning)
   ↓ (if fails)
4. GPT-4 Turbo (fallback)
   ↓ (if fails)
5. Fallback Mock Data
```

### Image Generation:
```
1. Nano Banana (infographics, Google ecosystem)
   ↓ (if fails)
2. Flux 1.1 Pro (product photos, cheapest)
   ↓ (if fails)
3. Ideogram V2 (text-heavy infographics)
   ↓ (if fails)
4. DALL-E 3 (fallback)
   ↓ (if fails)
5. Placeholder Image
```

---

## ✅ HOZIRGI HOLAT

**AI Services Status:**
- GEMINI_API_KEY: ❌ NOT SET
- OPENAI_API_KEY: ❌ NOT SET
- ANTHROPIC_API_KEY: ❌ NOT SET
- REPLICATE_API_KEY: ❌ NOT SET
- EMERGENT_LLM_KEY: ❌ NOT SET

**Natija:** AI xizmatlari **FALLBACK** rejimida ishlaydi (mock data).

---

## 🚀 ADMIN UCHUN AI YOQISH QADAMLARI

### 1. Minimal Setup (Tavsiya etiladi)
```bash
# .env ga qo'shing:
GEMINI_API_KEY=your-gemini-api-key
```
**Natija:** Text + Image generation ishlaydi, ~$0.0003/request

### 2. Recommended Setup (Gemini + Flux)
```bash
GEMINI_API_KEY=your-gemini-api-key
REPLICATE_API_KEY=your-replicate-key
```
**Natija:** Arzon va sifatli text + image generation

### 3. Full Setup (All AI Services)
```bash
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-key
REPLICATE_API_KEY=your-replicate-key
ANTHROPIC_API_KEY=your-anthropic-key
```
**Natija:** Barcha AI features to'liq ishlaydi

---

## 💡 AI PARALLEL ISHLASH TIZIMI

```
┌─────────────────────────────────────────────────────────────┐
│                    SELLERCLOUDX SERVER                       │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────────────────┐  │
│  │   AI Manager     │───▶│  AI API Keys (Admin sozladi)  │  │
│  │  (Orchestrator)  │    │  - Gemini API                 │  │
│  └────────┬─────────┘    │  - Replicate API              │  │
│           │              │  - OpenAI API (fallback)      │  │
│           ▼              └──────────────────────────────┘  │
│  ┌──────────────────┐                                       │
│  │   Task Queue     │  AI bir vaqtda barcha hamkorlar      │
│  │   (Parallel)     │  uchun parallel ishlaydi!            │
│  └────────┬─────────┘                                       │
│           │                                                 │
│     ┌─────┴─────┬─────────┬─────────┐                      │
│     ▼           ▼         ▼         ▼                      │
│ ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐                │
│ │Hamkor1│  │Hamkor2│  │Hamkor3│  │Hamkor4│  ...           │
│ │ Uzum  │  │  WB   │  │ Ozon  │  │Yandex │                │
│ │ API   │  │ API   │  │ API   │  │ API   │                │
│ └───────┘  └───────┘  └───────┘  └───────┘                │
└─────────────────────────────────────────────────────────────┘
```

**Jarayon:**
1. Hamkor mahsulot qo'shadi
2. AI Manager vazifani qabul qiladi
3. AI (Gemini/Flux) kartochka yaratadi
4. Kartochka hamkorning marketplace'iga yuboriladi
5. Hamkor faqat o'z marketplace API'si orqali mahsulot yuklaydi

---

## 📝 MUHIM ESLATMALAR

1. **AI API kalitlari = ADMIN vazifasi** - Hamkorlar ko'rmaydi
2. **Marketplace API kalitlari = HAMKOR vazifasi** - Har biri o'zi sozlaydi
3. **AI xarajatlari = Platforma to'laydi** - SaaS obunaga kiritilgan
4. **Gemini PRIMARY** - Eng arzon va tez
5. **Parallel ishlash** - AI bir vaqtda 100+ hamkor uchun ishlaydi
6. **Fallback Chain** - Xizmat ishlamasa avtomatik zaxiraga o'tadi

---

## ✅ ADMIN CHECKLIST (AI Setup)

- [ ] GEMINI_API_KEY sozlandi
- [ ] REPLICATE_API_KEY sozlandi (optional)
- [ ] OPENAI_API_KEY sozlandi (fallback)
- [ ] Server restart qilindi
- [ ] AI Manager test qilindi
- [ ] Birinchi kartochka yaratildi

---

## ✅ HAMKOR CHECKLIST (Marketplace Setup)

- [ ] SellerCloudX'ga ro'yxatdan o'tdi
- [ ] Partner Dashboard'ga kirdi
- [ ] Integratsiyalar bo'limiga o'tdi
- [ ] Marketplace API kalitini oldi
- [ ] SellerCloudX'ga API kalitini kiritdi
- [ ] Integratsiya test qilindi
- [ ] Birinchi mahsulot yuklandi

---

*Hujjat versiyasi: 2.0 | Yangilangan: Yanvar 2026*
