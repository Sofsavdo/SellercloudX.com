// AI Scanner with Uzum Market Integration
// Camera-based product recognition + Create on Uzum

import { useState, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Camera, 
  Upload, 
  X,
  CheckCircle, 
  TrendingUp,
  Loader2,
  RefreshCw,
  Zap,
  Package,
  Send
} from 'lucide-react';

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || '';

interface ScanResult {
  productInfo: {
    name: string;
    brand: string;
    category: string;
    description: string;
    confidence: number;
    labels: string[];
  };
  priceAnalysis: {
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    suggestedPrice: number;
  };
  seoKeywords: string[];
}

export default function AIProductScanner() {
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    quantity: 1,
    category: '',
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Kameraga kirish imkoni yo\'q. Iltimos, brauzerda ruxsat bering.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.95);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Scan mutation - uses AI to analyze image
  const scanMutation = useMutation({
    mutationFn: async (imageData: string) => {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', blob, 'capture.jpg');
      
      // Send to AI scan endpoint
      const result = await fetch(`${API_BASE}/api/ai/scan-product`, {
        method: 'POST',
        body: formData,
      });
      
      return result.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setScanResult(data.result);
        // Pre-fill form with AI results
        setProductForm({
          name: data.result.productInfo.name,
          description: data.result.productInfo.description,
          price: data.result.priceAnalysis.suggestedPrice,
          quantity: 1,
          category: data.result.productInfo.category,
        });
      }
    },
  });

  // Create product on Uzum mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: typeof productForm) => {
      const response = await fetch(`${API_BASE}/api/ai/create-uzum-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productData,
          image: capturedImage,
        }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setShowCreateDialog(false);
        alert('✅ Mahsulot Uzum Market\'ga muvaffaqiyatli qo\'shildi!');
      }
    },
  });

  const handleScan = () => {
    if (capturedImage) {
      scanMutation.mutate(capturedImage);
    }
  };

  const handleCreateProduct = () => {
    createProductMutation.mutate(productForm);
  };

  const resetScanner = () => {
    setCapturedImage(null);
    setScanResult(null);
    scanMutation.reset();
    setProductForm({
      name: '',
      description: '',
      price: 0,
      quantity: 1,
      category: '',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Zap className="w-8 h-8 text-purple-600" />
          AI Product Scanner
        </h1>
        <p className="text-muted-foreground">
          Rasmdan mahsulotni tanib, avtomatik Uzum Market'ga qo'shing
        </p>
      </div>

      {/* Camera/Upload Section */}
      {!capturedImage && !scanResult && (
        <Card>
          <CardHeader>
            <CardTitle>1-qadam: Rasm oling yoki yuklang</CardTitle>
            <CardDescription>
              Mahsulotni kamera bilan skaner qiling yoki rasm yuklang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!cameraActive ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-6">
                <div className="flex gap-4">
                  <Button onClick={startCamera} size="lg" className="gap-2 h-20 px-8">
                    <Camera className="w-6 h-6" />
                    <span>Kamera</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="gap-2 h-20 px-8"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-6 h-6" />
                    <span>Rasm Yuklash</span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  AI mahsulotni avtomatik taniydi, narxni tahlil qiladi va 
                  Uzum Market uchun tayyor karta yaratadi
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Video Preview */}
                <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Camera Controls */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={stopCamera}
                        className="gap-2 bg-white/10 text-white border-white/20"
                      >
                        <X className="w-5 h-5" />
                        Bekor
                      </Button>
                      
                      <Button
                        size="lg"
                        onClick={capturePhoto}
                        className="gap-2 bg-purple-600 hover:bg-purple-700 px-8"
                      >
                        <Camera className="w-5 h-5" />
                        Rasm Olish
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>
      )}

      {/* Captured Image Preview */}
      {capturedImage && !scanResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>2-qadam: AI Tahlil</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetScanner}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Qayta olish
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg overflow-hidden border aspect-video">
              <img src={capturedImage} alt="Captured" className="w-full h-full object-contain bg-slate-100" />
            </div>
            
            <Button 
              onClick={handleScan} 
              disabled={scanMutation.isPending}
              size="lg"
              className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {scanMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI tahlil qilmoqda...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Mahsulotni Tahlil Qilish
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {scanMutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Xatolik: AI tahlilida muammo yuz berdi. Qayta urinib ko'ring.
          </AlertDescription>
        </Alert>
      )}

      {/* Scan Results */}
      {scanResult && (
        <div className="space-y-6">
          {/* Success Banner */}
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Mahsulot muvaffaqiyatli aniqlandi! ({scanResult.productInfo.confidence}% ishonchlilik)
            </AlertDescription>
          </Alert>

          {/* Product Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{scanResult.productInfo.name}</CardTitle>
                  <CardDescription className="mt-2">
                    Brend: <span className="font-medium">{scanResult.productInfo.brand}</span> • 
                    Kategoriya: <span className="font-medium">{scanResult.productInfo.category}</span>
                  </CardDescription>
                </div>
                <Badge className="text-lg px-4 py-2 bg-purple-600">
                  {scanResult.productInfo.confidence}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image */}
              {capturedImage && (
                <div className="rounded-lg overflow-hidden border max-w-sm">
                  <img src={capturedImage} alt="Product" className="w-full h-auto" />
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">AI tomonidan yaratilgan tavsif:</p>
                <p className="text-sm bg-slate-50 p-3 rounded-lg">{scanResult.productInfo.description}</p>
              </div>

              {/* SEO Keywords */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">SEO kalit so'zlar:</p>
                <div className="flex flex-wrap gap-2">
                  {scanResult.seoKeywords.map((keyword, i) => (
                    <Badge key={i} variant="outline">{keyword}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Narx Tahlili
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Tavsiya etilgan</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatPrice(scanResult.priceAnalysis.suggestedPrice)}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">O'rtacha</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatPrice(scanResult.priceAnalysis.avgPrice)}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Minimal</p>
                  <p className="text-xl font-bold text-slate-600">
                    {formatPrice(scanResult.priceAnalysis.minPrice)}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Maksimal</p>
                  <p className="text-xl font-bold text-orange-600">
                    {formatPrice(scanResult.priceAnalysis.maxPrice)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={resetScanner} variant="outline" size="lg" className="flex-1">
              <RefreshCw className="w-5 h-5 mr-2" />
              Yangi Skaner
            </Button>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700">
                  <Package className="w-5 h-5" />
                  Uzum'ga Qo'shish
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="text-2xl">🍇</span>
                    Uzum Market'ga Mahsulot Qo'shish
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Mahsulot nomi</Label>
                    <Input
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tavsif</Label>
                    <Textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Narx (so'm)</Label>
                      <Input
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Miqdor</Label>
                      <Input
                        type="number"
                        value={productForm.quantity}
                        onChange={(e) => setProductForm({...productForm, quantity: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Kategoriya</Label>
                    <Input
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCreateProduct}
                    disabled={createProductMutation.isPending}
                    className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    {createProductMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Qo'shilmoqda...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Uzum Market'ga Yuborish
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
}
