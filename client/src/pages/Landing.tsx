// PROFESSIONAL LANDING PAGE - SellerCloudX
// Investor-Ready Platform

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, ArrowRight, CheckCircle, Star, TrendingUp, Zap,
  Globe, Truck, BarChart3, Brain, Target, Package, Shield,
  Crown, Clock, Users, DollarSign, Rocket, Play, Eye,
  MessageCircle, AlertCircle, Bot, Image as ImageIcon,
  LineChart, PieChart, ShoppingCart, Box, Warehouse,
  Infinity, Gauge, UserCheck, Lock, Award, Plus, X, FileText, ChevronDown,
  Camera, Lightbulb
} from 'lucide-react';

export default function Landing() {
  const [, setLocation] = useLocation();
  const [selectedModel, setSelectedModel] = useState<'saas' | 'fulfillment'>('saas');  // Changed to 'saas' as default
  const [showLoginMenu, setShowLoginMenu] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      
      {/* Navigation - Premium Fintech Style */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[hsl(220,70%,45%)] to-[hsl(250,84%,50%)] rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black text-gradient-primary">
                  SellerCloudX
                </span>
                <div className="text-xs text-muted-foreground font-medium">AI-Powered Marketplace Automation</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setLocation('/demo')} className="hidden md:flex text-foreground hover:bg-muted">
                <Eye className="w-4 h-4 mr-2" />
                Demo
              </Button>
              <Button variant="outline" onClick={() => setLocation('/partner-registration')} className="border-border hover:border-primary/50 hover:bg-primary/5">
                Ro'yxatdan o'tish
              </Button>
              <div className="relative">
                <Button 
                  onClick={() => setShowLoginMenu(!showLoginMenu)}
                  className="bg-gradient-to-r from-[hsl(220,70%,45%)] to-[hsl(250,84%,50%)] hover:from-[hsl(220,70%,40%)] hover:to-[hsl(250,84%,45%)] shadow-lg shadow-primary/20"
                >
                  Kirish
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
                {showLoginMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        setShowLoginMenu(false);
                        setLocation('/login');
                      }}
                      className="block w-full text-left px-5 py-4 hover:bg-primary/5 transition-colors"
                    >
                      <div className="font-bold text-primary text-lg">Hamkor Kirish</div>
                      <div className="text-xs text-muted-foreground mt-1">Partner Dashboard</div>
                    </button>
                    <button
                      onClick={() => {
                        setShowLoginMenu(false);
                        setLocation('/admin-login');
                      }}
                      className="block w-full text-left px-5 py-4 hover:bg-accent/10 transition-colors border-t border-border"
                    >
                      <div className="font-bold text-[hsl(45,93%,40%)] text-lg">Admin Kirish</div>
                      <div className="text-xs text-muted-foreground mt-1">Admin Panel</div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero - Premium Fintech Style */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Premium Background */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/3 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-[hsl(250,84%,54%)]/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-1/3 -left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-[hsl(45,93%,47%)]/8 to-primary/5 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-[hsl(220,70%,45%)] to-[hsl(250,84%,50%)] text-white px-6 py-2.5 text-base font-semibold shadow-lg shadow-primary/25 animate-fade-in">
              <Zap className="w-4 h-4 mr-2" />
              O'zbekiston #1 AI Marketplace Automation Platform
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8 leading-tight animate-fade-in-up">
              <span className="text-gradient-primary">
                AI Manager 24/7
              </span>
              <br />
              <span className="text-foreground">Sizning Biznesingiz Uchun</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
              <span className="font-bold text-primary">100% avtomatik marketplace boshqaruvi</span> AI bilan.
              <br />
              Mahsulot yaratish, yuklash, narx optimizatsiya - barchasi avtomatik!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8 animate-fade-in-up stagger-3">
              <Button 
                size="lg"
                onClick={() => setLocation('/partner-registration')}
                className="bg-gradient-to-r from-[hsl(220,70%,45%)] to-[hsl(250,84%,50%)] hover:from-[hsl(220,70%,40%)] hover:to-[hsl(250,84%,45%)] text-xl px-12 py-8 shadow-xl shadow-primary/25 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/30"
              >
                <Rocket className="w-6 h-6 mr-3" />
                Bepul Boshlash
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setLocation('/demo')}
                className="text-lg px-10 py-8 border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Play className="w-5 h-5 mr-2" />
                Demo Ko'rish
              </Button>
            </div>
          </div>

          {/* Stats - Premium Fintech Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: TrendingUp, value: '2,847', label: 'Faol Hamkorlar', color: 'primary' },
              { icon: Package, value: '127K+', label: 'AI Kartochkalar', color: 'secondary' },
              { icon: DollarSign, value: '45.7B', label: "So'm Aylanma", color: 'success' },
              { icon: Star, value: '4.9/5', label: 'Baho', color: 'accent' }
            ].map((stat, i) => (
              <div 
                key={i} 
                className="card-fintech p-6 text-center animate-fade-in-up"
                style={{ animationDelay: `${i * 100 + 200}ms` }}
              >
                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                  stat.color === 'primary' ? 'bg-primary/10 text-primary' :
                  stat.color === 'secondary' ? 'bg-secondary/10 text-secondary' :
                  stat.color === 'success' ? 'bg-success/10 text-success' :
                  'bg-[hsl(45,93%,47%)]/10 text-[hsl(45,93%,40%)]'
                }`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="text-4xl font-black text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model Selection - Premium Fintech */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border border-primary/20">
              <Brain className="w-4 h-4 mr-2" />
              Biznes Modeli
            </Badge>
            <h2 className="text-4xl font-black mb-4 text-foreground">Sizning Ehtiyojingiz Uchun</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">AI asosida to'liq avtomatlashtirilgan marketplace boshqaruvi</p>
          </div>
          
          <div className="max-w-xl mx-auto">
            {/* SAAS Model Card - Premium Style */}
            <div 
              className={`card-fintech card-fintech-active cursor-pointer p-8 ${
                selectedModel === 'saas' ? 'border-primary shadow-lg shadow-primary/10' : ''
              }`}
              onClick={() => setSelectedModel('saas')}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(220,70%,45%)] to-[hsl(250,84%,50%)] flex items-center justify-center shadow-lg shadow-primary/25">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-foreground">SAAS - AI Manager</h3>
                  <p className="text-muted-foreground">Faqat AI avtomatizatsiya</p>
                </div>
                <Badge className="ml-auto bg-success/10 text-success border border-success/20">Tavsiya</Badge>
              </div>
              
              <div className="space-y-4 mb-6">
                {[
                  'AI 24/7 marketplace boshqaradi',
                  'Siz mahsulotni o\'zingiz tayyorlaysiz',
                  'Siz marketplace ga yetkazasiz',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{text}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="font-bold text-primary">1-1.5% savdodan to'lov</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                <span className="text-muted-foreground">Xizmat turi</span>
                <Badge className="bg-primary/10 text-primary border-0">Minimal inson ishtiroki</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SAAS Pricing - Premium Fintech Style */}
      {selectedModel === 'saas' && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 gradient-hero relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-gradient-to-r from-[hsl(220,70%,45%)] to-[hsl(250,84%,50%)] text-white px-6 py-2.5 shadow-lg shadow-primary/20">
                <Brain className="w-4 h-4 mr-2" />
                SAAS Model - AI Manager
              </Badge>
              <h2 className="text-5xl font-black mb-4">
                <span className="text-gradient-primary">
                  Faqat AI - Maksimal Avtomatizatsiya
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">Siz mahsulot tayyorlaysiz, AI qolganini qiladi. 1-1.5% savdodan.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* AI Starter */}
              <div className="card-fintech p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                    <Brain className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground">AI Starter</h3>
                  <div className="mt-4">
                    <span className="text-5xl font-black text-foreground">$349</span>
                    <span className="text-xl text-muted-foreground">/oy</span>
                  </div>
                  <p className="text-lg font-bold text-primary mt-2">+ 1.5% savdodan</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                    <Package className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">100 SKU</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">2 marketplace</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="font-bold text-sm text-foreground">✅ Included:</p>
                  {[
                    'AI kartochka yaratish',
                    'Marketplace avtomatik yuklash',
                    'SEO optimizatsiya',
                    'Narx monitoring',
                    'Buyurtma boshqaruvi',
                    'Basic analytics',
                    'Email support'
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{f}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2 mb-6">
                  <p className="font-bold text-sm text-destructive">❌ Cheklovlar:</p>
                  {[
                    'Trend Hunter yopiq',
                    'Foyda analizi yopiq',
                    'Advanced analytics yopiq'
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{f}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-[hsl(220,70%,45%)] to-[hsl(250,84%,50%)] hover:from-[hsl(220,70%,40%)] hover:to-[hsl(250,84%,45%)] shadow-lg shadow-primary/20"
                  onClick={() => setLocation('/partner-registration')}
                >
                  Boshlash
                </Button>
              </div>

              {/* AI Manager Pro - Premium Gold Style */}
              <div className="card-fintech p-8 border-2 border-[hsl(45,93%,47%)]/30 shadow-xl shadow-[hsl(45,93%,47%)]/10 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-[hsl(45,93%,47%)] to-[hsl(38,92%,55%)] text-[hsl(220,70%,10%)] px-6 py-2.5 font-bold shadow-lg">
                    <Crown className="w-4 h-4 mr-2" />
                    FULL ACCESS
                  </Badge>
                </div>
                <div className="text-center mb-8 pt-4">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[hsl(45,93%,47%)] to-[hsl(38,92%,55%)] flex items-center justify-center shadow-lg shadow-[hsl(45,93%,47%)]/30">
                    <Sparkles className="w-10 h-10 text-[hsl(220,70%,10%)]" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground">AI Manager Pro</h3>
                  <div className="mt-4">
                    <span className="text-5xl font-black text-foreground">$899</span>
                    <span className="text-xl text-muted-foreground">/oy</span>
                  </div>
                  <p className="text-lg font-bold text-[hsl(45,93%,40%)] mt-2">+ 1% savdodan</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-[hsl(45,93%,47%)]/10 rounded-xl border border-[hsl(45,93%,47%)]/20">
                    <Package className="w-5 h-5 text-[hsl(45,93%,40%)]" />
                    <span className="font-semibold text-foreground">250 SKU</span>
                    <Badge className="ml-auto bg-[hsl(45,93%,47%)]/20 text-[hsl(45,93%,35%)] border-0 text-xs">+250 alohida</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[hsl(45,93%,47%)]/10 rounded-xl border border-[hsl(45,93%,47%)]/20">
                    <Globe className="w-5 h-5 text-[hsl(45,93%,40%)]" />
                    <span className="font-semibold text-foreground">Cheksiz marketplace</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <p className="font-bold text-sm text-foreground">✅ BARCHA Features:</p>
                  {[
                    'AI Starter features',
                    'Trend Hunter FULL',
                    'Sof foyda analizi',
                    'Advanced analytics',
                    'Priority support',
                    'API access',
                    'Custom integrations'
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground">{f}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-[hsl(45,93%,47%)] to-[hsl(38,92%,55%)] hover:from-[hsl(45,93%,50%)] hover:to-[hsl(38,92%,58%)] text-[hsl(220,70%,10%)] font-bold shadow-lg shadow-[hsl(45,93%,47%)]/25"
                  onClick={() => setLocation('/partner-registration')}
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Boshlash
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Fulfillment Pricing - HIDDEN for IT Park compliance */}
      {false && selectedModel === 'fulfillment' && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-purple-600 text-white px-6 py-2">
                <Truck className="w-4 h-4 mr-2" />
                Fulfillment + AI Model
              </Badge>
              <h2 className="text-5xl font-black mb-4">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  To'liq Xizmat - Foyda Bo'lmasa, To'lov Yo'q!
                </span>
              </h2>
              <p className="text-xl text-gray-600">Biz hamma ishni qilamiz: qabul, saqlash, qadoqlash, marketplace ga yetkazish!</p>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
              {[
                { name: 'Starter Pro', fee: '3M', profit: '50%', sku: '100', marketplaces: 1, popular: false },
                { name: 'Business Standard', fee: '8M', profit: '25%', sku: '500', marketplaces: 2, popular: true },
                { name: 'Professional Plus', fee: '18M', profit: '15%', sku: '2,000', marketplaces: 4, popular: false },
                { name: 'Enterprise Elite', fee: '25M', profit: '10%', sku: 'Cheksiz', marketplaces: 'Barchasi', popular: false }
              ].map((tier, i) => (
                <Card key={i} className={`border-2 transition-all ${
                  tier.popular ? 'border-purple-500 shadow-xl scale-105' : 'border-gray-200'
                }`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                        <Crown className="w-3 h-3 mr-1" />
                        Mashhur
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-black text-gray-900">{tier.fee}</span>
                      <span className="text-lg text-gray-600">/oy</span>
                    </div>
                    <p className="text-lg font-bold text-purple-600 mt-2">+ {tier.profit} foydadan</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">SKU:</span>
                        <span className="font-bold">{tier.sku}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Marketplace:</span>
                        <span className="font-bold">{tier.marketplaces}</span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-6">
                      {[
                        'AI Manager FULL',
                        'Qabul va tekshirish',
                        'Saqlash (ombor)',
                        'Qadoqlash + markirovka',
                        'Marketplace ga yetkazish'
                      ].map((f, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span className="text-sm">{f}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full"
                      variant={tier.popular ? 'default' : 'outline'}
                      onClick={() => setLocation('/partner-registration')}
                    >
                      Boshlash
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Marketplace Process */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-6 text-gray-900">Qanday Ishlaydi?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* SAAS Process */}
            <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Brain className="w-6 h-6 text-blue-600" />
                  SAAS - AI Manager
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { step: '1', icon: Bot, text: 'AI kartochka yaratadi', color: 'blue' },
                    { step: '2', icon: Globe, text: 'Marketplace ga yuklaydi', color: 'blue' },
                    { step: '3', icon: UserCheck, text: 'SIZ mahsulot tayyorlaysiz', color: 'orange' },
                    { step: '4', icon: Truck, text: 'SIZ marketplace ga yetkazasiz', color: 'orange' },
                    { step: '5', icon: ShoppingCart, text: 'Marketplace mijozga sotadi', color: 'green' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center font-bold">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                          <span className="font-semibold text-gray-900">{item.text}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fulfillment Process - HIDDEN for IT Park compliance */}
            {false && (
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Truck className="w-6 h-6 text-purple-600" />
                  Fulfillment + AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { step: '1', icon: Bot, text: 'AI kartochka yaratadi va yuklaydi', color: 'blue' },
                    { step: '2', icon: Box, text: 'SIZ bizning omborga yuborasiz', color: 'orange' },
                    { step: '3', icon: Shield, text: 'BIZ qabul va quality control', color: 'purple' },
                    { step: '4', icon: Package, text: 'BIZ qadoqlash + markirovka', color: 'purple' },
                    { step: '5', icon: Warehouse, text: 'BIZ saqlash (ombor)', color: 'purple' },
                    { step: '6', icon: Truck, text: 'BIZ marketplace ga yetkazamiz', color: 'purple' },
                    { step: '7', icon: ShoppingCart, text: 'Marketplace mijozga yetkazadi', color: 'green' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                          <span className="font-semibold text-gray-900">{item.text}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        </div>
      </section>

      {/* AI Manager Features - Premium Showcase */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[hsl(45,93%,47%)]/10 to-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-primary to-secondary text-white px-6 py-2.5 shadow-lg shadow-primary/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Super AI Manager
            </Badge>
            <h2 className="text-5xl font-black mb-6">
              <span className="text-gradient-primary">
                AI Nima Qiladi?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Bir lahzada mahsulot yaratish, marketplacelarga yuklash, foyda hisoblash - barchasi avtomatik!
            </p>
          </div>

          {/* Main AI Features Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* AI Product Scanner */}
            <div className="card-fintech p-8 group hover:border-primary/50 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">AI Product Scanner</h3>
              <p className="text-muted-foreground mb-6">Mahsulotni rasmga oling - AI bir lahzada to'liq kartochka yaratadi!</p>
              <div className="space-y-3">
                {[
                  { icon: Camera, text: 'Kamera yoki rasm yuklash' },
                  { icon: Brain, text: 'GPT-5 Vision tahlili' },
                  { icon: Globe, text: 'Marketplace narxlarini qidirish' },
                  { icon: DollarSign, text: 'Foyda/zarar hisoblash' },
                  { icon: Target, text: 'SEO optimallashtirish' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-success/10 rounded-xl border border-success/20">
                <div className="flex items-center gap-2 text-success">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">3 soniyada tayyor!</span>
                </div>
              </div>
            </div>

            {/* Trend Hunter */}
            <div className="card-fintech p-8 group hover:border-[hsl(45,93%,47%)]/50 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(45,93%,47%)] to-[hsl(38,92%,55%)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-[hsl(45,93%,47%)]/20">
                <TrendingUp className="w-8 h-8 text-[hsl(220,70%,10%)]" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">Trend Hunter Pro</h3>
              <p className="text-muted-foreground mb-6">Eng ko'p sotiladigan mahsulotlarni AI topadi va sizga tavsiya qiladi!</p>
              <div className="space-y-3">
                {[
                  { icon: BarChart3, text: 'Real-time bozor tahlili' },
                  { icon: Lightbulb, text: 'Yashirin imkoniyatlarni topish' },
                  { icon: Target, text: 'Raqobatchilar tahlili' },
                  { icon: Clock, text: 'Mavsumiy prognozlar' },
                  { icon: Crown, text: 'TOP 100 trendlar' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[hsl(45,93%,47%)]/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-[hsl(45,93%,40%)]" />
                    </div>
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-[hsl(45,93%,47%)]/10 rounded-xl border border-[hsl(45,93%,47%)]/20">
                <div className="flex items-center gap-2 text-[hsl(45,93%,40%)]">
                  <Award className="w-5 h-5" />
                  <span className="font-bold">+340% ROI o'rtacha</span>
                </div>
              </div>
            </div>

            {/* Profit Analysis */}
            <div className="card-fintech p-8 group hover:border-success/50 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-success/20">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">Sof Foyda Tahlili</h3>
              <p className="text-muted-foreground mb-6">Har bir mahsulotning sof foydasini real-time hisoblash!</p>
              <div className="space-y-3">
                {[
                  { icon: DollarSign, text: 'Tannarx + xarajatlar' },
                  { icon: Package, text: 'Fulfillment kalkulyator' },
                  { icon: Globe, text: 'Marketplace komissiyalar' },
                  { icon: BarChart3, text: '6 oylik prognozlar' },
                  { icon: Target, text: 'Optimal narx AI' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-success/10 rounded-xl border border-success/20">
                <div className="flex items-center gap-2 text-success">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-bold">+45% foyda oshirish</span>
                </div>
              </div>
            </div>
          </div>

          {/* Speed & Efficiency Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '3 sek', label: 'Kartochka yaratish', icon: Zap, color: 'primary' },
              { value: '99.2%', label: 'AI aniqlik', icon: Brain, color: '[hsl(45,93%,47%)]' },
              { value: '24/7', label: 'Avtomatik ishlash', icon: Clock, color: 'success' },
              { value: '5+', label: 'Marketplace parallel', icon: Globe, color: 'secondary' }
            ].map((stat, i) => (
              <div key={i} className="card-fintech p-6 text-center">
                <stat.icon className={`w-10 h-10 mx-auto mb-3 text-${stat.color}`} />
                <div className="text-3xl font-black text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-success/10 text-success border border-success/20">
              <CheckCircle className="w-4 h-4 mr-2" />
              Afzalliklar
            </Badge>
            <h2 className="text-4xl font-black mb-6 text-foreground">Nima Uchun SellerCloudX?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Marketplacelardagi savdoni AI bilan boshqarish - vaqt tejash, foyda ko'paytirish
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Vaqtni 90% Tejash',
                desc: 'Eskidan 2 soatda qilinadigan ish - endi 3 soniya!',
                stats: '2 soat → 3 sek',
                color: 'primary'
              },
              {
                icon: DollarSign,
                title: 'Xarajatni 60% Kamaytirish',
                desc: 'AI xarajatlarini biz qoplaymiz, siz faqat foyda ko\'rasiz',
                stats: '$0 AI xarajat',
                color: 'success'
              },
              {
                icon: TrendingUp,
                title: 'Foyda 45% Oshirish',
                desc: 'AI optimal narx va trend mahsulotlarni topadi',
                stats: '+45% sof foyda',
                color: '[hsl(45,93%,47%)]'
              },
              {
                icon: Globe,
                title: 'Multi-Marketplace',
                desc: 'Bir vaqtda 5+ marketplaceda parallel savdo qilish',
                stats: 'Uzum, WB, Ozon...',
                color: 'secondary'
              },
              {
                icon: Bot,
                title: '24/7 Avtomatik',
                desc: 'AI hech qachon dam olmaydi - doimo ishlaydi',
                stats: '24/7 ishlash',
                color: 'primary'
              },
              {
                icon: Shield,
                title: 'Xavfsiz va Ishonchli',
                desc: 'IT Park rezidensi, bank darajasida himoya',
                stats: '99.9% uptime',
                color: 'success'
              }
            ].map((benefit, i) => (
              <div key={i} className="card-fintech p-6 group hover:border-primary/30 transition-all">
                <div className={`w-14 h-14 rounded-2xl bg-${benefit.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className={`w-7 h-7 text-${benefit.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{benefit.title}</h3>
                <p className="text-muted-foreground mb-4">{benefit.desc}</p>
                <Badge variant="outline" className={`text-${benefit.color} border-${benefit.color}/30`}>
                  {benefit.stats}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Results Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[hsl(45,93%,47%)]/10 text-[hsl(45,93%,40%)] border border-[hsl(45,93%,47%)]/20">
              <Star className="w-4 h-4 mr-2" />
              Haqiqiy Natijalar
            </Badge>
            <h2 className="text-4xl font-black mb-6 text-foreground">Hamkorlarimiz Natijalari</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Texno Pro',
                category: 'Elektronika',
                before: '15M so\'m/oy',
                after: '85M so\'m/oy',
                growth: '+467%',
                time: '3 oy',
                quote: 'AI Manager bizning savdoni 5 baravar oshirdi!'
              },
              {
                name: 'Fashion House',
                category: 'Kiyim-kechak',
                before: '8M so\'m/oy',
                after: '42M so\'m/oy',
                growth: '+425%',
                time: '4 oy',
                quote: 'Endi 3ta marketplaceda parallel savdo qilamiz'
              },
              {
                name: 'Organic Kids',
                category: 'Bolalar tovarlari',
                before: '12M so\'m/oy',
                after: '67M so\'m/oy',
                growth: '+458%',
                time: '2 oy',
                quote: 'Trend Hunter eng yaxshi mahsulotlarni topdi'
              }
            ].map((result, i) => (
              <div key={i} className="card-fintech p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                    {result.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{result.name}</h3>
                    <p className="text-sm text-muted-foreground">{result.category}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-muted/30 rounded-xl">
                    <p className="text-xs text-muted-foreground">Oldin</p>
                    <p className="text-lg font-bold text-muted-foreground">{result.before}</p>
                  </div>
                  <div className="p-3 bg-success/10 rounded-xl border border-success/20">
                    <p className="text-xs text-success">Keyin</p>
                    <p className="text-lg font-bold text-success">{result.after}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-[hsl(45,93%,47%)]/10 rounded-xl border border-[hsl(45,93%,47%)]/20 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[hsl(45,93%,40%)]" />
                    <span className="text-2xl font-black text-[hsl(45,93%,40%)]">{result.growth}</span>
                  </div>
                  <Badge variant="outline">{result.time}da</Badge>
                </div>
                <p className="text-sm italic text-muted-foreground">"{result.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Rocket className="w-20 h-20 mx-auto mb-6" />
          <h2 className="text-5xl font-black mb-6">Bugun Boshlang!</h2>
          <p className="text-2xl mb-10 opacity-90">AI xarajatlarini biz qoplaymiz - siz faqat foyda ko'rasiz</p>
          <Button 
            size="lg"
            onClick={() => setLocation('/partner-registration')}
            className="bg-white text-blue-600 hover:bg-gray-100 text-2xl px-16 py-10"
          >
            <Sparkles className="w-7 h-7 mr-3" />
            BEPUL BOSHLASH
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto">
          {/* Investor Pitch Section */}
          <div className="mb-12 p-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl border border-purple-500/20">
            <div className="text-center space-y-4">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-sm font-bold mb-2">
                🚀 INVESTORLAR UCHUN
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Platform Pitch Presentation
              </h3>
              <p className="text-gray-300 max-w-2xl mx-auto">
                SellerCloudX platformasining to'liq taqdimoti, moliyaviy prognozlar va investitsiya imkoniyatlari
              </p>
              <Button
                onClick={() => setLocation('/investor-pitch')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-8 py-6 text-lg rounded-xl shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <Target className="w-6 h-6 mr-2" />
                Investor Pitch Ko'rish
              </Button>
            </div>
          </div>

          {/* Footer Content */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SellerCloudX
              </span>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Biz haqimizda</a>
              <a href="#" className="hover:text-white transition-colors">Xizmatlar</a>
              <a href="#" className="hover:text-white transition-colors">Narxlar</a>
              <a href="#" className="hover:text-white transition-colors">Aloqa</a>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 SellerCloudX. O'zbekiston #1 AI Marketplace Automation Platform.
            </p>
            <p className="text-gray-600 text-xs">
              Barcha huquqlar himoyalangan. Made with ❤️ in Uzbekistan
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
