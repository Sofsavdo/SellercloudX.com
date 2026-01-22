/**
 * AI Product Creator - To'liq Integratsiyalangan Oqim
 * 
 * 6 bosqichli wizard:
 * 1. Rasm yuklash / kamera
 * 2. AI tanib olish natijasi
 * 3. Tannarx va miqdor kiritish  
 * 4. AI Infografika yaratish (Nano Banana)
 * 5. Marketplace tanlash va narx tahlili
 * 6. Tayyor kartochka + Yuklash
 * 
 * To'liq oqim: Kamera → Aniqlash → Infografika → Uzum/Yandex yaratish
 */

import { useState, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Camera, 
  Upload, 
  Loader2, 
  Sparkles, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Copy,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  ShoppingCart,
  Zap,
  Info,
  Image as ImageIcon,
  Wand2,
  Download,
  Store,
  Rocket
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const PARTNER_ID = 'test-partner-123';

// Kategoriyalar
const CATEGORIES = [
  { value: 'electronics', label: 'Elektronika', icon: '📱' },
  { value: 'clothing', label: 'Kiyim-kechak', icon: '👔' },
  { value: 'beauty', label: "Go'zallik", icon: '💄' },
  { value: 'home', label: "Uy-ro'zg'or", icon: '🏠' },
  { value: 'food', label: 'Oziq-ovqat', icon: '🍎' },
  { value: 'toys', label: "O'yinchoqlar", icon: '🧸' },
  { value: 'sports', label: 'Sport', icon: '⚽' },
  { value: 'auto', label: 'Avtomobil', icon: '🚗' },
];

// Uzum kategoriyalari (4 daraja)
const UZUM_CATEGORIES = {
  "Электроника": {
    "Телефоны и планшеты": {
      "Смартфоны": ["Android", "iOS", "Другие"],
      "Планшеты": ["Android", "iOS", "Windows"],
      "Аксессуары": ["Чехлы", "Наушники", "Зарядные устройства"]
    },
    "Компьютерная техника": {
      "Ноутбуки": ["Игровые", "Офисные", "Ultrabook"],
      "ПК и комплектующие": ["Готовые ПК", "Комплектующие"]
    },
    "ТВ и аудио": {
      "Телевизоры": ["LED", "OLED", "Smart TV"],
      "Аудиотехника": ["Колонки", "Наушники"]
    }
  },
  "Одежда": {
    "Женская одежда": {
      "Платья": ["Повседневные", "Вечерние", "Офисные"],
      "Брюки и джинсы": ["Джинсы", "Брюки", "Леггинсы"]
    },
    "Мужская одежда": {
      "Рубашки": ["Классические", "Повседневные"],
      "Брюки": ["Джинсы", "Классические", "Спортивные"]
    }
  },
  "Дом и сад": {
    "Бытовая техника": {
      "Кухонная техника": ["Холодильники", "Плиты", "Микроволновки"],
      "Уборка": ["Пылесосы", "Роботы-пылесосы"]
    }
  },
  "Красота и здоровье": {
    "Парфюмерия": {
      "Женская": ["Eau de Parfum", "Eau de Toilette"],
      "Мужская": ["Eau de Parfum", "Eau de Toilette"]
    },
    "Косметика": {
      "Для лица": ["Кремы", "Маски"],
      "Для тела": ["Лосьоны", "Скрабы"]
    }
  }
};

// Infografika shablonlari
const INFOGRAPHIC_TEMPLATES = [
  { id: 'product_showcase', name: "Mahsulot ko'rsatish", icon: Package },
  { id: 'features_highlight', name: 'Xususiyatlar', icon: Zap },
  { id: 'comparison', name: 'Taqqoslash', icon: BarChart3 },
  { id: 'lifestyle', name: 'Hayot tarzi', icon: Camera },
  { id: 'bundle', name: "To'plam", icon: Copy },
];

// Marketplace options - IKKISI HAM TO'LIQ AVTOMATIK!
const MARKETPLACES = [
  { 
    id: 'uzum', 
    name: 'Uzum Market', 
    icon: '🍇',
    color: 'purple',
    automation: 'full_browser', // Browser automation orqali TO'LIQ AVTOMAT
    imageSize: '1080x1440px'
  },
  { 
    id: 'yandex', 
    name: 'Yandex Market', 
    icon: '🔴',
    color: 'yellow',
    automation: 'full', // API direct
    imageSize: '1000x1000px'
  },
];

interface ScanResult {
  name: string;
  category: string;
  brand: string;
  description: string;
  specifications: string[];
  confidence: number;
}

interface InfographicResult {
  image_base64: string;
  mime_type: string;
  metadata: any;
}

interface PriceData {
  min_price: number;
  optimal_price: number;
  max_price: number;
  net_profit: number;
  actual_margin: number;
  is_profitable: boolean;
}

export default function AIProductCreator() {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Image
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [cameraActive, setCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Step 2: Detected product
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [productName, setProductName] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const [productCategory, setProductCategory] = useState('electronics');
  const [productDescription, setProductDescription] = useState('');
  const [productFeatures, setProductFeatures] = useState<string[]>([]);
  
  // Step 3: Cost & quantity
  const [costPrice, setCostPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [weightKg, setWeightKg] = useState('1');
  
  // Step 4: Infographic
  const [infographicTemplate, setInfographicTemplate] = useState('product_showcase');
  const [infographicBackground, setInfographicBackground] = useState('white');
  const [generatedInfographic, setGeneratedInfographic] = useState<InfographicResult | null>(null);
  
  // Step 5: Marketplace & Price
  const [selectedMarketplace, setSelectedMarketplace] = useState('uzum');
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [productCard, setProductCard] = useState<any>(null);
  
  // Step 6: Final
  const [ikpuCode, setIkpuCode] = useState('');
  const [sku, setSku] = useState('');
  const [fullResult, setFullResult] = useState<any>(null);
  
  // Marketplace credentials (TO'LIQ AVTOMATLASHTIRISH UCHUN)
  const [uzumLogin, setUzumLogin] = useState('');
  const [uzumPassword, setUzumPassword] = useState('');
  const [uzumCredentialsSaved, setUzumCredentialsSaved] = useState(false);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  
  // Yandex credentials (for full automation)
  const [yandexToken, setYandexToken] = useState('');
  const [yandexBusinessId, setYandexBusinessId] = useState('');
  
  // YANGI: 4 darajali kategoriya tanlash
  const [categoryLevel1, setCategoryLevel1] = useState('');
  const [categoryLevel2, setCategoryLevel2] = useState('');
  const [categoryLevel3, setCategoryLevel3] = useState('');
  const [categoryLevel4, setCategoryLevel4] = useState('');
  
  // YANGI: Rus va O'zbek tilidagi tavsiflar
  const [nameUz, setNameUz] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [shortDescUz, setShortDescUz] = useState('');
  const [shortDescRu, setShortDescRu] = useState('');
  const [fullDescUz, setFullDescUz] = useState('');
  const [fullDescRu, setFullDescRu] = useState('');
  
  // YANGI: O'lchamlar
  const [widthCm, setWidthCm] = useState('10');
  const [heightCm, setHeightCm] = useState('10');
  const [depthCm, setDepthCm] = useState('10');
  
  // Automation status
  const [automationStatus, setAutomationStatus] = useState<string[]>([]);
  const [isAutomating, setIsAutomating] = useState(false);

  // Steps config
  const steps = [
    { id: 1, title: 'Rasm', icon: Camera },
    { id: 2, title: 'Aniqlash', icon: Sparkles },
    { id: 3, title: 'Tannarx', icon: DollarSign },
    { id: 4, title: 'Infografika', icon: Wand2 },
    { id: 5, title: 'Marketplace', icon: Store },
    { id: 6, title: 'Yaratish', icon: Rocket },
  ];

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      alert("Kameraga kirish imkoni yo'q");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setImagePreview(dataUrl);
    setImageBase64(dataUrl.split(',')[1]);
    stopCamera();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageBase64(result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Scan image mutation
  const scanImageMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      const byteString = atob(imageBase64);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'image/jpeg' });
      formData.append('file', blob, 'product.jpg');
      
      const response = await fetch(`${API_BASE}/api/unified-scanner/scan-image`, {
        method: 'POST',
        body: formData
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.product) {
        setScanResult(data.product);
        setProductName(data.product.name || '');
        setProductBrand(data.product.brand || '');
        setProductCategory(data.product.category || 'electronics');
        setProductDescription(data.product.description || '');
        setProductFeatures(data.product.specifications || []);
        setCurrentStep(2);
      }
    }
  });

  // Generate infographic mutation
  const generateInfographicMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/api/infographic/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName,
          brand: productBrand,
          features: productFeatures.length > 0 ? productFeatures : productDescription.split('\n').filter(f => f.trim()),
          template: infographicTemplate,
          marketplace: selectedMarketplace,
          background: infographicBackground
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.image_base64) {
        setGeneratedInfographic({
          image_base64: data.image_base64,
          mime_type: data.mime_type,
          metadata: data.metadata
        });
      }
    }
  });

  // 🚀 UZUM TO'LIQ AVTOMATLASHTIRISH - Browser Automation orqali
  const uzumFullAutoMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/api/uzum-automation/create-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: PARTNER_ID,
          // Credential
          use_saved_credentials: uzumCredentialsSaved,
          phone_or_email: uzumLogin,
          password: uzumPassword,
          // Product data
          name: productName,
          description: productDescription,
          price: priceData?.optimal_price || parseFloat(costPrice) * 1.3,
          category: productCategory,
          brand: productBrand,
          images: generatedInfographic ? [generatedInfographic.image_base64] : [],
          quantity: parseInt(quantity),
          ikpu_code: ikpuCode,
          weight_kg: parseFloat(weightKg),
          // AI options
          use_ai_card: true,
          use_ai_infographic: !generatedInfographic, // Agar allaqachon yaratilgan bo'lsa, yana yaratmaymiz
          infographic_template: infographicTemplate
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setFullResult(data);
        setCurrentStep(6);
      } else if (data.requires_otp) {
        setRequiresOtp(true);
        setSessionId(data.session_id);
      } else if (data.requires_credentials) {
        // Credential kiritish kerak
        alert('Iltimos, Uzum login va parolini kiriting');
      }
    }
  });

  // 🚀 YANGI: TO'LIQ MUKAMMAL AVTOMATIZATSIYA
  const uzumFullProfessionalMutation = useMutation({
    mutationFn: async () => {
      setIsAutomating(true);
      setAutomationStatus(['Jarayon boshlandi...']);
      
      const categoryPath = [categoryLevel1, categoryLevel2, categoryLevel3, categoryLevel4].filter(c => c);
      
      const response = await fetch(`${API_BASE}/api/uzum-full/create-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: PARTNER_ID,
          phone: uzumLogin,
          password: uzumPassword,
          // 4 darajali kategoriya
          category_path: categoryPath,
          // Nomlar (max 90 belgi)
          name_uz: nameUz || productName,
          name_ru: nameRu || productName,
          // Qisqa tavsif (max 390 belgi)
          short_desc_uz: shortDescUz,
          short_desc_ru: shortDescRu,
          // To'liq tavsif
          full_desc_uz: fullDescUz || productDescription,
          full_desc_ru: fullDescRu || productDescription,
          // Rasmlar
          images: generatedInfographic ? [`data:image/png;base64,${generatedInfographic.image_base64}`] : [],
          // Mamlakat
          country: "Узбекистан",
          // Xususiyatlar
          characteristics: {},
          // SKU va IKPU
          sku: sku,
          ikpu_code: ikpuCode,
          // Narx va o'lchamlar
          price: priceData?.optimal_price || parseInt(costPrice) || 100000,
          width_cm: parseInt(widthCm) || 10,
          height_cm: parseInt(heightCm) || 10,
          depth_cm: parseInt(depthCm) || 10,
          weight_kg: parseFloat(weightKg) || 1.0,
          // AI options
          use_ai_keywords: true,
          auto_generate_ikpu: !ikpuCode
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsAutomating(false);
      if (data.success) {
        setFullResult(data);
        setAutomationStatus(data.data?.steps_completed || ['Muvaffaqiyatli yakunlandi']);
        if (data.data?.sku) setSku(data.data.sku);
        if (data.data?.ikpu_code) setIkpuCode(data.data.ikpu_code);
        setCurrentStep(6);
      } else {
        setAutomationStatus([`Xatolik: ${data.error}`]);
        alert(`Xatolik: ${data.error}`);
      }
    },
    onError: (error) => {
      setIsAutomating(false);
      setAutomationStatus([`Xatolik: ${error}`]);
    }
  });

  // Uzum OTP yuborish
  const uzumOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/api/uzum-automation/submit-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: PARTNER_ID,
          otp_code: otpCode,
          session_id: sessionId
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setRequiresOtp(false);
        // Qayta mahsulot yaratishni boshlash
        uzumFullAutoMutation.mutate();
      }
    }
  });

  // Full process for Uzum mutation (eski - faqat kartochka tayyorlash)
  const uzumProcessMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/api/unified-scanner/full-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: PARTNER_ID,
          cost_price: parseFloat(costPrice),
          quantity: parseInt(quantity),
          category: productCategory,
          brand: productBrand,
          weight_kg: parseFloat(weightKg),
          fulfillment: 'fbs',
          product_name: productName,
          description: productDescription,
          auto_ikpu: true
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setFullResult(data.data);
        if (data.data.price_optimization) {
          setPriceData(data.data.price_optimization);
        }
        if (data.data.product_card) {
          setProductCard(data.data.product_card);
        }
        if (data.data.ikpu) {
          setIkpuCode(data.data.ikpu.code);
        }
        if (data.data.sku) {
          setSku(data.data.sku);
        }
        // Credential'lar tayyor bo'lsa, avtomatik yaratish
        if (uzumLogin && uzumPassword) {
          uzumFullAutoMutation.mutate();
        } else {
          setCurrentStep(6);
        }
      }
    }
  });

  // Full process for Yandex mutation
  const yandexProcessMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/api/yandex-market/full-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: PARTNER_ID,
          cost_price: parseFloat(costPrice),
          quantity: parseInt(quantity),
          category: productCategory,
          brand: productBrand,
          weight_kg: parseFloat(weightKg),
          fulfillment: 'fbs',
          payout_frequency: 'weekly',
          product_name: productName,
          description: productDescription
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setFullResult(data.data);
        if (data.data.price_optimization) {
          setPriceData(data.data.price_optimization);
        }
        if (data.data.product_card) {
          setProductCard(data.data.product_card);
        }
        if (data.data.sku) {
          setSku(data.data.sku);
        }
        setCurrentStep(6);
      }
    }
  });

  // Format currency
  const formatCurrency = (amount: number, currency: string = "so'm") => {
    return new Intl.NumberFormat('uz-UZ').format(Math.round(amount)) + ` ${currency}`;
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Download infographic
  const downloadInfographic = () => {
    if (!generatedInfographic) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${generatedInfographic.image_base64}`;
    link.download = `infographic_${productName.replace(/\s+/g, '_')}_${Date.now()}.png`;
    link.click();
  };

  // Reset
  const handleReset = () => {
    setCurrentStep(1);
    setImagePreview('');
    setImageBase64('');
    setScanResult(null);
    setProductName('');
    setProductBrand('');
    setProductCategory('electronics');
    setProductDescription('');
    setProductFeatures([]);
    setCostPrice('');
    setQuantity('1');
    setWeightKg('1');
    setGeneratedInfographic(null);
    setPriceData(null);
    setProductCard(null);
    setFullResult(null);
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return null;
    }
  };

  // Step 1: Image upload
  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-6 h-6 text-purple-600" />
          Mahsulot Rasmini Yuklang
        </CardTitle>
        <CardDescription>
          Mahsulot rasmini oling yoki galereyadan tanlang
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!imagePreview ? (
          <>
            {cameraActive ? (
              <div className="relative rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full aspect-[3/4] object-cover" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <Button onClick={capturePhoto} size="lg" className="bg-white text-black hover:bg-gray-100">
                    <Camera className="w-5 h-5 mr-2" /> Rasm Olish
                  </Button>
                  <Button onClick={stopCamera} variant="outline" size="lg" className="bg-white/80">
                    Bekor qilish
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={startCamera} variant="outline"
                  className="h-40 flex flex-col gap-3 border-2 border-dashed hover:border-purple-500 hover:bg-purple-50"
                  data-testid="camera-btn">
                  <Camera className="w-12 h-12 text-purple-600" />
                  <span className="text-lg">Kamera</span>
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline"
                  className="h-40 flex flex-col gap-3 border-2 border-dashed hover:border-purple-500 hover:bg-purple-50"
                  data-testid="upload-btn">
                  <Upload className="w-12 h-12 text-purple-600" />
                  <span className="text-lg">Yuklash</span>
                </Button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-gray-100">
              <img src={imagePreview} alt="Product" className="w-full aspect-[3/4] object-contain" />
            </div>
            <div className="flex gap-4">
              <Button onClick={() => { setImagePreview(''); setImageBase64(''); }} variant="outline" className="flex-1">
                Boshqa rasm
              </Button>
              <Button onClick={() => scanImageMutation.mutate()} disabled={scanImageMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700" data-testid="scan-btn">
                {scanImageMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Tahlil qilinmoqda...</>
                ) : (
                  <><Sparkles className="w-5 h-5 mr-2" /> AI bilan Aniqlash</>
                )}
              </Button>
            </div>
          </div>
        )}
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">yoki</span>
          </div>
        </div>
        <Button onClick={() => setCurrentStep(2)} variant="ghost" className="w-full">
          Qo'lda kiritish <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  // Step 2: Product info
  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Mahsulot Ma'lumotlari
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {scanResult && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertTitle className="text-green-800">AI Aniqladi!</AlertTitle>
            <AlertDescription className="text-green-700">
              Ishonch darajasi: {scanResult.confidence}%
            </AlertDescription>
          </Alert>
        )}
        <div className="grid gap-4">
          <div>
            <Label>Mahsulot nomi *</Label>
            <Input value={productName} onChange={(e) => setProductName(e.target.value)}
              placeholder="Masalan: Samsung Galaxy A54" className="mt-1" data-testid="product-name-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Brend</Label>
              <Input value={productBrand} onChange={(e) => setProductBrand(e.target.value)}
                placeholder="Samsung, Apple..." className="mt-1" />
            </div>
            <div>
              <Label>Kategoriya</Label>
              <Select value={productCategory} onValueChange={setProductCategory}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Tavsif va xususiyatlar</Label>
            <Textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Har bir qatorga bitta xususiyat yozing..." rows={4} className="mt-1" />
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setCurrentStep(1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Orqaga
          </Button>
          <Button onClick={() => setCurrentStep(3)} disabled={!productName}
            className="flex-1 bg-purple-600 hover:bg-purple-700">
            Davom etish <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Step 3: Cost
  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          Tannarx va Miqdor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tannarx (so'm) *</Label>
            <Input type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)}
              placeholder="2500000" className="mt-1 text-lg" data-testid="cost-price-input" />
          </div>
          <div>
            <Label>Miqdori *</Label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
              placeholder="10" className="mt-1 text-lg" />
          </div>
        </div>
        <div>
          <Label>Og'irlik (kg)</Label>
          <Input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)}
            placeholder="1" className="mt-1" />
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setCurrentStep(2)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Orqaga
          </Button>
          <Button onClick={() => setCurrentStep(4)} disabled={!costPrice || !quantity}
            className="flex-1 bg-green-600 hover:bg-green-700">
            Infografika yaratish <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Step 4: Infographic
  const renderStep4 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-pink-600" />
            AI Infografika (Nano Banana)
          </CardTitle>
          <CardDescription>
            Professional mahsulot rasmi yarating
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Shablon</Label>
              <Select value={infographicTemplate} onValueChange={setInfographicTemplate}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INFOGRAPHIC_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fon</Label>
              <Select value={infographicBackground} onValueChange={setInfographicBackground}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">⬜ Oq</SelectItem>
                  <SelectItem value="gradient">🌫️ Gradient</SelectItem>
                  <SelectItem value="studio">📸 Studio</SelectItem>
                  <SelectItem value="minimal">⚪ Minimal</SelectItem>
                  <SelectItem value="luxury">🖤 Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {generatedInfographic ? (
            <div className="space-y-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img src={`data:image/png;base64,${generatedInfographic.image_base64}`}
                  alt="Generated infographic" className="w-full h-auto" />
                <Badge className="absolute top-2 right-2 bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" /> Tayyor
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button onClick={downloadInfographic} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" /> Yuklab olish
                </Button>
                <Button onClick={() => generateInfographicMutation.mutate()} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" /> Qayta yaratish
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => generateInfographicMutation.mutate()}
              disabled={generateInfographicMutation.isPending}
              className="w-full h-16 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
              {generateInfographicMutation.isPending ? (
                <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> AI rasm yaratmoqda... (30-60 sek)</>
              ) : (
                <><Wand2 className="w-6 h-6 mr-2" /> Infografika Yaratish</>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={() => setCurrentStep(3)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Orqaga
        </Button>
        <Button onClick={() => setCurrentStep(5)} className="flex-1 bg-purple-600 hover:bg-purple-700">
          Marketplace tanlash <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Step 5: Marketplace selection + Credentials + Advanced Options
  const renderStep5 = () => {
    // Kategoriya darajalari
    const level1Options = Object.keys(UZUM_CATEGORIES);
    const level2Options = categoryLevel1 ? Object.keys(UZUM_CATEGORIES[categoryLevel1 as keyof typeof UZUM_CATEGORIES] || {}) : [];
    const level3Options = categoryLevel1 && categoryLevel2 
      ? Object.keys((UZUM_CATEGORIES[categoryLevel1 as keyof typeof UZUM_CATEGORIES] as any)?.[categoryLevel2] || {}) 
      : [];
    const level4Options = categoryLevel1 && categoryLevel2 && categoryLevel3
      ? (UZUM_CATEGORIES[categoryLevel1 as keyof typeof UZUM_CATEGORIES] as any)?.[categoryLevel2]?.[categoryLevel3] || []
      : [];
    
    return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-6 h-6 text-blue-600" />
            Marketplace va Kategoriya
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {MARKETPLACES.map((mp) => (
              <button key={mp.id} onClick={() => setSelectedMarketplace(mp.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left
                  ${selectedMarketplace === mp.id 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="text-2xl mb-1">{mp.icon}</div>
                <h3 className="font-bold">{mp.name}</h3>
                <Badge className="mt-1 bg-green-500 text-xs">🚀 Avtomatik</Badge>
              </button>
            ))}
          </div>

          {/* 4 DARAJALI KATEGORIYA TANLASH */}
          {selectedMarketplace === 'uzum' && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm font-bold">📂 Kategoriya (4 daraja)</Label>
              <div className="grid grid-cols-2 gap-3">
                <Select value={categoryLevel1} onValueChange={(v) => { setCategoryLevel1(v); setCategoryLevel2(''); setCategoryLevel3(''); setCategoryLevel4(''); }}>
                  <SelectTrigger><SelectValue placeholder="1. Asosiy kategoriya" /></SelectTrigger>
                  <SelectContent>
                    {level1Options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
                
                <Select value={categoryLevel2} onValueChange={(v) => { setCategoryLevel2(v); setCategoryLevel3(''); setCategoryLevel4(''); }} disabled={!categoryLevel1}>
                  <SelectTrigger><SelectValue placeholder="2. Sub-kategoriya" /></SelectTrigger>
                  <SelectContent>
                    {level2Options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
                
                <Select value={categoryLevel3} onValueChange={(v) => { setCategoryLevel3(v); setCategoryLevel4(''); }} disabled={!categoryLevel2}>
                  <SelectTrigger><SelectValue placeholder="3. Sub-sub kategoriya" /></SelectTrigger>
                  <SelectContent>
                    {level3Options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
                
                <Select value={categoryLevel4} onValueChange={setCategoryLevel4} disabled={!categoryLevel3}>
                  <SelectTrigger><SelectValue placeholder="4. Oxirgi daraja" /></SelectTrigger>
                  <SelectContent>
                    {level4Options.map((opt: string) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {categoryLevel1 && (
                <p className="text-xs text-gray-500">
                  Tanlangan: {[categoryLevel1, categoryLevel2, categoryLevel3, categoryLevel4].filter(c => c).join(' → ')}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MAHSULOT NOMLARI (90 belgi) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📝 Mahsulot Nomi (max 90 belgi)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>O'zbekcha nomi <span className="text-xs text-gray-400">({nameUz.length}/90)</span></Label>
            <Input
              value={nameUz}
              onChange={(e) => setNameUz(e.target.value.slice(0, 90))}
              placeholder="Samsung Galaxy A54 smartfon 128GB"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Ruscha nomi <span className="text-xs text-gray-400">({nameRu.length}/90)</span></Label>
            <Input
              value={nameRu}
              onChange={(e) => setNameRu(e.target.value.slice(0, 90))}
              placeholder="Смартфон Samsung Galaxy A54 128GB"
              className="mt-1"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            setNameUz(productName.slice(0, 90));
            setNameRu(productName.slice(0, 90));
          }}>
            <Copy className="w-3 h-3 mr-1" /> AI nomdan nusxalash
          </Button>
        </CardContent>
      </Card>

      {/* QISQA TAVSIF (390 belgi, SEO kalit so'zlar) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🔍 Qisqa Tavsif - SEO (max 390 belgi)</CardTitle>
          <CardDescription>Qidiruv va SEO uchun kalit so'zlar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>O'zbekcha <span className="text-xs text-gray-400">({shortDescUz.length}/390)</span></Label>
            <Textarea
              value={shortDescUz}
              onChange={(e) => setShortDescUz(e.target.value.slice(0, 390))}
              placeholder="Yangi Samsung Galaxy A54 128GB xotira, 8GB RAM, Super AMOLED ekran, 50MP kamera..."
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Ruscha <span className="text-xs text-gray-400">({shortDescRu.length}/390)</span></Label>
            <Textarea
              value={shortDescRu}
              onChange={(e) => setShortDescRu(e.target.value.slice(0, 390))}
              placeholder="Новый Samsung Galaxy A54 128GB памяти, 8GB RAM, Super AMOLED экран, камера 50MP..."
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* TO'LIQ TAVSIF */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📄 To'liq Tavsif</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>O'zbekcha tavsif</Label>
            <Textarea
              value={fullDescUz}
              onChange={(e) => setFullDescUz(e.target.value)}
              placeholder="Mahsulot haqida to'liq ma'lumot..."
              rows={4}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Ruscha tavsif</Label>
            <Textarea
              value={fullDescRu}
              onChange={(e) => setFullDescRu(e.target.value)}
              placeholder="Полное описание товара..."
              rows={4}
              className="mt-1"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            setFullDescUz(productDescription);
            setFullDescRu(productDescription);
          }}>
            <Copy className="w-3 h-3 mr-1" /> AI tavsifdan nusxalash
          </Button>
        </CardContent>
      </Card>

      {/* O'LCHAMLAR */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📐 O'lchamlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Kenglik (sm)</Label>
              <Input type="number" value={widthCm} onChange={(e) => setWidthCm(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Balandlik (sm)</Label>
              <Input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Chuqurlik (sm)</Label>
              <Input type="number" value={depthCm} onChange={(e) => setDepthCm(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Og'irlik (kg)</Label>
              <Input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CREDENTIALS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            🔐 {selectedMarketplace === 'uzum' ? 'Uzum Seller' : 'Yandex Market'} kirish
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedMarketplace === 'uzum' ? (
            <>
              <div>
                <Label>Telefon raqam</Label>
                <Input
                  value={uzumLogin}
                  onChange={(e) => setUzumLogin(e.target.value)}
                  placeholder="998901234567"
                  className="mt-1"
                  data-testid="uzum-login-input"
                />
              </div>
              <div>
                <Label>Parol</Label>
                <Input
                  type="password"
                  value={uzumPassword}
                  onChange={(e) => setUzumPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                  data-testid="uzum-password-input"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>OAuth Token</Label>
                <Input
                  type="password"
                  value={yandexToken}
                  onChange={(e) => setYandexToken(e.target.value)}
                  placeholder="y0_AgAAAA..."
                  className="mt-1 font-mono"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* AUTOMATION STATUS */}
      {isAutomating && (
        <Alert className="bg-blue-50 border-blue-500">
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          <AlertTitle className="text-blue-800">Avtomatlashtirish jarayoni...</AlertTitle>
          <AlertDescription className="text-blue-700">
            <ul className="mt-2 text-sm space-y-1">
              {automationStatus.map((status, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" /> {status}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <Button onClick={() => setCurrentStep(4)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Orqaga
        </Button>
        <Button 
          onClick={() => {
            if (selectedMarketplace === 'uzum') {
              if (!uzumLogin || !uzumPassword) {
                alert('Iltimos, Uzum login va parolini kiriting');
                return;
              }
              // Yangi to'liq professional automation
              uzumFullProfessionalMutation.mutate();
            } else {
              if (!yandexToken) {
                alert('Iltimos, Yandex OAuth tokenini kiriting');
                return;
              }
              yandexProcessMutation.mutate();
            }
          }}
          disabled={uzumFullProfessionalMutation.isPending || yandexProcessMutation.isPending || isAutomating}
          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
          {(uzumFullProfessionalMutation.isPending || yandexProcessMutation.isPending || isAutomating) ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Mahsulot yaratilmoqda...</>
          ) : (
            <><Rocket className="w-5 h-5 mr-2" /> 🚀 TO'LIQ AVTOMATIK YARATISH</>
          )}
        </Button>
      </div>
    </div>
  )};

  // Step 6: Final result
  const renderStep6 = () => (
    <div className="space-y-6">
      <Alert className="bg-green-50 border-green-500">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <AlertTitle className="text-green-800">Kartochka Tayyor!</AlertTitle>
        <AlertDescription className="text-green-700">
          {selectedMarketplace === 'uzum' ? 'Uzum' : 'Yandex'} Market uchun | 
          SKU: {sku} | IKPU: {ikpuCode || 'N/A'}
        </AlertDescription>
      </Alert>

      {/* Price Summary */}
      {priceData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Narx Tahlili
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
                <p className="text-xs text-red-600">Minimal</p>
                <p className="text-xl font-bold text-red-700">{formatCurrency(priceData.min_price)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-500 text-center">
                <p className="text-xs text-green-600">Tavsiya</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(priceData.optimal_price)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                <p className="text-xs text-blue-600">Maksimal</p>
                <p className="text-xl font-bold text-blue-700">{formatCurrency(priceData.max_price)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Infographic */}
      {generatedInfographic && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-pink-500" />
              Yaratilgan Infografika
            </CardTitle>
          </CardHeader>
          <CardContent>
            <img src={`data:image/png;base64,${generatedInfographic.image_base64}`}
              alt="Infographic" className="w-full max-w-md mx-auto rounded-lg" />
            <Button onClick={downloadInfographic} className="w-full mt-4">
              <Download className="w-4 h-4 mr-2" /> Rasmni Yuklab Olish
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Product Card */}
      {productCard && (
        <Card>
          <CardHeader>
            <CardTitle>Mahsulot Kartochkasi</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="uz">
              <TabsList>
                <TabsTrigger value="uz">O'zbekcha</TabsTrigger>
                <TabsTrigger value="ru">Ruscha</TabsTrigger>
              </TabsList>
              <TabsContent value="uz" className="space-y-4 mt-4">
                <div>
                  <Label className="text-xs text-gray-500">Sarlavha</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-semibold flex-1">{productCard.title_uz || productCard.name}</p>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(productCard.title_uz || productCard.name)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Tavsif</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm max-h-48 overflow-y-auto">
                    {productCard.description_uz || productCard.description}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="ru" className="space-y-4 mt-4">
                <div>
                  <Label className="text-xs text-gray-500">Заголовок</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-semibold flex-1">{productCard.title_ru || productCard.name}</p>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(productCard.title_ru || productCard.name)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Upload Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {selectedMarketplace === 'uzum' ? 'Uzum' : 'Yandex'} Market'ga Yuklash
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button asChild className="flex-1">
              <a href={selectedMarketplace === 'uzum' 
                ? 'https://seller.uzum.uz' 
                : 'https://partner.market.yandex.ru'} 
                target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                {selectedMarketplace === 'uzum' ? 'Uzum Seller Portal' : 'Yandex Partner'}
              </a>
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Yangi mahsulot
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          AI Mahsulot Yaratuvchi
        </h1>
        <p className="text-gray-500 mt-1">
          Kameradan kartochkagacha - to'liq avtomatik oqim
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center
                    ${isActive ? 'bg-purple-600 text-white' : ''}
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-1 hidden md:block ${isActive ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
        <Progress value={(currentStep / steps.length) * 100} className="mt-4 h-2" />
      </div>

      {/* Step Content */}
      {renderStepContent()}
    </div>
  );
}
