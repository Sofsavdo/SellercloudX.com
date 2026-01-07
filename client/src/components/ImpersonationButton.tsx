import { useState } from 'react';
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
    <div className=\"flex items-center gap-2\">\n      {!impersonating ? (\n        <Button\n          size=\"sm\"\n          variant=\"outline\"\n          onClick={() => impersonateMutation.mutate()}\n          disabled={impersonateMutation.isPending}\n          className=\"flex items-center gap-2\"\n        >\n          <Eye className=\"w-4 h-4\" />\n          Hamkor sifatida kirish\n        </Button>\n      ) : (\n        <Button\n          size=\"sm\"\n          variant=\"destructive\"\n          onClick={() => exitImpersonateMutation.mutate()}\n          disabled={exitImpersonateMutation.isPending}\n          className=\"flex items-center gap-2\"\n        >\n          <LogOut className=\"w-4 h-4\" />\n          Chiqish\n        </Button>\n      )}\n    </div>\n  );\n}\n\n// Impersonation Banner - shows when admin is impersonating\nexport function ImpersonationBanner() {\n  const [impersonationData, setImpersonationData] = useState<any>(null);\n  const { toast } = useToast();\n\n  // Check impersonation status on mount\n  React.useEffect(() => {\n    const checkStatus = async () => {\n      try {\n        const response = await apiRequest('GET', '/api/admin/impersonate/status');\n        const data = await response.json();\n        if (data.impersonating) {\n          setImpersonationData(data);\n        }\n      } catch (error) {\n        console.error('Failed to check impersonation status:', error);\n      }\n    };\n    checkStatus();\n  }, []);\n\n  const exitImpersonateMutation = useMutation({\n    mutationFn: async () => {\n      const response = await apiRequest('POST', '/api/admin/exit-impersonate');\n      return response.json();\n    },\n    onSuccess: () => {\n      toast({\n        title: 'Admin Holatga Qaytdingiz',\n        description: 'Impersonation tugatildi',\n      });\n      setImpersonationData(null);\n      setTimeout(() => {\n        window.location.href = '/admin-panel';\n      }, 1000);\n    },\n  });\n\n  if (!impersonationData) return null;\n\n  return (\n    <div className=\"fixed top-0 left-0 right-0 z-50 bg-warning/90 backdrop-blur-sm border-b border-warning\">\n      <div className=\"max-w-7xl mx-auto px-4 py-3 flex items-center justify-between\">\n        <div className=\"flex items-center gap-3\">\n          <AlertCircle className=\"w-5 h-5 text-warning-foreground\" />\n          <div>\n            <p className=\"font-semibold text-warning-foreground\">\n              Admin Mode: {impersonationData.originalAdmin?.username}\n            </p>\n            <p className=\"text-sm text-warning-foreground/80\">\n              Hamkor sifatida ko'rmoqdasiz: {impersonationData.targetPartner?.userId}\n            </p>\n          </div>\n        </div>\n        <Button\n          size=\"sm\"\n          variant=\"secondary\"\n          onClick={() => exitImpersonateMutation.mutate()}\n          disabled={exitImpersonateMutation.isPending}\n          className=\"flex items-center gap-2\"\n        >\n          <LogOut className=\"w-4 h-4\" />\n          Admin Holatga Qaytish\n        </Button>\n      </div>\n    </div>\n  );\n}\n\n// Add React import\nimport React from 'react';\n