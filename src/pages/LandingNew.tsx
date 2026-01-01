// Premium Landing Page - SellerCloudX
// Professional Fintech-Style Design

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Sparkles, ArrowRight, CheckCircle, Star, TrendingUp, Zap, ChevronDown,
  Brain, Target, Clock, Users, DollarSign, Rocket, Play, BarChart3, Shield,
  Crown, Package, Globe, Bot, LineChart, Award, Menu, X, ArrowUpRight
} from 'lucide-react';

export default function LandingNew() {
  const [, setLocation] = useLocation();
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { value: '2,847+', label: 'Faol Hamkorlar', icon: Users },
    { value: '127K+', label: 'AI Kartochkalar', icon: Package },
    { value: '45.7B', label: "So'm Aylanma", icon: DollarSign },
    { value: '4.9/5', label: 'Reyting', icon: Star },
  ];

  const features = [
    { icon: Brain, title: 'AI Kartochka Yaratish', desc: '40 soniyada professional mahsulot kartochkasi', color: 'from-violet-500 to-purple-600' },
    { icon: Globe, title: '3 Til Tarjima', desc: "O'zbek, Rus, Ingliz - avtomatik", color: 'from-blue-500 to-cyan-600' },
    { icon: BarChart3, title: 'Narx Optimizatsiya', desc: 'AI raqobatchilarni tahlil qiladi', color: 'from-emerald-500 to-teal-600' },
    { icon: Target, title: 'SEO Optimizatsiya', desc: 'Yuqori qidiruv natijalari', color: 'from-orange-500 to-amber-600' },
    { icon: LineChart, title: 'Savdo Tahlili', desc: 'Real-time statistika', color: 'from-pink-500 to-rose-600' },
    { icon: Shield, title: '24/7 Monitoring', desc: 'Telegram orqali ogohlantirishlar', color: 'from-indigo-500 to-blue-600' },
  ];

  const steps = [
    { num: '01', title: "Ro'yxatdan O'ting", desc: '2 daqiqada bepul boshlang', icon: Rocket },
    { num: '02', title: "AI'ni Sozlang", desc: 'Mahsulotingizni rasmga oling', icon: Bot },
    { num: '03', title: 'Natijani Ko\'ring', desc: 'AI 24/7 ishlaydi', icon: TrendingUp },
  ];

  const pricing = [
    {
      name: 'AI Starter',
      price: '$349',
      period: '/oy',
      commission: '+ 1.5% savdodan',
      features: ['100 SKU', '2 marketplace', 'AI kartochka yaratish', 'SEO optimizatsiya', 'Email support'],
      popular: false,
    },
    {
      name: 'AI Manager Pro',
      price: '$899',
      period: '/oy',
      commission: '+ 1% savdodan',
      features: ['500 SKU', '5 marketplace', 'Trend Hunter', 'Foyda analizi', '24/7 support', 'Priority listing'],
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-background/95 backdrop-blur-xl border-b shadow-sm' : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation('/')}>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">SellerCloudX</span>
                <p className="text-xs text-muted-foreground">AI Marketplace Platform</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <Button variant="ghost" onClick={() => setLocation('/demo')}>
                <Play className="w-4 h-4 mr-2" /> Demo
              </Button>
              <Button variant="outline" onClick={() => setLocation('/partner-registration')}>
                Ro'yxatdan o'tish
              </Button>
              
              {/* Login Dropdown */}
              <div className="relative">
                <Button onClick={() => setShowLoginMenu(!showLoginMenu)} className="gap-2">
                  Kirish <ChevronDown className={cn('w-4 h-4 transition-transform', showLoginMenu && 'rotate-180')} />
                </Button>
                
                {showLoginMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowLoginMenu(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-card rounded-xl border shadow-xl z-50 overflow-hidden animate-fade-in">
                      <button
                        onClick={() => { setShowLoginMenu(false); setLocation('/login'); }}
                        className="flex items-center gap-4 w-full p-4 hover:bg-muted transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">Hamkor</p>
                          <p className="text-xs text-muted-foreground">Partner Dashboard</p>
                        </div>
                      </button>
                      <button
                        onClick={() => { setShowLoginMenu(false); setLocation('/admin-login'); }}
                        className="flex items-center gap-4 w-full p-4 hover:bg-muted transition-colors border-t"
                      >
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">Admin</p>
                          <p className="text-xs text-muted-foreground">Admin Panel</p>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-b animate-slide-up">
            <div className="p-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => { setMobileMenuOpen(false); setLocation('/demo'); }}>Demo</Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { setMobileMenuOpen(false); setLocation('/partner-registration'); }}>Ro'yxatdan o'tish</Button>
              <Button className="w-full" onClick={() => { setMobileMenuOpen(false); setLocation('/login'); }}>Kirish</Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-8">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-medium">
              <Zap className="w-4 h-4 mr-2" />
              O'zbekiston #1 AI Marketplace Platform
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
              <span className="text-gradient-primary">95% Vaqtingizni</span>
              <br />
              <span className="text-foreground">Tejang AI Bilan</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              <span className="text-primary font-semibold">8-10 soat</span> ish o'rniga kuniga faqat{' '}
              <span className="text-emerald-600 font-semibold">15-30 daqiqa</span>.
              <br className="hidden sm:block" />
              AI 24/7 avtomatik ishlaydi. 10 ta mahsulot bilan bepul sinab ko'ring!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setLocation('/partner-registration')} className="text-lg px-8 py-6 shadow-lg shadow-primary/25 hover-glow">
                <Rocket className="w-5 h-5 mr-2" /> Bepul Boshlash <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setLocation('/demo')} className="text-lg px-8 py-6">
                <Play className="w-5 h-5 mr-2" /> Demo Ko'rish
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              {['100% BEPUL boshlash', 'Kredit karta kerak emas', '10 ta mahsulot bepul'].map((text, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-card border shadow-card hover-lift animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <stat.icon className="w-8 h-8 text-primary mb-3" />
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Brain className="w-4 h-4 mr-2" /> AI Imkoniyatlari
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Nima Qila Olasiz?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Marketplace'da muvaffaqiyat uchun kerak bo'lgan hamma narsa bitta platformada
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-card border hover:border-primary/50 shadow-card hover-lift transition-all animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4', feature.color)}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Qanday Ishlaydi?</h2>
            <p className="text-muted-foreground">3 ta oddiy qadam - va siz tayyor!</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
                  <span className="text-3xl font-bold text-white">{step.num}</span>
                </div>
                <step.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
                
                {i < 2 && (
                  <ArrowRight className="hidden md:block absolute top-10 -right-4 w-8 h-8 text-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Crown className="w-4 h-4 mr-2" /> Tariflar
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Siz Uchun Eng Yaxshisi</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {pricing.map((plan, i) => (
              <div
                key={i}
                className={cn(
                  'relative p-8 rounded-2xl border-2 transition-all animate-fade-in',
                  plan.popular
                    ? 'border-primary bg-card shadow-xl shadow-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    <Award className="w-3 h-3 mr-1" /> Tavsiya etiladi
                  </Badge>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-primary font-medium mb-6">{plan.commission}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={cn('w-full', plan.popular ? '' : 'variant-outline')}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => setLocation('/partner-registration')}
                >
                  Boshlash <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-2xl shadow-primary/25">
            <Sparkles className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Hoziroq Boshlang!</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              10 ta mahsulot bilan bepul sinab ko'ring. Kredit karta kerak emas.
            </p>
            <Button size="lg" variant="secondary" onClick={() => setLocation('/partner-registration')} className="text-lg px-8 py-6">
              <Rocket className="w-5 h-5 mr-2" /> Bepul Boshlash <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-foreground">SellerCloudX</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 SellerCloudX. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}
