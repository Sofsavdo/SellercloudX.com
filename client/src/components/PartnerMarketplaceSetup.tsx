// Partner Marketplace Setup - Hamkor o'zi API kiritib integratsiya qiladi
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Globe, Key, CheckCircle, AlertCircle, Loader2, Settings, 
  Link, RefreshCw, Trash2, Plus, ShoppingBag
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface MarketplaceConfig {
  id: string;
  marketplace: string;
  apiKey: string;
  apiSecret: string;
  shopId?: string;
  active: boolean;
  lastSyncAt?: string;
}

const MARKETPLACE_OPTIONS = [
  { id: 'uzum', name: 'Uzum Market', logo: '🛒', color: 'bg-purple-500' },
  { id: 'yandex', name: 'Yandex Market', logo: '🔴', color: 'bg-red-500' },
  { id: 'wildberries', name: 'Wildberries', logo: '🟣', color: 'bg-pink-500' },
  { id: 'ozon', name: 'Ozon', logo: '🔵', color: 'bg-blue-500' },
  { id: 'aliexpress', name: 'AliExpress', logo: '🟠', color: 'bg-orange-500' },
  { id: 'amazon', name: 'Amazon', logo: '📦', color: 'bg-yellow-500' },
];

export function PartnerMarketplaceSetup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    shopId: '',
  });

  // Fetch partner's marketplace integrations
  const { data: integrationsData, isLoading } = useQuery({
    queryKey: ['/api/partner/marketplace-integrations'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/partner/marketplace-integrations');
      return response.json();
    },
  });
  
  // Ensure integrations is always an array
  const integrations = Array.isArray(integrationsData) ? integrationsData : (integrationsData?.integrations || []);

  // Save integration
  const saveMutation = useMutation({
    mutationFn: async (data: { marketplace: string; apiKey: string; apiSecret: string; shopId?: string }) => {
      const response = await apiRequest('POST', '/api/partner/marketplace-integrations', data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Muvaffaqiyatli!', description: 'Marketplace ulandi' });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/marketplace-integrations'] });
      setSelectedMarketplace(null);
      setFormData({ apiKey: '', apiSecret: '', shopId: '' });
    },
    onError: (error: Error) => {
      toast({ title: 'Xatolik', description: error.message, variant: 'destructive' });
    },
  });

  // Test connection
  const testMutation = useMutation({
    mutationFn: async (marketplace: string) => {
      const response = await apiRequest('POST', `/api/partner/marketplace-integrations/${marketplace}/test`);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: 'Muvaffaqiyatli!', description: 'Ulanish ishlayapti' });
      } else {
        toast({ title: 'Xatolik', description: data.message || 'Ulanish muvaffaqiyatsiz', variant: 'destructive' });
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Xatolik', description: error.message, variant: 'destructive' });
    },
  });

  // Delete integration
  const deleteMutation = useMutation({
    mutationFn: async (marketplace: string) => {
      const response = await apiRequest('DELETE', `/api/partner/marketplace-integrations/${marketplace}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'O\'chirildi', description: 'Integratsiya o\'chirildi' });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/marketplace-integrations'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Xatolik', description: error.message, variant: 'destructive' });
    },
  });

  const handleSave = () => {
    if (!selectedMarketplace || !formData.apiKey) {
      toast({ title: 'Xatolik', description: 'API kalit kiritish shart', variant: 'destructive' });
      return;
    }
    saveMutation.mutate({
      marketplace: selectedMarketplace,
      apiKey: formData.apiKey,
      apiSecret: formData.apiSecret,
      shopId: formData.shopId,
    });
  };

  const getIntegration = (marketplaceId: string) => {
    return integrations.find((i: MarketplaceConfig) => i.marketplace === marketplaceId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Marketplace Integratsiyalari
          </CardTitle>
          <CardDescription>
            Marketplacelarni ulash uchun API kalitlaringizni kiriting. Admin tasdig'i talab qilinmaydi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Connected Marketplaces */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {MARKETPLACE_OPTIONS.map((mp) => {
              const integration = getIntegration(mp.id);
              const isConnected = integration?.active;

              return (
                <Card key={mp.id} className={`cursor-pointer transition-all hover:shadow-md ${isConnected ? 'border-success' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{mp.logo}</span>
                        <span className="font-semibold">{mp.name}</span>
                      </div>
                      <Badge variant={isConnected ? 'default' : 'secondary'} className={isConnected ? 'bg-success' : ''}>
                        {isConnected ? <><CheckCircle className="w-3 h-3 mr-1" /> Ulangan</> : 'Ulanmagan'}
                      </Badge>
                    </div>

                    {isConnected ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testMutation.mutate(mp.id)}
                          disabled={testMutation.isPending}
                        >
                          <RefreshCw className={`w-3 h-3 mr-1 ${testMutation.isPending ? 'animate-spin' : ''}`} />
                          Test
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMarketplace(mp.id);
                            setFormData({
                              apiKey: integration?.apiKey || '',
                              apiSecret: integration?.apiSecret || '',
                              shopId: '',
                            });
                          }}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Sozlash
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(mp.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedMarketplace(mp.id)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Ulash
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Setup Form */}
          {selectedMarketplace && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  {MARKETPLACE_OPTIONS.find(m => m.id === selectedMarketplace)?.name} API Sozlamalari
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key *</Label>
                  <Input
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder="API kalitingizni kiriting"
                    type="password"
                  />
                </div>

                <div className="space-y-2">
                  <Label>API Secret</Label>
                  <Input
                    value={formData.apiSecret}
                    onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                    placeholder="API secret (ixtiyoriy)"
                    type="password"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Shop ID / Seller ID</Label>
                  <Input
                    value={formData.shopId}
                    onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                    placeholder="Do'kon ID (ixtiyoriy)"
                  />
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    API kalitni qayerdan olish
                  </h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>{MARKETPLACE_OPTIONS.find(m => m.id === selectedMarketplace)?.name} seller hisobingizga kiring</li>
                    <li>Sozlamalar → API/Integratsiya bo'limiga o'ting</li>
                    <li>Yangi API kalit yarating va nusxalang</li>
                    <li>Shu yerga joylashtiring</li>
                  </ol>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Saqlash va Ulash
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedMarketplace(null)}>
                    Bekor qilish
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
