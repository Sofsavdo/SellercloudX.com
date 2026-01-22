// Admin Remote Access Component - Admin hamkor kabinetini ochib sozlamalarni amalga oshirish
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Monitor, Settings, Package, Save, Loader2 } from 'lucide-react';

interface AdminRemoteAccessProps {
  partnerId: string;
  partnerName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminRemoteAccess({ partnerId, partnerName, isOpen, onClose }: AdminRemoteAccessProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});

  // Load partner data
  const loadPartnerData = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', `/api/admin/remote/partner/${partnerId}`);
      const data = await response.json();
      setPartnerData(data);
      setSettings({
        businessName: data.partner?.businessName || '',
        phone: data.partner?.phone || '',
        pricingTier: data.partner?.pricingTier || '',
        aiEnabled: data.partner?.aiEnabled || false
      });
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load products
  const loadProducts = async () => {
    try {
      const response = await apiRequest('GET', `/api/admin/remote/partner/${partnerId}/products`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error: any) {
      console.error('Load products error:', error);
    }
  };

  // Save settings
  const saveSettings = async () => {
    setLoading(true);
    try {
      await apiRequest('PUT', `/api/admin/remote/partner/${partnerId}/settings`, settings);
      toast({
        title: '✅ Sozlamalar saqlandi',
        description: 'Hamkor sozlamalari muvaffaqiyatli yangilandi'
      });
      loadPartnerData();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Open on mount
  useState(() => {
    if (isOpen && partnerId) {
      loadPartnerData();
      loadProducts();
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Remote Access - {partnerName}
          </DialogTitle>
        </DialogHeader>

        {loading && !partnerData ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Sozlamalar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Biznes Nomi</Label>
                  <Input
                    value={settings.businessName}
                    onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Telefon</Label>
                  <Input
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Tarif</Label>
                  <Input
                    value={settings.pricingTier}
                    onChange={(e) => setSettings({ ...settings, pricingTier: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <Button onClick={saveSettings} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Saqlash
                </Button>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Mahsulotlar ({products.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Narx: {product.price} so'm | Qoldiq: {product.stockQuantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

