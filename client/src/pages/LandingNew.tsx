// SellerCloudX - Premium Landing Page
// Enterprise-Grade Marketplace Automation Platform

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Sparkles, ArrowRight, CheckCircle, Star, TrendingUp, Zap, ChevronDown,
  Brain, Target, Clock, Users, DollarSign, Rocket, Play, BarChart3, Shield,
  Crown, Package, Globe, Bot, LineChart, Award, Menu, X, ArrowUpRight,
  ChevronUp, Lock, Mail, MessageCircle, Phone, Instagram, Send, Layers,
  RefreshCw, Bell, FileText, Settings, Plus, Minus
} from 'lucide-react';

// Counter animation hook
function useCountUp(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (end - start) * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration, start]);

  return { count, setIsVisible };
}

export default function LandingNew() {
  const [, setLocation] = useLocation();
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Stats with counter animation
  const stat1 = useCountUp(1000, 2000);
  const stat2 = useCountUp(99, 1500);
  const stat3 = useCountUp(4, 1000);
  const stat4 = useCountUp(24, 1200);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger counter animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      stat1.setIsVisible(true);
      stat2.setIsVisible(true);
      stat3.setIsVisible(true);
      stat4.setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { value: stat1.count, suffix: '+', label: 'bizneslar', icon: Users, color: 'text-primary' },
    { value: stat2.count, suffix: '.9%', label: 'uptime', icon: Clock, color: 'text-success' },
    { value: stat3.count, suffix: '', label: 'marketplace', icon: Globe, color: 'text-secondary' },
    { value: stat4.count, suffix: '/7', label: 'AI monitoring', icon: Bot, color: 'text-accent' },
  ];

  const features = [
    { 
      icon: Brain, 
      title: 'AI Kartochka Yaratuvchi', 
      desc: "Mahsulot rasmidan professional kartochka yarating. 3 tilda avtomatik tarjima, SEO optimizatsiya va trend tahlili.",
      color: 'from-primary to-accent'
    },
    { 
      icon: Layers, 
      title: '4 Marketplace Bitta Joyda', 
      desc: "Uzum, Wildberries, Yandex Market va Ozon - barchasini bitta paneldan boshqaring. Real-time sinxronizatsiya.",
      color: 'from-secondary to-primary'
    },
    { 
      icon: LineChart, 
      title: 'Aqlli Narx Monitoring', 
      desc: "Raqobatchilar narxlarini kuzating. AI tavsiyalari bilan eng optimal narxni aniqlang. Avtomatik yangilash.",
      color: 'from-success to-secondary'
    },
    { 
      icon: DollarSign, 
      title: 'Sof Foyda Hisobi', 
      desc: "Har bir mahsulot va marketplace bo'yicha aniq foyda tahlili. Komissiya, yetkazish va boshqa xarajatlar hisobga olinadi.",
      color: 'from-warning to-destructive'
    },
    { 
      icon: Target, 
      title: 'Trend Hunter AI', 
      desc: "Eng ko'p sotiladigan mahsulotlarni toping. AI tavsiyalari bilan to'g'ri mahsulotni to'g'ri vaqtda qo'shing.",
      color: 'from-accent to-primary'
    },
    { 
      icon: Bell, 
      title: '24/7 Avtomatik Monitoring', 
      desc: "Stok tugashi, narx o'zgarishi, yangi buyurtmalar - hamma narsa real-time kuzatiladi. Telegram xabarnomalar.",
      color: 'from-info to-accent'
    },
    { 
      icon: RefreshCw, 
      title: 'Bulk Operations', 
      desc: "Yuzlab mahsulotni bir vaqtda yangilang. Excel import/export. Narx, stok, tavsif - hammasini tez o'zgartiring.",
      color: 'from-primary to-secondary'
    },
    { 
      icon: MessageCircle, 
      title: 'AI Chat Yordamchi', 
      desc: "24/7 AI chat yordami. Savollarga darhol javob. Platform bo'yicha to'liq yo'l-yo'riq va maslahat.",
      color: 'from-success to-info'
    },
  ];

  const testimonials = [
    {
      quote: "Platform biznesingizni 10 baravar tez o'stiradi. AI funksiyalar ajoyib!",
      name: "Sardor Rahimov",
      role: "CEO, Textile Uzbekistan"
    },
    {
      quote: "Bir necha oyda ROI 300% ga yetdi. Eng yaxshi investitsiya!",
      name: "Dilnoza Karimova",
      role: "E-commerce Manager"
    },
    {
      quote: "24/7 monitoring va AI yordam biznesni avtomatlashtirdi.",
      name: "Aziz Tursunov",
      role: "Online Store Owner"
    }
  ];

  const pricing = [
    {
      name: 'Free Starter',
      badge: 'BEPUL',
      badgeColor: 'bg-success text-success-foreground',
      price: '$0',
      priceNum: 0,
      period: '/oy',
      priceSom: "0 so'm/oy",
      commission: '2% komissiya',
      commissionColor: 'bg-success/10 text-success',
      description: "Sinab ko'rish uchun",
      cta: 'Bepul boshlash',
      ctaVariant: 'outline' as const,
      limits: [
        { icon: Package, text: '10 ta mahsulot' },
        { icon: Globe, text: '1 marketplace (Yandex Market)' },
        { icon: Bot, text: '10 AI kartochka' },
        { icon: Target, text: '10 marta/oy Trend Hunter' },
        { icon: DollarSign, text: "15M so'm oylik limit" },
        { icon: Globe, text: '3 tilda tarjima' },
      ],
      features: [
        '10 ta mahsulot',
        '1 marketplace (Yandex Market)',
        'AI kartochka yaratish (10 ta)',
        'Trend Hunter (10 marta/oy)',
        '3 tilda tarjima',
        'Asosiy savdo statistikasi',
        'Ombor monitoring',
        'Admin chat yordam',
        'Email yordam',
      ],
      excluded: [
        'Sof foyda tahlili',
        'Narx monitoring',
        'SEO optimizatsiya',
        "Ko'p marketplace",
        'Telegram xabarnomalar',
      ],
      popular: false,
    },
    {
      name: 'Basic',
      badge: 'Arzon',
      badgeColor: 'bg-warning text-warning-foreground',
      price: '$69',
      priceNum: 69,
      period: '/oy',
      priceSom: "828,000 so'm/oy",
      commission: '1.8% komissiya',
      commissionColor: 'bg-warning/10 text-warning',
      description: 'Kichik biznes uchun',
      cta: 'Basic rejasini tanlash',
      ctaVariant: 'outline' as const,
      limits: [
        { icon: Package, text: '69 ta mahsulot' },
        { icon: Globe, text: '1 marketplace (Yandex Market)' },
        { icon: Bot, text: '69 AI kartochka' },
        { icon: Target, text: '69 marta/oy Trend Hunter' },
        { icon: DollarSign, text: "69M so'm oylik limit" },
        { icon: Globe, text: '3 tilda tarjima' },
      ],
      features: [
        '69 ta mahsulot',
        '1 marketplace (Yandex Market)',
        'AI kartochka yaratish (69 ta)',
        'Trend Hunter (69 marta/oy)',
        '3 tilda tarjima',
        '✨ Sof foyda tahlili',
        "To'liq savdo statistikasi",
        'Ombor boshqaruvi',
        'Telegram xabarnomalar',
        'Email yordam',
      ],
      excluded: [
        "Ko'p marketplace",
        'SEO optimizatsiya',
        'Narx monitoring',
        'Ommaviy operatsiyalar',
      ],
      popular: false,
    },
    {
      name: 'Starter Pro',
      badge: 'MASHHUR',
      badgeColor: 'bg-primary text-primary-foreground badge-pulse',
      extraBadge: "Eng ko'p tanlangan",
      price: '$349',
      priceNum: 349,
      period: '/oy',
      priceSom: "4,188,000 so'm/oy",
      commission: '1.5% komissiya',
      commissionColor: 'bg-primary/10 text-primary',
      description: "O'sib borayotgan biznes",
      cta: 'Starter Pro rejasini tanlash',
      ctaVariant: 'default' as const,
      limits: [
        { icon: Package, text: '400 ta mahsulot (100/marketplace)' },
        { icon: Globe, text: '4 marketplace (Uzum, Yandex, WB, Ozon)' },
        { icon: Bot, text: 'Cheksiz AI kartochka' },
        { icon: Target, text: 'Cheksiz Trend Hunter' },
        { icon: DollarSign, text: "200M so'm oylik limit" },
        { icon: Globe, text: '3 tilda tarjima' },
      ],
      features: [
        '400 ta mahsulot (100 har bir marketplace)',
        '4 marketplace (Uzum, Yandex, Wildberries, Ozon)',
        'Cheksiz AI kartochka yaratish',
        'Cheksiz Trend Hunter',
        '3 tilda professional tarjima',
        '🎯 SEO optimizatsiya',
        '📊 Narx monitoring',
        '💰 Sof foyda tahlili',
        "📈 To'liq savdo tahlili",
        '🏪 Ombor boshqaruvi',
        '🔄 Ommaviy operatsiyalar',
        '📱 Telegram xabarnomalar',
        '⏰ 24/7 monitoring',
        '📧 Email yordam',
      ],
      excluded: [],
      popular: true,
    },
    {
      name: 'Professional',
      badge: 'Premium',
      badgeColor: 'bg-accent text-accent-foreground',
      extraBadge: 'Enterprise',
      price: '$899',
      priceNum: 899,
      period: '/oy',
      priceSom: "10,788,000 so'm/oy",
      commission: '1% komissiya',
      commissionColor: 'bg-accent/10 text-accent',
      description: 'Enterprise biznes',
      cta: 'Professional rejasini tanlash',
      ctaVariant: 'outline' as const,
      limits: [
        { icon: Package, text: 'Cheksiz mahsulotlar' },
        { icon: Globe, text: 'Barcha mavjud marketplacelar' },
        { icon: Bot, text: 'Cheksiz AI kartochka' },
        { icon: Target, text: 'Cheksiz Trend Hunter' },
        { icon: DollarSign, text: 'Cheksiz oylik savdo' },
        { icon: Globe, text: '3 tilda tarjima' },
      ],
      features: [
        'Cheksiz mahsulotlar',
        '4+ marketplace (barcha mavjud)',
        'Cheksiz AI kartochka',
        'Cheksiz Trend Hunter',
        '3 tilda professional tarjima',
        'SEO optimizatsiya',
        'Narx monitoring',
        'Sof foyda tahlili',
        '🧠 Kengaytirilgan AI tahlil',
        '⚡ Tezkor yordam (1 soat)',
        '👨‍💼 Shaxsiy menejer',
        '🔌 API kirish',
        '🎨 White-label branding',
        '🔗 Maxsus integratsiyalar',
        '🧪 A/B testing',
        '🌍 Xalqaro kengayish',
      ],
      excluded: [],
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "Platformani qanday boshlash mumkin?",
      answer: "Ro'yxatdan o'ting, email tasdiqlash, marketplace'laringizni ulang va darhol ishni boshlang. Birinchi 7 kun bepul."
    },
    {
      question: "Qaysi marketplace'lar qo'llab-quvvatlanadi?",
      answer: "Uzum, Wildberries, Yandex Market va Ozon. Yangi marketplace'lar tez orada qo'shiladi."
    },
    {
      question: "AI kartochka yaratish qanday ishlaydi?",
      answer: "Mahsulot rasmini yuklang, AI avtomatik ravishda 3 tilda professional tavsif, SEO kalit so'zlar va tartib yaratadi."
    },
    {
      question: "To'lovni qanday amalga oshiraman?",
      answer: "Click, Payme, UzCard, Humo - barcha O'zbekiston to'lov tizimlari qo'llab-quvvatlanadi. Xavfsiz va tez."
    },
    {
      question: "Tarifni o'zgartirish mumkinmi?",
      answer: "Ha, istalgan vaqt yuqori yoki pastroq tarifga o'tishingiz mumkin. Farq avtomatik hisoblanadi."
    },
    {
      question: "Texnik yordam mavjudmi?",
      answer: "Ha! 24/7 AI chat yordam, email va Professional tarifda shaxsiy menejer."
    },
    {
      question: "Ma'lumotlarim xavfsizmi?",
      answer: "100%. Bank darajasida shifrlash, ISO sertifikatlari, GDPR muvofiqlik."
    },
    {
      question: "Shartnoma kerakmi?",
      answer: "Yo'q. Oyma-oy to'lov, istalgan vaqt bekor qilish. Hech qanday yashirin to'lovlar."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ═══════════════════════════════════════════════════════════════════════
          NAVIGATION BAR (Sticky, Glassmorphism)
      ═══════════════════════════════════════════════════════════════════════ */}
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'glass-nav' : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setLocation('/')}>
              <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-glow transition-shadow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">SellerCloudX</span>
                <p className="text-xs text-muted-foreground">AI-Powered Marketplace Automation</p>
              </div>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Imkoniyatlar
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Narxlar
              </a>
              <Button variant="ghost" onClick={() => setLocation('/demo')} className="gap-2">
                <Play className="w-4 h-4" /> Demo
              </Button>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" onClick={() => setLocation('/partner-registration')} className="font-medium">
                Ro'yxatdan o'tish
              </Button>
              
              {/* Login Dropdown */}
              <div className="relative">
                <Button onClick={() => setShowLoginMenu(!showLoginMenu)} className="gap-2 gradient-primary border-0">
                  Kirish <ChevronDown className={cn('w-4 h-4 transition-transform', showLoginMenu && 'rotate-180')} />
                </Button>
                
                {showLoginMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowLoginMenu(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-card rounded-2xl border shadow-xl z-50 overflow-hidden animate-scale-in">
                      <button
                        onClick={() => { setShowLoginMenu(false); setLocation('/login'); }}
                        className="flex items-center gap-4 w-full p-4 hover:bg-muted transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">Hamkor Kirish</p>
                          <p className="text-xs text-muted-foreground">Partner Dashboard</p>
                        </div>
                      </button>
                      <button
                        onClick={() => { setShowLoginMenu(false); setLocation('/admin-login'); }}
                        className="flex items-center gap-4 w-full p-4 hover:bg-muted transition-colors border-t"
                      >
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-accent" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">Admin Kirish</p>
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
          <div className="md:hidden bg-card border-b animate-slide-up">
            <div className="p-4 space-y-2">
              <a href="#features" className="block px-4 py-2 text-muted-foreground hover:text-foreground">Imkoniyatlar</a>
              <a href="#pricing" className="block px-4 py-2 text-muted-foreground hover:text-foreground">Narxlar</a>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { setMobileMenuOpen(false); setLocation('/demo'); }}>
                <Play className="w-4 h-4 mr-2" /> Demo
              </Button>
              <Button variant="outline" className="w-full" onClick={() => { setMobileMenuOpen(false); setLocation('/partner-registration'); }}>
                Ro'yxatdan o'tish
              </Button>
              <Button className="w-full gradient-primary border-0" onClick={() => { setMobileMenuOpen(false); setLocation('/login'); }}>
                Kirish
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden hero-bg">
        {/* Animated Background Orbs */}
        <div className="hero-orb hero-orb-1 animate-float" />
        <div className="hero-orb hero-orb-2 animate-float-delayed" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Badge */}
          <div className="text-center mb-8 animate-fade-in">
            <Badge className="gradient-primary text-white border-0 px-6 py-2.5 text-sm font-medium shadow-glow">
              <Zap className="w-4 h-4 mr-2 text-yellow-300" />
              O'zbekiston #1 AI Marketplace Automation Platform
            </Badge>
          </div>

          {/* Main Headline */}
          <div className="text-center mb-8 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight leading-tight animate-fade-in-up">
              AI bilan marketplace
              <br />
              <span className="text-gradient-primary">savdosini avtomatlashtiring</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up stagger-2">
              Uzum, Wildberries, Yandex Market va Ozon - barcha bitta platformada. 
              AI kartochka yaratish, narx monitoring, trend tahlili va ko'proq.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-fade-in-up stagger-3">
            <Button 
              size="lg" 
              onClick={() => setLocation('/partner-registration')} 
              className="text-lg px-8 py-6 gradient-primary border-0 shadow-lg shadow-primary/25 hover:shadow-glow transition-all btn-glow"
            >
              <Rocket className="w-5 h-5 mr-2" /> Bepul boshlash <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setLocation('/demo')} 
              className="text-lg px-8 py-6 hover-scale-sm"
            >
              <Play className="w-5 h-5 mr-2" /> Demo ko'rish
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-16 animate-fade-in-up stagger-4">
            {['7 kun bepul', 'Kredit karta kerak emas', '5 daqiqada sozlash'].map((text, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Floating Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-card/80 backdrop-blur border shadow-card hover-lift animate-fade-in"
                style={{ animationDelay: `${(i + 5) * 100}ms` }}
              >
                <stat.icon className={cn('w-8 h-8 mb-3', stat.color)} />
                <p className="text-3xl font-bold text-foreground font-mono">
                  {stat.value}{stat.suffix}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TRUST INDICATORS / TESTIMONIALS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 border-b">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-muted-foreground mb-8 font-medium">Bizga ishonishadi</p>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-muted/50 border animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <p className="text-foreground mb-4 italic">"{item.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FEATURES SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-4 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Brain className="w-4 h-4 mr-2" /> Platformaning kuchli imkoniyatlari
            </Badge>
            <h2 className="text-3xl sm:text-section font-bold mb-4">Platformaning kuchli imkoniyatlari</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Biznesni o'stirish uchun zarur bo'lgan barcha vositalar bitta platformada
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="card-feature group animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={cn(
                  'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6',
                  feature.color
                )}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                <ArrowRight className="w-5 h-5 text-primary mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          STATS SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 gradient-primary">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-section font-bold text-white mb-4">Raqamlarda SellerCloudX</h2>
          <p className="text-white/80 mb-12 text-lg">Platformamiz orqali minglab bizneslar o'sdi</p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '1,000+', label: 'Faol bizneslar platformada', icon: Users },
              { value: '99.9%', label: 'Server ishlash kafolati', icon: Shield },
              { value: '4', label: 'Marketplace integratsiyalar', icon: Globe },
              { value: '24/7', label: 'AI monitoring va yordam', icon: Bot },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/10 backdrop-blur border border-white/20 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <stat.icon className="w-10 h-10 text-white/80 mx-auto mb-4" />
                <p className="text-4xl font-bold text-white font-mono mb-2">{stat.value}</p>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PRICING SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-24 px-4 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Crown className="w-4 h-4 mr-2" /> Tariflar
            </Badge>
            <h2 className="text-3xl sm:text-section font-bold mb-4">O'zingizga mos tarifni tanlang</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Har qanday biznes o'lchami uchun moslashuvchan tariflar. Istalgan vaqt o'zgartiring yoki bekor qiling.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-all',
                  billingPeriod === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Oylik
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
                  billingPeriod === 'yearly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Yillik <Badge className="bg-success text-success-foreground text-xs">20% chegirma</Badge>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {pricing.map((plan, i) => (
              <div
                key={i}
                className={cn(
                  'relative animate-fade-in',
                  plan.popular ? 'card-pricing-popular' : 'card-pricing hover:border-primary/50'
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Badges */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={plan.badgeColor}>{plan.badge}</Badge>
                  {plan.extraBadge && (
                    <Badge variant="outline" className="text-xs">{plan.extraBadge}</Badge>
                  )}
                </div>

                {/* Tier Name */}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>

                {/* Price */}
                <div className="mb-1">
                  <span className={cn(
                    'text-5xl font-black',
                    plan.popular ? 'text-gradient-primary' : ''
                  )}>
                    ${billingPeriod === 'yearly' ? Math.round(plan.priceNum * 0.8) : plan.priceNum}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{plan.priceSom}</p>

                {/* Commission Badge */}
                <Badge className={cn('mb-4', plan.commissionColor)}>{plan.commission}</Badge>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                {/* CTA Button */}
                <Button
                  className={cn(
                    'w-full mb-6',
                    plan.popular && 'gradient-primary border-0 shadow-glow btn-glow'
                  )}
                  variant={plan.ctaVariant}
                  onClick={() => {
                    // Store selected tier in sessionStorage
                    sessionStorage.setItem('selectedTier', JSON.stringify({
                      id: plan.name.toLowerCase().replace(/\s+/g, '_'),
                      name: plan.name,
                      price: plan.priceNum,
                      priceSom: plan.priceSom,
                      commission: plan.commission,
                    }));
                    setLocation('/partner-registration');
                  }}
                >
                  {plan.cta}
                  {plan.popular ? <Star className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>

                {/* Divider */}
                <div className="border-t mb-6" />

                {/* Limits */}
                <div className="space-y-3 mb-6">
                  {plan.limits.map((limit, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm">
                      <limit.icon className="w-4 h-4 text-primary shrink-0" />
                      <span>{limit.text}</span>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Xususiyatlar</p>
                <div className="space-y-2">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {plan.excluded.map((feature, j) => (
                    <div key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <X className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FAQ SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-section font-bold mb-4">Tez-tez so'raladigan savollar</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-card border rounded-2xl overflow-hidden animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold pr-4">{faq.question}</span>
                  {openFaq === i ? (
                    <Minus className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-muted-foreground animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FINAL CTA SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 sm:p-16 rounded-3xl gradient-primary text-white shadow-2xl shadow-primary/25 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <Sparkles className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Bugun boshlang va biznesingizni o'stiring</h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                7 kun bepul. Kreditka talab qilinmaydi.
              </p>
              
              {/* Email Input + CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-8">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  onClick={() => setLocation('/partner-registration')} 
                  className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90"
                >
                  <Rocket className="w-5 h-5 mr-2" /> Boshlash <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="py-16 px-4 border-t bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">SellerCloudX</span>
              </div>
              <p className="text-muted-foreground mb-6">
                O'zbekistonning yetakchi AI Marketplace Automation platformasi. 
                Biznesingizni 10x tezroq o'stiring.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <Send className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <p className="font-semibold mb-4">Mahsulot</p>
              <div className="space-y-3 text-sm text-muted-foreground">
                <a href="#features" className="block hover:text-foreground transition-colors">Imkoniyatlar</a>
                <a href="#pricing" className="block hover:text-foreground transition-colors">Narxlar</a>
                <a href="#" className="block hover:text-foreground transition-colors">Demo</a>
                <a href="#" className="block hover:text-foreground transition-colors">API</a>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <p className="font-semibold mb-4">Kompaniya</p>
              <div className="space-y-3 text-sm text-muted-foreground">
                <a href="#" className="block hover:text-foreground transition-colors">Biz haqimizda</a>
                <a href="#" className="block hover:text-foreground transition-colors">Jamoa</a>
                <a href="#" className="block hover:text-foreground transition-colors">Vakansiyalar</a>
                <a href="#" className="block hover:text-foreground transition-colors">Blog</a>
              </div>
            </div>

            {/* Support Links */}
            <div>
              <p className="font-semibold mb-4">Yordam</p>
              <div className="space-y-3 text-sm text-muted-foreground">
                <a href="#" className="block hover:text-foreground transition-colors">Yordam markazi</a>
                <a href="#" className="block hover:text-foreground transition-colors">Dokumentatsiya</a>
                <a href="#" className="block hover:text-foreground transition-colors">Status</a>
                <a href="#" className="block hover:text-foreground transition-colors">Aloqa</a>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 SellerCloudX. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Maxfiylik</a>
              <a href="#" className="hover:text-foreground transition-colors">Shartlar</a>
              <a href="#" className="hover:text-foreground transition-colors">Xavfsizlik</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}