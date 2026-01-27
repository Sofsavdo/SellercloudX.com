import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { RefreshCw, CheckCircle, Clock, AlertCircle, XCircle, Package, TrendingUp, Store } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

interface OfferStatus {
  offer_id: string;
  name: string;
  status: string;
  price: number;
  market_sku?: string;
}

interface DashboardStats {
  total: number;
  ready: number;
  in_moderation: number;
  need_content: number;
  rejected: number;
  other: number;
}

interface Campaign {
  domain: string;
  id: number;
  clientId: number;
  business: {
    id: number;
    name: string;
  };
}

export default function YandexDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [offers, setOffers] = useState<OfferStatus[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/yandex/dashboard/status?limit=100`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setOffers(data.offers || []);
        setLastUpdated(data.last_updated);
        
        // Also fetch campaigns
        const campaignsRes = await fetch(`${API_URL}/api/yandex/campaigns`);
        const campaignsData = await campaignsRes.json();
        if (campaignsData.success && campaignsData.campaigns) {
          setCampaigns(campaignsData.campaigns);
        }
      } else {
        toast({
          title: "Xatolik",
          description: data.error || "Ma'lumotlarni yuklab bo'lmadi",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Tarmoq xatosi",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchDashboardData]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      'READY': { color: 'bg-green-500', icon: <CheckCircle className="w-3 h-3" />, label: 'Tayyor' },
      'IN_MODERATION': { color: 'bg-yellow-500', icon: <Clock className="w-3 h-3" />, label: 'Moderatsiya' },
      'NEED_CONTENT': { color: 'bg-blue-500', icon: <AlertCircle className="w-3 h-3" />, label: 'Kontent kerak' },
      'REJECTED': { color: 'bg-red-500', icon: <XCircle className="w-3 h-3" />, label: 'Rad etildi' },
      'OTHER': { color: 'bg-gray-500', icon: <Package className="w-3 h-3" />, label: 'Boshqa' }
    };
    
    const config = statusMap[status] || statusMap['OTHER'];
    
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    if (!price) return '-';
    return new Intl.NumberFormat('uz-UZ').format(price) + ' UZS';
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const calculateReadyPercentage = () => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.ready / stats.total) * 100);
  };

  return (
    <div className="space-y-6 p-6" data-testid="yandex-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-yellow-500" />
            Yandex Market Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-vaqt mahsulotlar holati
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            data-testid="auto-refresh-btn"
          >
            {autoRefresh ? '⏸ Avtomatik yangilash' : '▶ Avtomatik yangilash'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
            data-testid="refresh-btn"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-slate-500">Jami mahsulotlar</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30">
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-green-600">{stats.ready}</div>
              <div className="text-sm text-green-600/70">✅ Sotuvga tayyor</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/30">
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-yellow-600">{stats.in_moderation}</div>
              <div className="text-sm text-yellow-600/70">⏳ Moderatsiyada</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30">
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-blue-600">{stats.need_content}</div>
              <div className="text-sm text-blue-600/70">📝 Kontent kerak</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30">
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-red-600/70">❌ Rad etildi</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Bar */}
      {stats && stats.total > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Sotuvga tayyorlik</span>
              <span className="text-green-600">{calculateReadyPercentage()}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={calculateReadyPercentage()} className="h-2" />
            <p className="text-xs text-slate-500 mt-2">
              {stats.ready} / {stats.total} mahsulot sotuvga tayyor
            </p>
          </CardContent>
        </Card>
      )}

      {/* Campaigns */}
      {campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
              Do'konlar ({campaigns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {campaigns.map((campaign, index) => (
                <div 
                  key={campaign.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <div className="font-medium text-slate-900 dark:text-white text-sm">
                    {campaign.business?.name || campaign.domain || `Do'kon ${index + 1}`}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    ID: {campaign.id}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Mahsulotlar ro'yxati</CardTitle>
              <CardDescription>
                Oxirgi yangilanish: {formatTime(lastUpdated)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {offers.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Mahsulotlar topilmadi</p>
              <p className="text-sm">Yangi mahsulot qo'shish uchun AI Scanner'dan foydalaning</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">SKU</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">Nomi</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">Status</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-slate-500">Narx</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">Market SKU</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer, index) => (
                    <tr 
                      key={offer.offer_id || index}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-2 text-sm font-mono text-slate-600 dark:text-slate-400">
                        {offer.offer_id?.substring(0, 15) || '-'}
                      </td>
                      <td className="py-3 px-2 text-sm text-slate-900 dark:text-white">
                        {offer.name || '-'}
                      </td>
                      <td className="py-3 px-2">
                        {getStatusBadge(offer.status)}
                      </td>
                      <td className="py-3 px-2 text-sm text-right text-slate-900 dark:text-white font-medium">
                        {formatPrice(offer.price)}
                      </td>
                      <td className="py-3 px-2 text-sm text-slate-500">
                        {offer.market_sku || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xl">
              💡
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Maslahat</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Mahsulot sifat indeksini 100 ballga yetkazish uchun 6 ta infografika rasm va 8 soniyalik video qo'shing. 
                AI Scanner bilan yangi mahsulot qo'shganingizda avtomatik generatsiya qilinadi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
