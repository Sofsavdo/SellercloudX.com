// Partner Payments Dashboard - 2026 Revenue Share Model
// Shows monthly sales, debt calculation, payment history, and sales growth comparison

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/currency';
import {
  DollarSign, TrendingUp, TrendingDown, Calendar, Clock,
  CreditCard, AlertTriangle, CheckCircle, Building, Copy,
  ArrowUpRight, ArrowDownRight, Percent, Calculator, History,
  ShoppingCart, Globe, Wallet, Lock, Unlock, RefreshCw
} from 'lucide-react';

interface PaymentDashboardProps {
  partner: any;
}

const USD_TO_UZS = 12600;

export default function PartnerPaymentsDashboard({ partner }: PaymentDashboardProps) {
  const { toast } = useToast();

  // Fetch billing summary from API
  const { data: billingData, isLoading, refetch } = useQuery({
    queryKey: ['billing-summary'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/billing/revenue-share/summary');
        const data = await res.json();
        return data.success ? data.data : null;
      } catch (error) {
        console.error('Billing fetch error:', error);
        return null;
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Calculate values from partner or API response
  const setupFeeUzs = (billingData?.setupFeeUsd || partner?.setupFeeUsd || 699) * USD_TO_UZS;
  const monthlyFeeUzs = (billingData?.monthlyFeeUsd || partner?.monthlyFeeUsd || 499) * USD_TO_UZS;
  const revenueSharePercent = billingData?.revenueSharePercent || partner?.revenueSharePercent || 0.04;
  const totalDebt = billingData?.currentDebt || partner?.totalDebtUzs || 0;
  const isBlocked = billingData?.isBlocked || (partner?.blockedUntil && new Date(partner.blockedUntil) > new Date());
  const setupPaid = billingData?.setupPaid || partner?.setupPaid || false;
  const salesBeforeUs = billingData?.salesBeforeUs || partner?.salesBeforeUs || 0;
  const currentMonthSales = billingData?.currentMonthSales || 0;
  const salesGrowthPercent = billingData?.salesGrowthPercent || 0;
  const paymentHistory = billingData?.paymentHistory || [];
  const monthlyBreakdown = billingData?.monthlyBreakdown || [];

  // Calculate current month data
  const currentMonthData = {
    totalSales: currentMonthSales,
    orders: monthlyBreakdown[0]?.totalOrders || 0,
    revenueShare: Math.round(currentMonthSales * revenueSharePercent),
    monthlyFee: monthlyFeeUzs,
    totalDue: Math.round(currentMonthSales * revenueSharePercent) + monthlyFeeUzs
  };

  const formatUzs = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Nusxalandi!', description: text });
  };

  // Start trial handler
  const handleStartTrial = async () => {
    try {
      const res = await apiRequest('POST', '/api/billing/revenue-share/start-trial');
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Muvaffaqiyat!', description: '7 kunlik bepul sinov boshlandi!' });
        refetch();
      } else {
        toast({ title: 'Xatolik', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Xatolik', description: 'Trial boshlanmadi', variant: 'destructive' });
    }
  };

  // Bank details for manual payment
  const bankDetails = {
    bankName: 'Ipak Yo\'li Bank',
    accountNumber: '20208000XXXXXXXXXX',
    mfo: '00XXX',
    inn: '123456789',
    companyName: 'SellerCloudX LLC',
    purpose: `To'lov: Partner ID ${partner?.id}`
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Blocking Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">To'lovlar va Qarz</h2>
          <p className="text-muted-foreground">Oylik savdo va to'lov holati</p>
        </div>
        
        {isBlocked ? (
          <Badge className="bg-destructive/10 text-destructive border-destructive/30 px-4 py-2">
            <Lock className="w-4 h-4 mr-2" />
            Akkount Bloklangan
          </Badge>
        ) : (
          <Badge className="bg-success/10 text-success border-success/30 px-4 py-2">
            <Unlock className="w-4 h-4 mr-2" />
            Akkount Faol
          </Badge>
        )}
      </div>

      {/* Blocking Warning */}
      {isBlocked && (
        <Card className="border-2 border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-destructive flex-shrink-0" />
              <div>
                <p className="font-bold text-destructive">Akkountingiz vaqtincha bloklangan!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sabab: {partner?.blockReason || 'To\'lov kechiktirilgan'}. 
                  Yangi mahsulot yaratish va AI xizmatlari to'xtatilgan.
                  To'lovni amalga oshiring va akkauntingizni qayta faollashtiring.
                </p>
                <Button 
                  className="mt-3 bg-destructive hover:bg-destructive/90"
                  onClick={() => window.open('https://t.me/sellercloudx_support', '_blank')}
                >
                  Admin bilan bog'lanish
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Current Debt */}
        <Card className={totalDebt > 0 ? 'border-warning/50' : 'border-success/50'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Joriy Qarz</p>
                <p className={`text-2xl font-black ${totalDebt > 0 ? 'text-warning' : 'text-success'}`}>
                  {formatUzs(totalDebt)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                totalDebt > 0 ? 'bg-warning/10' : 'bg-success/10'
              }`}>
                <Wallet className={`w-6 h-6 ${totalDebt > 0 ? 'text-warning' : 'text-success'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* This Month Sales */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bu Oy Savdo</p>
                <p className="text-2xl font-black text-primary">
                  {formatUzs(currentMonthSales)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Share */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">4% Ulush</p>
                <p className="text-2xl font-black">
                  {formatUzs(currentMonthData.revenueShare)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Percent className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Growth */}
        <Card className={salesGrowthPercent >= 0 ? 'border-success/50' : 'border-destructive/50'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Savdo O'sishi</p>
                <p className={`text-2xl font-black ${salesGrowthPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {salesGrowthPercent >= 0 ? '+' : ''}{salesGrowthPercent}%
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                salesGrowthPercent >= 0 ? 'bg-success/10' : 'bg-destructive/10'
              }`}>
                {salesGrowthPercent >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-success" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-destructive" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Comparison Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Savdo Taqqoslash (60-kun kafolat)
          </CardTitle>
          <CardDescription>
            Bizdan oldin va biz bilan savdolaringiz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Before Us */}
            <div className="text-center p-4 bg-muted/30 rounded-xl">
              <p className="text-sm text-muted-foreground mb-2">Bizdan OLDIN (oylik)</p>
              <p className="text-3xl font-black">{formatUzs(salesBeforeUs)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Ro'yxatdan o'tish vaqtidagi savdo
              </p>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <div className={`p-4 rounded-full ${salesGrowthPercent >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                {salesGrowthPercent >= 0 ? (
                  <ArrowUpRight className="w-8 h-8 text-success" />
                ) : (
                  <ArrowDownRight className="w-8 h-8 text-destructive" />
                )}
              </div>
            </div>

            {/* With Us */}
            <div className={`text-center p-4 rounded-xl ${
              salesGrowthPercent >= 0 ? 'bg-success/10 border border-success/30' : 'bg-destructive/10 border border-destructive/30'
            }`}>
              <p className="text-sm text-muted-foreground mb-2">Biz BILAN (bu oy)</p>
              <p className={`text-3xl font-black ${salesGrowthPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatUzs(currentMonthSales)}
              </p>
              <Badge className={`mt-2 ${salesGrowthPercent >= 0 ? 'bg-success text-white' : 'bg-destructive text-white'}`}>
                {salesGrowthPercent >= 0 ? '+' : ''}{salesGrowthPercent}% o'sish
              </Badge>
            </div>
          </div>

          {/* 60-day guarantee note */}
          {salesGrowthPercent < 0 && (
            <div className="mt-4 p-3 bg-warning/10 rounded-lg border border-warning/30">
              <p className="text-sm">
                <AlertTriangle className="w-4 h-4 inline mr-2 text-warning" />
                <strong>60-kun kafolati:</strong> Agar savdo o'smasa, oylik to'lovning bir qismini qaytarib olishingiz mumkin.
                <Button variant="link" className="p-0 h-auto ml-2 text-primary">
                  Batafsil
                </Button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Joriy Hisob</TabsTrigger>
          <TabsTrigger value="history">To'lov Tarixi</TabsTrigger>
          <TabsTrigger value="payment">To'lov Qilish</TabsTrigger>
        </TabsList>

        {/* Current Bill */}
        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>Bu Oyning Hisobi</CardTitle>
              <CardDescription>
                {new Date().toLocaleString('uz-UZ', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                    Jami savdo
                  </span>
                  <span className="font-bold">{formatUzs(currentMonthData.totalSales)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-muted-foreground" />
                    4% Revenue Share
                  </span>
                  <span className="font-bold">{formatUzs(currentMonthData.revenueShare)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Oylik to'lov ($499)
                  </span>
                  <span className="font-bold">{formatUzs(monthlyFeeUzs)}</span>
                </div>

                {!setupPaid && (
                  <div className="flex justify-between items-center p-3 bg-warning/10 rounded-lg border border-warning/30">
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-warning" />
                      Setup to'lov ($699) - bir martalik
                    </span>
                    <span className="font-bold text-warning">{formatUzs(setupFeeUzs)}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold">JAMI TO'LOV:</span>
                  <span className="text-2xl font-black text-primary">
                    {formatUzs(currentMonthData.totalDue + (!setupPaid ? setupFeeUzs : 0))}
                  </span>
                </div>
              </div>

              <Button className="w-full" size="lg">
                <CreditCard className="w-5 h-5 mr-2" />
                To'lov Qilish
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                To'lov Tarixi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentHistory.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payment.status === 'completed' ? 'bg-success/10' : 'bg-warning/10'
                      }`}>
                        {payment.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <Clock className="w-5 h-5 text-warning" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {payment.paymentType === 'monthly_fee' ? 'Oylik to\'lov' : 
                           payment.paymentType === 'revenue_share' ? 'Revenue Share' :
                           payment.paymentType === 'setup_fee' ? 'Setup to\'lov' : payment.paymentType}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.createdAt * 1000).toLocaleDateString('uz-UZ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatUzs(payment.amountUzs)}</p>
                      <Badge variant="outline" className="text-xs">
                        {(payment.paymentMethod || 'N/A').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}

                {paymentHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>To'lov tarixi mavjud emas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Make Payment */}
        <TabsContent value="payment">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Online Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Online To'lov
                </CardTitle>
                <CardDescription>Click yoki Payme orqali</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full h-14 bg-[#00C389] hover:bg-[#00B078]">
                  <img src="https://click.uz/img/logo.svg" alt="Click" className="h-6 mr-2 brightness-0 invert" />
                  Click orqali to'lash
                </Button>
                
                <Button className="w-full h-14 bg-[#00CCCC] hover:bg-[#00B3B3]">
                  <span className="font-bold text-lg">Payme</span>
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  To'lov avtomatik tasdiqlanadi
                </p>
              </CardContent>
            </Card>

            {/* Manual Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  Bank O'tkazmasi / Naqd
                </CardTitle>
                <CardDescription>Rekvizitlarni ko'chirib oling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(bankDetails).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {key === 'bankName' ? 'Bank nomi' :
                         key === 'accountNumber' ? 'Hisob raqami' :
                         key === 'mfo' ? 'MFO' :
                         key === 'inn' ? 'STIR' :
                         key === 'companyName' ? 'Kompaniya' :
                         key === 'purpose' ? 'Maqsad' : key}
                      </p>
                      <p className="font-mono text-sm">{value}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(value)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    To'lovni amalga oshirgandan so'ng admin tasdiqlashi kerak
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('https://t.me/sellercloudx_support', '_blank')}
                  >
                    Admin bilan bog'lanish
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Marketplace Sales Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Marketplace Savdolari (Real-time)
          </CardTitle>
          <CardDescription>
            Yandex Market dan avtomatik yuklanadi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Yandex Market */}
            <div className="p-4 bg-[#FFCC00]/10 rounded-xl border border-[#FFCC00]/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#FFCC00] rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-black" />
                </div>
                <span className="font-semibold">Yandex Market</span>
              </div>
              <p className="text-2xl font-black">{formatUzs(currentMonthSales)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {currentMonthData.orders} buyurtma
              </p>
            </div>

            {/* Uzum (coming soon) */}
            <div className="p-4 bg-muted/30 rounded-xl border border-dashed border-border opacity-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">Uzum Market</span>
              </div>
              <p className="text-lg font-medium text-muted-foreground">Tez kunda...</p>
            </div>

            {/* Total */}
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">JAMI</span>
              </div>
              <p className="text-2xl font-black text-primary">{formatUzs(currentMonthSales)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Barcha marketplace
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Oxirgi yangilanish: {new Date().toLocaleString('uz-UZ')}
            </span>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Yangilash
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
