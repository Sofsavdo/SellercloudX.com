import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Rocket, Home, Gift, User, Building, Mail, Phone, Lock, Tag, Crown, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export default function PartnerRegistrationNew() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [promoCode, setPromoCode] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [innError, setInnError] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    businessName: '',
    businessType: 'yatt', // yatt, ooo, individual
    inn: '', // STIR - majburiy
    agreeToTerms: false,
    referralCode: ''
  });

  // INN validatsiya (kuchaytirilgan)
  const validateINN = (inn: string) => {
    const cleanINN = inn.replace(/\D/g, '');
    if (!cleanINN) {
      setInnError('');
      return;
    }
    if (cleanINN.length !== 9) {
      setInnError('INN 9 ta raqamdan iborat bo\'lishi kerak');
      return;
    }
    if (cleanINN.startsWith('0')) {
      setInnError('Noto\'g\'ri INN formati');
      return;
    }
    // Barcha raqamlar bir xil bo'lmasligi kerak
    const allSame = cleanINN.split('').every((d: string) => d === cleanINN[0]);
    if (allSame) {
      setInnError('Noto\'g\'ri INN: barcha raqamlar bir xil bo\'lmasligi kerak');
      return;
    }
    // Ketma-ket raqamlar bo'lmasligi kerak
    if (cleanINN === '123456789' || cleanINN === '987654321') {
      setInnError('Noto\'g\'ri INN: ketma-ket raqamlar qabul qilinmaydi');
      return;
    }
    // Viloyat kodi tekshirish (birinchi 2 raqam 10-99 orasida)
    const regionCode = parseInt(cleanINN.substring(0, 2));
    if (regionCode < 10 || regionCode > 99) {
      setInnError('Noto\'g\'ri INN: viloyat kodi noto\'g\'ri');
      return;
    }
    setInnError('');
  };

  useEffect(() => {
    // Get referral code
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setPromoCode(ref);
      setFormData(prev => ({ ...prev, referralCode: ref }));
      toast({
        title: "🎁 Promo kod qo'llandi!",
        description: `Kod: ${ref}`,
      });
    }

    // Get selected tier from sessionStorage
    const savedTier = sessionStorage.getItem('selectedTier');
    if (savedTier) {
      try {
        const tier = JSON.parse(savedTier);
        setSelectedTier(tier);
        toast({
          title: "✅ Tarif tanlandi",
          description: `${tier.name} - ${tier.priceSom}`,
        });
      } catch (error) {
        console.error('Failed to parse selected tier:', error);
      }
    }
  }, [toast]);

  const registrationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/partners/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          businessCategory: 'general',
          monthlyRevenue: '0',
          pricingTier: selectedTier?.id || 'free_starter', // Use selected tier
          notes: selectedTier ? `Selected tier: ${selectedTier.name}` : ''
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Muvaffaqiyatli!",
        description: "Admin tez orada tasdiqlab, platformaga kirish beradi.",
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Xatolik",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      toast({
        title: "Shartlarni qabul qiling",
        variant: "destructive"
      });
      return;
    }
    registrationMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Button
        onClick={() => setLocation('/')}
        variant="ghost"
        className="absolute top-4 left-4 flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        Bosh sahifa
      </Button>

      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-3xl font-bold text-center">
            SellerCloudX ga Qo'shiling!
          </CardTitle>
          <p className="text-center text-white/90 mt-2">
            Bir ekranda ro'yxatdan o'ting - Admin tasdiqlab kirish beradi
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Selected Tier Card */}
          {selectedTier && (
            <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tanlangan tarif</p>
                    <h3 className="text-xl font-bold">{selectedTier.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedTier.priceSom}</p>
                  </div>
                </div>
                <Badge className="bg-success text-success-foreground">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Tanlandi
                </Badge>
              </div>
            </div>
          )}

          {promoCode && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800">
                Promo kod: <strong>{promoCode}</strong>
              </span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Single Grid Layout */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Ism *
                  </Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                    placeholder="Rustam"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Familiya *
                  </Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                    placeholder="Karimov"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email *
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    placeholder="rustam@example.uz"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefon *
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    placeholder="+998901234567"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Username *
                  </Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                    placeholder="rustam_seller"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Parol *
                  </Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    placeholder="Minimal 6 belgi"
                    minLength={6}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Biznes Nomi *
                  </Label>
                  <Input
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    required
                    placeholder="ElectroMart UZ"
                    className="mt-1"
                  />
                </div>

                {/* Biznes turi */}
                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Biznes Turi *
                  </Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => setFormData({...formData, businessType: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yatt">YATT (Yakka tartibdagi tadbirkor)</SelectItem>
                      <SelectItem value="ooo">OOO/MChJ (Mas'uliyati cheklangan jamiyat)</SelectItem>
                      <SelectItem value="individual">Jismoniy shaxs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* INN (STIR) */}
                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    INN (STIR) *
                  </Label>
                  <Input
                    value={formData.inn}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                      setFormData({...formData, inn: value});
                      validateINN(value);
                    }}
                    required
                    placeholder="123456789"
                    className={`mt-1 ${innError ? 'border-red-500' : ''}`}
                    maxLength={9}
                  />
                  {innError && (
                    <p className="text-sm text-red-500 mt-1">{innError}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    9 ta raqam. Bitta INN = Bitta akkaunt
                  </p>
                </div>

                {/* INN haqida ogohlantirish */}
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-sm">
                    <strong>Muhim:</strong> Har bir biznes (YATT/OOO) uchun faqat bitta akkaunt yaratish mumkin. 
                    INN bo'yicha dublikat akkauntlar bloklash bilan ogohlantirish oladi.
                  </AlertDescription>
                </Alert>

                {promoCode && (
                  <div>
                    <Label className="flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      Referral Kod
                    </Label>
                    <Input
                      value={formData.referralCode}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Checkbox
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => setFormData({...formData, agreeToTerms: checked as boolean})}
                id="terms"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                Men <span className="font-bold">Shartlar va Qoidalar</span> bilan tanishdim va roziman.
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!formData.agreeToTerms || !formData.inn || innError !== '' || registrationMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-lg"
            >
              {registrationMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Yuborilmoqda...
                </div>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  Ro'yxatdan O'tish
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Allaqachon akkauntingiz bormi?{' '}
            <button
              onClick={() => setLocation('/login')}
              className="text-blue-600 hover:underline font-semibold"
            >
              Kirish
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
