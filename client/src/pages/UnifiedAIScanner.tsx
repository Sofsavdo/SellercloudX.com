/**
 * Unified AI Scanner - To'liq mahsulot yaratish oqimi
 * 
 * 5 bosqichli wizard:
 * 1. Rasm yuklash / kamera
 * 2. AI tanib olish natijasi
 * 3. Tannarx va miqdor kiritish  
 * 4. Narx tahlili va raqobatchilar
 * 5. Tayyor kartochka
 */

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
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
  Target,
  BarChart3,
  ShoppingCart,
  Zap,
  Info,
  Image as ImageIcon
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

// Fulfillment turlari
const FULFILLMENT_TYPES = [
  { value: 'fbs', label: 'FBS - O\'zim yetkazaman', description: 'Tovarni o\'zingiz saqlaysiz' },
  { value: 'fbo', label: 'FBO - Uzum skladi', description: 'Tovar Uzum skladida' },
];

interface ScanResult {
  name: string;
  category: string;
  brand: string;
  description: string;
  specifications: string[];
  confidence: number;
}

interface PriceData {
  cost_price: number;
  min_price: number;
  optimal_price: number;
  max_price: number;
  competitor_avg: number | null;
  net_profit: number;
  actual_margin: number;
  is_profitable: boolean;
  is_competitive: boolean;
}

interface ProductCard {
  title_uz: string;
  title_ru: string;
  description_uz: string;
  description_ru: string;
  keywords: string[];
  bullet_points_uz: string[];
  bullet_points_ru: string[];
  specifications: Record<string, string>;
  seo_score: number;
}

