import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  UserPlus, 
  Shield, 
  Trash2, 
  Edit, 
  Key,
  Eye,
  EyeOff,
  Crown,
  Lock,
  Unlock
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Admin {
  id: string;
  username: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  permissions: Record<string, boolean>;
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = {
  'view_partners': 'Hamkorlarni Ko\'rish',
  'manage_partners': 'Hamkorlarni Boshqarish',
  'view_analytics': 'Analitika Ko\'rish',
  'manage_marketplace': 'Marketplace Boshqarish',
  'view_ai': 'AI Manager Ko\'rish',
  'manage_ai': 'AI Manager Boshqarish',
  'view_messages': 'Xabarlar Ko\'rish',
  'send_messages': 'Xabar Yuborish',
  'view_referrals': 'Referrallar Ko\'rish',
  'manage_settings': 'Sozlamalar Boshqarish',
  'view_remote_access': 'Remote Access Ko\'rish',
};

export function SuperAdminManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    isSuperAdmin: false,
    permissions: {} as Record<string, boolean>,
  });

  const { data: admins, isLoading } = useQuery({
    queryKey: ['/api/admin/admins'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/admins');
      return response.json();
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/admin/admins', data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Admin yaratildi', description: 'Yangi admin muvaffaqiyatli qo\'shildi' });
      setShowAddModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/admins'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Xatolik', description: error.message, variant: 'destructive' });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ adminId, permissions }: { adminId: string; permissions: Record<string, boolean> }) => {
      const response = await apiRequest('PATCH', `/api/admin/admins/${adminId}/permissions`, { permissions });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Saqlandi', description: 'Ruxsatlar yangilandi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/admins'] });
    },
  });

  const toggleAdminStatusMutation = useMutation({
    mutationFn: async (adminId: string) => {
      const response = await apiRequest('PATCH', `/api/admin/admins/${adminId}/toggle-status`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Status o\'zgartirildi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/admins'] });
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/admins/${adminId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'O\'chirildi', description: 'Admin o\'chirildi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/admins'] });
    },
  });

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      isSuperAdmin: false,
      permissions: {},
    });
  };

  const handlePermissionToggle = (adminId: string, permKey: string, currentValue: boolean) => {
    const admin = admins?.admins?.find((a: Admin) => a.id === adminId);
    if (!admin) return;

    const newPermissions = {
      ...admin.permissions,
      [permKey]: !currentValue,
    };

    updatePermissionsMutation.mutate({ adminId, permissions: newPermissions });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const adminsList: Admin[] = admins?.admins || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary" />
            Admin Management
          </h2>
          <p className="text-muted-foreground">Super Admin faqat - adminlarni boshqarish</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Yangi Admin Qo'shish
        </Button>
      </div>

      {/* Admins List */}
      <div className="grid grid-cols-1 gap-4">
        {adminsList.map((admin) => (
          <Card key={admin.id} className={admin.isSuperAdmin ? 'border-primary' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    admin.isSuperAdmin ? 'bg-gradient-to-br from-primary to-accent' : 'bg-slate-200'
                  }`}>
                    {admin.isSuperAdmin ? (
                      <Crown className="w-6 h-6 text-white" />
                    ) : (
                      <Shield className="w-6 h-6 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{admin.username}</h3>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {admin.isSuperAdmin && (
                    <Badge className="bg-gradient-to-r from-primary to-accent">
                      Super Admin
                    </Badge>
                  )}
                  <Badge variant={admin.isActive ? 'default' : 'secondary'}>
                    {admin.isActive ? 'Faol' : 'Nofaol'}
                  </Badge>
                </div>
              </div>

              {/* Permissions Grid */}
              {!admin.isSuperAdmin && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Ruxsatlar
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(AVAILABLE_PERMISSIONS).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm">{label}</span>
                        <Switch
                          checked={admin.permissions?.[key] || false}
                          onCheckedChange={() => handlePermissionToggle(admin.id, key, admin.permissions?.[key])}
                          disabled={updatePermissionsMutation.isPending}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {!admin.isSuperAdmin && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAdminStatusMutation.mutate(admin.id)}
                    disabled={toggleAdminStatusMutation.isPending}
                  >
                    {admin.isActive ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Bloklash
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Faollashtirish
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Adminni o\'chirmoqchimisiz?')) {
                        deleteAdminMutation.mutate(admin.id);
                      }
                    }}
                    disabled={deleteAdminMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    O'chirish
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Admin Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yangi Admin Qo'shish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Username *</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="admin_username"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <Label>Parol *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Kuchli parol kiriting"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded">
              <Switch
                checked={formData.isSuperAdmin}
                onCheckedChange={(checked) => setFormData({ ...formData, isSuperAdmin: checked })}
              />
              <div>
                <p className="font-semibold">Super Admin qilish</p>
                <p className="text-xs text-muted-foreground">
                  Super Admin barcha ruxsatlarga ega bo'ladi
                </p>
              </div>
            </div>

            {!formData.isSuperAdmin && (
              <div className="space-y-2">
                <Label>Ruxsatlarni Tanlang</Label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded">
                  {Object.entries(AVAILABLE_PERMISSIONS).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Switch
                        checked={formData.permissions[key] || false}
                        onCheckedChange={(checked) => 
                          setFormData({
                            ...formData,
                            permissions: { ...formData.permissions, [key]: checked }
                          })
                        }
                      />
                      <span className="text-sm">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => createAdminMutation.mutate(formData)}
                disabled={!formData.username || !formData.password || createAdminMutation.isPending}
                className="flex-1"
              >
                {createAdminMutation.isPending ? 'Yaratilmoqda...' : 'Admin Yaratish'}
              </Button>
              <Button variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                Bekor qilish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
