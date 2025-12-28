// PROFESSIONAL LANDING PAGE - SellerCloudX v2.0
// IT Park Compliant - Pure SaaS Solution

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { ModernButton } from '@/components/ui/ModernButton';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { 
  Sparkles, ArrowRight, CheckCircle, Star, TrendingUp, Zap,
  Brain, Target, Clock, Users, DollarSign, Rocket, Play,
  BarChart3, Shield, Crown, ChevronDown, Infinity, Award,
  LineChart, Package, Globe, Bot, Image as ImageIcon
} from 'lucide-react';

export default function LandingNew() {
  const [, setLocation] = useLocation();
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Scroll animation
  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => {
      const elements = document.querySelectorAll('.scroll-animate');
      elements.forEach((el) => {
        const elementTop = el.getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < window.innerHeight - elementVisible) {
          el.classList.add('animate-fade-in-up');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 5s ease infinite;
        }
      `}</style>
      
      {/* Navigation - Enhanced */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SellerCloudX
                </span>
                <div className="text-xs text-gray-500 font-medium">AI-Powered SaaS Platform</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setLocation('/partner-registration')}>
                Ro'yxatdan o'tish
              </Button>
              <div className="relative">
                <Button 
                  onClick={() => setShowLoginMenu(!showLoginMenu)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Kirish
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
                {showLoginMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border-2 border-blue-200 z-50">
                    <button
                      onClick={() => {
                        setShowLoginMenu(false);
                        setLocation('/login');
                      }}
                      className="block w-full text-left px-5 py-4 hover:bg-blue-50 transition-colors rounded-t-lg"
                    >
                      <div className="font-bold text-blue-600 text-lg">Hamkor Kirish</div>
                      <div className="text-xs text-gray-500 mt-1">Partner Dashboard</div>
                    </button>
                    <button
                      onClick={() => {
                        setShowLoginMenu(false);
                        setLocation('/admin-login');
                      }}
                      className="block w-full text-left px-5 py-4 hover:bg-purple-50 transition-colors border-t rounded-b-lg"
                    >
                      <div className="font-bold text-purple-600 text-lg">Admin Kirish</div>
                      <div className="text-xs text-gray-500 mt-1">Admin Panel</div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 text-base font-semibold shadow-lg">
              <Zap className="w-4 h-4 mr-2" />
              O'zbekiston #1 AI Marketplace Platform
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                95% Vaqtingizni Tejang
              </span>
              <br />
              <span className="text-gray-900">AI Bilan Avtomatlashtiring</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-700 mb-10 max-w-4xl mx-auto leading-relaxed">
              <span className="font-bold text-blue-600">8-10 soat</span> ish o'rniga kuniga faqat <span className="font-bold text-green-600">15-30 daqiqa</span>.
              <br />
              Qolgan ishlarni AI 24/7 avtomatik bajaradi. <span className="font-bold text-purple-600">10 ta mahsulot bilan bepul sinab ko'ring!</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 animate-fade-in-up">
              <ModernButton
                variant="gradient"
                size="lg"
                onClick={() => setLocation('/partner-registration')}
                className="text-xl px-12 py-8 shadow-2xl hover:shadow-blue-500/50"
                icon={<Rocket className="w-6 h-6" />}
              >
                Bepul Boshlash
              </ModernButton>
              <ModernButton
                variant="outline"
                size="lg"
                onClick={() => setLocation('/demo')}
                className="text-lg px-10 py-8 border-2"
                icon={<Play className="w-5 h-5" />}
              >
                Demo Ko'rish
              </ModernButton>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold">100% BEPUL boshlash</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Kredit karta kerak emas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>10 ta mahsulot bepul</span>
              </div>
            </div>
          </div>

          {/* Stats - Modern Design */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <StatCard
              title="Faol Hamkorlar"
              value="2,847"
              icon={Users}
              trend={{ value: 25, isPositive: true }}
              subtitle="Oxirgi oyda"
              delay={0}
            />
            <StatCard
              title="AI Kartochkalar"
              value="127K+"
              icon={Package}
              trend={{ value: 40, isPositive: true }}
              subtitle="Yaratilgan"
              delay={100}
            />
            <StatCard
              title="So'm Aylanma"
              value="45.7B"
              icon={DollarSign}
              trend={{ value: 35, isPositive: true }}
              subtitle="Jami aylanma"
              delay={200}
            />
            <StatCard
              title="Hamkor Bahosi"
              value="4.9/5"
              icon={Star}
              subtitle="O'rtacha reyting"
              delay={300}
              gradient={true}
            />
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              Nega <span className="text-blue-600">SellerCloudX</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Marketplace'da muvaffaqiyat uchun kerak bo'lgan hamma narsa bitta platformada
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: '95% Vaqt Tejash',
                description: '8-10 soat ish o\'rniga kuniga faqat 15-30 daqiqa. AI qolgan ishlarni avtomatik bajaradi.',
                metric: '8-10 soat → 15-30 daq',
                color: 'blue'
              },
              {
                icon: TrendingUp,
                title: '3x Ko\'proq Savdo',
                description: 'AI SEO va narx optimizatsiya orqali savdolaringiz 3 barobar oshadi.',
                metric: '+200% o\'sish',
                color: 'green'
              },
              {
                icon: DollarSign,
                title: '80% Xarajat Kamayishi',
                description: 'Xodim, ofis, dasturlar uchun xarajatlar yo\'q. Faqat natija uchun to\'lov.',
                metric: '15-55 mln so\'m/oy tejash',
                color: 'purple'
              }
            ].map((item, i) => (
              <AnimatedCard
                key={i}
                delay={i * 200}
                hover={true}
                className="scroll-animate"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center mb-4 shadow-lg`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className={`text-3xl font-black text-${item.color}-600`}>{item.metric}</div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              Qanday Ishlaydi?
            </h2>
            <p className="text-xl text-gray-600">
              3 ta oddiy qadam - va siz tayyor!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: Rocket,
                title: 'Ro\'yxatdan O\'ting',
                description: '2 daqiqada ro\'yxatdan o\'ting. Kredit karta kerak emas.',
                time: '2 daqiqa'
              },
              {
                step: '2',
                icon: Bot,
                title: 'AI\'ni Sozlang',
                description: 'Mahsulotingizni oddiy rasmga oling va AI hamma ishni o\'zi bajaradi.',
                time: '5 daqiqa'
              },
              {
                step: '3',
                icon: TrendingUp,
                title: 'Natijani Ko\'ring',
                description: 'AI 24/7 ishlaydi. Siz faqat savdo va foydani ko\'rasiz.',
                time: '24/7 avtomatik'
              }
            ].map((item, i) => (
              <div key={i} className="relative scroll-animate">
                <AnimatedCard
                  delay={i * 200}
                  hover={true}
                  className="h-full"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                      {item.step}
                    </div>
                    <item.icon className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <Badge className="bg-blue-100 text-blue-700">
                    <Clock className="w-3 h-3 mr-1" />
                    {item.time}
                  </Badge>
                </AnimatedCard>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-blue-400 animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-600 text-white px-6 py-2">
              <Brain className="w-4 h-4 mr-2" />
              AI Imkoniyatlari
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              Nima Qila Olasiz?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: ImageIcon, 
                title: 'AI Kartochka Yaratish', 
                desc: '40 soniyada professional mahsulot kartochkasi. Sarlavha, tavsif, kalit so\'zlar - hammasi avtomatik.',
                badge: 'GPT-4 Ko\'rish'
              },
              { 
                icon: Globe, 
                title: '3 Tilda Tarjima', 
                desc: 'O\'zbek, Rus, Ingliz tillarida avtomatik tarjima. Har bir til uchun SEO optimizatsiya.',
                badge: 'Neyron Tarjima'
              },
              { 
                icon: BarChart3, 
                title: 'Aqlli Narx Optimizatsiya', 
                desc: 'AI raqobatchilarni tahlil qilib, eng optimal narxni tavsiya qiladi. Maksimal foyda.',
                badge: 'AI Quvvat'
              },
              { 
                icon: Target, 
                title: 'SEO Optimizatsiya', 
                desc: 'Google va marketplace algoritmlari uchun maxsus optimizatsiya. Yuqori o\'rinlar.',
                badge: 'Avto SEO'
              },
              { 
                icon: LineChart, 
                title: 'Savdo Tahlili', 
                desc: 'Jonli statistika, prognozlar, trend tahlili. Har bir mahsulot uchun batafsil hisobot.',
                badge: 'Tahlil'
              },
              { 
                icon: Shield, 
                title: 'Avtomatik Monitoring', 
                desc: '24/7 narx kuzatuv, stok monitoring, raqobatchi tahlili. Telegram orqali ogohlantirishlar.',
                badge: '24/7 Faol'
              },
              { 
                icon: Bot, 
                title: 'Ommaviy Operatsiyalar', 
                desc: 'Yuzlab mahsulotni bir vaqtda yuklash, yangilash, narx o\'zgartirish. Excel import/export.',
                badge: 'Ommaviy Amallar'
              },
              { 
                icon: Infinity, 
                title: 'Xalqaro Marketplace Integratsiya', 
                desc: 'Uzum, Yandex Market, Wildberries, Ozon - barchasi bitta platformada. O\'zbekiston, Rossiya, Qozog\'iston bozorlari.',
                badge: 'Multi-channel'
              },
              { 
                icon: Award, 
                title: 'Aqlli Tavsiyalar', 
                desc: 'AI sizga eng yaxshi mahsulotlar, kategoriyalar va strategiyalarni tavsiya qiladi.',
                badge: 'AI Tushunchalar'
              }
            ].map((feature, i) => (
              <AnimatedCard
                key={i}
                delay={i * 100}
                hover={true}
                className="scroll-animate group"
              >
                <div className="flex items-start justify-between mb-4">
                  <feature.icon className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
                  <Badge className="bg-blue-100 text-blue-700 text-xs">{feature.badge}</Badge>
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              Har Bir Biznes Uchun Tarif
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              Bepuldan boshlab, biznesingiz o'sishi bilan tarifni oshiring. Hech qanday yashirin to'lovlar yo'q.
            </p>
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-lg text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>Har bir tarifda SKU va oylik savdo limiti bor</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {[
              { 
                name: 'Free Starter', 
                price: '0', 
                currency: '$',
                commission: '2%',
                sku: '10',
                salesLimit: '15 mln',
                salesLimitFull: '15,000,000',
                features: [
                  '10 ta mahsulot',
                  '📊 Oylik savdo: 15 mln so\'m gacha',
                  '1 marketplace (Yandex Market)',
                  'AI kartochka (10 ta)',
                  'Trend Hunter (10 marta/oy)',
                  '3 tilda tarjima',
                  'Asosiy savdo statistikasi',
                  'Ombor monitoring',
                  'Admin chat',
                  'Email yordam'
                ],
                excluded: [
                  'Sof foyda tahlili',
                  'Narx monitoring',
                  'SEO optimizatsiya',
                  'Ko\'p marketplace',
                  'Telegram xabarnomalar'
                ],
                popular: false,
                description: 'Sinab ko\'rish',
                cta: 'Bepul Boshlash',
                highlight: false,
                limitWarning: 'Limit to\'lsa tarif almashtirish kerak'
              },
              { 
                name: 'Basic', 
                price: '69', 
                currency: '$',
                commission: '1.8%',
                sku: '69',
                salesLimit: '69 mln',
                salesLimitFull: '69,000,000',
                features: [
                  '69 ta mahsulot',
                  '📊 Oylik savdo: 69 mln so\'m gacha',
                  '1 marketplace (Yandex Market)',
                  'AI kartochka (69 ta)',
                  'Trend Hunter (69 marta/oy)',
                  '3 tilda tarjima',
                  '✨ Sof foyda tahlili',
                  'To\'liq savdo statistikasi',
                  'Ombor boshqaruvi',
                  'Telegram xabarnomalar',
                  'Email yordam'
                ],
                excluded: [
                  'Ko\'p marketplace',
                  'SEO optimizatsiya',
                  'Narx monitoring',
                  'Ommaviy operatsiyalar'
                ],
                popular: false,
                description: 'Kichik biznes',
                cta: 'Boshlash',
                highlight: false,
                limitWarning: 'Limit to\'lsa tarif almashtirish kerak'
              },
              { 
                name: 'Starter', 
                price: '349', 
                currency: '$',
                commission: '1.5%',
                sku: '400',
                salesLimit: '200 mln',
                salesLimitFull: '200,000,000',
                features: [
                  '400 ta mahsulot (100/marketplace)',
                  '📊 Oylik savdo: 200 mln so\'m gacha',
                  '4 marketplace (Uzum, Yandex, Wildberries, Ozon)',
                  'Cheksiz AI kartochka',
                  'Cheksiz Trend Hunter',
                  '3 tilda tarjima',
                  'SEO optimizatsiya',
                  'Narx monitoring',
                  'Sof foyda tahlili',
                  'To\'liq savdo tahlili',
                  'Ombor boshqaruvi',
                  'Ommaviy operatsiyalar',
                  'Telegram xabarnomalar',
                  '24/7 monitoring',
                  'Email yordam'
                ],
                excluded: [],
                popular: true,
                description: 'O\'sish uchun',
                cta: 'Boshlash',
                highlight: true,
                limitWarning: 'Limit to\'lsa tarif almashtirish kerak'
              },
              { 
                name: 'Professional', 
                price: '899', 
                currency: '$',
                commission: '1%',
                sku: '∞',
                salesLimit: '♾️ Cheksiz',
                salesLimitFull: 'unlimited',
                features: [
                  '♾️ Cheksiz mahsulotlar',
                  '📊 Oylik savdo: Cheksiz',
                  '4+ marketplace (barcha mavjud)',
                  'Cheksiz AI kartochka',
                  'Cheksiz Trend Hunter',
                  '3 tilda tarjima',
                  'SEO optimizatsiya',
                  'Narx monitoring',
                  'Sof foyda tahlili',
                  'Kengaytirilgan AI tahlil',
                  'Tezkor yordam (1 soat)',
                  'Shaxsiy menejer',
                  'API kirish',
                  'White-label branding',
                  'Maxsus integratsiyalar',
                  'A/B testing',
                  'Xalqaro kengayish'
                ],
                excluded: [],
                popular: false,
                description: 'Enterprise',
                cta: 'Boshlash',
                highlight: false,
                limitWarning: null
              }
            ].map((tier, i) => (
              <Card key={i} className={`border-2 transition-all relative transform hover:scale-105 flex flex-col h-full ${
                tier.highlight ? 'border-blue-500 shadow-2xl lg:scale-105 animate-pulse-glow' : 'border-gray-200 hover:border-blue-300'
              }`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm shadow-lg">
                      <Crown className="w-3 h-3 mr-1" />
                      Mashhur
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="mb-2">
                    <Badge className={
                      tier.price === '0' ? 'bg-green-100 text-green-700 text-xs' : 
                      tier.price === '69' ? 'bg-orange-100 text-orange-700 text-xs' :
                      'bg-blue-100 text-blue-700 text-xs'
                    }>
                      {tier.description}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold mb-3">{tier.name}</CardTitle>
                  <div className="mb-3">
                    <div className="flex items-baseline justify-center gap-1">
                      {tier.price === '0' ? (
                        <span className="text-4xl font-black text-green-600">BEPUL</span>
                      ) : (
                        <>
                          <span className="text-base text-gray-600">{tier.currency}</span>
                          <span className="text-3xl font-black text-gray-900">{tier.price}</span>
                          <span className="text-base text-gray-600">/oy</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-blue-600 font-semibold mt-1">
                      + {tier.commission} savdodan
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                      <Package className="w-3 h-3" />
                      <span className="font-semibold">{tier.sku} mahsulot</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs font-bold text-orange-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>{tier.salesLimit}/oy</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow p-4">
                  <div className="space-y-1.5 flex-grow">
                    {tier.features.map((f, j) => (
                      <div key={j} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs leading-tight">{f}</span>
                      </div>
                    ))}
                  </div>
                  
                  {tier.excluded && tier.excluded.length > 0 && (
                    <div className="pt-3 border-t space-y-1 mt-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Yo'q:</p>
                      {tier.excluded.map((f, j) => (
                        <div key={j} className="flex items-start gap-1.5">
                          <span className="text-gray-400 text-xs">✕</span>
                          <span className="text-xs text-gray-500 line-through">{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {tier.limitWarning && (
                    <div className="pt-3 border-t mt-3">
                      <div className="bg-orange-50 rounded-lg p-2">
                        <p className="text-xs text-orange-700 font-semibold flex items-start gap-1">
                          <span>⚠️</span>
                          <span>{tier.limitWarning}</span>
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <ModernButton
                    variant={tier.highlight ? 'gradient' : tier.price === '0' || tier.price === '69' ? 'primary' : 'outline'}
                    size="md"
                    onClick={() => setLocation('/partner-registration')}
                    className="w-full py-4 text-sm mt-4"
                    icon={<Rocket className="w-3 h-3" />}
                  >
                    {tier.cta}
                  </ModernButton>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Kredit karta kerak emas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Istalgan vaqt bekor qilish</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Darhol boshlash</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 max-w-5xl mx-auto border-2 border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                ⚠️ Muhim: Oylik Limitlar
              </h3>
              
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 text-center border-2 border-green-200">
                  <div className="text-2xl font-black text-green-600 mb-1">15 mln</div>
                  <div className="text-xs text-gray-600">Free Starter</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border-2 border-orange-200">
                  <div className="text-2xl font-black text-orange-600 mb-1">69 mln</div>
                  <div className="text-xs text-gray-600">Basic</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border-2 border-blue-200">
                  <div className="text-2xl font-black text-blue-600 mb-1">200 mln</div>
                  <div className="text-xs text-gray-600">Starter</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border-2 border-purple-200">
                  <div className="text-2xl font-black text-purple-600 mb-1">♾️</div>
                  <div className="text-xs text-gray-600">Professional</div>
                </div>
              </div>
              
              <div className="bg-orange-100 rounded-lg p-4 mb-4">
                <p className="text-sm text-orange-900 font-semibold mb-2">
                  🚨 Limit to'lganda nima bo'ladi?
                </p>
                <ul className="text-xs text-orange-800 space-y-1">
                  <li>• SKU limiti yoki oylik savdo limiti to'lsa platforma bloklanadi</li>
                  <li>• Tarifni oshirish so'rovi keladi</li>
                  <li>• Yangi oy boshlanguncha yoki to'lov qilinguncha ishlamaydi</li>
                  <li>• Mavjud mahsulotlar marketplace'da qoladi, lekin yangilarini qo'sha olmaysiz</li>
                </ul>
              </div>
              
              <p className="text-sm text-gray-700 text-center">
                <span className="font-semibold">🎯 Tavsiya:</span> Biznesingiz o'sishini oldindan rejalashtiring va limitga yaqinlashganda tarifni oshiring
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Limits Explanation */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Limitlar Qanday Ishlaydi?
            </h2>
            <p className="text-lg text-gray-600">
              Har bir tarif 2 ta limit bilan cheklangan: SKU soni va oylik savdo hajmi
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Package className="w-6 h-6" />
                  SKU Limiti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700">
                  Platformada yarata oladigan mahsulotlar soni. Masalan:
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Free: 10 ta mahsulot yaratdingiz → 11-chisini yarata olmaysiz</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Basic: 69 ta mahsulot yaratdingiz → 70-chisini yarata olmaysiz</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">⚠️</span>
                    <span>Limit to'lsa tarif oshirish kerak</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <TrendingUp className="w-6 h-6" />
                  Oylik Savdo Limiti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700">
                  Bir oyda qila oladigan savdo hajmi (so'm). Masalan:
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Free: 9 ta mahsulot bor, lekin savdo 15 mln so'mga yetdi → bloklanadi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Basic: 50 ta mahsulot bor, lekin savdo 69 mln so'mga yetdi → bloklanadi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">⚠️</span>
                    <span>Har oy 1-sanada limit qayta tiklanadi</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Shield className="w-6 h-6" />
                Bloklanish Holatlari
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Platforma qachon bloklanadi?</p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">1.</span>
                      <span>SKU limiti to'lsa (masalan, Free'da 10 ta mahsulot yaratilgan)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">2.</span>
                      <span>Oylik savdo limiti to'lsa (masalan, Free'da 15 mln so'm savdo bo'lgan)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">3.</span>
                      <span>Ikkalasi ham to'lsa</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Bloklanishdan qanday qutulish mumkin?</p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>Tarifni oshirish</strong> - darhol blok ochiladi, yangi limitlar qo'llaniladi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span><strong>Yangi oy kutish</strong> - faqat savdo limiti uchun (SKU limiti qoladi)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-orange-300">
                  <p className="text-sm font-semibold text-orange-900 mb-2">
                    💡 Maslahat: Limitga 80% yetganda tarifni oshiring
                  </p>
                  <p className="text-xs text-orange-800">
                    Kutilmagan bloklanishdan qochish uchun limitingizni kuzatib boring va oldindan rejalashtiring.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden animate-gradient">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            Bugun Boshlang, Ertaga Natija Ko'ring
          </h2>
          <p className="text-xl mb-10 opacity-90">
            2,847 hamkor allaqachon AI bilan ishlayapti. Siz ham qo'shiling!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <ModernButton
              variant="primary"
              size="lg"
              onClick={() => setLocation('/partner-registration')}
              className="bg-white text-blue-600 hover:bg-gray-100 text-xl px-12 py-8 shadow-2xl"
              icon={<Rocket className="w-6 h-6" />}
            >
              Bepul Boshlash
            </ModernButton>
            <ModernButton
              variant="outline"
              size="lg"
              onClick={() => setLocation('/demo')}
              className="border-2 border-white text-white hover:bg-white/10 text-xl px-12 py-8"
              icon={<Play className="w-6 h-6" />}
            >
              Demo Ko'rish
            </ModernButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black">SellerCloudX</span>
          </div>
          <p className="text-gray-400 mb-6">
            AI-Powered Marketplace Automation Platform
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Aloqa</a>
            <a href="#" className="hover:text-white transition-colors">Yordam</a>
            <a href="#" className="hover:text-white transition-colors">Shartlar</a>
            <a href="#" className="hover:text-white transition-colors">Maxfiylik</a>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-gray-500">
            © 2024 SellerCloudX. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </footer>
    </div>
  );
}
