// AI Scanner Component - Google Lens style product recognition
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Camera, Search, Loader2, CheckCircle, X, Upload } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AIScannerProps {
  onProductFound: (productData: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AIScanner({ onProductFound, isOpen, onClose }: AIScannerProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [productData, setProductData] = useState<any>(null);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Back camera
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: 'Kamera xatosi',
        description: 'Kameraga kirish imkoniyati yo\'q',
        variant: 'destructive'
      });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Capture image
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        setIsScanning(false);
        processImage(imageData);
      }
    }
  };

  // Process image with AI
  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    try {
      // Extract base64 from data URL
      const base64 = imageData.includes('base64,') 
        ? imageData.split('base64,')[1] 
        : imageData;
      
      // Send to Unified Scanner API (same as mobile app)
      const result = await fetch('/api/unified-scanner/analyze-base64', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: base64,
          language: 'uz'
        }),
        credentials: 'include'
      });

      if (!result.ok) {
        throw new Error('AI Scanner xatosi');
      }

      const responseData = await result.json();
      
      // Transform unified scanner response to expected format
      const data = responseData.success && responseData.product_info ? {
        name: responseData.product_info.product_name || responseData.product_info.name || 'Mahsulot',
        brand: responseData.product_info.brand || 'Unknown',
        model: responseData.product_info.model || '',
        category: responseData.product_info.category || 'general',
        description: responseData.product_info.description || '',
        features: responseData.product_info.features || [],
        suggestedPrice: responseData.suggested_price || responseData.product_info.suggested_price || 100000,
        confidence: responseData.confidence || 85
      } : responseData;
      
      setProductData(data);
      
      toast({
        title: '✅ Mahsulot topildi!',
        description: data.name || 'Ma\'lumotlar yuklandi'
      });
    } catch (error: any) {
      console.error('AI Scanner error:', error);
      toast({
        title: 'Xatolik',
        description: error.message || 'Mahsulotni aniqlashda xatolik',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload image file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setCapturedImage(imageData);
      processImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  // Use found product
  const handleUseProduct = () => {
    if (productData) {
      onProductFound(productData);
      onClose();
      stopCamera();
      setCapturedImage(null);
      setProductData(null);
    }
  };

  // Reset
  const handleReset = () => {
    setCapturedImage(null);
    setProductData(null);
    setIsScanning(true);
    startCamera();
  };

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
      setProductData(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            AI Scanner - Mahsulotni Aniqlash
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!capturedImage ? (
            <>
              {/* Camera View */}
              <Card>
                <CardContent className="p-4">
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="border-4 border-white rounded-lg w-64 h-64 animate-pulse" />
                      </div>
                    )}
                  </div>
                  
                  <canvas ref={canvasRef} className="hidden" />
                </CardContent>
              </Card>

              {/* Controls */}
              <div className="flex gap-2">
                <Button
                  onClick={captureImage}
                  className="flex-1"
                  disabled={!isScanning}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Rasmga Olish
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Fayl Yuklash
                </Button>
                
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </>
          ) : (
            <>
              {/* Captured Image */}
              <Card>
                <CardContent className="p-4">
                  <img
                    src={capturedImage}
                    alt="Captured product"
                    className="w-full rounded-lg"
                  />
                </CardContent>
              </Card>

              {/* Processing */}
              {isProcessing && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-lg font-semibold">AI mahsulotni aniqlayapti...</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Internetdan qidiryapti va ma'lumotlarni yig'ayapti
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Found Product */}
              {productData && (
                <Card className="border-green-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      Mahsulot Topildi!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-semibold">{productData.name}</p>
                      <p className="text-sm text-muted-foreground">{productData.category}</p>
                    </div>
                    
                    {productData.description && (
                      <div>
                        <p className="text-sm font-medium">Tavsif:</p>
                        <p className="text-sm text-muted-foreground">{productData.description}</p>
                      </div>
                    )}
                    
                    {productData.price && (
                      <div>
                        <p className="text-sm font-medium">Narx:</p>
                        <p className="text-lg font-bold text-green-600">{productData.price} so'm</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={handleUseProduct} className="flex-1">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Foydalanish
                      </Button>
                      <Button onClick={handleReset} variant="outline">
                        <X className="w-4 h-4 mr-2" />
                        Qayta Urinish
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

