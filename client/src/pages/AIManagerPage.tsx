// AI Manager Dashboard - Full E-commerce Automation
// Scan product -> Get IKPU -> Create card -> Upload to marketplace

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Camera, 
  Package, 
  Upload, 
  CheckCircle, 
  Loader2, 
  Zap,
  TrendingUp,
  FileText,
  Settings,
  ArrowRight,
  Copy,
  ExternalLink,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const PARTNER_ID = 'test-partner-123';

interface ProductCard {
  title: string;
  description: string;
  price: number;
  category: string;
  ikpu_code: string;
  brand: string;
  quantity: number;
  barcode: string;
  fbs_available: boolean;
  status: string;
  ready_for_upload: boolean;
}

interface AICard {
  title: string;
  description: string;
  shortDescription: string;
  keywords: string[];
  bulletPoints: string[];
  seoScore: number;
  suggestedPrice: number;
  categoryPath: string[];
}

export default function AIManagerDashboard() {
  const [activeTab, setActiveTab] = useState('create');
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'electronics',
    quantity: '1',
    brand: '',
    barcode: ''
  });
  const [createdCard, setCreatedCard] = useState<{
    product_card: ProductCard;
    ai_card: AICard;
    ikpu: { code: string; auto_detected: boolean };
    validation: { is_valid: boolean; errors: string[] };
    upload_instructions: Record<string, string>;
  } | null>(null);

  // Fetch partner dashboard
  const { data: dashboardData } = useQuery({
    queryKey: ['ai-manager-dashboard', PARTNER_ID],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/ai-manager/partner/${PARTNER_ID}/dashboard`);
      return response.json();
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: typeof productForm) => {
      const response = await fetch(`${API_BASE}/api/ai-manager/create-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: PARTNER_ID,
          name: data.name,
          description: data.description,
          price: parseFloat(data.price) || 0,
          category: data.category,
          quantity: parseInt(data.quantity) || 1,
          brand: data.brand,
          barcode: data.barcode,
          auto_upload: false
        }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setCreatedCard(data.data);
        setActiveTab('result');
      }
    },
  });

  const handleCreateProduct = () => {
    createProductMutation.mutate(productForm);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  const dashboard = dashboardData?.dashboard || {};
  const connectedMarketplaces = dashboard.connected_marketplaces || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="w-8 h-8 text-purple-600" />
            AI Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Avtomatik mahsulot kartasi yaratish va marketplace'ga yuklash
          </p>
        </div>
        <div className="flex items-center gap-2">
          {connectedMarketplaces.length > 0 ? (
            <Badge className="bg-green-500 px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              {connectedMarketplaces.length} marketplace ulangan
            </Badge>
          ) : (
            <Badge variant="outline" className="px-4 py-2">
              Marketplace ulanmagan
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-purple-700">AI Scanner</p>
                <p className="text-lg font-bold text-purple-900">Faol</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-700">IKPU Qidiruv</p>
                <p className="text-lg font-bold text-blue-900">Faol</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-green-700">Narx Optimallashtirish</p>
                <p className="text-lg font-bold text-green-900">Faol</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-orange-700">Avto-yuklash</p>
                <p className="text-lg font-bold text-orange-900">
                  {connectedMarketplaces.length > 0 ? 'Tayyor' : 'O\'chirilgan'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="create">Yangi Mahsulot</TabsTrigger>
          <TabsTrigger value="result" disabled={!createdCard}>Natija</TabsTrigger>
          <TabsTrigger value="settings">Sozlamalar</TabsTrigger>
        </TabsList>

        {/* Create Product Tab */}
        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Mahsulot Ma'lumotlari
                </CardTitle>
                <CardDescription>
                  AI avtomatik SEO tavsif va IKPU kod yaratadi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mahsulot nomi *</Label>
                  <Input
                    placeholder="Masalan: Samsung Galaxy A54 5G"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Qisqacha tavsif</Label>
                  <Textarea
                    placeholder="Mahsulot haqida qisqacha ma'lumot..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Narx (so'm) *</Label>
                    <Input
                      type="number"
                      placeholder="4500000"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Miqdor</Label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={productForm.quantity}
                      onChange={(e) => setProductForm({...productForm, quantity: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kategoriya</Label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    >
                      <option value="electronics">Elektronika</option>
                      <option value="clothing">Kiyim</option>
                      <option value="beauty">Go'zallik</option>
                      <option value="home">Uy-ro'zg'or</option>
                      <option value="toys">O'yinchoqlar</option>
                      <option value="sports">Sport</option>
                      <option value="food">Oziq-ovqat</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Brend</Label>
                    <Input
                      placeholder="Samsung, Apple..."
                      value={productForm.brand}
                      onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Shtrix kod (ixtiyoriy)</Label>
                  <Input
                    placeholder="4607014980123"
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({...productForm, barcode: e.target.value})}
                  />
                </div>

                <Button
                  onClick={handleCreateProduct}
                  disabled={createProductMutation.isPending || !productForm.name || !productForm.price}
                  className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  {createProductMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      AI ishlamoqda...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      AI Karta Yaratish
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Info Panel */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    AI Manager nima qiladi?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-purple-100 rounded-full">
                      <span className="text-sm">1</span>
                    </div>
                    <div>
                      <p className="font-medium">SEO Tavsif Yaratadi</p>
                      <p className="text-sm text-muted-foreground">Uzum Market talablariga mos professional tavsif</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-purple-100 rounded-full">
                      <span className="text-sm">2</span>
                    </div>
                    <div>
                      <p className="font-medium">IKPU Kodini Topadi</p>
                      <p className="text-sm text-muted-foreground">tasnif.soliq.uz dan avtomatik IKPU kod</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-purple-100 rounded-full">
                      <span className="text-sm">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Kalit So'zlar Tanlaydi</p>
                      <p className="text-sm text-muted-foreground">SEO uchun eng yaxshi kalit so'zlar</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-purple-100 rounded-full">
                      <span className="text-sm">4</span>
                    </div>
                    <div>
                      <p className="font-medium">Yuklanishga Tayyor Karta</p>
                      <p className="text-sm text-muted-foreground">Uzum Seller Portal'ga tayyor format</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">💡 AI Scanner'dan foydalaning</h3>
                  <p className="text-purple-100 text-sm mb-4">
                    Mahsulotni kamera bilan suratga oling - AI avtomatik taniydi va to'ldiradi
                  </p>
                  <Button variant="secondary" className="w-full" asChild>
                    <a href="/ai-scanner">
                      <Camera className="w-4 h-4 mr-2" />
                      AI Scanner'ga o'tish
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Result Tab */}
        <TabsContent value="result" className="space-y-6">
          {createdCard && (
            <>
              {/* Success Banner */}
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ✅ Mahsulot kartasi muvaffaqiyatli yaratildi! SEO Score: {createdCard.ai_card.seoScore}%
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Card Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mahsulot Kartasi</CardTitle>
                    <CardDescription>Uzum Market uchun tayyor</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Sarlavha</Label>
                      <div className="flex items-center gap-2">
                        <p className="font-medium flex-1">{createdCard.product_card.title}</p>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(createdCard.product_card.title)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Tavsif</Label>
                      <div className="p-3 bg-slate-50 rounded-lg text-sm max-h-40 overflow-y-auto">
                        {createdCard.product_card.description}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(createdCard.product_card.description)}>
                        <Copy className="w-3 h-3 mr-2" /> Nusxa olish
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Narx</Label>
                        <p className="font-bold text-lg text-green-600">{formatPrice(createdCard.product_card.price)}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">IKPU Kod</Label>
                        <p className="font-mono font-bold">{createdCard.ikpu.code}</p>
                        {createdCard.ikpu.auto_detected && (
                          <Badge variant="outline" className="text-xs">Avtomatik</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      AI Tahlil
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* SEO Score */}
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span>SEO Score</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-purple-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-600" 
                            style={{ width: `${createdCard.ai_card.seoScore}%` }}
                          />
                        </div>
                        <span className="font-bold text-purple-600">{createdCard.ai_card.seoScore}%</span>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">SEO Kalit so'zlar</Label>
                      <div className="flex flex-wrap gap-2">
                        {createdCard.ai_card.keywords.map((kw, i) => (
                          <Badge key={i} variant="outline">{kw}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Asosiy xususiyatlar</Label>
                      <ul className="space-y-1">
                        {createdCard.ai_card.bulletPoints.map((point, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upload Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Uzum Market'ga Yuklash
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {Object.entries(createdCard.upload_instructions).map(([step, instruction], i) => (
                      <div key={step} className="flex items-start gap-2">
                        <div className="p-2 bg-purple-100 rounded-full text-purple-600 font-bold text-sm">
                          {i + 1}
                        </div>
                        <p className="text-sm">{instruction}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-4">
                    <Button asChild className="gap-2">
                      <a href="https://seller.uzum.uz" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        Uzum Seller Portal
                      </a>
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('create')}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Yangi mahsulot
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Marketplace Sozlamalari
              </CardTitle>
              <CardDescription>
                API kalitlaringizni va login ma'lumotlaringizni boshqaring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="gap-2">
                <a href="/partner-credentials">
                  <ArrowRight className="w-4 h-4" />
                  Sozlamalar sahifasiga o'tish
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
