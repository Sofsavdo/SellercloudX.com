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
    <div className="min-h-screen bg-white">
      
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
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
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
              Marketplace'da savdo qilish uchun <span className="font-bold text-blue-600">kuniga 15 daqiqa</span> kifoya.
              <br />
              Qolgan ishlarni AI 24/7 bajaradi. Siz faqat natijani ko'rasiz.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Button 
                size="lg"
                onClick={() => setLocation('/partner-registration')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xl px-12 py-8 shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105"
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
                <span>Kredit karta kerak emas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>14 kun bepul sinov</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Istalgan vaqt bekor qilish</span>
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
                description: 'Kuniga 8 soat ish o\'rniga faqat 30 daqiqa. AI qolgan ishlarni bajaradi.',
                metric: '7.5 soat/kun',
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
                metric: '₩ 15M/oy tejash',
                color: 'purple'
              }
            ].map((item, i) => (
              <Card key={i} className="border-2 hover:border-blue-400 transition-all hover:shadow-xl">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center mb-4`}>
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
                description: 'Mahsulot rasmini yuklang. AI qolgan ishlarni bajaradi.',
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
              { icon: ImageIcon, title: 'AI Kartochka Yaratish', desc: '40 soniyada professional mahsulot kartochkasi' },
              { icon: Globe, title: '3 Tilda Tarjima', desc: 'O\'zbek, Rus, Ingliz tillarida avtomatik' },
              { icon: BarChart3, title: 'Narx Optimizatsiya', desc: 'AI eng yaxshi narxni topadi' },
              { icon: Target, title: 'SEO Optimizatsiya', desc: 'Google va marketplace uchun' },
              { icon: LineChart, title: 'Savdo Tahlili', desc: 'Real-time statistika va prognoz' },
              { icon: Shield, title: 'Avtomatik Monitoring', desc: '24/7 kuzatuv va ogohlantirishlar' }
            ].map((feature, i) => (
              <Card key={i} className="border hover:border-blue-400 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <feature.icon className="w-10 h-10 text-blue-600 mb-4" />
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
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
              Faqat Natija Uchun To'lov
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Foyda bo'lmasa - to'lov yo'q! Biz sizning muvaffaqiyatingizga qiziqamiz.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {[
              { 
                name: 'Starter Pro', 
                price: '240K', 
                commission: '1.5%',
                sku: '100',
                revenue: '~₩ 5M',
                profit: '~₩ 1.5M',
                popular: false 
              },
              { 
                name: 'Business', 
                price: '640K', 
                commission: '1.2%',
                sku: '500',
                revenue: '~₩ 25M',
                profit: '~₩ 7.5M',
                popular: true 
              },
              { 
                name: 'Professional', 
                price: '1.44M', 
                commission: '1%',
                sku: '2,000',
                revenue: '~₩ 100M',
                profit: '~₩ 30M',
                popular: false 
              },
              { 
                name: 'Enterprise', 
                price: 'Maxsus', 
                commission: '0.8%',
                sku: 'Cheksiz',
                revenue: '₩ 100M+',
                profit: '₩ 30M+',
                popular: false 
              }
            ].map((tier, i) => (
              <Card key={i} className={`border-2 transition-all ${
                tier.popular ? 'border-blue-500 shadow-2xl scale-105' : 'border-gray-200 hover:border-blue-300'
              }`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Mashhur
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-black text-gray-900">{tier.price}</span>
                    {tier.price !== 'Maxsus' && <span className="text-lg text-gray-600">/oy</span>}
                  </div>
                  <p className="text-sm text-blue-600 font-semibold mt-2">+ {tier.commission} savdodan</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-xs text-gray-600">Oylik daromad:</div>
                      <div className="text-lg font-bold text-green-600">{tier.revenue}</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-gray-600">Sof foyda:</div>
                      <div className="text-lg font-bold text-blue-600">{tier.profit}</div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">SKU:</span>
                      <span className="font-bold">{tier.sku}</span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    {[
                      'AI Manager FULL',
                      '4 Marketplace',
                      '24/7 Monitoring',
                      'Analitika'
                    ].map((f, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
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

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              💡 <span className="font-semibold">Hisob-kitob:</span> O'rtacha mahsulot narxi ₩ 50,000, oyiga 100 ta savdo
            </p>
            <p className="text-sm text-gray-500">
              Barcha tariflar 14 kun bepul sinov bilan. Istalgan vaqt bekor qilish mumkin.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
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
              className="bg-white text-blue-600 hover:bg-gray-100 text-xl px-12 py-8 shadow-2xl"
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
