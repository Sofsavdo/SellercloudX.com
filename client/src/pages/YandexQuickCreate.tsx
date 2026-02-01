/**
 * Yandex Market - Tez Avtomatik Mahsulot Yaratish
 * 
 * Hamkor faqat:
 * 1. Rasmga oladi
 * 2. Tannarxni kiritadi
 * 3. "Yaratish" tugmasini bosadi
 * 
 * AI qolganini bajaradi!
 */

import React, { useState, useRef, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Upload, Camera, Loader2, CheckCircle, AlertCircle, 
  Sparkles, Package, TrendingUp, Image as ImageIcon,
  Zap, ArrowRight, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Steps
const STEPS = [
  { id: 'upload', name: 'Rasm', icon: Camera },
  { id: 'price', name: 'Narx', icon: TrendingUp },
  { id: 'create', name: 'Yaratish', icon: Sparkles },
  { id: 'done', name: 'Tayyor', icon: CheckCircle },
];

export default function YandexQuickCreate() {
  const [currentStep, setCurrentStep] = useState(0);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [costPrice, setCostPrice] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ulanish statusini tekshirish
  const connectionQuery = useQuery({
    queryKey: ['yandex-connection'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/yandex/campaigns`);
      return response.json();
    }
  });

  // Rasm yuklash
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      // data:image/xxx;base64, qismini olib tashlash
      const base64Data = base64.split(',')[1];
      setImageBase64(base64Data);
      setImagePreview(base64);
      setCurrentStep(1);
    };
    reader.readAsDataURL(file);
  }, []);

  // Drag & Drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const base64Data = base64.split(',')[1];
      setImageBase64(base64Data);
      setImagePreview(base64);
      setCurrentStep(1);
    };
    reader.readAsDataURL(file);
  }, []);

  // To'liq avtomatik yaratish
  const createMutation = useMutation({
    mutationFn: async () => {
      setProgress(0);
      setProgressText('🔍 AI Scanner ishlamoqda...');
      
      // Progress simulatsiya - real API jarayoniga mos
      const progressInterval = setInterval(() => {
        setProgress(p => {
          if (p >= 90) {
            return 90; // 90% da to'xtaydi, API javobini kutadi
          }
          if (p < 20) {
            setProgressText('🔍 AI Scanner - mahsulotni aniqlash (brend, model, kategoriya)...');
          } else if (p < 40) {
            setProgressText('✍️ AI Manager - ikki tilda kartochka yaratish (RU + UZ)...');
          } else if (p < 70) {
            setProgressText('🎨 Nano Banana - 6 ta infografika yaratish...');
          } else {
            setProgressText('🚀 Yandex Market\'ga yuklash...');
          }
          return p + 2;
        });
      }, 2000);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 daqiqa timeout

        const response = await fetch(`${API_BASE}/api/yandex/auto-create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_base64: imageBase64,
            cost_price: parseFloat(costPrice),
            partner_id: 'default'
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        setProgress(100);
        
        if (!response.ok) {
          throw new Error(`Server xatosi: ${response.status}`);
        }

        return response.json();
      } catch (error: any) {
        clearInterval(progressInterval);
        
        if (error.name === 'AbortError') {
          throw new Error('So\'rov vaqti tugadi. Iltimos, qayta urinib ko\'ring.');
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      setResult(data);
      if (data.success) {
        setCurrentStep(3);
        setProgressText('✅ Tayyor!');
      } else {
        setCurrentStep(3); // Xato holatini ham ko'rsatish uchun
        setProgressText('❌ Xatolik yuz berdi');
      }
    },
    onError: (error: Error) => {
      setProgress(0);
      setProgressText('');
      setResult({
        success: false,
        error: error.message || 'Noma\'lum xatolik yuz berdi'
      });
      setCurrentStep(3);
    }
  });

  // Qayta boshlash
  const handleReset = () => {
    setCurrentStep(0);
    setImageBase64('');
    setImagePreview('');
    setCostPrice('');
    setResult(null);
    setProgress(0);
    setProgressText('');
  };

  // Narxni formatlash
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('uz-UZ').format(value) + " so'm";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="w-7 h-7" />
                Yandex Market - Tez Yaratish
              </h1>
              <p className="text-yellow-100 mt-1">
                Rasmga oling → Narx kiriting → AI qolganini qiladi!
              </p>
            </div>
            
            {/* Ulanish statusi */}
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              {connectionQuery.data?.success ? (
                <>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm">Ulangan ({connectionQuery.data?.campaigns?.length || 0} do'kon)</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <span className="text-sm">Ulanmagan</span>
                </>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6 gap-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isDone = index < currentStep;
              
              return (
                <React.Fragment key={step.id}>
                  <div 
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      isActive 
                        ? 'bg-white text-yellow-600 shadow-lg scale-105' 
                        : isDone 
                          ? 'bg-green-500 text-white'
                          : 'bg-white/30 text-white/70'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <ArrowRight className={`w-4 h-4 ${isDone ? 'text-green-400' : 'text-white/30'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 -mt-4">
        
        {/* Step 0: Rasm yuklash */}
        {currentStep === 0 && (
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Camera className="w-8 h-8 text-yellow-500" />
                Mahsulot Rasmini Yuklang
              </CardTitle>
              <CardDescription>
                AI rasmdan mahsulotni avtomatik aniqlaydi va kartochka yaratadi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-yellow-300 rounded-2xl p-12 text-center cursor-pointer hover:border-yellow-500 hover:bg-yellow-50 transition-all"
              >
                <Upload className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  Rasmni bu yerga tashlang yoki bosing
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG, WEBP • Maksimum 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  data-testid="image-upload-input"
                />
              </div>

              {/* Kamera tugmasi (mobil uchun) */}
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4" />
                  Kameradan olish
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Narx kiritish */}
        {currentStep === 1 && (
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-yellow-500" />
                Tannarxni Kiriting
              </CardTitle>
              <CardDescription>
                AI optimal sotuv narxini avtomatik hisoblaydi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rasm preview */}
              {imagePreview && (
                <div className="flex justify-center">
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Mahsulot" 
                      className="w-48 h-48 object-cover rounded-xl shadow-lg"
                    />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Tannarx input */}
              <div className="space-y-2">
                <Label className="text-lg">Tannarx (so'm)</Label>
                <Input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="Masalan: 500000"
                  className="text-2xl h-16 text-center font-bold"
                  data-testid="cost-price-input"
                />
                <p className="text-sm text-gray-500 text-center">
                  Mahsulotni sotib olish narxi
                </p>
              </div>

              {/* Yaratish tugmasi */}
              <Button
                onClick={() => {
                  setCurrentStep(2);
                  createMutation.mutate();
                }}
                disabled={!costPrice || parseFloat(costPrice) <= 0}
                className="w-full h-14 text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                data-testid="create-button"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                AI bilan Yaratish
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Yaratish jarayoni */}
        {currentStep === 2 && (
          <Card className="shadow-xl border-0">
            <CardContent className="py-12">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <Loader2 className="w-20 h-20 text-yellow-500 animate-spin" />
                  <Sparkles className="w-8 h-8 text-orange-500 absolute -right-2 -top-2 animate-pulse" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    AI Mahsulot Yaratmoqda...
                  </h2>
                  <p className="text-gray-500 mt-2">{progressText}</p>
                </div>

                <div className="max-w-md mx-auto">
                  <Progress value={progress} className="h-3" />
                  <p className="text-sm text-gray-400 mt-2">{progress}%</p>
                </div>

                <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto mt-8">
                  {['Scanner', 'Infografika', 'Kartochka', 'Yuklash'].map((step, i) => (
                    <div 
                      key={step}
                      className={`p-3 rounded-lg text-center text-sm ${
                        progress > i * 25 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {progress > i * 25 ? '✓' : '○'} {step}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Natija */}
        {currentStep === 3 && result && (
          <div className="space-y-4">
            {result.success ? (
              <>
                <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="py-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-green-800">
                        Mahsulot Muvaffaqiyatli Yaratildi!
                      </h2>
                      <p className="text-green-600 mt-2">
                        Yandex Market kabinetingizda mahsulotni ko'rishingiz mumkin
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Natija ma'lumotlari */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Yaratilgan Mahsulot
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Chap tomon - rasmlar */}
                      <div>
                        {imagePreview && (
                          <img 
                            src={imagePreview} 
                            alt="Mahsulot"
                            className="w-full h-48 object-cover rounded-xl"
                          />
                        )}
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                          <ImageIcon className="w-4 h-4" />
                          <span>{result.data?.images_count || 6} ta infografika yuklandi</span>
                        </div>
                      </div>

                      {/* O'ng tomon - ma'lumotlar */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Mahsulot (Ruscha)</p>
                          <p className="font-semibold text-lg">
                            {result.data?.product_name?.substring(0, 60)}...
                          </p>
                        </div>

                        {result.data?.product_name_uz && (
                          <div>
                            <p className="text-sm text-gray-500">Mahsulot (O'zbekcha)</p>
                            <p className="font-semibold">
                              {result.data?.product_name_uz?.substring(0, 60)}...
                            </p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Brend</p>
                            <p className="font-semibold">{result.data?.brand || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Model</p>
                            <p className="font-semibold">{result.data?.model || '-'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Kategoriya</p>
                            <p className="font-semibold text-blue-600">{result.data?.category || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">SKU</p>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {result.data?.offer_id}
                            </code>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3 pt-4 border-t">
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Rasmlar</p>
                            <p className="font-bold text-lg">{result.data?.images_count}/6</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Vazn</p>
                            <p className="font-bold text-lg">{result.data?.weight_kg?.toFixed(1)} kg</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">IKPU</p>
                            <p className="font-bold text-xs text-green-600">✓ Bor</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Mamlakat</p>
                            <p className="font-bold text-xs">{result.data?.country || '-'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <p className="text-sm text-gray-500">Tannarx</p>
                            <p className="font-bold text-lg">
                              {formatPrice(result.data?.cost_price || 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Sotuv narxi</p>
                            <p className="font-bold text-lg text-green-600">
                              {formatPrice(result.data?.selling_price || 0)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-xl">
                          <p className="text-sm text-green-600">Kutilayotgan foyda</p>
                          <p className="text-3xl font-bold text-green-700">
                            +{result.data?.profit_margin?.toFixed(0) || 0}%
                          </p>
                        </div>

                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span>AI ishonch: {result.data?.scan_confidence?.toFixed(0)}%</span>
                          <span className="text-green-500">• Ikki tilda ✓</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Harakatlar */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1 h-12"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Yangi mahsulot yaratish
                  </Button>
                  <Button
                    onClick={() => window.open('https://partner.market.yandex.ru', '_blank')}
                    className="flex-1 h-12 bg-yellow-500 hover:bg-yellow-600"
                  >
                    Yandex Kabinetga o'tish
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            ) : (
              <Card className="shadow-xl border-0 bg-gradient-to-br from-red-50 to-orange-50">
                <CardContent className="py-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-red-800">
                      Xatolik yuz berdi
                    </h2>
                    <p className="text-red-600 mt-2 text-sm max-w-md mx-auto">
                      {result.error || 'Noma\'lum xatolik'}
                    </p>
                    {result.details && (
                      <p className="text-gray-500 text-xs mt-2 max-w-md mx-auto">
                        {typeof result.details === 'string' 
                          ? result.details.substring(0, 200) 
                          : JSON.stringify(result.details).substring(0, 200)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={handleReset} 
                      variant="outline"
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Qayta urinish
                    </Button>
                    <Button
                      onClick={() => window.open('https://partner.market.yandex.ru', '_blank')}
                      className="gap-2 bg-yellow-500 hover:bg-yellow-600"
                    >
                      Yandex Kabinetni tekshirish
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Error state */}
        {createMutation.isError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="w-5 h-5" />
            <AlertTitle>Xatolik</AlertTitle>
            <AlertDescription>
              Mahsulot yaratishda xatolik yuz berdi. Qayta urinib ko'ring.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
