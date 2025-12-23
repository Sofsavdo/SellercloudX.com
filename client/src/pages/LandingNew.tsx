// PROFESSIONAL LANDING PAGE - SellerCloudX v2.0
// IT Park Compliant - Pure SaaS Solution

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, ArrowRight, CheckCircle, Star, TrendingUp, Zap,
  Brain, Target, Clock, Users, DollarSign, Rocket, Play,
  BarChart3, Shield, Crown, ChevronDown, Infinity, Award,
  LineChart, Package, Globe, Bot, Image as ImageIcon
} from 'lucide-react';

export default function LandingNew() {
  const [, setLocation] = useLocation();
  const [showLoginMenu, setShowLoginMenu] = useState(false);

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
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b shadow-sm">
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
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Button 
                size="lg"
                onClick={() => setLocation('/partner-registration')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xl px-12 py-8 shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105 animate-pulse-glow"
              >
                <Rocket className="w-6 h-6 mr-3" />
                Bepul Boshlash
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setLocation('/demo')}
                className="text-lg px-10 py-8 border-2"
              >
                <Play className="w-5 h-5 mr-2" />
                Demo Ko'rish
              </Button>
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

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Users, value: '2,847', label: 'Faol Hamkorlar', color: 'blue' },
              { icon: Package, value: '127K+', label: 'AI Kartochkalar', color: 'purple' },
              { icon: DollarSign, value: '45.7B', label: "So'm Aylanma", color: 'green' },
              { icon: Star, value: '4.9/5', label: 'Hamkor Bahosi', color: 'yellow' }
            ].map((stat, i) => (
              <Card key={i} className="border-2 hover:border-blue-400 transition-all hover:shadow-xl bg-white">
                <CardContent className="p-6 text-center">
                  <stat.icon className={`w-8 h-8 mx-auto mb-3 text-${stat.color}-600`} />
                  <div className="text-4xl font-black text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
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
              <Card key={i} className="border-2 hover:border-blue-400 transition-all hover:shadow-xl transform hover:scale-105 animate-float" style={{animationDelay: `${i * 0.2}s`}}>
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center mb-4 animate-gradient`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className={`text-3xl font-black text-${item.color}-600`}>{item.metric}</div>
                </CardContent>
              </Card>
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
              <div key={i} className="relative">
                <Card className="border-2 hover:border-blue-400 transition-all hover:shadow-xl h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black">
                        {item.step}
                      </div>
                      <item.icon className="w-12 h-12 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <Badge className="bg-blue-100 text-blue-700">
                      <Clock className="w-3 h-3 mr-1" />
                      {item.time}
                    </Badge>
                  </CardContent>
                </Card>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-blue-400" />
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
              <Card key={i} className="border-2 hover:border-blue-400 transition-all hover:shadow-xl group transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <feature.icon className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
                    <Badge className="bg-blue-100 text-blue-700 text-xs">{feature.badge}</Badge>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              Har Bir Biznes Uchun Tarif
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bepuldan boshlab, biznesingiz o'sishi bilan tarifni oshiring. Hech qanday yashirin to'lovlar yo'q.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {[
              { 
                name: 'Free Starter', 
                price: '0', 
                currency: '$',
                commission: '2%',
                sku: '10',
                features: [
                  '10 ta mahsulot',
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
                highlight: false
              },
              { 
                name: 'Basic', 
                price: '69', 
                currency: '$',
                commission: '1.8%',
                sku: '69',
                features: [
                  '69 ta mahsulot',
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
                highlight: false
              },
              { 
                name: 'Starter', 
                price: '349', 
                currency: '$',
                commission: '1.5%',
                sku: '400',
                features: [
                  '400 ta mahsulot (100/marketplace)',
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
                highlight: true
              },
              { 
                name: 'Professional', 
                price: '899', 
                currency: '$',
                commission: '1%',
                sku: '∞',
                features: [
                  '♾️ Cheksiz mahsulotlar',
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
                highlight: false
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
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                    <Package className="w-3 h-3" />
                    <span className="font-semibold">{tier.sku} mahsulot</span>
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
                  
                  <Button 
                    className={`w-full py-4 text-sm mt-4 ${
                      tier.highlight
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                        : tier.price === '0'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : tier.price === '69'
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : ''
                    }`}
                    variant={tier.highlight || tier.price === '0' || tier.price === '69' ? 'default' : 'outline'}
                    onClick={() => setLocation('/partner-registration')}
                  >
                    <Rocket className="w-3 h-3 mr-1" />
                    {tier.cta}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
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
            <div className="bg-blue-50 rounded-xl p-6 max-w-3xl mx-auto">
              <p className="text-base text-gray-800 font-semibold mb-2">
                🎯 Tavsiya: Free Starter → Basic ($69) → Starter ($349)
              </p>
              <p className="text-sm text-gray-600">
                Bepul sinab ko'ring, biznesingiz o'sishi bilan tarifni oshiring. Istalgan vaqt o'zgartirish mumkin.
              </p>
            </div>
          </div>
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
            <Button 
              size="lg"
              onClick={() => setLocation('/partner-registration')}
              className="bg-white text-blue-600 hover:bg-gray-100 text-xl px-12 py-8 shadow-2xl animate-pulse-glow transform hover:scale-105 transition-all"
            >
              <Rocket className="w-6 h-6 mr-3" />
              Bepul Boshlash
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => setLocation('/demo')}
              className="border-2 border-white text-white hover:bg-white/10 text-xl px-12 py-8"
            >
              <Play className="w-6 h-6 mr-3" />
              Demo Ko'rish
            </Button>
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
