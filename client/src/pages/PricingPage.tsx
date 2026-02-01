// 2026 PREMIUM PRICING PAGE - SellerCloudX
// Revenue Share Model with 60-Day Guarantee

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, ArrowRight, CheckCircle, Star, TrendingUp, Crown,
  Shield, Users, DollarSign, Rocket, MessageCircle, 
  Brain, Target, ShoppingCart, Award, ChevronDown, ChevronUp,
  Calculator, Percent, Calendar, Lock, Zap, Globe, Phone, Mail
} from 'lucide-react';

// USD to UZS rate (approximate)
const USD_TO_UZS = 12600;

export default function PricingPage() {
  const [, setLocation] = useLocation();
  const [showFaq, setShowFaq] = useState<number | null>(null);
  const [calculatorSales, setCalculatorSales] = useState(50000000); // 50M UZS default

  // Calculate revenue share
  const calculateShare = (sales: number, percent: number) => Math.round(sales * percent);
  const monthlyFeeUzs = 499 * USD_TO_UZS; // $499 in UZS
  const setupFeeUzs = 699 * USD_TO_UZS; // $699 in UZS

  const formatUzs = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  const formatUsd = (amount: number) => {
    return '$' + new Intl.NumberFormat('en-US').format(amount);
  };

  const faqs = [
    {
      q: '60 kunlik kafolat qanday ishlaydi?',
      a: 'Agar 60 kun ichida savdolaringiz o\'smasa, oylik to\'lovning bir qismini qaytarib beramiz. Biz sizning muvaffaqiyatingizga ishonchimiz komil!'
    },
    {
      q: '4% revenue share qanday hisoblanadi?',
      a: 'Har oyning oxirida marketplace (Yandex) dan jami savdolaringiz yuklab olinadi va 4% hisob-kitob qilinadi. Masalan: 100M so\'m savdo = 4M so\'m ulush.'
    },
    {
      q: 'To\'lovni qanday amalga oshirish mumkin?',
      a: 'Click, Payme yoki bank o\'tkazmasi orqali to\'lashingiz mumkin. Naqd to\'lovlar ham qabul qilinadi - admin tasdiqlaydi.'
    },
    {
      q: 'Agar to\'lovni kechiktirsam nima bo\'ladi?',
      a: '7 kundan ortiq kechikish akkauntni vaqtincha bloklaydi. Yangi mahsulot yaratish to\'xtatiladi, lekin mavjud buyurtmalar davom etadi.'
    },
    {
      q: 'Individual tarif nima?',
      a: 'Katta hajmli sotuvchilar uchun maxsus shartlar: past % (2% dan), yuqori setup va premium xizmat. Biz bilan bog\'laning!'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation('/')}>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-[hsl(250,84%,50%)] rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black text-gradient-primary">SellerCloudX</span>
                <div className="text-xs text-muted-foreground">AI-Powered Marketplace</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setLocation('/partner-registration')}>
                Ro'yxatdan o'tish
              </Button>
              <Button 
                onClick={() => setLocation('/login')}
                className="bg-gradient-to-r from-primary to-[hsl(250,84%,50%)]"
              >
                Kirish
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/3 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-[hsl(250,84%,54%)]/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-1/3 -left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-[hsl(45,93%,47%)]/8 to-primary/5 rounded-full blur-3xl animate-float-delayed" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <Badge className="mb-6 bg-gradient-to-r from-[hsl(45,93%,47%)] to-[hsl(38,92%,55%)] text-black px-6 py-2.5 text-base font-bold shadow-lg">
            <Crown className="w-4 h-4 mr-2" />
            2026 PREMIUM MODEL
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            <span className="text-gradient-primary">Faqat Natija Uchun</span>
            <br />
            <span className="text-foreground">To'lov Qiling</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Biz sizning savdolaringizdan 4% olamiz. Savdo bo'lmasa - to'lov yo'q.
            <br />
            <span className="text-primary font-bold">60 kunlik savdo o'sishi kafolati!</span>
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">60-kun kafolat</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
              <Percent className="w-5 h-5" />
              <span className="font-semibold">4% savdodan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Pricing Card */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Premium Tariff */}
            <Card className="border-2 border-[hsl(45,93%,47%)]/50 shadow-2xl shadow-[hsl(45,93%,47%)]/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[hsl(45,93%,47%)]/20 to-transparent rounded-bl-full" />
              
              <CardHeader className="text-center pb-2">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-[hsl(45,93%,47%)] to-[hsl(38,92%,55%)] text-black px-6 py-2 font-bold shadow-lg">
                    <Star className="w-4 h-4 mr-2" />
                    PREMIUM
                  </Badge>
                </div>
                
                <div className="w-20 h-20 mx-auto mt-6 mb-4 rounded-2xl bg-gradient-to-br from-[hsl(45,93%,47%)] to-[hsl(38,92%,55%)] flex items-center justify-center shadow-lg">
                  <Crown className="w-10 h-10 text-black" />
                </div>
                
                <CardTitle className="text-3xl font-black">Premium Tarif</CardTitle>
                <p className="text-muted-foreground mt-2">To'liq AI avtomatizatsiya + kafolat</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Pricing Breakdown */}
                <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Bir martalik sozlash:</span>
                    <span className="text-2xl font-black text-foreground">{formatUsd(699)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Oylik to'lov:</span>
                    <span className="text-2xl font-black text-foreground">{formatUsd(499)}/oy</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-muted-foreground">Savdodan ulush:</span>
                    <span className="text-2xl font-black text-[hsl(45,93%,40%)]">4%</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {[
                    '60 kunlik savdo o\'sishi kafolati',
                    'Cheksiz AI kartochka yaratish',
                    'Barcha marketplace integratsiya',
                    'Trend Hunter FULL access',
                    'Sof foyda analitikasi',
                    'Priority 24/7 support',
                    'API access',
                    'Telegram bot integratsiya'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Guarantee Badge */}
                <div className="p-4 bg-success/10 rounded-xl border border-success/30">
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-success" />
                    <div>
                      <p className="font-bold text-success">60-KUN KAFOLAT</p>
                      <p className="text-sm text-muted-foreground">
                        Savdo o'smasa, oylik to'lovning bir qismini qaytaramiz
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-[hsl(45,93%,47%)] to-[hsl(38,92%,55%)] hover:from-[hsl(45,93%,50%)] hover:to-[hsl(38,92%,58%)] text-black font-bold text-lg py-6"
                  onClick={() => setLocation('/partner-registration?tariff=premium')}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Hoziroq Boshlash
                </Button>
              </CardContent>
            </Card>

            {/* Individual Tariff */}
            <Card className="border-2 border-primary/30 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
              
              <CardHeader className="text-center pb-2">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-[hsl(250,84%,50%)] flex items-center justify-center shadow-lg mt-6">
                  <Users className="w-10 h-10 text-white" />
                </div>
                
                <CardTitle className="text-3xl font-black">Individual Tarif</CardTitle>
                <p className="text-muted-foreground mt-2">Katta sotuvchilar uchun maxsus</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Custom Pricing */}
                <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/20">
                  <p className="text-muted-foreground mb-2">Sizning hajmingizga mos</p>
                  <p className="text-4xl font-black text-primary">SHAXSIY NARX</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Setup: {formatUsd(1599)}+ | Share: 2% dan
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {[
                    'Premium ning barcha imkoniyatlari',
                    'Pastroq % ulush (2% dan)',
                    'Dedicated account manager',
                    'Custom integrations',
                    'SLA kafolati',
                    'On-site training',
                    'Multi-brand support',
                    'Enterprise analytics'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* For whom */}
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="font-semibold mb-2">Kimlar uchun:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Oylik savdo $50,000+ bo'lgan sotuvchilar</li>
                    <li>• Ko'p brendli bizneslar</li>
                    <li>• Maxsus talablar bo'lgan kompaniyalar</li>
                  </ul>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-primary to-[hsl(250,84%,50%)] text-white font-bold text-lg py-6"
                  onClick={() => window.open('https://t.me/sellercloudx_support', '_blank')}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Shaxsiy Taklif Olish
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 inline mr-1" />
                  +998 90 123 45 67
                  <span className="mx-2">|</span>
                  <Mail className="w-4 h-4 inline mr-1" />
                  sales@sellercloudx.com
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Revenue Calculator */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary">
              <Calculator className="w-4 h-4 mr-2" />
              KALKULYATOR
            </Badge>
            <h2 className="text-4xl font-black">Qancha to'laysiz?</h2>
            <p className="text-muted-foreground mt-2">Oylik savdolaringizni kiriting</p>
          </div>

          <Card className="p-8">
            <div className="space-y-8">
              {/* Slider */}
              <div>
                <label className="block text-sm font-medium mb-4">
                  Oylik savdo: <span className="text-2xl font-black text-primary">{formatUzs(calculatorSales)}</span>
                </label>
                <input
                  type="range"
                  min={10000000}
                  max={500000000}
                  step={5000000}
                  value={calculatorSales}
                  onChange={(e) => setCalculatorSales(parseInt(e.target.value))}
                  className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>10M</span>
                  <span>500M</span>
                </div>
              </div>

              {/* Calculations */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-primary/5 rounded-xl text-center">
                  <p className="text-sm text-muted-foreground mb-1">4% Revenue Share</p>
                  <p className="text-2xl font-black text-primary">{formatUzs(calculateShare(calculatorSales, 0.04))}</p>
                </div>
                <div className="p-4 bg-muted rounded-xl text-center">
                  <p className="text-sm text-muted-foreground mb-1">Oylik to'lov</p>
                  <p className="text-2xl font-black">{formatUzs(monthlyFeeUzs)}</p>
                </div>
                <div className="p-4 bg-success/10 rounded-xl text-center">
                  <p className="text-sm text-muted-foreground mb-1">JAMI</p>
                  <p className="text-2xl font-black text-success">
                    {formatUzs(calculateShare(calculatorSales, 0.04) + monthlyFeeUzs)}
                  </p>
                </div>
              </div>

              {/* Comparison */}
              <div className="p-4 bg-[hsl(45,93%,47%)]/10 rounded-xl border border-[hsl(45,93%,47%)]/30">
                <p className="text-sm text-muted-foreground mb-2">Sizning foydangiz:</p>
                <p className="text-3xl font-black text-[hsl(45,93%,40%)]">
                  {formatUzs(calculatorSales - calculateShare(calculatorSales, 0.04) - monthlyFeeUzs)}
                  <span className="text-lg font-normal text-muted-foreground ml-2">
                    ({((1 - 0.04 - (monthlyFeeUzs / calculatorSales)) * 100).toFixed(1)}% qoladi)
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black">Ko'p So'raladigan Savollar</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card 
                key={i} 
                className={`cursor-pointer transition-all ${showFaq === i ? 'border-primary' : ''}`}
                onClick={() => setShowFaq(showFaq === i ? null : i)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{faq.q}</p>
                    {showFaq === i ? (
                      <ChevronUp className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  {showFaq === i && (
                    <p className="mt-3 text-muted-foreground">{faq.a}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-[hsl(250,84%,50%)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">
            Biznesingizni AI Bilan Kuchaytiring!
          </h2>
          <p className="text-xl text-white/80 mb-8">
            60 kunlik savdo o'sishi kafolati
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-bold px-8"
              onClick={() => setLocation('/partner-registration?tariff=premium')}
            >
              <Rocket className="w-5 h-5 mr-2" />
              Hoziroq Boshlash
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 font-bold px-8"
              onClick={() => window.open('https://t.me/sellercloudx_support', '_blank')}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Savol Berish
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>© 2026 SellerCloudX. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}
