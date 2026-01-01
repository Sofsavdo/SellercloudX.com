import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  RefreshCw, 
  Check, 
  X, 
  Loader2, 
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  TrendingUp,
  Package
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface RecognizedProduct {
  name: string;
  category: string;
  brand?: string;
  images: string[];
  marketplaceLinks: {
    uzum?: { url: string; price: number };
    wildberries?: { url: string; price: number };
    ozon?: { url: string; price: number };
    yandex?: { url: string; price: number };
  };
  averagePrice: number;
  confidence: number;
  description?: string;
}

interface CameraProductCaptureProps {
  onProductRecognized: (product: RecognizedProduct) => void;
  onCancel?: () => void;
}

export function CameraProductCapture({ onProductRecognized, onCancel }: CameraProductCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognizedProduct, setRecognizedProduct] = useState<RecognizedProduct | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Kameraga kirish imkoni yo\'q. Brauzer sozlamalarini tekshiring.');
    }
  }, [facingMode]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
    stopCamera();
  }, [stopCamera]);

  // Switch camera
  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setTimeout(startCamera, 100);
  }, [stopCamera, startCamera]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setRecognizedProduct(null);
    startCamera();
  }, [startCamera]);

  // Recognize product mutation
  const recognizeMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const response = await apiRequest('POST', '/api/ai/recognize-product', {
        image: imageData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Mahsulotni tanib bo\'lmadi');
      }
      
      return response.json();
    },
    onSuccess: (data: RecognizedProduct) => {
      setRecognizedProduct(data);
      toast({
        title: "Mahsulot topildi!",
        description: `${data.name} - ${data.confidence}% aniqlik`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Confirm and create product
  const handleConfirm = () => {
    if (recognizedProduct) {
      onProductRecognized(recognizedProduct);
    }
  };

  // Start camera on mount
  useState(() => {
    startCamera();
    return () => stopCamera();
  });

  return (
    <div className="space-y-4">
      {/* Camera View */}
      {!capturedImage && !recognizedProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Mahsulot Rasmini Oling
            </CardTitle>
            <CardDescription>
              Mahsulotni yaxshi yoritilgan joyda, to'liq ko'rinadigan qilib oling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cameraError ? (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{cameraError}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Camera overlay guide */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-4 border-white/50 rounded-lg w-3/4 h-3/4 flex items-center justify-center">
                      <Package className="w-16 h-16 text-white/50" />
                    </div>
                  </div>
                </div>

                <canvas ref={canvasRef} className="hidden" />

                <div className="flex gap-2">
                  <Button
                    onClick={switchCamera}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Kamerani Almashtirish
                  </Button>
                  
                  <Button
                    onClick={capturePhoto}
                    className="flex-1"
                    size="lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Rasm Olish
                  </Button>
                </div>

                <Alert>
                  <Sparkles className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Maslahat:</strong> Mahsulot brendi va logotipi aniq ko'rinsin
                  </AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Captured Image Preview */}
      {capturedImage && !recognizedProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Rasm Olindi
            </CardTitle>
            <CardDescription>
              Rasmni tekshiring va mahsulotni tanish uchun tasdiqlang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <img
                src={capturedImage}
                alt="Captured product"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={retakePhoto}
                variant="outline"
                className="flex-1"
                disabled={recognizeMutation.isPending}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Qayta Olish
              </Button>
              
              <Button
                onClick={() => recognizeMutation.mutate(capturedImage)}
                className="flex-1"
                disabled={recognizeMutation.isPending}
              >
                {recognizeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Tanilmoqda...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Mahsulotni Tanish
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recognition Results */}
      {recognizedProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Mahsulot Topildi!
            </CardTitle>
            <CardDescription>
              AI mahsulotni {recognizedProduct.confidence}% aniqlik bilan tanidi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Info */}
            <div className="flex gap-4">
              <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {recognizedProduct.images[0] && (
                  <img
                    src={recognizedProduct.images[0]}
                    alt={recognizedProduct.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold">{recognizedProduct.name}</h3>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {recognizedProduct.category}
                  </Badge>
                  {recognizedProduct.brand && (
                    <Badge variant="outline">
                      {recognizedProduct.brand}
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {recognizedProduct.confidence}% aniqlik
                  </Badge>
                </div>

                {recognizedProduct.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recognizedProduct.description}
                  </p>
                )}
              </div>
            </div>

            {/* Marketplace Prices */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Marketplace'larda Narxlar
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {recognizedProduct.marketplaceLinks.uzum && (
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Uzum</div>
                    <div className="text-lg font-bold">
                      {recognizedProduct.marketplaceLinks.uzum.price.toLocaleString()} so'm
                    </div>
                  </div>
                )}
                {recognizedProduct.marketplaceLinks.wildberries && (
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Wildberries</div>
                    <div className="text-lg font-bold">
                      {recognizedProduct.marketplaceLinks.wildberries.price.toLocaleString()} ₽
                    </div>
                  </div>
                )}
                {recognizedProduct.marketplaceLinks.ozon && (
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Ozon</div>
                    <div className="text-lg font-bold">
                      {recognizedProduct.marketplaceLinks.ozon.price.toLocaleString()} ₽
                    </div>
                  </div>
                )}
                {recognizedProduct.marketplaceLinks.yandex && (
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Yandex</div>
                    <div className="text-lg font-bold">
                      {recognizedProduct.marketplaceLinks.yandex.price.toLocaleString()} ₽
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Price */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-700 mb-1">Tavsiya Narx</div>
              <div className="text-2xl font-black text-blue-900">
                {recognizedProduct.averagePrice.toLocaleString()} so'm
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={retakePhoto}
                variant="outline"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Qayta Olish
              </Button>
              
              <Button
                onClick={handleConfirm}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Tasdiqlash va Yaratish
              </Button>
            </div>

            <Alert>
              <Sparkles className="w-4 h-4" />
              <AlertDescription>
                AI avtomatik ravishda kartochka yaratadi, rasmlarni optimizatsiya qiladi va marketplace'larga joylashtiradi
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
