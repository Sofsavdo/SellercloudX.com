/**
 * Yandex Market Scanner - TO'LIQ AVTOMATLASHTIRISH
 * 
 * MUHIM: Bu Uzum Marketdan farq qiladi!
 * - Uzum Market: "Assisted automation" (copy-paste)
 * - Yandex Market: "FULL API automation" (to'g'ridan-to'g'ri yaratiladi)
 * 
 * Yandex Market API mahsulot yaratishni TO'LIQ quvvatlaydi!
 */

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Camera, 
  Upload, 
  Loader2, 
  Sparkles, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Copy,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Package,
  RefreshCw,
  BarChart3,
  ShoppingCart,
  Zap,
  Info,
  Image as ImageIcon,
  Key,
  AlertCircle,
  Rocket
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const PARTNER_ID = 'test-partner-123';

// Kategoriyalar
const CATEGORIES = [
  { value: 'perfume', label: 'Духи и парфюм', icon: '🌸' },
  { value: 'electronics', label: 'Электроника', icon: '📱' },
  { value: 'clothing', label: 'Одежда', icon: '👔' },
  { value: 'beauty', label: 'Красота', icon: '💄' },
  { value: 'home', label: 'Дом и сад', icon: '🏠' },
  { value: 'food', label: 'Продукты', icon: '🍎' },
  { value: 'toys', label: 'Игрушки', icon: '🧸' },
  { value: 'sports', label: 'Спорт', icon: '⚽' },
  { value: 'auto', label: 'Авто', icon: '🚗' },
];

// Fulfillment turlari
const FULFILLMENT_TYPES = [
  { value: 'fbs', label: 'FBS - Продаю сам', description: 'Храню и доставляю сам' },
  { value: 'fby', label: 'FBY - Склад Яндекса', description: 'Товар на складе Яндекса' },
  { value: 'dbs', label: 'DBS - Доставка продавца', description: 'Доставляю сам' },
];

// To'lov chastotasi
const PAYOUT_FREQUENCIES = [
  { value: 'daily', label: 'Ежедневно', commission: '3.3%' },
  { value: 'weekly', label: 'Раз в неделю', commission: '2.8%' },
  { value: 'biweekly', label: 'Раз в 2 недели', commission: '2.3%' },
  { value: 'monthly', label: 'Раз в месяц', commission: '1.8%' },
];

interface ProductCard {
  name: string;
  description: string;
  vendor: string;
  keywords: string[];
  bullet_points: string[];
  specifications: Record<string, string>;
  seo_score: number;
}

interface PriceData {
  cost_price: number;
  min_price: number;
  optimal_price: number;
  max_price: number;
  breakdown: {
    commission: { rate: number; amount: number };
    payout_fee: { rate: number; amount: number; frequency: string };
    logistics: { type: string; amount: number };
    net_profit: number;
    actual_margin: number;
  };
}

