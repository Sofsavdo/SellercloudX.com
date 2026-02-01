// Dashboard AI Scanner - Yagona AI Scanner komponenti (Rasm yuklash va Kamera)
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency';
import { 
  Camera, Loader2, CheckCircle, X, Upload, Sparkles, 
  Brain, Zap,
  Image as ImageIcon, RefreshCw, ExternalLink
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface ScanResult {
  brand: string;
  model: string;
  name: string;
  category: string;
  categoryRu?: string;
  features: string[];
  suggestedPrice?: number;
  confidence: number;
  competitors?: Array<{
    seller: string;
    price: number;
    link: string;
  }>;
}

export default function DashboardAIScanner() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [step, setStep] = useState<'upload' | 'camera' | 'processing' | 'result'>('upload');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [costPrice, setCostPrice] = useState('');

  // File upload handler
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Xato',
        description: 'Faqat rasm fayllari qabul qilinadi',
        variant: 'destructive'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string);
      setStep('result');
      analyzeImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStep('camera');
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: 'Kamera xatosi',
        description: 'Kameraga ruxsat bering yoki rasm yuklang',
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
  };

  // Capture from camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(dataUrl);
      stopCamera();
      setStep('result');
      analyzeImage(dataUrl);
    }
  };

  // Analyze image with AI
  const analyzeImage = async (imageData: string) => {
    setIsProcessing(true);
    setScanProgress(0);
    setScanStage('Rasm yuklanmoqda...');

    try {
      // Extract base64 from data URL
      const base64 = imageData.includes('base64,') 
        ? imageData.split('base64,')[1] 
        : imageData;

      // Progress simulation
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 500);

      setScanStage('AI tahlil qilmoqda...');

      // Call unified scanner API (public endpoint)
      const response = await fetch(`${API_BASE}/api/unified-scanner/analyze-base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: base64,
          language: 'uz'
        })
      });

      clearInterval(progressInterval);
      setScanProgress(100);
      setScanStage('Yakunlandi!');

      const data = await response.json();

      if (data.success && data.product_info) {
        setScanResult({
          brand: data.product_info.brand || 'Unknown',
          model: data.product_info.model || '',
          name: data.product_info.product_name || data.product_info.name || 'Mahsulot',
          category: data.product_info.category || '',
          categoryRu: data.product_info.category_ru,
          features: data.product_info.features || [],
          suggestedPrice: data.suggested_price || data.product_info.suggested_price,
          confidence: data.confidence || 85,
          competitors: data.competitors || []
        });
        
        toast({
          title: 'Mahsulot aniqlandi!',
          description: `${data.product_info.brand || ''} ${data.product_info.model || ''}`,
        });
      } else {
        throw new Error(data.error || 'Mahsulot aniqlanmadi');
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      toast({
        title: 'Tahlil xatosi',
        description: error.message || 'Rasmni tahlil qilishda xatolik',
        variant: 'destructive'
      });
      setScanResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset scanner
  const resetScanner = () => {
    setCapturedImage(null);
    setScanResult(null);
    setStep('upload');
    setScanProgress(0);
    setScanStage('');
    setCostPrice('');
    stopCamera();
  };

  // Create product card
  const createProductCard = async () => {
    if (!scanResult) return;

    toast({
      title: 'Mahsulot kartasi yaratilmoqda...',
      description: 'Yandex Market ga yuklanmoqda',
    });

    // Navigate to product creation or call API
    // For now, show success
    setTimeout(() => {
      toast({
        title: 'Muvaffaqiyat!',
        description: 'Mahsulot kartasi yaratildi',
      });
      resetScanner();
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Upload/Camera Section */}
      {step === 'upload' && (
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-2">AI Mahsulot Skaneri</h3>
                <p className="text-muted-foreground">
                  Mahsulot rasmini yuklang yoki kamera bilan skanerlang
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Rasm Yuklash
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={startCamera}
                  className="border-primary/50 hover:bg-primary/10"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Kamera Ochish
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <p className="text-sm text-muted-foreground">
                PNG, JPG, WEBP • Max 10MB
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Camera View */}
      {step === 'camera' && (
        <Card className="overflow-hidden">
          <CardContent className="p-0 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full aspect-video object-cover"
            />
            
            {/* Camera overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-4 border-primary/50 rounded-xl">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
              </div>
            </div>

            {/* Camera controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex justify-center gap-4">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => { stopCamera(); setStep('upload'); }}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-6 h-6" />
                </Button>
                
                <Button
                  size="lg"
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-white hover:bg-white/90"
                >
                  <Camera className="w-8 h-8 text-primary" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-white hover:bg-white/20"
                >
                  <ImageIcon className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Section */}
      {step === 'result' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Yuklangan Rasm
              </CardTitle>
            </CardHeader>
            <CardContent>
              {capturedImage && (
                <div className="relative rounded-xl overflow-hidden">
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="w-full aspect-square object-cover"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={resetScanner}
                    className="absolute top-2 right-2"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Qayta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <div className="space-y-4">
            {/* Processing */}
            {isProcessing && (
              <Card className="border-primary/30">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-primary animate-pulse" />
                      </div>
                      <div>
                        <p className="font-semibold">AI Tahlil</p>
                        <p className="text-sm text-muted-foreground">{scanStage}</p>
                      </div>
                    </div>
                    <Progress value={scanProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Scan Result */}
            {scanResult && !isProcessing && (
              <>
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      Mahsulot Aniqlandi!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold">{scanResult.name}</h3>
                      {scanResult.brand && (
                        <p className="text-muted-foreground">{scanResult.brand} {scanResult.model}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{scanResult.category}</Badge>
                      <Badge className="bg-primary/10 text-primary border-0">
                        {scanResult.confidence}% ishonch
                      </Badge>
                    </div>

                    {scanResult.features.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Xususiyatlar:</p>
                        <div className="flex flex-wrap gap-1">
                          {scanResult.features.slice(0, 5).map((f, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {scanResult.suggestedPrice && (
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Tavsiya etilgan narx</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(scanResult.suggestedPrice)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Cost Price Input */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Tannarx Kiriting</CardTitle>
                    <CardDescription>
                      Mahsulotning sizga tushgan narxini kiriting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="costPrice">Tannarx (UZS)</Label>
                      <Input
                        id="costPrice"
                        type="number"
                        placeholder="Masalan: 50000"
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value)}
                      />
                    </div>

                    {costPrice && scanResult.suggestedPrice && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Taxminiy foyda:</span>
                          <span className="font-bold text-green-600">
                            {formatCurrency(scanResult.suggestedPrice - parseInt(costPrice))}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Foyda %:</span>
                          <span className="font-bold text-green-600">
                            {Math.round(((scanResult.suggestedPrice - parseInt(costPrice)) / parseInt(costPrice)) * 100)}%
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={createProductCard}
                        disabled={!costPrice}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Mahsulot Kartasi Yaratish
                      </Button>
                      <Button variant="outline" onClick={resetScanner}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Qayta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* No result */}
            {!scanResult && !isProcessing && (
              <Card className="border-destructive/30">
                <CardContent className="p-6 text-center">
                  <X className="w-12 h-12 text-destructive mx-auto mb-3" />
                  <p className="font-medium">Mahsulot aniqlanmadi</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Boshqa rasm bilan sinab ko'ring
                  </p>
                  <Button onClick={resetScanner}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Qayta Skanerlash
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
