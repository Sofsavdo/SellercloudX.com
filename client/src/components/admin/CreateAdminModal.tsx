import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, UserPlus, Crown, Headphones, DollarSign, Package, BarChart3 } from 'lucide-react';

const createAdminSchema = z.object({
  username: z.string().min(3, "Minimum 3 ta belgi"),
  email: z.string().email("Email noto'g'ri formatda"),
  password: z.string().min(8, "Minimum 8 ta belgi"),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  roleId: z.string().min(1, "Role tanlang"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Parollar mos kelmadi",
  path: ['confirmPassword'],
});

type CreateAdminForm = z.infer<typeof createAdminSchema>;

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
}

interface CreateAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  super_admin: Crown,
  support_admin: Headphones,
  finance_admin: DollarSign,
  content_admin: Package,
  analytics_admin: BarChart3,
};

const roleColors: Record<string, string> = {
  super_admin: 'border-purple-500 bg-purple-50 dark:bg-purple-950/30',
  support_admin: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
  finance_admin: 'border-green-500 bg-green-50 dark:bg-green-950/30',
  content_admin: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30',
  analytics_admin: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30',
};

export function CreateAdminModal({ open, onOpenChange }: CreateAdminModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: roles = [], isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ['/api/admin-management/roles'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin-management/roles');
      if (!res.ok) throw new Error('Failed to fetch roles');
      return res.json();
    },
    enabled: open,
  });

  const form = useForm<CreateAdminForm>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      roleId: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateAdminForm) => {
      const res = await apiRequest('POST', '/api/admin-management/admins', {
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        roleId: data.roleId,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create admin');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Admin muvaffaqiyatli yaratildi!' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-management/admins'] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: '❌ Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateAdminForm) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Yangi Admin Qo'shish
          </DialogTitle>
          <DialogDescription>
            Yangi admin yarating va role tayinlang. Barcha maydonlar to'ldirilishi kerak.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* User Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Foydalanuvchi ma'lumotlari</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="admin_username"
                  {...form.register('username')}
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ism</Label>
                <Input
                  id="firstName"
                  placeholder="Ali"
                  {...form.register('firstName')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Familiya</Label>
                <Input
                  id="lastName"
                  placeholder="Valiyev"
                  {...form.register('lastName')}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Parol</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Parol *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...form.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Parolni takrorlang *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...form.register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Role tanlang *</h3>
            
            {rolesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <RadioGroup
                value={form.watch('roleId')}
                onValueChange={(value) => form.setValue('roleId', value)}
                className="space-y-3"
              >
                {roles.map((role) => {
                  const Icon = roleIcons[role.name] || Crown;
                  const colorClass = roleColors[role.name] || '';
                  const isSelected = form.watch('roleId') === role.id;
                  
                  return (
                    <div
                      key={role.id}
                      className={`relative flex items-start gap-4 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        isSelected ? colorClass + ' border-opacity-100' : 'border-border hover:border-muted-foreground/50'
                      }`}
                      onClick={() => form.setValue('roleId', role.id)}
                    >
                      <RadioGroupItem value={role.id} id={role.id} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={role.id} className="flex items-center gap-2 cursor-pointer font-semibold">
                          <Icon className="w-4 h-4" />
                          {role.displayName}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            )}
            {form.formState.errors.roleId && (
              <p className="text-sm text-destructive">{form.formState.errors.roleId.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Bekor qilish
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Yaratilmoqda...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Yaratish
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

