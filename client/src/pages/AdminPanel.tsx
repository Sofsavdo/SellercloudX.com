import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { 
  Users, 
  Settings, 
  BarChart, 
  Shield, 
  LogOut,
  Loader2
} from 'lucide-react';
import AdminPartnersManagement from '../components/AdminPartnersManagement';

export default function AdminPanel() {
  const { user, isLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    console.log('🔍 AdminPanel - Auth state:', { 
      isLoading, 
      user: user ? { id: user.id, role: user.role } : null 
    });

    // Wait for auth to load
    if (!isLoading) {
      if (!user) {
        console.log('❌ No user, redirecting to admin login');
        setLocation('/admin-login');
      } else if (user.role !== 'admin') {
        console.log('❌ Not admin, redirecting to home');
        setLocation('/');
      }
    }
  }, [user, isLoading, setLocation]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setLocation('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Don't render if not admin
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
              <p className="text-sm text-slate-600">SellerCloudX Boshqaruv Paneli</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user.username}</p>
                <p className="text-xs text-slate-600">Admin</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                disabled={isLoggingOut}
                className="flex items-center gap-2"
                data-testid="button-logout"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                Chiqish
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="partners" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="partners" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Hamkorlar</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              <span className="hidden sm:inline">Analitika</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Sozlamalar</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Xavfsizlik</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hamkorlar Boshqaruvi</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminPartnersManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analitikasi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Analitika tez orada qo'shiladi...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tizim Sozlamalari</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Sozlamalar tez orada qo'shiladi...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Xavfsizlik Sozlamalari</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Xavfsizlik sozlamalari tez orada qo'shiladi...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
