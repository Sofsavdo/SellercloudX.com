import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Eye, LogOut, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ImpersonationButtonProps {
  partnerId: string;
  partnerName: string;
  partnerUsername: string;
}

export function ImpersonationButton({ partnerId, partnerName, partnerUsername }: ImpersonationButtonProps) {
  const { toast } = useToast();
  const { refetch } = useAuth();
  const [impersonating, setImpersonating] = useState(false);

  const impersonateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/admin/impersonate/${partnerId}`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Impersonation Boshlandi',
        description: `${partnerName} sifatida kirildi`,
      });
      setImpersonating(true);
      
      // Redirect to partner dashboard after 1 second
      setTimeout(() => {
        window.location.href = '/partner-dashboard';
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const exitImpersonateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/exit-impersonate');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Admin Holatga Qaytdingiz',
        description: 'Impersonation tugatildi',
      });
      setImpersonating(false);
      refetch();
      
      // Redirect to admin panel
      setTimeout(() => {
        window.location.href = '/admin-panel';
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="flex items-center gap-2">
      {!impersonating ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => impersonateMutation.mutate()}
          disabled={impersonateMutation.isPending}
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Hamkor sifatida kirish
        </Button>
      ) : (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => exitImpersonateMutation.mutate()}
          disabled={exitImpersonateMutation.isPending}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Chiqish
        </Button>
      )}
    </div>
  );
}

// Impersonation Banner - shows when admin is impersonating
export function ImpersonationBanner() {
  const [impersonationData, setImpersonationData] = React.useState<any>(null);
  const { toast } = useToast();

  // Check impersonation status on mount
  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/impersonate/status');
        const data = await response.json();
        if (data.impersonating) {
          setImpersonationData(data);
        }
      } catch (error) {
        console.error('Failed to check impersonation status:', error);
      }
    };
    checkStatus();
  }, []);

  const exitImpersonateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/exit-impersonate');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Admin Holatga Qaytdingiz',
        description: 'Impersonation tugatildi',
      });
      setImpersonationData(null);
      setTimeout(() => {
        window.location.href = '/admin-panel';
      }, 1000);
    },
  });

  if (!impersonationData) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-warning/90 backdrop-blur-sm border-b border-warning">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-warning-foreground" />
          <div>
            <p className="font-semibold text-warning-foreground">
              Admin Mode: {impersonationData.originalAdmin?.username}
            </p>
            <p className="text-sm text-warning-foreground/80">
              Hamkor sifatida ko'rmoqdasiz: {impersonationData.targetPartner?.userId}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => exitImpersonateMutation.mutate()}
          disabled={exitImpersonateMutation.isPending}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Admin Holatga Qaytish
        </Button>
      </div>
    </div>
  );
}
