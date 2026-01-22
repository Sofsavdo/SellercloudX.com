import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Store, Plus, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';

interface MarketplaceConnection {
  id: string;
  marketplace: string;
  active: boolean;
  lastSyncAt?: string;
  sellerId?: string;
}

const MARKETPLACES = [
  {
    id: 'uzum',
    name: 'Uzum Market',
    logo: '🛍️',
    color: 'purple',
    docs: 'https://api-seller.uzum.uz/api/seller-openapi/swagger/swagger-ui/',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'text', required: true },
      { name: 'sellerId', label: 'Seller ID', type: 'text', required: false }
    ]
  },
  {
    id: 'yandex',
    name: 'Yandex Market',
    logo: '🟡',
    color: 'yellow',
    docs: 'https://yandex.ru/dev/market/partner-api/doc/ru/',
    fields: [
      { name: 'campaignId', label: 'Campaign ID', type: 'text', required: true },
      { name: 'accessToken', label: 'OAuth Token', type: 'password', required: true }
    ]
  },
  {
    id: 'wildberries',
    name: 'Wildberries',
    logo: '💜',
    color: 'purple',
    docs: 'https://openapi.wildberries.ru/',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'supplierId', label: 'Supplier ID', type: 'text', required: false }
    ]
  },
  {
    id: 'ozon',
    name: 'Ozon',
    logo: '🔵',
    color: 'blue',
    docs: 'https://docs.ozon.ru/api/seller/',
    fields: [
      { name: 'clientId', label: 'Client ID', type: 'text', required: true },
      { name: 'apiKey', label: 'API Key', type: 'password', required: true }
    ]
  }
];

export function MarketplaceConnections() {
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: connections = [], isLoading } = useQuery<MarketplaceConnection[]>({
    queryKey: ['/api/marketplace/connections'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/marketplace/connections');
        return response.json();
      } catch {
        return [];
      }
    }
  });

  const connectMutation = useMutation({
    mutationFn: async (data: { marketplace: string; credentials: Record<string, string> }) => {
      const response = await apiRequest('POST', '/api/marketplace/connect', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ulanishda xatolik');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/connections'] });
      toast({
        title: "Muvaffaqiyatli",
        description: "Marketplace ulandi",
      });
      setIsDialogOpen(false);
      setFormData({});
      setSelectedMarketplace(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (data: { marketplace: string; credentials: Record<string, string> }) => {
      const response = await apiRequest('POST', '/api/marketplace/test-connection', data);
      if (!response.ok) {
        throw new Error('Ulanish muvaffaqiyatsiz');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ulanish muvaffaqiyatli",
        description: "API ma'lumotlari to'g'ri",
      });
    },
    onError: () => {
      toast({
        title: "Ulanish xatosi",
        description: "API ma'lumotlarini tekshiring",
        variant: "destructive",
      });
    }
  });

  const handleConnect = () => {
    if (!selectedMarketplace) return;
    connectMutation.mutate({
      marketplace: selectedMarketplace,
      credentials: formData
    });
  };

  const handleTestConnection = () => {
    if (!selectedMarketplace) return;
    testConnectionMutation.mutate({
      marketplace: selectedMarketplace,
      credentials: formData
    });
  };

  const getMarketplaceInfo = (id: string) => {
    return MARKETPLACES.find(m => m.id === id);
  };

  const isConnected = (marketplaceId: string) => {
    return connections.some(c => c.marketplace === marketplaceId && c.active);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Marketplace Integratsiyalari
          </CardTitle>
          <CardDescription>
            Mahsulotlaringizni turli marketplacelarga ulang va boshqaring
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MARKETPLACES.map((marketplace) => {
                const connected = isConnected(marketplace.id);
                const connection = connections.find(c => c.marketplace === marketplace.id);

                return (
                  <Card key={marketplace.id} className={connected ? 'border-green-500' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{marketplace.logo}</div>
                          <div>
                            <h3 className="font-semibold">{marketplace.name}</h3>
                            {connected && connection?.lastSyncAt && (
                              <p className="text-xs text-muted-foreground">
                                Oxirgi sync: {new Date(connection.lastSyncAt).toLocaleString('uz-UZ')}
                              </p>
                            )}
                          </div>
                        </div>
                        {connected ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ulangan
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50">
                            <XCircle className="w-3 h-3 mr-1" />
                            Ulanmagan
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Dialog open={isDialogOpen && selectedMarketplace === marketplace.id} onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (!open) {
                            setSelectedMarketplace(null);
                            setFormData({});
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant={connected ? "outline" : "default"}
                              size="sm"
                              className="flex-1"
                              onClick={() => setSelectedMarketplace(marketplace.id)}
                            >
                              {connected ? (
                                <>Sozlamalar</>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4 mr-1" />
                                  Ulash
                                </>
                              )}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <span className="text-2xl">{marketplace.logo}</span>
                                {marketplace.name}
                              </DialogTitle>
                              <DialogDescription>
                                API ma'lumotlarini kiriting
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              {marketplace.fields.map((field) => (
                                <div key={field.name} className="space-y-2">
                                  <Label htmlFor={field.name}>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                  </Label>
                                  <Input
                                    id={field.name}
                                    type={field.type}
                                    value={formData[field.name] || ''}
                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                    placeholder={`${field.label} kiriting`}
                                  />
                                </div>
                              ))}

                              <div className="flex gap-2 pt-4">
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={handleTestConnection}
                                  disabled={testConnectionMutation.isPending}
                                >
                                  {testConnectionMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : null}
                                  Test
                                </Button>
                                <Button
                                  className="flex-1"
                                  onClick={handleConnect}
                                  disabled={connectMutation.isPending}
                                >
                                  {connectMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : null}
                                  Ulash
                                </Button>
                              </div>

                              <Button
                                variant="link"
                                size="sm"
                                className="w-full"
                                onClick={() => window.open(marketplace.docs, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                API Hujjatlari
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ulangan Marketplacelar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {connections.filter(c => c.active).map((connection) => {
                const info = getMarketplaceInfo(connection.marketplace);
                return (
                  <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{info?.logo}</span>
                      <div>
                        <p className="font-medium">{info?.name}</p>
                        {connection.sellerId && (
                          <p className="text-xs text-muted-foreground">ID: {connection.sellerId}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Faol
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
