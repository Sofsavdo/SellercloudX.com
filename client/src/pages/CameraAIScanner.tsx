// Camera AI Scanner - Google Lens Style
// Real-time camera capture + object detection

import { useState, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  Upload, 
  X,
  CheckCircle, 
  TrendingUp,
  DollarSign,
  ExternalLink,
  Loader2,
  RefreshCw,
  Zap
} from 'lucide-react';

interface ScanResult {
  taskId: string;
  productInfo: {
    name: string;
    brand: string;
    category: string;
    description: string;
    confidence: number;
    labels: string[];
  };
  competitors: Array<{
    seller: string;
    price: number;
    currency: string;
    link: string;
    source: string;
  }>;
  priceAnalysis: {
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    totalResults: number;
  };
  status: 'success' | 'partial' | 'failed';
  message: string;
}

export default function CameraAIScanner() {
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Back camera on mobile
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

  // Scan mutation
  const scanMutation = useMutation({
    mutationFn: async (imageData: string) => {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');
      
      // Send to backend
      const result = await axios.post('/api/ai/scanner/scan-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return result.data.data as ScanResult;
    },
    onSuccess: (data) => {
      setScanResult(data);
    },
  });

  const handleScan = () => {
    if (capturedImage) {
      scanMutation.mutate(capturedImage);
    }
  };

  const resetScanner = () => {
    setCapturedImage(null);
    setScanResult(null);
    scanMutation.reset();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  const getMarketplaceIcon = (source: string) => {
    const icons: Record<string, string> = {
      wildberries: '🛍️',
      ozon: '📦',
      uzum: '🍇',
      yandex: '🔴',
      aliexpress: '🛒',
      amazon: '📦',
    };
    return icons[source] || '🌐';
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Camera className="w-8 h-8 text-blue-600" />
          AI Scanner - Kamera
        </h1>
        <p className="text-muted-foreground mt-2">
          Mahsulotni kamera bilan skaner qiling - Google Lens kabi
        </p>
      </div>

      {/* Camera Section */}
      {!capturedImage && !scanResult && (
        <Card>
          <CardHeader>
            <CardTitle>Mahsulot rasmini oling</CardTitle>
            <CardDescription>
              Kamerani yoqing va mahsulotga qarating
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!cameraActive ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Camera className="w-16 h-16 text-white" />
                </div>
                <Button onClick={startCamera} size="lg" className="gap-2">
                  <Camera className="w-5 h-5" />
                  Kamerani Yoqish
                </Button>
                <p className="text-sm text-muted-foreground">
                  Yoki rasm yuklash (kelgusida qo'shiladi)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Video Preview */}
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-auto"
                  />
                  
                  {/* Camera Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={stopCamera}
                        className="gap-2"
                      >
                        <X className="w-5 h-5" />
                        Bekor qilish
                      </Button>
                      
                      <Button
                        size="lg"
                        onClick={capturePhoto}
                        className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Camera className="w-5 h-5" />
                        Rasm Olish
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Tips */}
                <Alert>
                  <Zap className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Maslahat:</strong> Mahsulotni yaxshi yoritilgan joyda, aniq ko'rinishda oling
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>
      )}

      {/* Captured Image Preview */}
      {capturedImage && !scanResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Olingan Rasm</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetScanner}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Qayta olish
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg overflow-hidden border">
              <img src={capturedImage} alt="Captured" className="w-full h-auto" />
            </div>
            
            <Button 
              onClick={handleScan} 
              disabled={scanMutation.isPending}
              size="lg"
              className="w-full gap-2"
            >
              {scanMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Tahlil qilinmoqda...
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
            Xatolik: {(scanMutation.error as any)?.response?.data?.error || 'Tahlil qilishda xatolik'}
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
              ✅ {scanResult.message}
            </AlertDescription>
          </Alert>

          {/* Product Info */}
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
                <Badge variant="default" className="text-lg px-4 py-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {scanResult.productInfo.confidence}% Aniqlandi
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Captured Image */}
              {capturedImage && (
                <div className="rounded-lg overflow-hidden border max-w-md">
                  <img src={capturedImage} alt="Scanned product" className="w-full h-auto" />
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">Tavsif:</p>
                <p className="text-sm">{scanResult.productInfo.description}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Teglar:</p>
                <div className="flex flex-wrap gap-2">
                  {scanResult.productInfo.labels.slice(0, 10).map((label, i) => (
                    <Badge key={i} variant="outline">{label}</Badge>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">O'rtacha Narx</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(scanResult.priceAnalysis.avgPrice)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Minimal Narx</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(scanResult.priceAnalysis.minPrice)}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Maksimal Narx</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatPrice(scanResult.priceAnalysis.maxPrice)}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Raqobatchilar</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {scanResult.priceAnalysis.totalResults}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competitors */}
          {scanResult.competitors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Raqobatchilar ({scanResult.competitors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scanResult.competitors.slice(0, 10).map((competitor, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getMarketplaceIcon(competitor.source)}</span>
                        <div>
                          <p className="font-medium">{competitor.seller}</p>
                          <p className="text-xs text-muted-foreground capitalize">{competitor.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatPrice(competitor.price)}</p>
                          <p className="text-xs text-muted-foreground">{competitor.currency}</p>
                        </div>
                        {competitor.link && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={competitor.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={resetScanner} variant="outline" size="lg" className="flex-1">
              <RefreshCw className="w-5 h-5 mr-2" />
              Yangi Skaner
            </Button>
            <Button size="lg" className="flex-1 gap-2">
              <Upload className="w-5 h-5" />
              Mahsulot Yaratish
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
