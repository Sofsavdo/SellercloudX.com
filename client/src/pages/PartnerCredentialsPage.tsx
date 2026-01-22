// Partner Marketplace Credentials Management
// Allows partners to save and manage their marketplace API keys and login credentials

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Key, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Shield,
  ExternalLink,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Mock partner ID - in real app, get from auth context
const PARTNER_ID = 'test-partner-123';

interface MarketplaceConfig {
  name: string;
  icon: string;
  auth_type: string;
  fields: string[];
  portal_url: string;
  api_docs: string;
}

interface SavedCredential {
  marketplace: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  has_api_key: boolean;
  has_login: boolean;
  has_password: boolean;
  login_masked?: string;
}

export default function PartnerCredentialsPage() {
  const queryClient = useQueryClient();
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch supported marketplaces
  const { data: marketplacesData } = useQuery({
    queryKey: ['supported-marketplaces'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/marketplaces/supported`);
      return response.json();
    },
  });

  // Fetch partner's saved credentials
  const { data: credentialsData, isLoading: isLoadingCreds, refetch: refetchCreds } = useQuery({
    queryKey: ['partner-credentials', PARTNER_ID],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/partner/${PARTNER_ID}/credentials`);
      return response.json();
    },
  });

  // Save credentials mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const response = await fetch(`${API_BASE}/api/partner/credentials/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: PARTNER_ID,
          marketplace: selectedMarketplace,
          ...data
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-credentials'] });
      setSelectedMarketplace(null);
      setFormData({});
    },
  });

  // Test credentials mutation
  const testMutation = useMutation({
    mutationFn: async (marketplace: string) => {
      const response = await fetch(`${API_BASE}/api/partner/credentials/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: PARTNER_ID,
          marketplace
        }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      setTestResult(data);
    },
  });

  // Delete credentials mutation
  const deleteMutation = useMutation({
    mutationFn: async (marketplace: string) => {
      const response = await fetch(`${API_BASE}/api/partner/${PARTNER_ID}/credentials/${marketplace}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-credentials'] });
    },
  });

  const marketplaces = marketplacesData?.marketplaces || {};
  const savedCredentials = credentialsData?.credentials || [];

  const isMarketplaceConnected = (marketplace: string) => {
    return savedCredentials.some((c: SavedCredential) => c.marketplace === marketplace);
  };

  const getCredentialStatus = (marketplace: string): SavedCredential | null => {
    return savedCredentials.find((c: SavedCredential) => c.marketplace === marketplace) || null;
  };

  const handleSaveCredentials = () => {
    if (!selectedMarketplace) return;
    saveMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Marketplace Sozlamalari
          </h1>
          <p className="text-muted-foreground mt-1">
            API kalitlaringizni va login ma'lumotlaringizni boshqaring
          </p>
        </div>
        <Button variant="outline" onClick={() => refetchCreds()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Yangilash
        </Button>
      </div>

      {/* Security Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Sizning ma'lumotlaringiz shifrlangan holda saqlanadi. API kalitlaringiz xavfsiz.
        </AlertDescription>
      </Alert>

      {/* Marketplaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(marketplaces).map(([key, config]) => {
          const marketplace = config as MarketplaceConfig;
          const isConnected = isMarketplaceConnected(key);
          const credStatus = getCredentialStatus(key);

          return (
            <Card key={key} className={`${isConnected ? 'border-green-300 bg-green-50/50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{marketplace.icon}</span>
                    {marketplace.name}
                  </CardTitle>
                  {isConnected ? (
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ulangan
                    </Badge>
                  ) : (
                    <Badge variant="outline">Ulanmagan</Badge>
                  )}
                </div>
                <CardDescription>
                  {marketplace.auth_type === 'api_key' ? 'API kalit' : 'OAuth'} orqali ulanish
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Connection Status */}
                {credStatus && (
                  <div className="text-sm space-y-1 bg-white p-3 rounded-lg border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">API kalit:</span>
                      <span>{credStatus.has_api_key ? '✅ Bor' : '❌ Yo\'q'}</span>
                    </div>
                    {credStatus.has_login && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Login:</span>
                        <span>{credStatus.login_masked}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yangilangan:</span>
                      <span className="text-xs">{new Date(credStatus.updated_at).toLocaleDateString('uz')}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Dialog open={selectedMarketplace === key} onOpenChange={(open) => {
                    if (open) {
                      setSelectedMarketplace(key);
                      setFormData({});
                      setTestResult(null);
                    } else {
                      setSelectedMarketplace(null);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="flex-1" variant={isConnected ? 'outline' : 'default'}>
                        <Key className="w-4 h-4 mr-2" />
                        {isConnected ? 'Yangilash' : 'Ulash'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <span className="text-2xl">{marketplace.icon}</span>
                          {marketplace.name} sozlamalari
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        {/* API Key */}
                        <div className="space-y-2">
                          <Label>API Kalit</Label>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="API kalitingizni kiriting"
                            value={formData.api_key || ''}
                            onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                          />
                        </div>

                        {/* Login (optional for some marketplaces) */}
                        <div className="space-y-2">
                          <Label>Login (telefon raqami)</Label>
                          <Input
                            placeholder="+998901234567"
                            value={formData.login || ''}
                            onChange={(e) => setFormData({...formData, login: e.target.value})}
                          />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                          <Label>Parol</Label>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Parolingizni kiriting"
                              value={formData.password || ''}
                              onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>

                        {/* Additional fields for Yandex */}
                        {key === 'yandex' && (
                          <>
                            <div className="space-y-2">
                              <Label>Campaign ID</Label>
                              <Input
                                placeholder="Campaign ID"
                                value={formData.campaign_id || ''}
                                onChange={(e) => setFormData({...formData, campaign_id: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Client ID</Label>
                              <Input
                                placeholder="Client ID"
                                value={formData.client_id || ''}
                                onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                              />
                            </div>
                          </>
                        )}

                        {/* Test Result */}
                        {testResult && (
                          <Alert variant={testResult.success ? 'default' : 'destructive'}>
                            <AlertDescription>
                              {testResult.success ? '✅ ' : '❌ '}{testResult.message || testResult.error}
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Help Link */}
                        <a 
                          href={marketplace.api_docs} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          API dokumentatsiyasi <ExternalLink className="w-3 h-3" />
                        </a>

                        {/* Buttons */}
                        <div className="flex gap-2 pt-4">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => testMutation.mutate(key)}
                            disabled={testMutation.isPending}
                          >
                            {testMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Test
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={handleSaveCredentials}
                            disabled={saveMutation.isPending}
                          >
                            {saveMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Saqlash
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {isConnected && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteMutation.mutate(key)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>

                {/* Portal Link */}
                <a 
                  href={marketplace.portal_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  Seller Portal <ExternalLink className="w-3 h-3" />
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Connected Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Ulangan Marketplacelar</CardTitle>
        </CardHeader>
        <CardContent>
          {savedCredentials.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Hali hech qanday marketplace ulanmagan. Yuqoridagi marketplacelardan birini ulang.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {savedCredentials.map((cred: SavedCredential) => {
                const config = marketplaces[cred.marketplace] as MarketplaceConfig;
                return (
                  <Badge key={cred.marketplace} className="px-4 py-2 text-base">
                    <span className="mr-2">{config?.icon}</span>
                    {config?.name}
                    <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
