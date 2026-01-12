# 🤖 SellerCloudX - AI Xizmatlari To'liq Ro'yxati

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

## 🔑 KERAKLI API KEYS

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

## ⚙️ ENV FAYLI NAMUNASI

```bash
# AI SERVICES - PRODUCTION

# PRIMARY (Required)
GEMINI_API_KEY=AIzaSy...
OPENAI_API_KEY=sk-...

# IMAGE GENERATION
REPLICATE_API_KEY=r8_...
IDEOGRAM_API_KEY=api_key_...

# ADVANCED (Optional)
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...
RUNWAY_API_KEY=key_...

# EMERGENT (Alternative)
EMERGENT_LLM_KEY=your-emergent-key
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

## 🚀 AI XIZMATLARINI YOQISH

### 1. Minimal Setup (faqat Gemini)
```bash
# .env ga qo'shing:
GEMINI_API_KEY=your-gemini-api-key
```
**Natija:** Text + Image generation ishlaydi (~$0.0003/request)

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
IDEOGRAM_API_KEY=your-ideogram-key
```
**Natija:** Barcha AI features to'liq ishlaydi

---

## 📝 MUHIM ESLATMALAR

1. **Gemini PRIMARY** - Loyiha asosan Gemini'ga asoslangan (arzon va tez)
2. **OpenAI FALLBACK** - Gemini ishlamasa OpenAI ishlatiladi
3. **Nano Banana** - Google'ning yangi image generation modeli
4. **Cost Optimizer** - Avtomatik eng arzon variantni tanlaydi
5. **Fallback Chain** - Har bir xizmat uchun zaxira variant bor

---

*Hujjat versiyasi: 1.0 | Yangilangan: Yanvar 2026*
