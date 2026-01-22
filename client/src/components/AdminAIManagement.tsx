// Admin AI Management Component
// AI Manager sozlamalari, monitoring, cost tracking

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Brain, 
  DollarSign, 
  Activity, 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Zap,
  Loader2
} from 'lucide-react';

export function AdminAIManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);

  // Get AI usage statistics
  const { data: usageStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-ai-usage-stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/ai/usage-stats');
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Get cost breakdown
  const { data: costBreakdown } = useQuery({
    queryKey: ['admin-ai-cost-breakdown'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/ai/cost-breakdown');
      return response.json();
    }
  });

  // Get active jobs
  const { data: jobsData } = useQuery({
    queryKey: ['admin-ai-jobs'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/ai/jobs/active');
      return response.json();
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Get partner AI config
  const { data: partnerConfig } = useQuery({
    queryKey: ['admin-ai-partner-config', selectedPartner],
    queryFn: async () => {
      if (!selectedPartner) return null;
      const response = await apiRequest('GET', `/api/admin/ai/partner/${selectedPartner}/config`);
      return response.json();
    },
    enabled: !!selectedPartner
  });

  // Get partner errors
  const { data: partnerErrors } = useQuery({
    queryKey: ['admin-ai-partner-errors', selectedPartner],
    queryFn: async () => {
      if (!selectedPartner) return null;
      const response = await apiRequest('GET', `/api/admin/ai/partner/${selectedPartner}/errors`);
      return response.json();
    },
    enabled: !!selectedPartner
  });

  // Update partner config
  const updateConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `/api/admin/ai/partner/${selectedPartner}/config`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Sozlamalar yangilandi' });
      queryClient.invalidateQueries({ queryKey: ['admin-ai-partner-config', selectedPartner] });
    },
    onError: (error: Error) => {
      toast({ title: '❌ Xatolik', description: error.message, variant: 'destructive' });
    }
  });

  // Fix AI issue
  const fixIssueMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', `/api/admin/ai/partner/${selectedPartner}/fix`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Muammo hal qilindi' });
      queryClient.invalidateQueries({ queryKey: ['admin-ai-partner-errors', selectedPartner] });
    },
    onError: (error: Error) => {
      toast({ title: '❌ Xatolik', description: error.message, variant: 'destructive' });
    }
  });

  // Clear cache
  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/ai/cache/clear');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Cache tozalandi' });
    }
  });

  if (statsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Yuklanmoqda...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami Xarajat</p>
                <p className="text-2xl font-bold">
                  ${usageStats?.totalCost?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {costBreakdown?.total?.totalRequests || 0} so'rov
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami Tokens</p>
                <p className="text-2xl font-bold">
                  {(usageStats?.totalTokens || 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  O'rtacha: {Math.round((usageStats?.totalTokens || 0) / (usageStats?.totalRequests || 1))} per so'rov
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktiv Vazifalar</p>
                <p className="text-2xl font-bold">{jobsData?.activeJobs || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Queue: {jobsData?.queueStatus || 'unknown'}
                </p>
              </div>
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">O'rtacha Latency</p>
                <p className="text-2xl font-bold">
                  {Math.round(usageStats?.averageLatency || 0)}ms
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tez ishlayapti
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Umumiy</TabsTrigger>
          <TabsTrigger value="costs">Xarajatlar</TabsTrigger>
          <TabsTrigger value="partners">Hamkorlar</TabsTrigger>
          <TabsTrigger value="settings">Sozlamalar</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Model Taqsimoti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Xarajat</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>So'rovlar</TableHead>
                    <TableHead>Foiz</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(usageStats?.byModel || {}).map(([model, data]: [string, any]) => {
                    const percentage = ((data.cost / (usageStats?.totalCost || 1)) * 100).toFixed(1);
                    return (
                      <TableRow key={model}>
                        <TableCell>
                          <Badge variant="outline">{model}</Badge>
                        </TableCell>
                        <TableCell>${data.cost.toFixed(2)}</TableCell>
                        <TableCell>{data.tokens.toLocaleString()}</TableCell>
                        <TableCell>{data.requests}</TableCell>
                        <TableCell>{percentage}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Hamkorlar (Xarajat bo'yicha)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hamkor ID</TableHead>
                    <TableHead>Xarajat</TableHead>
                    <TableHead>So'rovlar</TableHead>
                    <TableHead>O'rtacha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costBreakdown?.byPartner?.map((partner: any) => (
                    <TableRow key={partner.partnerId}>
                      <TableCell>{partner.partnerId}</TableCell>
                      <TableCell>${partner.cost.toFixed(2)}</TableCell>
                      <TableCell>{partner.requests}</TableCell>
                      <TableCell>${(partner.cost / partner.requests).toFixed(4)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent value="partners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hamkor AI Sozlamalari</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hamkor ID</Label>
                <Input
                  value={selectedPartner || ''}
                  onChange={(e) => setSelectedPartner(e.target.value)}
                  placeholder="Hamkor ID kiriting"
                />
              </div>

              {selectedPartner && partnerConfig && (
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <Label>AI Manager Faol</Label>
                    <Badge variant={partnerConfig.aiEnabled ? 'default' : 'secondary'}>
                      {partnerConfig.aiEnabled ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </div>

                  {partnerErrors?.errors?.length > 0 && (
                    <div className="space-y-2">
                      <Label>Xatolar</Label>
                      {partnerErrors.errors.map((error: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <div>
                            <p className="text-sm font-medium">{error.error_type}</p>
                            <p className="text-xs text-muted-foreground">{error.error_message}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => fixIssueMutation.mutate({ issueType: error.error_type })}
                            disabled={fixIssueMutation.isPending}
                          >
                            {fixIssueMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Tuzatish'
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                AI Manager Sozlamalari
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Cache Tozalash</Label>
                  <p className="text-sm text-muted-foreground">
                    Barcha AI cache ma'lumotlarini tozalash
                  </p>
                </div>
                <Button
                  onClick={() => clearCacheMutation.mutate()}
                  disabled={clearCacheMutation.isPending}
                  variant="outline"
                >
                  {clearCacheMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Tozalanmoqda...
                    </>
                  ) : (
                    'Cache Tozalash'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

