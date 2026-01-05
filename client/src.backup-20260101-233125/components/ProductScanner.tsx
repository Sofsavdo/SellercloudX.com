import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, Loader2, Sparkles, CheckCircle } from 'lucide-react';

interface ScanResult {
  name: string;
  category: string;
  description: string;
  seoTitle: string;
  keywords: string[];
  translations: any;
  marketIntelligence: {
    suggestedPrice: {
      min: number;
      optimal: number;
      max: number;
    };
    demand: string;
    competition: string;
    trends: string[];
  };
  marketplaceCards: any;
}

export default function ProductScanner() {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    quantity: '',
    costPrice: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Start camera
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
      toast({
        title: "Kamera xatosi",
        description: "Kameraga kirish imkoni yo'q",
        variant: "destructive"
      });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        handleImageUpload(file);
        stopCamera();
      }
    }, 'image/jpeg');
  };

  // Handle file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Process image
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Scan product
  const handleScan = async () => {
    if (!imagePreview || !formData.quantity || !formData.costPrice) {
      toast({
        title: "Ma'lumot to'liq emas",
        description: "Rasm, miqdor va tannarxni kiriting",
        variant: "destructive"
      });
      return;
    }

    setScanning(true);

    try {
      const formDataToSend = new FormData();
      
      // Convert base64 to blob
      const response = await fetch(imagePreview);
      const blob = await response.blob();
      formDataToSend.append('image', blob, 'product.jpg');
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('costPrice', formData.costPrice);

      const scanResponse = await fetch('/api/smart-ai/scan-product', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      });

      if (!scanResponse.ok) {
        throw new Error('Scan failed');
      }

      const data = await scanResponse.json();
      setResult(data.data);

      toast({
        title: "✅ Muvaffaqiyatli!",
        description: `Mahsulot tahlil qilindi. Xarajat: ${data.costStats.totalCost}`,
      });
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Mahsulotni tahlil qilishda xatolik",
        variant: "destructive"
      });
    } finally {
      setScanning(false);
    }
  };

  // Reset
  const handleReset = () => {
    setResult(null);
    setImagePreview('');
    setFormData({ quantity: '', costPrice: '' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {!result ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              AI Mahsulot Skaneri
            </CardTitle>
            <p className="text-sm text-gray-600">
              Mahsulot rasmini oling yoki yuklang - AI qolganini bajaradi
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Input */}
            <div className="space-y-4">
              {!imagePreview ? (
                <div className="space-y-4">
                  {/* Camera View */}
                  {cameraActive ? (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full rounded-lg"
                      />
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                        <Button
                          onClick={capturePhoto}
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          Rasm Olish
                        </Button>
                        <Button
                          onClick={stopCamera}
                          variant="outline"
                          size="lg"
                        >
                          Bekor qilish
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={startCamera}
                        variant="outline"
                        className="h-32 flex flex-col gap-2"
                      >
                        <Camera className="w-8 h-8" />
                        <span>Kamera</span>
                      </Button>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="h-32 flex flex-col gap-2"
                      >
                        <Upload className="w-8 h-8" />
                        <span>Yuklash</span>
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
                </div>
              ) : (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Product"
                    className="w-full rounded-lg"
                  />
                  <Button
                    onClick={() => setImagePreview('')}
                    variant="outline"
                    className="w-full"
                  >
                    Boshqa rasm tanlash
                  </Button>
                </div>
              )}
            </div>

            {/* Quantity and Cost */}
            {imagePreview && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Miqdori *</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Tannarxi (so'm) *</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Scan Button */}
            {imagePreview && (
              <Button
                onClick={handleScan}
                disabled={scanning || !formData.quantity || !formData.costPrice}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12"
              >
                {scanning ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    AI tahlil qilmoqda...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    AI bilan Tahlil Qilish
                  </>
                )}
              </Button>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>AI avtomatik bajaradi:</strong> Mahsulot nomi, kategoriya, tavsif, 
                SEO, 3 tilda tarjima, narx tavsiyasi, bozor tahlili va 4 ta marketplace kartochkasi
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              AI Tahlil Natijasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <img
                  src={imagePreview}
                  alt="Product"
                  className="w-full rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-600">Mahsulot Nomi</Label>
                  <p className="text-xl font-bold">{result.name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Kategoriya</Label>
                  <p className="font-semibold">{result.category}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Tavsif</Label>
                  <p className="text-sm">{result.description}</p>
                </div>
              </div>
            </div>

            {/* Price Recommendation */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">💰 Narx Tavsiyasi</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-600">Minimal</Label>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(result.marketIntelligence.suggestedPrice.min)}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Optimal</Label>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(result.marketIntelligence.suggestedPrice.optimal)}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Maksimal</Label>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(result.marketIntelligence.suggestedPrice.max)}
                  </p>
                </div>
              </div>
            </div>

            {/* Market Intelligence */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <Label className="text-gray-600">Talab</Label>
                <p className="text-xl font-bold capitalize">{result.marketIntelligence.demand}</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <Label className="text-gray-600">Raqobat</Label>
                <p className="text-xl font-bold capitalize">{result.marketIntelligence.competition}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Label className="text-gray-600">Trendlar</Label>
                <p className="text-sm">{result.marketIntelligence.trends.join(', ')}</p>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold mb-2">🔍 SEO</h3>
              <p className="text-sm"><strong>Title:</strong> {result.seoTitle}</p>
              <p className="text-sm mt-2"><strong>Keywords:</strong> {result.keywords.join(', ')}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1"
              >
                Yangi Mahsulot
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600"
              >
                Tasdiqlash va Saqlash
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
