// Premium Auth Page - Login & Registration
// Professional Fintech-Style Design

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles, ArrowLeft, Eye, EyeOff, Mail, Lock, User, Building,
  Phone, Rocket, CheckCircle, ArrowRight, Gift, Loader2
} from 'lucide-react';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // Register form
  const [registerData, setRegisterData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    username: '', password: '', businessName: '',
    referralCode: '', agreeToTerms: false
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(loginData.username, loginData.password);
      console.log('Login result:', result);
      
      // Use window.location for full page reload to ensure session is picked up
      if (result?.user?.role === 'admin') {
        window.location.href = '/admin-panel';
      } else if (result?.user?.role === 'partner') {
        window.location.href = '/partner-dashboard';
      } else {
        // Default redirect for other roles
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Kirish xatosi');
      setIsLoading(false);
    }
  };

  const registrationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/partners/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...data, businessCategory: 'general', monthlyRevenue: '0' }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Muvaffaqiyatli!", description: "Admin tez orada tasdiqlab, platformaga kirish beradi." });
      setTimeout(() => setLocation('/'), 2000);
    },
    onError: (error: Error) => {
      toast({ title: "Xatolik", description: error.message, variant: "destructive" });
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.agreeToTerms) {
      toast({ title: "Shartlarni qabul qiling", variant: "destructive" });
      return;
    }
    registrationMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation('/')}>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">SellerCloudX</span>
              <p className="text-sm text-white/70">AI Marketplace Platform</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Biznesingizni<br />AI Bilan Kuchaytiring
          </h1>
          <div className="space-y-4">
            {[
              '95% vaqt tejash',
              '3x ko\'proq savdo',
              '24/7 avtomatik ishlash'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/60 text-sm">© 2024 SellerCloudX. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="p-6 flex justify-between items-center">
          <Button variant="ghost" onClick={() => setLocation('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Bosh sahifa
          </Button>
          
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">SellerCloudX</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md space-y-8">
            {/* Mode Toggle */}
            <div className="flex p-1 bg-muted rounded-lg">
              <button
                onClick={() => setMode('login')}
                className={cn(
                  'flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all',
                  mode === 'login' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Kirish
              </button>
              <button
                onClick={() => setMode('register')}
                className={cn(
                  'flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all',
                  mode === 'register' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Ro'yxatdan o'tish
              </button>
            </div>

            {/* Login Form */}
            {mode === 'login' && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Xush kelibsiz!</h2>
                  <p className="text-muted-foreground">Hisobingizga kiring</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="username"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        className="pl-10"
                        placeholder="Username kiriting"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Parol</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10 pr-10"
                        placeholder="Parol kiriting"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Kirish...</>
                    ) : (
                      <>Kirish <ArrowRight className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                  Hisobingiz yo'qmi?{' '}
                  <button onClick={() => setMode('register')} className="text-primary font-medium hover:underline">
                    Ro'yxatdan o'ting
                  </button>
                </p>
              </div>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Hamkor Bo'ling!</h2>
                  <p className="text-muted-foreground">2 daqiqada ro'yxatdan o'ting</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ism</Label>
                      <Input
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                        placeholder="Rustam"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Familiya</Label>
                      <Input
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                        placeholder="Karimov"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="pl-10"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Telefon</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        className="pl-10"
                        placeholder="+998 90 123 45 67"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Biznes Nomi</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={registerData.businessName}
                        onChange={(e) => setRegisterData({ ...registerData, businessName: e.target.value })}
                        className="pl-10"
                        placeholder="ElectroMart UZ"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        placeholder="rustam_seller"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Parol</Label>
                      <Input
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        placeholder="••••••"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-emerald-500" /> Promo Kod (ixtiyoriy)
                    </Label>
                    <Input
                      value={registerData.referralCode}
                      onChange={(e) => setRegisterData({ ...registerData, referralCode: e.target.value.toUpperCase() })}
                      placeholder="SCX-XXXXXX"
                      className="font-mono"
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <Checkbox
                      id="terms"
                      checked={registerData.agreeToTerms}
                      onCheckedChange={(checked) => setRegisterData({ ...registerData, agreeToTerms: checked as boolean })}
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                      Men <span className="font-medium text-foreground">Shartlar va Qoidalar</span> bilan tanishdim va roziman
                    </label>
                  </div>

                  <Button type="submit" className="w-full" disabled={registrationMutation.isPending}>
                    {registrationMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Yuborilmoqda...</>
                    ) : (
                      <><Rocket className="w-4 h-4 mr-2" /> Ro'yxatdan O'tish</>
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                  Allaqachon hisobingiz bormi?{' '}
                  <button onClick={() => setMode('login')} className="text-primary font-medium hover:underline">
                    Kirish
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
