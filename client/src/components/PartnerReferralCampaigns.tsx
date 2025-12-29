// Partner Referral Campaigns - Faol konkurslarni ko'rish va qo'shilish
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Gift, Users, Target, DollarSign, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { ReferralCampaignTimer } from './ReferralCampaignTimer';
import { Badge } from '@/components/ui/badge';

export function PartnerReferralCampaigns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  // Get active campaigns
  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['referral-campaigns-active'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/referral-campaigns/active');
      return response.json();
    },
    refetchInterval: 60000 // Refresh every minute
  });

  // Get my stats for selected campaign
  const { data: myStats } = useQuery({
    queryKey: ['referral-campaign-stats', selectedCampaign],
    queryFn: async () => {
      if (!selectedCampaign) return null;
      const response = await apiRequest('GET', `/api/referral-campaigns/my-stats/${selectedCampaign}`);
      return response.json();
    },
    enabled: !!selectedCampaign,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Join campaign mutation
  const joinMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await apiRequest('POST', `/api/referral-campaigns/join/${campaignId}`);
      return response.json();
    },
    onSuccess: (data, campaignId) => {
      toast({
        title: '✅ Konkursga qo\'shildingiz!',
        description: 'Endi taklif qilingan hamkorlar hisoblanadi'
      });
      setSelectedCampaign(campaignId);
      queryClient.invalidateQueries({ queryKey: ['referral-campaigns-active'] });
      queryClient.invalidateQueries({ queryKey: ['referral-campaign-stats', campaignId] });
    },
    onError: (error: any) => {
      toast({
        title: '❌ Xatolik',
        description: error.message || 'Konkursga qo\'shilishda xatolik',
        variant: 'destructive'
      });
    }
  });

  const campaigns = campaignsData?.campaigns || [];

  if (isLoading) {
    return <div>Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="w-6 h-6 text-purple-600" />
          Faol Konkurslar
        </h2>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Hozircha faol konkurslar yo'q
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {campaigns.map((campaign: any) => {
            const isParticipating = myStats?.participant?.status === 'participating' || 
                                   myStats?.participant?.status === 'winner';
            const isWinner = myStats?.participant?.status === 'winner';
            const stats = myStats?.stats || { referralsCount: 0, progress: 0, remaining: campaign.targetReferrals };

            return (
              <Card key={campaign.id} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold mb-1">{campaign.name}</h3>
                      {campaign.description && (
                        <p className="text-sm text-muted-foreground">{campaign.description}</p>
                      )}
                    </div>
                    {isWinner && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        G'olib!
                      </Badge>
                    )}
                    {isParticipating && !isWinner && (
                      <Badge variant="outline">
                        Ishtirok etmoqdasiz
                      </Badge>
                    )}
                  </div>

                  {/* Timer */}
                  <div className="mb-4">
                    <ReferralCampaignTimer
                      endDate={campaign.endDate}
                      targetReferrals={campaign.targetReferrals}
                      currentReferrals={stats.referralsCount}
                      bonusAmount={campaign.bonusAmount}
                      campaignName={campaign.name}
                    />
                  </div>

                  {/* My Stats (if participating) */}
                  {isParticipating && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Sizning Natijangiz
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{stats.referralsCount}</div>
                          <div className="text-xs text-muted-foreground">Taklif qilingan</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{stats.remaining}</div>
                          <div className="text-xs text-muted-foreground">Qolgan</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {isWinner ? `$${campaign.bonusAmount}` : '$0'}
                          </div>
                          <div className="text-xs text-muted-foreground">Bonus</div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${stats.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stats.progress.toFixed(1)}% bajarildi
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Campaign Info */}
                  <div className="grid grid-cols-4 gap-4 mb-4 pt-4 border-t">
                    <div className="text-center">
                      <Target className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                      <div className="text-sm font-bold">{campaign.targetReferrals}</div>
                      <div className="text-xs text-muted-foreground">Maqsad</div>
                    </div>
                    <div className="text-center">
                      <Users className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                      <div className="text-sm font-bold">{campaign.participants || 0}</div>
                      <div className="text-xs text-muted-foreground">Ishtirokchilar</div>
                    </div>
                    <div className="text-center">
                      <DollarSign className="w-5 h-5 mx-auto mb-1 text-green-600" />
                      <div className="text-sm font-bold">${campaign.bonusAmount}</div>
                      <div className="text-xs text-muted-foreground">Bonus</div>
                    </div>
                    <div className="text-center">
                      <Gift className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                      <div className="text-sm font-bold">{campaign.minTier}</div>
                      <div className="text-xs text-muted-foreground">Min Tarif</div>
                    </div>
                  </div>

                  {/* Join Button */}
                  {!isParticipating && (
                    <Button
                      onClick={() => {
                        setSelectedCampaign(campaign.id);
                        joinMutation.mutate(campaign.id);
                      }}
                      className="w-full"
                      disabled={joinMutation.isPending}
                    >
                      {joinMutation.isPending ? 'Qo\'shilmoqda...' : 'Konkursga Qo\'shilish'}
                    </Button>
                  )}

                  {isParticipating && !isWinner && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        💡 {stats.remaining} ta taklif qilingan hamkor qo'shish kerak g'olib bo'lish uchun!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

