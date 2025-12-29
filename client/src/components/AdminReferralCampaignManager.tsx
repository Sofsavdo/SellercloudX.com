// Admin Referral Campaign Manager - Konkurslar yaratish va boshqarish
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Gift, Plus, Trash2, Edit, Users, DollarSign, Clock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { ReferralCampaignTimer } from './ReferralCampaignTimer';

export function AdminReferralCampaignManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    durationDays: 3,
    targetReferrals: 10,
    bonusAmount: 1000,
    minTier: 'basic',
    minSubscriptionMonths: 1
  });

  // Get all campaigns
  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['referral-campaigns-all'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/referral-campaigns/all');
      return response.json();
    }
  });

  const campaigns = campaignsData?.campaigns || [];

  // Create campaign mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/referral-campaigns/create', {
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: '✅ Konkurs yaratildi',
        description: 'Yangi konkurs muvaffaqiyatli yaratildi'
      });
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        durationDays: 3,
        targetReferrals: 10,
        bonusAmount: 1000,
        minTier: 'basic',
        minSubscriptionMonths: 1
      });
      queryClient.invalidateQueries({ queryKey: ['referral-campaigns-all'] });
    },
    onError: (error: any) => {
      toast({
        title: '❌ Xatolik',
        description: error.message || 'Konkurs yaratishda xatolik',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return <div>Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="w-6 h-6" />
          Referral Konkurslar
        </h2>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Yangi Konkurs
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Yangi Konkurs Yaratish</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Konkurs Nomi *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Masalan: 3 kun ichida 10 ta hamkor uchun $1000"
                  required
                />
              </div>

              <div>
                <Label>Tavsif</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Konkurs haqida qo'shimcha ma'lumot"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Davomiyligi (kun) *</Label>
                  <Input
                    type="number"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({...formData, durationDays: parseInt(e.target.value)})}
                    min={1}
                    required
                  />
                </div>

                <div>
                  <Label>Maqsad (takliflar soni) *</Label>
                  <Input
                    type="number"
                    value={formData.targetReferrals}
                    onChange={(e) => setFormData({...formData, targetReferrals: parseInt(e.target.value)})}
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bonus Miqdori ($) *</Label>
                  <Input
                    type="number"
                    value={formData.bonusAmount}
                    onChange={(e) => setFormData({...formData, bonusAmount: parseFloat(e.target.value)})}
                    min={0}
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <Label>Minimal Tarif *</Label>
                  <select
                    value={formData.minTier}
                    onChange={(e) => setFormData({...formData, minTier: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="basic">Basic ($69/oy)</option>
                    <option value="starter_pro">Starter Pro ($349/oy)</option>
                    <option value="professional">Professional ($899/oy)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Minimal Muddat (oy) *</Label>
                <Input
                  type="number"
                  value={formData.minSubscriptionMonths}
                  onChange={(e) => setFormData({...formData, minSubscriptionMonths: parseInt(e.target.value)})}
                  min={1}
                  max={12}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimal necha oyga ulanishi kerak (1, 3, 6, 12)
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Yaratilmoqda...' : 'Yaratish'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Bekor qilish
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      <div className="grid gap-4">
        {campaigns.map((campaign: any) => {
          const endDate = new Date(campaign.endDate);
          const now = new Date();
          const isActive = campaign.status === 'active' && endDate > now;

          return (
            <Card key={campaign.id} className={isActive ? 'border-purple-300' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-1">{campaign.name}</h3>
                    {campaign.description && (
                      <p className="text-sm text-muted-foreground">{campaign.description}</p>
                    )}
                  </div>
                  <Badge variant={isActive ? 'default' : 'secondary'}>
                    {campaign.status}
                  </Badge>
                </div>

                {isActive && (
                  <ReferralCampaignTimer
                    endDate={Math.floor(endDate.getTime() / 1000)}
                    targetReferrals={campaign.targetReferrals}
                    currentReferrals={campaign.participants || 0}
                    bonusAmount={campaign.bonusAmount}
                    campaignName={campaign.name}
                  />
                )}

                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <Users className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <div className="text-sm font-bold">{campaign.participants || 0}</div>
                    <div className="text-xs text-muted-foreground">Ishtirokchilar</div>
                  </div>
                  <div className="text-center">
                    <Gift className="w-5 h-5 mx-auto mb-1 text-green-600" />
                    <div className="text-sm font-bold">{campaign.winners || 0}</div>
                    <div className="text-xs text-muted-foreground">G'oliblar</div>
                  </div>
                  <div className="text-center">
                    <Target className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                    <div className="text-sm font-bold">{campaign.targetReferrals}</div>
                    <div className="text-xs text-muted-foreground">Maqsad</div>
                  </div>
                  <div className="text-center">
                    <DollarSign className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                    <div className="text-sm font-bold">${campaign.bonusAmount}</div>
                    <div className="text-xs text-muted-foreground">Bonus</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {campaigns.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Hozircha konkurslar yo'q. Yangi konkurs yarating!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

