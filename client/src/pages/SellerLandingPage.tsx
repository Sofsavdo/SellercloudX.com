// SellerLandingPage - Premium B2B Landing for High-Value Investors
// Mobile-first, FOMO-driven, Lead Capture focused landing page

import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import { 
  Camera, Zap, CheckCircle, ArrowRight, Star, Clock, 
  TrendingUp, Shield, BarChart3, Sparkles, Target,
  DollarSign, Users, Award, MessageCircle, Phone, Bot,
  Calculator, Building2, Rocket, 
  Gift, AlertTriangle, Timer, Flame, ChevronDown, X,
  GraduationCap, UserX, Send
} from 'lucide-react';

// Lead form interface
interface LeadFormData {
  fullName: string;
  phone: string;
  region: string;
  currentSalesVolume: string;
  businessType: string;
}

export default function SellerLandingPage() {
  const { toast } = useToast();
  const [spotsLeft] = useState(7);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 12 });
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LeadFormData>({
    fullName: '',
    phone: '',
    region: '',
    currentSalesVolume: '',
    businessType: ''
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to top when modal closes
  useEffect(() => {
    if (!showLeadModal) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [showLeadModal]);

  // AI capabilities list
  const aiCapabilities = [
    { icon: Camera, text: "Mahsulotni skanerlab 2 daqiqada kartochka yaratish" },
    { icon: BarChart3, text: "Raqobatchilar narxini real-time kuzatish" },
    { icon: Target, text: "IKPU/MXIK kodlarini avtomatik aniqlash" },
    { icon: Sparkles, text: "SEO-optimallashtirilgan tavsiflar" },
    { icon: TrendingUp, text: "4 ta marketplace'da bir vaqtda sotish" },
  ];

  // Success stories with more realistic Uzbek names
  const successStories = [
    {
      name: "Abdulloh T.",
      business: "Elektronika do'koni, Toshkent",
      initials: "AT",
      bgColor: "bg-blue-600",
      result: "3 ta kontentchi o'rniga AI",
      revenue: "+180% savdo o'sishi",
      saving: "12M UZS/oy tejaldi"
    },
    {
      name: "Gulnora S.", 
      business: "Ayollar kiyimi, Samarqand",
      initials: "GS",
      bgColor: "bg-purple-600",
      result: "300+ mahsulot 3 kunda",
      revenue: "Yandex TOP 10 ga chiqdi",
      saving: "8M UZS/oy tejaldi"
    },
    {
      name: "Bobur A.",
      business: "Parfyumeriya, Farg'ona",
      initials: "BA",
      bgColor: "bg-emerald-600", 
      result: "4 ta hodim ishini AI bajaradi",
      revenue: "4 ta marketplace birdan",
      saving: "20M UZS/oy tejaldi"
    }
  ];

  // Regions
  const regions = [
    "Toshkent shahri",
    "Toshkent viloyati",
    "Samarqand",
    "Buxoro",
    "Farg'ona",
    "Andijon",
    "Namangan",
    "Qashqadaryo",
    "Surxondaryo",
    "Xorazm",
    "Navoiy",
    "Jizzax",
    "Sirdaryo",
    "Qoraqalpog'iston"
  ];

  // Sales volume options
  const salesVolumes = [
    "Hali boshlaganim yo'q",
    "1-10 mln UZS/oy",
    "10-30 mln UZS/oy",
    "30-50 mln UZS/oy",
    "50-100 mln UZS/oy",
    "100+ mln UZS/oy",
    "$10,000+/oy",
    "$30,000+/oy"
  ];

  // Submit lead form
  const handleSubmitLead = async () => {
    if (!formData.fullName || !formData.phone) {
      toast({
        title: "Xatolik",
        description: "Ism va telefon raqam kiritish shart",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Use relative URL - works in both dev and production
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          region: formData.region || null,
          currentSalesVolume: formData.currentSalesVolume || null,
          businessType: formData.businessType || null,
          source: 'seller_landing',
          campaign: 'instagram_ads'
        })
      });

      console.log('Lead submission response status:', response.status, response.ok);
      
      // Read response text first
      const responseText = await response.text();
      console.log('Lead submission response body:', responseText);

      if (response.ok || response.status === 200) {
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.log('Response is not JSON, but status is OK');
          data = { success: true };
        }
        
        console.log('Lead created:', data);
        toast({
          title: "Muvaffaqiyatli yuborildi!",
          description: "Tez orada siz bilan bog'lanamiz"
        });
        setShowLeadModal(false);
        setFormData({
          fullName: '',
          phone: '',
          region: '',
          currentSalesVolume: '',
          businessType: ''
        });
      } else {
        console.error('Lead submission failed:', response.status, responseText);
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Lead submission error:', error);
      toast({
        title: "Xatolik",
        description: "Qaytadan urinib ko'ring",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openLeadForm = () => {
    setShowLeadModal(true);
  };

  const scrollToPlans = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      
      {/* FOMO Urgency Banner - Fixed Top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-orange-600 py-2 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Flame className="w-4 h-4 animate-pulse" />
            <span>BEPUL O'RNATISH: Faqat <strong>{spotsLeft} ta</strong> joy qoldi!</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <Timer className="w-3 h-3" />
            <span>{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-14 px-4 pb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-slate-950 to-slate-950" />
        
        <div className="max-w-lg mx-auto relative z-10 pt-4">
          
          {/* Trust Badge */}
          <div className="flex justify-center mb-3">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-3 py-1 text-xs font-medium">
              <Award className="w-3 h-3 mr-1.5" />
              O'zbekiston #1 E-commerce AI Platformasi
            </Badge>
          </div>

          {/* Hook Question */}
          <div className="text-center mb-3">
            <p className="text-amber-400 text-sm font-medium mb-1">
              Marketplace'larda savdo qilasiz, lekin natija yo'qmi?
            </p>
            <p className="text-slate-400 text-xs">
              Qimmat kurslarga oylab vaqt sarflab o'rganish shart emas!
            </p>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl font-black text-center leading-tight mb-3">
            <span className="text-white">Qimmat kurslar va </span>
            <span className="text-red-400 line-through">hodimlar</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 mt-1">
              kerak emas!
            </span>
          </h1>

          {/* Value Proposition */}
          <p className="text-center text-slate-300 text-sm mb-4 leading-relaxed">
            <span className="text-amber-400 font-bold">1 ta AI Manager</span> = 
            <span className="text-white font-bold"> 3-4 ta professional hodim</span> ishi. 
            <br/>Tezroq, xatosiz va <span className="text-green-400 font-bold">24/7</span> ishlaydi.
          </p>

          {/* Visual Demo - Happy entrepreneur with phone */}
          <div className="relative mb-4 mx-auto max-w-[280px]">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/20 border border-amber-500/30">
              <img 
                src="https://images.unsplash.com/photo-1680459575528-6b848f0255ed?w=400&h=300&fit=crop"
                alt="Tadbirkor telefon bilan mahsulot skanerlayapti"
                className="w-full h-[200px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              {/* Floating Stats */}
              <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur rounded-lg px-2 py-1">
                <p className="text-xs font-bold text-white">+180% sotuvlar</p>
              </div>
              
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-2.5 border border-amber-500/30">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <Bot className="w-4 h-4 text-black" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-xs">AI Manager ishlayapti</p>
                      <p className="text-amber-400 text-[10px]">4 ta marketplace'da parallel</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800">
              <div className="flex items-center gap-2 mb-0.5">
                <GraduationCap className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400 font-medium">Kurslar emas</span>
              </div>
              <p className="text-[10px] text-slate-400">Oylab o'rganish shart emas</p>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800">
              <div className="flex items-center gap-2 mb-0.5">
                <UserX className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400 font-medium">Hodimlar emas</span>
              </div>
              <p className="text-[10px] text-slate-400">Qimmat maosh to'lamaysiz</p>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800">
              <div className="flex items-center gap-2 mb-0.5">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400 font-medium">2 daqiqada</span>
              </div>
              <p className="text-[10px] text-slate-400">1 ta kartochka tayyor</p>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800">
              <div className="flex items-center gap-2 mb-0.5">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400 font-medium">4 marketplace</span>
              </div>
              <p className="text-[10px] text-slate-400">Bir vaqtda sotish</p>
            </div>
          </div>

          {/* Primary CTA */}
          <Button 
            onClick={openLeadForm}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-black font-black text-base py-5 rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02]"
          >
            <Phone className="w-5 h-5 mr-2" />
            BEPUL KONSULTATSIYA OLISH
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          {/* Urgency text */}
          <p className="text-center text-xs text-red-400 mt-2 font-medium animate-pulse">
            ⚡ Bepul o'rnatish uchun faqat {spotsLeft} ta joy qoldi!
          </p>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-4">
            <ChevronDown className="w-5 h-5 text-slate-500 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Problem-Solution Section */}
      <section className="px-4 py-6 bg-slate-900">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-white mb-1">
              Tanish muammolarmi?
            </h2>
          </div>

          {/* Problems */}
          <div className="bg-red-950/40 rounded-xl p-3 border border-red-500/20 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="font-bold text-red-400 text-sm">Hozirgi holat</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>Qimmat kurslarga oylab vaqt sarflash</span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>3-4 ta hodimga maosh to'lash (30M+ UZS/oy)</span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>Kartochkalar sifatsiz, savdo yo'q</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center mb-3">
            <ArrowRight className="w-5 h-5 text-amber-400 rotate-90" />
          </div>

          {/* Solution */}
          <div className="bg-green-950/40 rounded-xl p-3 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-green-400" />
              <span className="font-bold text-green-400 text-sm">AI Manager bilan</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Rasm skanerlang — <strong className="text-white">2 daqiqada</strong> kartochka tayyor</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">4 ta marketplace</strong>da parallel ishlaydi</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Xatosiz, <strong className="text-white">24/7</strong> ishlaydi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="px-4 py-6 bg-slate-950">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-4">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-2">
              <Calculator className="w-3 h-3 mr-1" />
              INVESTITSIYA QAYTIMI
            </Badge>
            <h2 className="text-lg font-bold text-white">
              Qancha tejaysiz?
            </h2>
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              
              {/* Calculation */}
              <div className="space-y-2.5 mb-4">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">1 ta marketplace menejer:</span>
                  <span className="text-white font-bold">8-12M UZS/oy</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">3-4 ta hodim jamoasi:</span>
                  <span className="text-red-400 font-bold">30-45M UZS/oy</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">AI Manager almashtiradi:</span>
                  <span className="text-amber-400 font-bold">3-4 ta hodimni</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-white font-bold text-sm">Oylik tejash:</span>
                  <span className="text-green-400 font-black text-lg">20-35M UZS</span>
                </div>
              </div>

              {/* Bottom highlight */}
              <div className="bg-amber-500/10 rounded-xl p-2.5 border border-amber-500/30">
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <p className="text-center text-xs">
                    <span className="text-slate-300">Investitsiya </span>
                    <span className="text-amber-400 font-bold">1-2 oyda</span>
                    <span className="text-slate-300"> qaytadi</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* AI Capabilities */}
      <section className="px-4 py-6 bg-slate-900">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-4">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mb-2">
              <Bot className="w-3 h-3 mr-1" />
              IMKONIYATLAR
            </Badge>
            <h2 className="text-lg font-bold text-white mb-1">
              AI Manager nima qiladi?
            </h2>
          </div>

          <div className="space-y-2">
            {aiCapabilities.map((item, i) => (
              <div 
                key={i}
                className="flex items-center gap-2.5 bg-slate-800/50 rounded-xl p-2.5 border border-slate-700"
              >
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-slate-200 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Success Stories */}
      <section className="px-4 py-6 bg-slate-950">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-4">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-2">
              <Star className="w-3 h-3 mr-1" />
              NATIJALAR
            </Badge>
            <h2 className="text-lg font-bold text-white">
              Hamkorlarimiz muvaffaqiyati
            </h2>
          </div>

          <div className="space-y-2.5">
            {successStories.map((story, i) => (
              <Card key={i} className="bg-slate-900 border-slate-800">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${story.bgColor} rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                      {story.initials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-white text-sm">{story.name}</p>
                        <Badge className="bg-green-500/20 text-green-400 text-[10px] px-1">Tasdiqlangan</Badge>
                      </div>
                      <p className="text-slate-400 text-xs mb-1.5">{story.business}</p>
                      
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="bg-slate-800/50 rounded-lg p-1.5">
                          <p className="text-amber-400 font-bold text-xs">{story.result}</p>
                        </div>
                        <div className="bg-green-500/10 rounded-lg p-1.5">
                          <p className="text-green-400 font-bold text-xs">{story.saving}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 py-6 bg-slate-900">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-white mb-1">
              Ta'riflar
            </h2>
            <p className="text-slate-400 text-sm">
              Biznesingiz hajmiga mos tanlang
            </p>
          </div>

          {/* FOMO Banner */}
          <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-xl p-2.5 border border-red-500/30 mb-3">
            <div className="flex items-center justify-center gap-2">
              <Gift className="w-4 h-4 text-red-400" />
              <p className="text-sm">
                <span className="text-white font-bold">BEPUL O'RNATISH</span>
                <span className="text-slate-300"> - Faqat </span>
                <span className="text-red-400 font-black">{spotsLeft} ta</span>
                <span className="text-slate-300"> joy!</span>
              </p>
            </div>
            <p className="text-center text-xs text-slate-400 mt-1">
              Joylar tugagach o'rnatish pullik ($699) bo'ladi
            </p>
          </div>

          {/* Premium Plan */}
          <Card className="bg-slate-800 border-amber-500/50 mb-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-2.5 py-0.5 rounded-bl-lg">
              ENG MASHHUR
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Badge className="bg-amber-500 text-black font-bold mb-1.5">PREMIUM</Badge>
                  <h3 className="text-base font-bold text-white">Yangi boshlovchilar uchun</h3>
                  <p className="text-slate-400 text-xs">Eng optimal investitsiya</p>
                </div>
                <Rocket className="w-8 h-8 text-amber-400" />
              </div>

              {/* Price */}
              <div className="bg-slate-900/60 rounded-xl p-3 mb-3 border border-slate-700">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-slate-500 line-through text-sm">$699 o'rnatish</span>
                  <Badge className="bg-green-500 text-black text-xs font-bold">BEPUL</Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">$499</span>
                  <span className="text-slate-400 text-sm">/oy</span>
                  <span className="text-amber-400 text-sm font-medium">+ 4% savdodan</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-1.5 mb-3">
                {[
                  "4 ta marketplace (Yandex, Uzum, WB, Ozon)",
                  "Cheksiz mahsulot kartochkalari",
                  "AI Manager - to'liq avtomatlashtirish",
                  "60 kunlik natija kafolati",
                  "24/7 texnik qo'llab-quvvatlash"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-white">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={openLeadForm}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-black py-4 text-base"
              >
                <Phone className="w-4 h-4 mr-2" />
                KONSULTATSIYA OLISH
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <p className="text-center text-xs text-slate-400 mt-2">
                60 kun ichida natija bo'lmasa - to'liq qaytarish
              </p>
            </CardContent>
          </Card>

          {/* Individual Plan */}
          <Card className="bg-slate-800 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Badge className="bg-purple-500 text-white font-bold mb-1.5">INDIVIDUAL</Badge>
                  <h3 className="text-base font-bold text-white">Yirik biznes uchun</h3>
                  <p className="text-slate-400 text-xs">$30,000+ oylik savdo hajmi</p>
                </div>
                <Building2 className="w-8 h-8 text-purple-400" />
              </div>

              {/* Price */}
              <div className="bg-slate-900/60 rounded-xl p-3 mb-3 border border-slate-700">
                <p className="text-base font-bold text-white mb-0.5">Maxsus narx</p>
                <p className="text-slate-400 text-sm">
                  Savdo hajmingizga qarab <span className="text-purple-400 font-semibold">individual kelishiladi</span>
                </p>
              </div>

              {/* Features */}
              <div className="space-y-1.5 mb-3">
                {[
                  "Premium ning barcha imkoniyatlari",
                  "Shaxsiy account menejer",
                  "Prioritet qo'llab-quvvatlash",
                  "Maxsus API integratsiyalar"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={openLeadForm}
                variant="outline"
                className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10 font-bold py-4"
              >
                <Phone className="w-4 h-4 mr-2" />
                SUHBAT BELGILASH
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="px-4 py-6 bg-slate-950">
        <div className="max-w-lg mx-auto">
          <Card className="bg-green-950/30 border-green-500/30">
            <CardContent className="p-4 text-center">
              <Shield className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white mb-1.5">
                60 Kunlik Natija Kafolati
              </h3>
              <p className="text-slate-300 text-sm mb-2">
                Agar 60 kun ichida tizim sizga foyda keltirmasa — 
                <span className="text-green-400 font-bold"> 100% pulni qaytaramiz</span>
              </p>
              <div className="flex justify-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  Risk-free
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  Yashirin shartlarsiz
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-6 bg-slate-900">
        <div className="max-w-lg mx-auto text-center">
          
          {/* Urgency */}
          <div className="bg-red-500/10 rounded-xl p-2.5 border border-red-500/30 mb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-red-400 font-bold text-sm">OXIRGI IMKONIYAT</span>
            </div>
            <p className="text-white text-sm">
              Bepul o'rnatish uchun faqat <span className="text-red-400 font-black">{spotsLeft}</span> ta joy qoldi
            </p>
          </div>

          <h2 className="text-lg font-bold text-white mb-2">
            Biznesingizni avtomatlashtiring
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Raqobatchilaringiz allaqachon AI ishlatmoqda. Ortda qolmang.
          </p>
          
          <Button 
            onClick={openLeadForm}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-black font-black text-base py-5 rounded-xl shadow-lg shadow-orange-500/30"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            HOZIROQ BOSHLASH
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-slate-500 text-xs mt-2">
            ✓ 60 kunlik kafolat · ✓ Tez o'rnatish · ✓ 24/7 qo'llab-quvvatlash
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="px-4 py-5 border-t border-slate-800 bg-slate-950">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-slate-400 text-sm mb-3">Savollaringiz bormi?</p>
          <div className="flex justify-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => window.open('tel:+998900082244')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Qo'ng'iroq
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => window.open('https://t.me/sellercloudx')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Telegram
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-4 border-t border-slate-800 bg-slate-950">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-slate-500 text-xs">
            © 2026 SellerCloudX. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </footer>

      {/* Mobile Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-slate-950 via-slate-950/98 to-transparent sm:hidden z-40">
        <Button 
          onClick={openLeadForm}
          className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-black font-black py-3.5 rounded-xl shadow-lg shadow-orange-500/30"
        >
          <Phone className="w-4 h-4 mr-2" />
          KONSULTATSIYA ({spotsLeft} joy qoldi)
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Spacer for fixed CTA */}
      <div className="h-16 sm:hidden" />

      {/* Lead Capture Modal - Compact, fits one screen */}
      <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-sm mx-4 p-0 max-h-[90vh] overflow-y-auto">
          {/* Header with close button */}
          <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-amber-400" />
              <span className="text-white font-bold">Bepul konsultatsiya</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={() => setShowLeadModal(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="p-4 space-y-3">
            <p className="text-slate-400 text-xs">
              Ma'lumotlaringizni qoldiring, 24 soat ichida bog'lanamiz
            </p>

            {/* Compact form */}
            <div className="space-y-3">
              <div>
                <Label className="text-slate-300 text-xs">Ism Familiya *</Label>
                <Input
                  placeholder="To'liq ismingiz"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white mt-1 h-10"
                />
              </div>

              <div>
                <Label className="text-slate-300 text-xs">Telefon raqam *</Label>
                <Input
                  placeholder="+998 90 123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white mt-1 h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-slate-300 text-xs">Hudud</Label>
                  <Select value={formData.region} onValueChange={(v) => setFormData({...formData, region: v})}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1 h-10">
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 max-h-[200px]">
                      {regions.map(r => (
                        <SelectItem key={r} value={r} className="text-white text-sm">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300 text-xs">Savdo hajmi</Label>
                  <Select value={formData.currentSalesVolume} onValueChange={(v) => setFormData({...formData, currentSalesVolume: v})}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1 h-10">
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 max-h-[200px]">
                      {salesVolumes.map(v => (
                        <SelectItem key={v} value={v} className="text-white text-sm">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-slate-300 text-xs">Biznes turi</Label>
                <Input
                  placeholder="Masalan: Kiyim, Elektronika..."
                  value={formData.businessType}
                  onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white mt-1 h-10"
                />
              </div>
            </div>

            <Button 
              onClick={handleSubmitLead}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold py-4 mt-2"
            >
              {isSubmitting ? (
                <>Yuborilmoqda...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  YUBORISH
                </>
              )}
            </Button>

            <p className="text-slate-500 text-[10px] text-center">
              Ma'lumotlaringiz maxfiy saqlanadi
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
