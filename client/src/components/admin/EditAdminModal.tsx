import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { RoleBadge } from './RoleBadge';
import { Loader2, User, Mail, Calendar, Clock, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface Admin {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  roleId: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
}

interface Permission {
  resource: string;
  actions: string[];
}

interface EditAdminModalProps {
  admin: Admin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const editAdminSchema = z.object({
  roleId: z.string().min(1, "Role tanlang"),
  isActive: z.boolean(),
});

type EditAdminForm = z.infer<typeof editAdminSchema>;

export function EditAdminModal({ admin, open, onOpenChange }: EditAdminModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['/api/admin-management/roles'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin-management/roles');
      if (!res.ok) throw new Error('Failed to fetch roles');
      return res.json();
    },
    enabled: open,
  });

  const { data: permissions = [] } = useQuery<Permission[]>({
    queryKey: ['/api/admin-management/roles', admin?.roleId, 'permissions'],
    queryFn: async () => {
      if (!admin?.roleId) return [];
      const res = await apiRequest('GET', `/api/admin-management/roles/${admin.roleId}/permissions`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: open && !!admin?.roleId,
  });

  const form = useForm<EditAdminForm>({
    resolver: zodResolver(editAdminSchema),
    defaultValues: {
      roleId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (admin) {
      form.reset({
        roleId: admin.roleId,
        isActive: admin.isActive,
      });
    }
  }, [admin, form]);

  const updateRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const res = await apiRequest('PUT', `/api/admin-management/admins/${admin?.id}/role`, { roleId });
      if (!res.ok) throw new Error('Failed to update role');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Role muvaffaqiyatli o\'zgartirildi!' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-management/admins'] });
    },
    onError: (error: Error) => {
      toast({ title: '❌ Xatolik', description: error.message, variant: 'destructive' });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      const res = await apiRequest('PUT', `/api/admin-management/admins/${admin?.id}/status`, { isActive });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Status muvaffaqiyatli o\'zgartirildi!' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-management/admins'] });
    },
    onError: (error: Error) => {
      toast({ title: '❌ Xatolik', description: error.message, variant: 'destructive' });
    },
  });

  const handleSave = () => {
    const values = form.getValues();
    
    if (values.roleId !== admin?.roleId) {
      updateRoleMutation.mutate(values.roleId);
    }
    
    if (values.isActive !== admin?.isActive) {
      updateStatusMutation.mutate(values.isActive);
    }
    
    onOpenChange(false);
  };

  const isSuperAdmin = admin?.role === 'super_admin';
  const isPending = updateRoleMutation.isPending || updateStatusMutation.isPending;

  if (!admin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Admin Tahrirlash
          </DialogTitle>
          <DialogDescription>
            Admin role va statusini o'zgartiring.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Read-only Info */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/50">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Ma'lumotlar (o'zgartirib bo'lmaydi)
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Username:</span>
                <span className="font-medium">{admin.username}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{admin.email}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Yaratilgan:</span>
                <span className="font-medium">
                  {format(new Date(admin.createdAt), 'dd.MM.yyyy HH:mm')}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Oxirgi kirish:</span>
                <span className="font-medium">
                  {admin.lastLoginAt
                    ? format(new Date(admin.lastLoginAt), 'dd.MM.yyyy HH:mm')
                    : 'Hech qachon'}
                </span>
              </div>
            </div>
          </div>

          {/* Role Change */}
          <div className="space-y-3">
            <Label>Role o'zgartirish</Label>
            {isSuperAdmin && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Super Admin role'ini o'zgartirib bo'lmaydi
              </div>
            )}
            <Select
              value={form.watch('roleId')}
              onValueChange={(value) => form.setValue('roleId', value)}
              disabled={isSuperAdmin}
            >
              <SelectTrigger>
                <SelectValue placeholder="Role tanlang" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <RoleBadge role={role.name} size="sm" />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Toggle */}
          <div className="space-y-3">
            <Label>Status</Label>
            {isSuperAdmin && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Super Admin'ni o'chirib bo'lmaydi
              </div>
            )}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                {form.watch('isActive') ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">
                    {form.watch('isActive') ? 'Faol' : 'Faol emas'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {form.watch('isActive')
                      ? 'Admin tizimga kirishi mumkin'
                      : 'Admin tizimga kira olmaydi'}
                  </p>
                </div>
              </div>
              <Switch
                checked={form.watch('isActive')}
                onCheckedChange={(checked) => form.setValue('isActive', checked)}
                disabled={isSuperAdmin}
              />
            </div>
          </div>

          {/* Permissions Preview */}
          <div className="space-y-3">
            <Label>Ruxsatlar (joriy role asosida)</Label>
            <div className="p-4 rounded-lg border bg-muted/30 max-h-40 overflow-y-auto">
              {permissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ruxsatlar yuklanmoqda...</p>
              ) : (
                <div className="space-y-2">
                  {permissions.map((perm) => (
                    <div key={perm.resource} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{perm.resource}:</span>
                      <span className="text-muted-foreground">
                        {perm.actions.join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Yopish
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                'Saqlash'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

