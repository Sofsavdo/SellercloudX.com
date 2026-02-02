// Simple Product Form - AI Scanner orqali mahsulot yaratish
// MUHIM: Marketplace ulanmagan bo'lsa kartochka yaratilmaydi!
// Mobil ilova bilan bir xil mantiq
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Camera, Loader2, Scan, CheckCircle, AlertTriangle, DollarSign, TrendingUp, ArrowRight, Link2Off, Settings } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface SimpleProductFormProps {
  onProductCreated?: () => void;
}

interface ScanResult {
  name: string;
  brand: string;
  category: string;
  features: string[];
  confidence: number;
  competitors: Array<{
    name: string;
    price: number;
    marketplace: string;
    url?: string;
  }>;
  suggestedPrice?: number;
  imageBase64?: string;
}

export function SimpleProductForm({ onProductCreated }: SimpleProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // State
  const [step, setStep] = useState<'marketplace_check' | 'scanner' | 'cost' | 'review'>('marketplace_check');
  const [isOpen, setIsOpen] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState(''); // NEW: Sale price input
  const [quantity, setQuantity] = useState('1');
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>([]); // NEW: Multiple marketplace selection
  const [priceAnalysis, setPriceAnalysis] = useState<{
    suggestedPrice: number;
    minCompetitorPrice: number;
    maxCompetitorPrice: number;
    avgCompetitorPrice: number;
    profit: number;
    margin: number;
    isProfitable: boolean;
  } | null>(null);

  // Video ref for camera
  const videoRef = { current: null as HTMLVideoElement | null };
  const canvasRef = { current: null as HTMLCanvasElement | null };

  // MUHIM: Marketplace ulanish holatini tekshirish
  const { data: marketplaceStatus, isLoading: isLoadingMarketplace, refetch: refetchMarketplace } = useQuery({
    queryKey: ['/api/partner/marketplaces'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/partner/marketplaces');
      if (!response.ok) return { yandex: { connected: false }, uzum: { connected: false } };
      const data = await response.json();
      return data.data || data;
    },
    staleTime: 30000, // 30 seconds
  });

  // Check if any marketplace is connected
  const hasConnectedMarketplace = marketplaceStatus?.yandex?.connected || marketplaceStatus?.uzum?.connected;
  const connectedMarketplace = marketplaceStatus?.yandex?.connected ? 'yandex' : 
                               marketplaceStatus?.uzum?.connected ? 'uzum' : null;

  // Create product mutation - NEW: Uses enterprise auto-create endpoint with parallel processing
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      // MUHIM: Marketplace ulanganligini tekshirish
      if (!data.marketplaces || data.marketplaces.length === 0) {
        throw new Error('Marketplace tanlang. Avval API kalitlarini ulang.');
      }

      // Check if selected marketplace is connected
      const selectedMp = data.primaryMarketplace || data.marketplaces[0];
      const isYandexSelected = data.marketplaces.includes('yandex');
      const isUzumSelected = data.marketplaces.includes('uzum');
      
      if (isYandexSelected && !marketplaceStatus?.yandex?.connected) {
        throw new Error('Yandex Market ulanmagan. Avval API kalitlarini ulang.');
      }
      if (isUzumSelected && !marketplaceStatus?.uzum?.connected) {
        throw new Error('Uzum Market ulanmagan. Avval API kalitlarini ulang.');
      }

      // Use new auto-create endpoint for Yandex (full automation with parallel processing)
      if (isYandexSelected) {
        // PARALLEL: Start card creation in background, scanner can continue
        const response = await apiRequest('POST', '/api/yandex/auto-create', {
          partner_id: 'current',
          image_base64: data.imageBase64,
          cost_price: parseFloat(data.costPrice),
          sale_price: parseFloat(data.salePrice), // NEW: Sale price
          product_name: data.name,
          brand: data.brand,
          category: data.category,
          quantity: parseInt(data.quantity || '1'),
          generate_infographics: true,
          use_perfect_infographics: true,  // ERROR-FREE text!
          marketplaces: data.marketplaces,  // NEW: Multiple marketplaces
          parallel_processing: true  // NEW: Enable parallel processing
        });
        
        const result = await response.json();
        
        // If success, allow scanner to continue (parallel)
        if (result.success) {
          // Don't close scanner immediately - allow next product scan
          // Scanner stays open for next product
        }
        
        return result;
      }

      // Fallback for other marketplaces
      const response = await apiRequest('POST', '/api/unified-scanner/full-process', {
        partner_id: 'current',
        product_name: data.name,
        brand: data.brand,
        category: data.category,
        cost_price: parseFloat(data.costPrice),
        quantity: parseInt(data.quantity),
        image_base64: data.imageBase64,
        marketplace: connectedMarketplace,
        auto_ikpu: true,
        auto_generate_infographics: true
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        const marketplaceName = selectedMarketplaces.includes('yandex') ? 'Yandex Market' : 
                               selectedMarketplaces.includes('uzum') ? 'Uzum Market' : 'Marketplace';
        
        // Show detailed success message with quality score
        const stepsCompleted = data.steps_completed?.length || 0;
        const qualityScore = data.quality_score || data.quality_score_after_fix;
        const message = data.message || `${marketplaceName} ga yuklash boshlandi`;
        
        toast({
          title: "✅ Mahsulot yaratildi!",
          description: qualityScore ? `${message} (Sifat: ${qualityScore}/100)` : message,
        });
        
        // Show SKU if available
        if (data.sku) {
          toast({
            title: "📦 SKU yaratildi",
            description: `Mahsulot kodi: ${data.sku}`,
          });
        }
        
        // PARALLEL PROCESSING: Don't close scanner - allow next product scan
        // Reset form but keep scanner open
        setScanResult(null);
        setCostPrice('');
        setSalePrice('');
        setQuantity('1');
        setCapturedImage(null);
        setPriceAnalysis(null);
        setSelectedMarketplaces([]);
        setStep('scanner'); // Go back to scanner for next product
        
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        onProductCreated?.();
        
        // Show info: Scanner ready for next product
        setTimeout(() => {
          toast({
            title: "🔄 Keyingi mahsulotni skaner qiling",
            description: "AI Scanner keyingi mahsulotni aniqlashga tayyor",
          });
        }, 2000);
      } else {
        // Show specific error and failed steps
        const failedSteps = data.steps_failed?.join(', ') || '';
        const errorMessage = data.error || data.yandex_error || "Mahsulot yaratishda muammo";
        
        toast({
          title: "⚠️ Ogohlantirish",
          description: failedSteps ? `${errorMessage} (${failedSteps})` : errorMessage,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Xatolik",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle open - check marketplace first, then scanner
  const handleOpen = async () => {
    setIsOpen(true);
    setScanResult(null);
    setCostPrice('');
    setQuantity('1');
    setCapturedImage(null);
    setPriceAnalysis(null);
    
    // Refresh marketplace status
    await refetchMarketplace();
    
    // If marketplace connected, go to scanner; otherwise show warning
    if (hasConnectedMarketplace) {
      setStep('scanner');
    } else {
      setStep('marketplace_check');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('scanner');
    setScanResult(null);
    setCostPrice('');
    setCapturedImage(null);
    setPriceAnalysis(null);
  };

  // Handle image capture/upload
  const handleImageCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setIsScanning(true);

    try {
      // Extract base64
      const base64 = imageData.includes('base64,') 
        ? imageData.split('base64,')[1] 
        : imageData;

      // Call AI Scanner
      const response = await fetch('/api/unified-scanner/analyze-base64', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          image_base64: base64,
          language: 'uz'
        })
      });

      const data = await response.json();

      if (data.success && data.product_info) {
        const productInfo = data.product_info;
        
        // Check if it's a valid product (not a person)
        const invalidCategories = ['person', 'face', 'human', 'people', 'portrait'];
        const category = (productInfo.category || '').toLowerCase();
        const name = (productInfo.product_name || productInfo.name || '').toLowerCase();
        
        if (invalidCategories.some(inv => category.includes(inv) || name.includes(inv))) {
          toast({
            title: "⚠️ Mahsulot aniqlanmadi",
            description: "Iltimos, mahsulot rasmini oling (yuz emas)",
            variant: "destructive",
          });
          setIsScanning(false);
          setCapturedImage(null);
          return;
        }

        // Get competitor prices
        const competitors = data.competitors || [];
        
        setScanResult({
          name: productInfo.product_name || productInfo.name || 'Noma\'lum mahsulot',
          brand: productInfo.brand || '',
          category: productInfo.category || 'general',
          features: productInfo.features || [],
          confidence: data.confidence || 85,
          competitors: competitors,
          suggestedPrice: data.suggested_price || productInfo.suggested_price,
          imageBase64: base64
        });

        toast({
          title: "✅ Mahsulot aniqlandi!",
          description: `${productInfo.brand || ''} ${productInfo.product_name || productInfo.name || ''}`,
        });

        setStep('cost');
      } else {
        toast({
          title: "❌ Aniqlanmadi",
          description: data.error || "Mahsulotni aniqlab bo'lmadi. Qaytadan urinib ko'ring.",
          variant: "destructive",
        });
        setCapturedImage(null);
      }
    } catch (error: any) {
      toast({
        title: "❌ Xatolik",
        description: error.message,
        variant: "destructive",
      });
      setCapturedImage(null);
    } finally {
      setIsScanning(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        handleImageCapture(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate price analysis when cost price changes - AUTO 50% MARGIN
  const handleCostPriceChange = (value: string) => {
    setCostPrice(value);
    
    if (!scanResult || !value) {
      setPriceAnalysis(null);
      setSalePrice(''); // Clear sale price
      return;
    }

    const cost = parseFloat(value);
    if (isNaN(cost) || cost <= 0) {
      setPriceAnalysis(null);
      setSalePrice(''); // Clear sale price
      return;
    }
    
    // AUTO CALCULATE: 50% margin (sale price = cost * 1.5)
    const autoSalePrice = Math.round(cost * 1.5);
    setSalePrice(autoSalePrice.toString());

    // Get competitor prices
    const competitors = scanResult.competitors || [];
    const competitorPrices = competitors.map(c => c.price).filter(p => p > 0);
    
    let suggestedPrice: number;
    let minCompetitorPrice = 0;
    let maxCompetitorPrice = 0;
    let avgCompetitorPrice = 0;

    if (competitorPrices.length > 0) {
      minCompetitorPrice = Math.min(...competitorPrices);
      maxCompetitorPrice = Math.max(...competitorPrices);
      avgCompetitorPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;
      
      // Suggested price: slightly below average competitor price
      // But ensure at least 20% margin
      const minProfitablePrice = cost * 1.25; // At least 25% margin
      suggestedPrice = Math.max(minProfitablePrice, avgCompetitorPrice * 0.95);
    } else {
      // No competitors - use markup
      suggestedPrice = cost * 1.5; // 50% margin
    }

    // Include marketplace fees (approximately 15% for Yandex)
    const marketplaceFee = suggestedPrice * 0.15;
    const profit = suggestedPrice - cost - marketplaceFee;
    const margin = (profit / suggestedPrice) * 100;

    setPriceAnalysis({
      suggestedPrice: Math.round(suggestedPrice),
      minCompetitorPrice: Math.round(minCompetitorPrice),
      maxCompetitorPrice: Math.round(maxCompetitorPrice),
      avgCompetitorPrice: Math.round(avgCompetitorPrice),
      profit: Math.round(profit),
      margin: Math.round(margin * 10) / 10,
      isProfitable: profit > 0
    });
  };

  // Handle submit
  const handleSubmit = () => {
    if (!scanResult || !costPrice || !salePrice || selectedMarketplaces.length === 0) {
      toast({
        title: "⚠️ Ma'lumotlar to'liq emas",
        description: "Tannarx, sotuv narxi va marketplace tanlang",
        variant: "destructive",
      });
      return;
    }

    // Use first selected marketplace (or all if multiple)
    const primaryMarketplace = selectedMarketplaces[0];
    
    createProductMutation.mutate({
      name: scanResult.name,
      brand: scanResult.brand,
      category: scanResult.category,
      costPrice: costPrice,
      salePrice: salePrice, // NEW: Sale price
      quantity: quantity,
      imageBase64: scanResult.imageBase64,
      marketplaces: selectedMarketplaces, // NEW: Selected marketplaces
      primaryMarketplace: primaryMarketplace
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  return (
    <>
      {/* Main Button - Opens AI Scanner directly */}
      <Button 
        onClick={handleOpen}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        <Plus className="w-4 h-4 mr-2" />
        Yangi Mahsulot
      </Button>

      {/* Main Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {step === 'marketplace_check' && (
                <>
                  <Link2Off className="w-5 h-5 text-destructive" />
                  Marketplace Ulanmagan
                </>
              )}
              {step === 'scanner' && (
                <>
                  <Scan className="w-5 h-5 text-primary" />
                  AI Scanner - Mahsulotni Skanerlang
                </>
              )}
              {step === 'cost' && (
                <>
                  <DollarSign className="w-5 h-5 text-primary" />
                  Tannarx va Narx Tahlili
                </>
              )}
              {step === 'review' && (
                <>
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Yakuniy Tekshiruv
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Step 0: Marketplace Check - MUHIM! */}
          {step === 'marketplace_check' && (
            <div className="space-y-6 py-4">
              {isLoadingMarketplace ? (
                <div className="text-center py-8">
                  <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Marketplace ulanishlar tekshirilmoqda...</p>
                </div>
              ) : (
                <>
                  {/* Warning Card */}
                  <Card className="bg-destructive/5 border-destructive/30">
                    <CardContent className="p-6 text-center">
                      <Link2Off className="w-16 h-16 mx-auto mb-4 text-destructive" />
                      <h3 className="text-xl font-bold text-destructive mb-2">
                        Marketplace Ulanmagan!
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Mahsulot kartochkasi yaratish uchun avval Yandex Market yoki Uzum Market API kalitlarini ulang.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Kartochka qayerga yuklanadi? Marketplace ulanmagan bo'lsa, kartochka yaratib bo'lmaydi.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Marketplace Status */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Marketplace Holati</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${marketplaceStatus?.yandex?.connected ? 'bg-success' : 'bg-destructive'}`} />
                          <span className="font-medium">Yandex Market</span>
                        </div>
                        <Badge variant={marketplaceStatus?.yandex?.connected ? 'default' : 'destructive'}>
                          {marketplaceStatus?.yandex?.connected ? 'Ulangan' : 'Ulanmagan'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${marketplaceStatus?.uzum?.connected ? 'bg-success' : 'bg-destructive'}`} />
                          <span className="font-medium">Uzum Market</span>
                        </div>
                        <Badge variant={marketplaceStatus?.uzum?.connected ? 'default' : 'destructive'}>
                          {marketplaceStatus?.uzum?.connected ? 'Ulangan' : 'Ulanmagan'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                      onClick={() => {
                        handleClose();
                        setLocation('/partner-dashboard?tab=integrations');
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Marketplace Ulash (Sozlamalar)
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={handleClose}
                    >
                      Bekor qilish
                    </Button>
                  </div>

                  {/* Info Note */}
                  <p className="text-xs text-center text-muted-foreground">
                    💡 Marketplace ulangandan so'ng, AI Scanner yordamida 2 daqiqada mahsulot kartochkasi yarating
                  </p>
                </>
              )}
            </div>
          )}

          {/* Step 1: Scanner */}
          {step === 'scanner' && (
            <div className="space-y-6">
              {/* Scanning indicator */}
              {isScanning ? (
                <div className="text-center py-12">
                  <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary mb-4" />
                  <h3 className="text-lg font-semibold">AI tahlil qilmoqda...</h3>
                  <p className="text-muted-foreground">Mahsulot aniqlanmoqda</p>
                </div>
              ) : capturedImage ? (
                <div className="text-center py-8">
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="max-h-64 mx-auto rounded-lg border shadow-lg"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Camera/Upload Area */}
                  <Card className="border-2 border-dashed border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="p-8 text-center">
                      <Camera className="w-16 h-16 mx-auto mb-4 text-primary" />
                      <h3 className="text-lg font-semibold mb-2">Mahsulot Rasmini Yuklang</h3>
                      <p className="text-muted-foreground mb-4">
                        AI avtomatik mahsulotni aniqlaydi va raqobatchilarni topadi
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="product-image-upload"
                      />
                      <label htmlFor="product-image-upload">
                        <Button asChild className="cursor-pointer">
                          <span>
                            <Camera className="w-4 h-4 mr-2" />
                            Rasm Yuklash
                          </span>
                        </Button>
                      </label>
                    </CardContent>
                  </Card>

                  {/* Important Notice */}
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-amber-900">Muhim!</h4>
                          <p className="text-sm text-amber-800">
                            Faqat mahsulot rasmini yuklang. Yuz, odam yoki boshqa narsalar aniqlanmaydi.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Cost & Price Analysis */}
          {step === 'cost' && scanResult && (
            <div className="space-y-6">
              {/* Product Info */}
              <Card className="bg-success/5 border-success/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-success" />
                    <div>
                      <h4 className="font-semibold">{scanResult.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {scanResult.brand && `${scanResult.brand} • `}
                        {scanResult.category} • Ishonch: {scanResult.confidence}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Competitor Prices */}
              {scanResult.competitors && scanResult.competitors.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Raqobatchilar Narxi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {scanResult.competitors.slice(0, 5).map((comp, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{comp.marketplace}</Badge>
                            <span className="text-sm truncate max-w-[200px]">{comp.name}</span>
                          </div>
                          <span className="font-bold text-primary">{formatCurrency(comp.price)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cost Price Input */}
              <div className="space-y-2">
                <Label htmlFor="costPrice" className="text-base font-semibold">
                  Tannarx (siz qanchaga oldingiz?) *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="costPrice"
                    type="number"
                    min="0"
                    value={costPrice}
                    onChange={(e) => handleCostPriceChange(e.target.value)}
                    placeholder="Masalan: 105000"
                    className="pl-10 text-lg"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Mahsulotni qanday narxda sotib oldingiz?</p>
              </div>

              {/* Sale Price Input - AUTO 50% MARGIN */}
              <div className="space-y-2">
                <Label htmlFor="salePrice" className="text-base font-semibold">
                  Sotuv Narxi (50% marja avtomatik qo'shildi) *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="salePrice"
                    type="number"
                    min="0"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="Avtomatik hisoblanadi"
                    className="pl-10 text-lg"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {costPrice && salePrice && (
                    <>
                      Marja: {Math.round(((parseFloat(salePrice) - parseFloat(costPrice)) / parseFloat(costPrice)) * 100)}% 
                      (Foyda: {formatCurrency(parseFloat(salePrice) - parseFloat(costPrice))})
                    </>
                  )}
                  {!costPrice && "Tannarxni kiriting, sotuv narxi avtomatik hisoblanadi (50% marja)"}
                </p>
              </div>

              {/* Marketplace Selection */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Marketplace Tanlash *
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {marketplaceStatus?.yandex?.connected && (
                    <Card 
                      className={`cursor-pointer transition-all ${
                        selectedMarketplaces.includes('yandex') 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted'
                      }`}
                      onClick={() => {
                        if (selectedMarketplaces.includes('yandex')) {
                          setSelectedMarketplaces(selectedMarketplaces.filter(m => m !== 'yandex'));
                        } else {
                          setSelectedMarketplaces([...selectedMarketplaces, 'yandex']);
                        }
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {selectedMarketplaces.includes('yandex') && (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          )}
                          <span className="font-medium">Yandex Market</span>
                        </div>
                        {marketplaceStatus.yandex.shop_name && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {marketplaceStatus.yandex.shop_name}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  {marketplaceStatus?.uzum?.connected && (
                    <Card 
                      className={`cursor-pointer transition-all ${
                        selectedMarketplaces.includes('uzum') 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted'
                      }`}
                      onClick={() => {
                        if (selectedMarketplaces.includes('uzum')) {
                          setSelectedMarketplaces(selectedMarketplaces.filter(m => m !== 'uzum'));
                        } else {
                          setSelectedMarketplaces([...selectedMarketplaces, 'uzum']);
                        }
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {selectedMarketplaces.includes('uzum') && (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          )}
                          <span className="font-medium">Uzum Market</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Tez kunda</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
                {selectedMarketplaces.length === 0 && (
                  <p className="text-xs text-destructive">Kamida bitta marketplace tanlang</p>
                )}
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Miqdor</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                />
              </div>

              {/* Price Analysis */}
              {priceAnalysis && (
                <Card className={priceAnalysis.isProfitable ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Narx Tahlili</h4>
                      <Badge className={priceAnalysis.isProfitable ? 'bg-success' : 'bg-destructive'}>
                        {priceAnalysis.isProfitable ? 'Foydali' : 'Zararsiz'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Tavsiya qilinadigan narx</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(priceAnalysis.suggestedPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Kutilayotgan foyda</p>
                        <p className={`text-2xl font-bold ${priceAnalysis.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {priceAnalysis.profit >= 0 ? '+' : ''}{formatCurrency(priceAnalysis.profit)}
                        </p>
                      </div>
                    </div>

                    {priceAnalysis.avgCompetitorPrice > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <p>📊 Raqobatchilar narxi: {formatCurrency(priceAnalysis.minCompetitorPrice)} - {formatCurrency(priceAnalysis.maxCompetitorPrice)}</p>
                        <p>📈 O'rtacha: {formatCurrency(priceAnalysis.avgCompetitorPrice)}</p>
                        <p>💰 Margin: {priceAnalysis.margin}% (marketplace to'lovlaridan keyin)</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => { setStep('scanner'); setCapturedImage(null); setScanResult(null); }}>
                  Qayta Skanerlash
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={
                    !costPrice || 
                    !salePrice || 
                    selectedMarketplaces.length === 0 ||
                    createProductMutation.isPending || 
                    (priceAnalysis && !priceAnalysis.isProfitable)
                  }
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {createProductMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Yaratilmoqda...
                    </>
                  ) : (
                    <>
                      Kartochka Yaratish
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