export default function YandexMarketScanner() {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Credentials (NEW!)
  const [oauthToken, setOauthToken] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [credentialsVerified, setCredentialsVerified] = useState(false);
  const [campaignInfo, setCampaignInfo] = useState<any>(null);
  
  // Step 2: Product info
  const [productName, setProductName] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const [productCategory, setProductCategory] = useState('perfume');
  const [productDescription, setProductDescription] = useState('');
  
  // Step 3: Cost & quantity
  const [costPrice, setCostPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [weightKg, setWeightKg] = useState('1');
  const [fulfillment, setFulfillment] = useState('fbs');
  const [payoutFrequency, setPayoutFrequency] = useState('weekly');
  
  // Step 4: Results
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [productCard, setProductCard] = useState<ProductCard | null>(null);
  const [fullResult, setFullResult] = useState<any>(null);
  const [createResult, setCreateResult] = useState<any>(null);

  // Steps config (updated with credentials step)
  const steps = [
    { id: 1, title: 'API Kalitlar', icon: Key },
    { id: 2, title: 'Товар', icon: Package },
    { id: 3, title: 'Цена', icon: DollarSign },
    { id: 4, title: 'Yaratish', icon: Rocket },
  ];

  // Test connection mutation - using simplified endpoint
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/api/yandex/campaigns`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setCredentialsVerified(true);
        setCampaignInfo(data);
        // Auto-set business_id if not provided
        if (!businessId && data.business_id) {
          setBusinessId(data.business_id);
        }
      }
    }
  });

  // Full process mutation (prepares card and price)
  const fullProcessMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/api/yandex-market/full-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: PARTNER_ID,
          cost_price: parseFloat(costPrice),
          quantity: parseInt(quantity),
          category: productCategory,
          brand: productBrand,
          weight_kg: parseFloat(weightKg),
          fulfillment: fulfillment,
          payout_frequency: payoutFrequency,
          product_name: productName,
          description: productDescription
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setFullResult(data.data);
        if (data.data.price_optimization) {
          setPriceData(data.data.price_optimization);
        }
        if (data.data.product_card) {
          setProductCard(data.data.product_card);
        }
        setCurrentStep(4);
      }
    }
  });

  // CREATE PRODUCT via real API (NEW! - Key difference from Uzum)
  // Using simplified endpoint that reads credentials from .env
  const createProductMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/api/yandex/create-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName,
          description: productDescription,
          brand: productBrand,
          category: productCategory,
          price: priceData?.optimal_price || parseFloat(costPrice) * 1.3,
          images: [],
          use_ai: true
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCreateResult(data);
    }
  });

  // Format currency (RUB)
  const formatCurrency = (amount: number, currency: string = "so'm") => {
    return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ` ${currency}`;
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Reset
  const handleReset = () => {
    setCurrentStep(1);
    setProductName('');
    setProductBrand('');
    setProductCategory('electronics');
    setProductDescription('');
    setCostPrice('');
    setQuantity('1');
    setWeightKg('1');
    setPriceData(null);
    setProductCard(null);
    setFullResult(null);
    setCreateResult(null);
    // Keep credentials
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1Credentials();
      case 2:
        return renderStep2ProductInfo();
      case 3:
        return renderStep3Price();
      case 4:
        return renderStep4Results();
      default:
        return null;
    }
  };

  // Step 1: Credentials (NEW!)
  const renderStep1Credentials = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-6 h-6 text-yellow-600" />
          Yandex Market API
        </CardTitle>
        <CardDescription>
          API kalitlari serverda sozlangan. 
          <a 
            href="https://partner.market.yandex.ru" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-yellow-600 ml-1 underline"
          >
            Yandex Market Kabinetga o'tish
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info Banner */}
        <Alert className="bg-green-50 border-green-500">
          <Rocket className="w-4 h-4 text-green-600" />
          <AlertTitle className="text-green-800">To'liq Avtomatlashtirish!</AlertTitle>
          <AlertDescription className="text-green-700">
            Yandex Market API mahsulot yaratishni <strong>TO'LIQ</strong> quvvatlaydi. 
            Uzumdagi kabi copy-paste emas, mahsulot <strong>avtomatik</strong> yaratiladi!
          </AlertDescription>
        </Alert>

        {/* Connection Status */}
        {credentialsVerified && campaignInfo && (
          <Alert className="bg-green-50 border-green-500">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertTitle className="text-green-800">Ulandi!</AlertTitle>
            <AlertDescription className="text-green-700">
              Business ID: {campaignInfo.business_id}<br/>
              Do'konlar: {campaignInfo.campaigns?.length || 0} ta
            </AlertDescription>
          </Alert>
        )}

        {testConnectionMutation.isError && (
          <Alert className="bg-red-50 border-red-500">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Ulanish xatosi. Server konfiguratsiyasini tekshiring.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-4">
          <Button
            onClick={() => testConnectionMutation.mutate()}
            disabled={testConnectionMutation.isPending}
            variant="outline"
            className="flex-1"
          >
            {testConnectionMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Tekshirilmoqda...
              </>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                Ulanishni tekshirish
              </>
            )}
          </Button>
          <Button
            onClick={() => setCurrentStep(2)}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600"
          >
            Davom etish
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Step 2: Product info (renamed from step 1)
  const renderStep2ProductInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-6 h-6 text-yellow-600" />
          Информация о товаре
        </CardTitle>
        <CardDescription>
          Введите данные о товаре для Яндекс Маркета
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div>
            <Label>Название товара *</Label>
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Например: Samsung Galaxy A54 5G Смартфон"
              className="mt-1"
              data-testid="product-name-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Бренд</Label>
              <Input
                value={productBrand}
                onChange={(e) => setProductBrand(e.target.value)}
                placeholder="Samsung, Apple..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Категория</Label>
              <Select value={productCategory} onValueChange={setProductCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Описание</Label>
            <Textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Краткое описание товара..."
              rows={3}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => setCurrentStep(1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga
          </Button>
          <Button
            onClick={() => setCurrentStep(3)}
            disabled={!productName}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600"
          >
            Далее
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Step 3: Cost & quantity (renamed from step 2)
  const renderStep3Price = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          Себестоимость и настройки
        </CardTitle>
        <CardDescription>
          Укажите себестоимость и параметры доставки
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Себестоимость (сум) *</Label>
            <Input
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="2500000"
              className="mt-1 text-lg"
              data-testid="cost-price-input"
            />
          </div>
          <div>
            <Label>Количество *</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="10"
              className="mt-1 text-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Вес (кг)</Label>
            <Input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="1"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Модель работы</Label>
            <Select value={fulfillment} onValueChange={setFulfillment}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FULFILLMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Частота выплат</Label>
          <Select value={payoutFrequency} onValueChange={setPayoutFrequency}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYOUT_FREQUENCIES.map((freq) => (
                <SelectItem key={freq.value} value={freq.value}>
                  {freq.label} ({freq.commission})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Alert className="bg-yellow-50 border-yellow-200">
          <Info className="w-4 h-4 text-yellow-600" />
          <AlertDescription>
            <strong>Yandex Market komissiyalari:</strong>
            <ul className="list-disc list-inside mt-2 text-sm">
              <li>Категория: {productCategory === 'electronics' ? '5-10%' : '10-24%'}</li>
              <li>Pul chiqarish: {PAYOUT_FREQUENCIES.find(f => f.value === payoutFrequency)?.commission}</li>
              <li>Logistika: FBS/FBY turiga bog'liq</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Button onClick={() => setCurrentStep(2)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <Button
            onClick={() => fullProcessMutation.mutate()}
            disabled={!costPrice || !quantity || fullProcessMutation.isPending}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            data-testid="analyze-btn"
          >
            {fullProcessMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                AI анализирует...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Создать карточку
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Step 4: Results (renamed from step 3, with CREATE button)
  const renderStep4Results = () => (
    <div className="space-y-6">
      {/* Success Banner */}
      <Alert className="bg-green-50 border-green-500">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <AlertTitle className="text-green-800">Карточка готова!</AlertTitle>
        <AlertDescription className="text-green-700">
          SEO Score: {productCard?.seo_score || fullResult?.seo_score || 0}/100 | 
          SKU: {fullResult?.sku}
        </AlertDescription>
      </Alert>

      {/* Price Analysis */}
      {priceData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Анализ цены
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Price Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs text-red-600 font-medium">Минимум</p>
                <p className="text-xl font-bold text-red-700">{formatCurrency(priceData.min_price)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-500">
                <p className="text-xs text-green-600 font-medium">Рекомендуем</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(priceData.optimal_price)}</p>
                <p className="text-xs text-green-600">+{priceData.breakdown.actual_margin}% маржа</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 font-medium">Максимум</p>
                <p className="text-xl font-bold text-blue-700">{formatCurrency(priceData.max_price)}</p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Расходы:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Себестоимость:</span>
                  <span className="font-medium">{formatCurrency(priceData.cost_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Комиссия ({priceData.breakdown.commission.rate}%):</span>
                  <span className="font-medium text-red-600">-{formatCurrency(priceData.breakdown.commission.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Вывод средств ({priceData.breakdown.payout_fee.rate}%):</span>
                  <span className="font-medium text-red-600">-{formatCurrency(priceData.breakdown.payout_fee.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Логистика ({priceData.breakdown.logistics.type}):</span>
                  <span className="font-medium text-red-600">-{formatCurrency(priceData.breakdown.logistics.amount)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Чистая прибыль:</span>
                  <span className={priceData.breakdown.net_profit > 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(priceData.breakdown.net_profit)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Card */}
      {productCard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Карточка товара
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-gray-500">Название (макс. 120 символов)</Label>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-semibold flex-1">{productCard.name}</p>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(productCard.name)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Описание</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm max-h-48 overflow-y-auto">
                {productCard.description}
              </div>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => copyToClipboard(productCard.description)}>
                <Copy className="w-4 h-4 mr-2" /> Копировать
              </Button>
            </div>

            {productCard.bullet_points && (
              <div>
                <Label className="text-xs text-gray-500">Характеристики</Label>
                <ul className="mt-1 space-y-1">
                  {productCard.bullet_points.map((point, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Keywords */}
            {productCard.keywords && (
              <div>
                <Label className="text-xs text-gray-500">Ключевые слова</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {productCard.keywords.map((kw, i) => (
                    <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => copyToClipboard(kw)}>
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Media Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="w-5 h-5 text-yellow-500" />
            Требования к фото
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-600">Размер</p>
              <p className="font-bold">1000 x 1000px</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-600">Соотношение</p>
              <p className="font-bold">1:1</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-600">Макс. размер</p>
              <p className="font-bold">10 MB</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-600">Фон</p>
              <p className="font-bold">Белый</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CREATE PRODUCT Section (NEW!) */}
      <Card className="border-2 border-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-green-600" />
            Avtomatik Yaratish (API)
          </CardTitle>
          <CardDescription>
            Yandex Market API orqali mahsulotni to'g'ridan-to'g'ri yarating
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Success/Error Messages */}
          {createResult?.success && (
            <Alert className="bg-green-50 border-green-500">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertTitle className="text-green-800">Mahsulot yaratildi!</AlertTitle>
              <AlertDescription className="text-green-700">
                Product ID: {createResult.product_id}<br/>
                SKU: {createResult.sku}<br/>
                Status: {createResult.status}
              </AlertDescription>
            </Alert>
          )}

          {createResult?.error && (
            <Alert className="bg-red-50 border-red-500">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Xatolik: {createResult.error}
              </AlertDescription>
            </Alert>
          )}

          {/* CREATE Button */}
          <div className="flex gap-4">
            <Button
              onClick={() => createProductMutation.mutate()}
              disabled={!credentialsVerified || createProductMutation.isPending || createResult?.success}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              data-testid="create-product-btn"
            >
              {createProductMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Yaratilmoqda...
                </>
              ) : createResult?.success ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Yaratildi!
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  Mahsulot yaratish
                </>
              )}
            </Button>
            <Button onClick={() => setCurrentStep(3)} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Orqaga
            </Button>
          </div>

          {/* Manual Upload Instructions (fallback) */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2 text-gray-600">Yoki qo'lda yuklash:</h4>
            {fullResult?.upload_instructions?.ru && (
              <ol className="space-y-2">
                {fullResult.upload_instructions.ru.map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="bg-gray-100 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            )}
            
            <div className="flex gap-4 pt-4">
              <Button asChild variant="outline" className="flex-1">
                <a href="https://partner.market.yandex.ru" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Яндекс Маркет Кабинет
                </a>
              </Button>
              <Button onClick={handleReset} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Новый товар
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          Яндекс Маркет
        </h1>
        <p className="text-gray-500 mt-1">
          AI карточка товара для Яндекс Маркета
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${isActive ? 'bg-yellow-500 text-white' : ''}
                      ${isCompleted ? 'bg-green-500 text-white' : ''}
                      ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${isActive ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
        <Progress value={(currentStep / steps.length) * 100} className="mt-4 h-2" />
      </div>

      {/* Step Content */}
      {renderStepContent()}
    </div>
  );
}
