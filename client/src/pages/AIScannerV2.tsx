import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Scan, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle, 
  TrendingUp,
  DollarSign,
  ExternalLink,
  Loader2
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

export default function AIScannerV2() {
  const [imageUrl, setImageUrl] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const scanMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await axios.post('/api/ai/scanner/scan-image', {
        imageUrl: url,
      });
      return response.data.data as ScanResult;
    },
    onSuccess: (data) => {
      setScanResult(data);
    },
  });

  const handleScan = () => {
    if (!imageUrl) return;
    scanMutation.mutate(imageUrl);
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
          <Scan className="w-8 h-8 text-blue-600" />
          AI Scanner V2
        </h1>
        <p className="text-muted-foreground mt-2">
          Mahsulot rasmini yuklang va raqobatchilar tahlilini oling
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Mahsulot rasmini yuklang</CardTitle>
          <CardDescription>
            Rasm URL ini kiriting yoki rasm yuklab olish (kelgusida qo'shiladi)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Rasm URL</Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                placeholder="https://example.com/product-image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={scanMutation.isPending}
              />
              <Button 
                onClick={handleScan} 
                disabled={!imageUrl || scanMutation.isPending}
              >
                {scanMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Skanerlash...
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4 mr-2" />
                    Skanerlash
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Image Preview */}
          {imageUrl && !scanMutation.isPending && (
            <div className="border rounded-lg p-4 flex items-center justify-center bg-slate-50">
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="max-h-64 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Demo Images */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Demo rasmlar:</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImageUrl('https://ae01.alicdn.com/kf/H8a9e7c8f5d8f4e8a9c0b1c2d3e4f5g6h/Wireless-Earbuds.jpg')}
              >
                <ImageIcon className="w-4 h-4 mr-1" />
                Earbuds
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImageUrl('https://ae01.alicdn.com/kf/H1234567890abcdef/Smart-Watch.jpg')}
              >
                <ImageIcon className="w-4 h-4 mr-1" />
                Smart Watch
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {scanMutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Xatolik: {(scanMutation.error as any)?.response?.data?.error || 'Skanerlashda xatolik yuz berdi'}
          </AlertDescription>
        </Alert>
      )}

      {/* Results Section */}
      {scanResult && (
        <div className="space-y-6">
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
                <Badge variant={scanResult.status === 'success' ? 'default' : 'secondary'}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {scanResult.productInfo.confidence}% Aniqlandi
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tavsif:</p>
                <p className="text-sm">{scanResult.productInfo.description}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Teglar:</p>
                <div className="flex flex-wrap gap-2">
                  {scanResult.productInfo.labels.slice(0, 8).map((label, i) => (
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
                  <p className="text-xs text-muted-foreground mb-1">Topilgan Raqobatchilar</p>
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

          {/* Message */}
          <Alert>
            <AlertDescription>{scanResult.message}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