export default function UnifiedAIScanner() {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
  
  // Step 3: Cost & quantity
  const [costPrice, setCostPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [weightKg, setWeightKg] = useState('1');
  const [fulfillment, setFulfillment] = useState('fbs');
  
  // Step 4: Price analysis
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<any>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null);
  
  // Step 5: Final card
  const [productCard, setProductCard] = useState<ProductCard | null>(null);
  const [ikpuCode, setIkpuCode] = useState('');
  const [sku, setSku] = useState('');
  const [salesTips, setSalesTips] = useState<string[]>([]);
  const [cardValidation, setCardValidation] = useState<any>(null);
  
  // Full result
  const [fullResult, setFullResult] = useState<any>(null);

  // Steps config
  const steps = [
    { id: 1, title: 'Rasm', icon: Camera },
    { id: 2, title: 'Aniqlash', icon: Sparkles },
    { id: 3, title: 'Tannarx', icon: DollarSign },
    { id: 4, title: 'Tahlil', icon: BarChart3 },
    { id: 5, title: 'Kartochka', icon: Package },
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
      const response = await fetch(`${API_BASE}/api/unified-scanner/scan-image`, {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          // Convert base64 to blob
          const byteString = atob(imageBase64);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: 'image/jpeg' });
          formData.append('file', blob, 'product.jpg');
          return formData;
        })()
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
        setCurrentStep(2);
      }
    }
  });

  // Full process mutation
  const fullProcessMutation = useMutation({
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
          fulfillment: fulfillment,
          image_base64: imageBase64 || null,
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
        
        // Price data
        if (data.data.price_optimization) {
          setPriceData(data.data.price_optimization);
        }
        if (data.data.price_breakdown) {
          setPriceBreakdown(data.data.price_breakdown);
        }
        if (data.data.competitor_analysis) {
          setCompetitorAnalysis(data.data.competitor_analysis);
        }
        
        // Card data
        if (data.data.product_card) {
          setProductCard(data.data.product_card);
        }
        if (data.data.ikpu) {
          setIkpuCode(data.data.ikpu.code);
        }
        if (data.data.sku) {
          setSku(data.data.sku);
        }
        if (data.data.sales_tips) {
          setSalesTips(data.data.sales_tips);
        }
        if (data.data.card_validation) {
          setCardValidation(data.data.card_validation);
        }
        
        setCurrentStep(4);
      }
    }
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(Math.round(amount)) + " so'm";
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
    setCostPrice('');
    setQuantity('1');
    setWeightKg('1');
    setPriceData(null);
    setCompetitorAnalysis(null);
    setProductCard(null);
    setFullResult(null);
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
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
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-[3/4] object-cover"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <Button onClick={capturePhoto} size="lg" className="bg-white text-black hover:bg-gray-100">
                    <Camera className="w-5 h-5 mr-2" />
                    Rasm Olish
                  </Button>
                  <Button onClick={stopCamera} variant="outline" size="lg" className="bg-white/80">
                    Bekor qilish
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={startCamera}
                  variant="outline"
                  className="h-40 flex flex-col gap-3 border-2 border-dashed hover:border-purple-500 hover:bg-purple-50"
                  data-testid="camera-btn"
                >
                  <Camera className="w-12 h-12 text-purple-600" />
                  <span className="text-lg">Kamera</span>
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="h-40 flex flex-col gap-3 border-2 border-dashed hover:border-purple-500 hover:bg-purple-50"
                  data-testid="upload-btn"
                >
                  <Upload className="w-12 h-12 text-purple-600" />
                  <span className="text-lg">Yuklash</span>
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-gray-100">
              <img
                src={imagePreview}
                alt="Product"
                className="w-full aspect-[3/4] object-contain"
              />
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setImagePreview('');
                  setImageBase64('');
                }}
                variant="outline"
                className="flex-1"
              >
                Boshqa rasm
              </Button>
              <Button
                onClick={() => scanImageMutation.mutate()}
                disabled={scanImageMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                data-testid="scan-btn"
              >
                {scanImageMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Tahlil qilinmoqda...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    AI bilan Aniqlash
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Or enter manually */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">yoki</span>
          </div>
        </div>

        <Button
          onClick={() => setCurrentStep(2)}
          variant="ghost"
          className="w-full"
        >
          Qo'lda kiritish <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  // Step 2: Detected product info
  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Mahsulot Ma'lumotlari
        </CardTitle>
        <CardDescription>
          {scanResult ? 'AI tomonidan aniqlangan ma\'lumotlarni tekshiring' : 'Mahsulot ma\'lumotlarini kiriting'}
        </CardDescription>
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
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Masalan: Samsung Galaxy A54"
              className="mt-1"
              data-testid="product-name-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Brend</Label>
              <Input
                value={productBrand}
                onChange={(e) => setProductBrand(e.target.value)}
                placeholder="Samsung, Apple..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Kategoriya</Label>
              <Select value={productCategory} onValueChange={setProductCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
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
            <Label>Qisqacha tavsif</Label>
            <Textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Mahsulot haqida qisqacha..."
              rows={3}
              className="mt-1"
            />
          </div>

          {scanResult?.specifications && scanResult.specifications.length > 0 && (
            <div>
              <Label className="text-gray-500">AI aniqlagan xususiyatlar:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {scanResult.specifications.map((spec, i) => (
                  <Badge key={i} variant="secondary">{spec}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button onClick={() => setCurrentStep(1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga
          </Button>
          <Button
            onClick={() => setCurrentStep(3)}
            disabled={!productName}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            Davom etish
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Step 3: Cost & quantity
  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          Tannarx va Miqdor
        </CardTitle>
        <CardDescription>
          Mahsulot tannarxi va qoldig'ini kiriting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tannarx (so'm) *</Label>
            <Input
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="100000"
              className="mt-1 text-lg"
              data-testid="cost-price-input"
            />
            <p className="text-xs text-gray-500 mt-1">Mahsulotning sotib olish narxi</p>
          </div>
          <div>
            <Label>Miqdori *</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="10"
              className="mt-1 text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Ombordagi qoldiq</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Og'irlik (kg)</Label>
            <Input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="1"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Yetkazib berish turi</Label>
            <Select value={fulfillment} onValueChange={setFulfillment}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FULFILLMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            <strong>{productName}</strong> uchun AI avtomatik tahlil qiladi:
            <ul className="list-disc list-inside mt-2 text-sm">
              <li>Raqobatchilar narxlari</li>
              <li>Uzum komissiyasi ({productCategory === 'electronics' ? '8-12%' : '10-18%'})</li>
              <li>Soliqlar (12% QQS + 4% daromad)</li>
              <li>Logistika xarajatlari</li>
              <li>Optimal sotuv narxi</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Button onClick={() => setCurrentStep(2)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga
          </Button>
          <Button
            onClick={() => fullProcessMutation.mutate()}
            disabled={!costPrice || !quantity || fullProcessMutation.isPending}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            data-testid="analyze-btn"
          >
            {fullProcessMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                AI tahlil qilmoqda...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                To'liq Tahlil Qilish
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Step 4: Price analysis
  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Price Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Narx Tahlili
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {priceData && (
            <>
              {/* Price Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs text-red-600 font-medium">Minimal</p>
                  <p className="text-xl font-bold text-red-700">{formatCurrency(priceData.min_price)}</p>
                  <p className="text-xs text-red-500">Zarar chegarasi</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-500">
                  <p className="text-xs text-green-600 font-medium">Tavsiya etilgan</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(priceData.optimal_price)}</p>
                  <p className="text-xs text-green-600">+{priceData.actual_margin}% foyda</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium">Maksimal</p>
                  <p className="text-xl font-bold text-blue-700">{formatCurrency(priceData.max_price)}</p>
                  <p className="text-xs text-blue-500">Raqobatbardosh</p>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex gap-2">
                <Badge className={priceData.is_profitable ? 'bg-green-500' : 'bg-red-500'}>
                  {priceData.is_profitable ? '✓ Foydali' : '✗ Zarar'}
                </Badge>
                <Badge className={priceData.is_competitive ? 'bg-blue-500' : 'bg-yellow-500'}>
                  {priceData.is_competitive ? '✓ Raqobatbardosh' : '⚠ Qimmat'}
                </Badge>
                {priceData.competitor_avg && (
                  <Badge variant="outline">
                    Raqobatchilar o'rtachasi: {formatCurrency(priceData.competitor_avg)}
                  </Badge>
                )}
              </div>
            </>
          )}

          {/* Price Breakdown */}
          {priceBreakdown && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Xarajatlar tafsiloti:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tannarx:</span>
                  <span className="font-medium">{formatCurrency(priceBreakdown.cost_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uzum komissiyasi ({priceBreakdown.commission?.rate}%):</span>
                  <span className="font-medium text-red-600">-{formatCurrency(priceBreakdown.commission?.amount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Logistika ({priceBreakdown.logistics?.type}):</span>
                  <span className="font-medium text-red-600">-{formatCurrency(priceBreakdown.logistics?.amount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Soliq ({priceBreakdown.tax?.type} {priceBreakdown.tax?.rate}%):</span>
                  <span className="font-medium text-red-600">-{formatCurrency(priceBreakdown.tax?.amount || 0)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Sof foyda:</span>
                  <span className={priceBreakdown.net_profit > 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(priceBreakdown.net_profit)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Competitor Analysis */}
      {competitorAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Raqobatchilar Tahlili
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Talab</p>
                <p className="font-bold capitalize">{competitorAnalysis.demand_level || 'O\'rta'}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Raqobat</p>
                <p className="font-bold capitalize">{competitorAnalysis.competition_level || 'O\'rta'}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Mavsumiylik</p>
                <p className="font-bold">x{competitorAnalysis.seasonality?.current_multiplier || 1.0}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Pozitsiya</p>
                <p className="font-bold capitalize">{competitorAnalysis.price_position?.current_position || 'O\'rta'}</p>
              </div>
            </div>

            {competitorAnalysis.tips && competitorAnalysis.tips.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Tavsiyalar:</p>
                <ul className="space-y-1">
                  {competitorAnalysis.tips.slice(0, 4).map((tip: string, i: number) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-4">
        <Button onClick={() => setCurrentStep(3)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Orqaga
        </Button>
        <Button
          onClick={() => setCurrentStep(5)}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          Kartochkani Ko'rish
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Step 5: Final card
  const renderStep5 = () => (
    <div className="space-y-6">
      {/* Success Banner */}
      <Alert className="bg-green-50 border-green-500">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <AlertTitle className="text-green-800">Kartochka Tayyor!</AlertTitle>
        <AlertDescription className="text-green-700">
          SEO Score: {productCard?.seo_score || fullResult?.seo_score || 0}/100 | 
          IKPU: {ikpuCode} | 
          SKU: {sku}
        </AlertDescription>
      </Alert>

      {/* Validation warnings */}
      {cardValidation && !cardValidation.is_valid && (
        <Alert className="bg-yellow-50 border-yellow-500">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <ul>
              {cardValidation.errors?.map((err: string, i: number) => (
                <li key={i}>⚠ {err}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Product Card Tabs */}
      {productCard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Mahsulot Kartochkasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="uz">
              <TabsList className="grid grid-cols-2 w-full max-w-xs">
                <TabsTrigger value="uz">O'zbekcha</TabsTrigger>
                <TabsTrigger value="ru">Ruscha</TabsTrigger>
              </TabsList>

              <TabsContent value="uz" className="space-y-4 mt-4">
                <div>
                  <Label className="text-xs text-gray-500">Sarlavha</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-semibold flex-1">{productCard.title_uz}</p>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(productCard.title_uz)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Tavsif</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm max-h-48 overflow-y-auto">
                    {productCard.description_uz}
                  </div>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => copyToClipboard(productCard.description_uz)}>
                    <Copy className="w-4 h-4 mr-2" /> Nusxa olish
                  </Button>
                </div>
                {productCard.bullet_points_uz && (
                  <div>
                    <Label className="text-xs text-gray-500">Asosiy xususiyatlar</Label>
                    <ul className="mt-1 space-y-1">
                      {productCard.bullet_points_uz.map((point, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ru" className="space-y-4 mt-4">
                <div>
                  <Label className="text-xs text-gray-500">Заголовок</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-semibold flex-1">{productCard.title_ru}</p>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(productCard.title_ru)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Описание</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm max-h-48 overflow-y-auto">
                    {productCard.description_ru}
                  </div>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => copyToClipboard(productCard.description_ru)}>
                    <Copy className="w-4 h-4 mr-2" /> Копировать
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Keywords */}
            {productCard.keywords && (
              <div className="mt-4">
                <Label className="text-xs text-gray-500">SEO Kalit so'zlar</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {productCard.keywords.map((kw, i) => (
                    <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => copyToClipboard(kw)}>
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sales Tips */}
      {salesTips && salesTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-orange-500" />
              Sotuvni Oshirish Maslahatlari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {salesTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="bg-orange-100 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Media Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="w-5 h-5 text-purple-500" />
            Rasm Talablari
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600">O'lcham</p>
              <p className="font-bold">1080 x 1440px</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600">Nisbat</p>
              <p className="font-bold">3:4</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600">Maks. hajm</p>
              <p className="font-bold">5 MB</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600">Min. soni</p>
              <p className="font-bold">3 ta</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Uzum Market'ga Yuklash
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fullResult?.upload_instructions?.uz && (
            <ol className="space-y-2">
              {fullResult.upload_instructions.uz.map((step: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          )}
          
          <div className="flex gap-4 pt-4">
            <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
              <a href="https://seller.uzum.uz" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Uzum Seller Portal
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
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          AI Mahsulot Skaneri
        </h1>
        <p className="text-gray-500 mt-1">
          Rasmdan kartochkagacha - to'liq avtomatik
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
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${isActive ? 'bg-purple-600 text-white' : ''}
                      ${isCompleted ? 'bg-green-500 text-white' : ''}
                      ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${isActive ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
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
