/**
 * AI Infographic Generator - Nano Banana
 * 
 * Mahsulot kartalari uchun professional infografika rasmlar yaratish
 * Uzum Market va Yandex Market uchun optimallashtirilgan
 */

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Sparkles, 
  Download,
  Image as ImageIcon,
  Wand2,
  RefreshCw,
  Copy,
  CheckCircle,
  Camera,
  Upload,
  Palette,
  LayoutTemplate,
  ShoppingBag,
  Zap,
  Info
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Template icons
const TEMPLATE_ICONS: Record<string, any> = {
  product_showcase: ShoppingBag,
  features_highlight: Zap,
  comparison: LayoutTemplate,
  lifestyle: Camera,
  bundle: Copy
};

interface Template {
  id: string;
  name: string;
  name_ru: string;
  description: string;
}

interface InfographicResult {
  success: boolean;
  image_base64?: string;
  mime_type?: string;
  metadata?: {
    product_name: string;
    template: string;
    marketplace: string;
  };
  error?: string;
}

export default function InfographicGenerator() {
  // Form state
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [features, setFeatures] = useState('');
  const [template, setTemplate] = useState('product_showcase');
  const [marketplace, setMarketplace] = useState('uzum');
  const [background, setBackground] = useState('white');
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  
  // Result state
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = useState<any>(null);

  // Fetch templates
  const { data: templatesData } = useQuery({
    queryKey: ['infographic-templates'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/infographic/templates`);
      return response.json();
    }
  });

  // Generate infographic mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const featuresArray = features.split('\n').filter(f => f.trim());
      
      const response = await fetch(`${API_BASE}/api/infographic/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName,
          brand,
          features: featuresArray,
          template,
          marketplace,
          background,
          custom_prompt: useCustomPrompt ? customPrompt : null
        })
      });
      return response.json();
    },
    onSuccess: (data: InfographicResult) => {
      if (data.success && data.image_base64) {
        setGeneratedImage(data.image_base64);
        setImageMetadata(data.metadata);
      }
    }
  });

  // Download image
  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${generatedImage}`;
    link.download = `infographic_${productName.replace(/\s+/g, '_')}_${Date.now()}.png`;
    link.click();
  };

  // Reset form
  const handleReset = () => {
    setGeneratedImage(null);
    setImageMetadata(null);
  };

  const templates: Template[] = templatesData?.templates || [];
  const backgrounds = templatesData?.backgrounds || {};

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          AI Infografika Generator
        </h1>
        <p className="text-gray-500 mt-1">
          Nano Banana AI bilan professional mahsulot rasmlari yarating
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* Product Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingBag className="w-5 h-5 text-purple-500" />
                Mahsulot ma'lumotlari
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Mahsulot nomi *</Label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Samsung Galaxy A54 5G Smartfon"
                  className="mt-1"
                  data-testid="product-name-input"
                />
              </div>

              <div>
                <Label>Brend</Label>
                <Input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Samsung"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Xususiyatlar (har bir qatorga bittadan)</Label>
                <Textarea
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="6.4 inch Super AMOLED display&#10;128GB storage&#10;50MP camera&#10;5000mAh battery"
                  rows={4}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Template & Style Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LayoutTemplate className="w-5 h-5 text-blue-500" />
                Shablon va stil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Shablon</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => {
                      const Icon = TEMPLATE_ICONS[t.id] || ImageIcon;
                      return (
                        <SelectItem key={t.id} value={t.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{t.name}</span>
                            <span className="text-gray-400 text-xs">({t.name_ru})</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Marketplace</Label>
                  <Select value={marketplace} onValueChange={setMarketplace}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uzum">🍇 Uzum Market (1080x1440)</SelectItem>
                      <SelectItem value="yandex">🔴 Yandex Market (1000x1000)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fon stili</Label>
                  <Select value={background} onValueChange={setBackground}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white">⬜ Oq (White)</SelectItem>
                      <SelectItem value="gradient">🌫️ Gradient</SelectItem>
                      <SelectItem value="studio">📸 Studio</SelectItem>
                      <SelectItem value="minimal">⚪ Minimal</SelectItem>
                      <SelectItem value="luxury">🖤 Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Prompt Option */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomPrompt}
                    onChange={(e) => setUseCustomPrompt(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Maxsus prompt ishlatish</span>
                </label>
                
                {useCustomPrompt && (
                  <Textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Masalan: Create a premium smartphone image with floating UI elements..."
                    rows={3}
                    className="mt-2"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!productName || generateMutation.isPending}
            className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            data-testid="generate-btn"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                AI rasm yaratmoqda... (30-60 sekund)
              </>
            ) : (
              <>
                <Wand2 className="w-6 h-6 mr-2" />
                Infografika yaratish
              </>
            )}
          </Button>

          {/* Info */}
          <Alert className="bg-purple-50 border-purple-200">
            <Info className="w-4 h-4 text-purple-600" />
            <AlertDescription className="text-purple-700 text-sm">
              <strong>Nano Banana AI</strong> professional e-commerce rasmlar yaratadi. 
              Har bir rasm yaratish taxminan 30-60 sekund vaqt oladi.
            </AlertDescription>
          </Alert>
        </div>

        {/* Right: Preview */}
        <div className="space-y-6">
          <Card className="min-h-[500px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="w-5 h-5 text-green-500" />
                Natija
              </CardTitle>
              {imageMetadata && (
                <CardDescription>
                  {imageMetadata.template_name} | {imageMetadata.marketplace === 'uzum' ? 'Uzum' : 'Yandex'} Market
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {generatedImage ? (
                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={`data:image/png;base64,${generatedImage}`}
                      alt="Generated infographic"
                      className="w-full h-auto"
                    />
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Tayyor
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button onClick={downloadImage} className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Yuklab olish
                    </Button>
                    <Button onClick={handleReset} variant="outline" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Yangi yaratish
                    </Button>
                  </div>

                  {/* Marketplace Tips */}
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertTitle className="text-blue-800 text-sm">Yuklash qo'llanmasi</AlertTitle>
                    <AlertDescription className="text-blue-700 text-xs">
                      {marketplace === 'uzum' ? (
                        <>
                          <strong>Uzum Market:</strong> Rasmni 1080x1440px ga moslashtiring va seller.uzum.uz ga yuklang
                        </>
                      ) : (
                        <>
                          <strong>Yandex Market:</strong> 1000x1000px, oq fon talab qilinadi. partner.market.yandex.ru ga yuklang
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : generateMutation.isPending ? (
                <div className="flex flex-col items-center justify-center h-80 text-gray-400">
                  <Loader2 className="w-16 h-16 animate-spin mb-4 text-purple-500" />
                  <p className="text-lg font-medium text-gray-600">AI rasm yaratmoqda...</p>
                  <p className="text-sm">Bu jarayon 30-60 sekund olishi mumkin</p>
                </div>
              ) : generateMutation.isError ? (
                <div className="flex flex-col items-center justify-center h-80 text-red-500">
                  <p className="text-lg">Xatolik yuz berdi</p>
                  <p className="text-sm text-gray-500">Iltimos qaytadan urinib ko'ring</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 text-gray-400">
                  <Palette className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">Rasm bu yerda ko'rinadi</p>
                  <p className="text-sm">Mahsulot ma'lumotlarini kiriting va "Yaratish" tugmasini bosing</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tez shablonlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {templates.slice(0, 5).map((t) => {
                  const Icon = TEMPLATE_ICONS[t.id] || ImageIcon;
                  const isActive = template === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTemplate(t.id)}
                      className={`
                        p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1
                        ${isActive 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-purple-300'}
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                      <span className={`text-xs ${isActive ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
                        {t.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
