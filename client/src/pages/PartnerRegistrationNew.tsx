import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Rocket, Home, Gift, User, Building, Mail, Phone, Lock, Tag, Crown, CheckCircle } from 'lucide-react';

export default function PartnerRegistrationNew() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [promoCode, setPromoCode] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    businessName: '',
    agreeToTerms: false,
    referralCode: ''
  });

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
              disabled={!formData.agreeToTerms || registrationMutation.isPending}
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
