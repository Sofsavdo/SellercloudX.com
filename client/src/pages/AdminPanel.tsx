import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'wouter';
import AdminSuperDashboard from './AdminSuperDashboard';
import { Loader2 } from 'lucide-react';

export default function AdminPanel() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation('/admin-login');
      } else if (user.role !== 'admin') {
        setLocation('/');
      }
    }
  }, [user, isLoading, setLocation]);

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

  if (!user || user.role !== 'admin') {
    return null;
  }

  return <AdminSuperDashboard />;
}
