import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Search,
  UserPlus,
  Users,
  Trash2,
  PauseCircle,
  PlayCircle,
  Mail,
  Clock,
  Shield,
} from 'lucide-react';

interface Admin {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin',
  });

  const { data: admins = [], isLoading } = useQuery<Admin[]>({
    queryKey: ['/api/admin-management/admins'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/admin-management/admins');
        if (!res.ok) return [];
        return res.json();
      } catch {
        return [];
      }
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async (data: typeof newAdmin) => {
      const res = await apiRequest('POST', '/api/admin-management/admins', {
        ...data,
        roleId: data.role,
      });
      if (!res.ok) throw new Error('Failed to create admin');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Admin yaratildi!' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-management/admins'] });
      setShowCreateModal(false);
      setNewAdmin({ username: '', email: '', password: '', role: 'admin' });
    },
    onError: () => {
      toast({ title: '❌ Xatolik', variant: 'destructive' });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ adminId, isActive }: { adminId: string; isActive: boolean }) => {
      const res = await apiRequest('PUT', `/api/admin-management/admins/${adminId}/status`, { isActive });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Status o\'zgartirildi!' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-management/admins'] });
    },
    onError: () => {
      toast({ title: '❌ Xatolik', variant: 'destructive' });
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      const res = await apiRequest('DELETE', `/api/admin-management/admins/${adminId}`);
      if (!res.ok) throw new Error('Failed to delete admin');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Admin o\'chirildi!' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-management/admins'] });
    },
    onError: () => {
      toast({ title: '❌ Xatolik', variant: 'destructive' });
    },
  });

  const filteredAdmins = admins.filter((admin) => {
    const search = searchQuery.toLowerCase();
    return (
      admin.username.toLowerCase().includes(search) ||
      admin.email.toLowerCase().includes(search) ||
      (admin.firstName && admin.firstName.toLowerCase().includes(search)) ||
      (admin.lastName && admin.lastName.toLowerCase().includes(search))
    );
  });

  const activeAdmins = admins.filter((a) => a.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Admin Boshqaruv
          </h1>
          <p className="text-muted-foreground mt-1">
            Adminlarni yarating va boshqaring
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="lg">
          <UserPlus className="w-5 h-5 mr-2" />
          Yangi Admin
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{admins.length}</p>
                <p className="text-sm text-muted-foreground">Jami adminlar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <PlayCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeAdmins}</p>
                <p className="text-sm text-muted-foreground">Faol adminlar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-500/10">
                <PauseCircle className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{admins.length - activeAdmins}</p>
                <p className="text-sm text-muted-foreground">Faol emas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Admin qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Admin List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredAdmins.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium">Adminlar topilmadi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAdmins.map((admin) => (
            <Card key={admin.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {admin.firstName && admin.lastName
                        ? `${admin.firstName} ${admin.lastName}`
                        : admin.username}
                    </CardTitle>
                    <CardDescription>@{admin.username}</CardDescription>
                  </div>
                  <Badge variant={admin.isActive ? 'default' : 'secondary'}>
                    {admin.isActive ? 'Faol' : 'Faol emas'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{admin.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>{admin.role}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(admin.createdAt).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      toggleStatusMutation.mutate({
                        adminId: admin.id,
                        isActive: !admin.isActive,
                      })
                    }
                    disabled={toggleStatusMutation.isPending}
                  >
                    {admin.isActive ? (
                      <PauseCircle className="w-4 h-4" />
                    ) : (
                      <PlayCircle className="w-4 h-4" />
                    )}
                  </Button>
                  {admin.role !== 'super_admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm(`${admin.username} adminini o'chirmoqchimisiz?`)) {
                          deleteAdminMutation.mutate(admin.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Simple Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Yangi Admin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  placeholder="admin_username"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Parol</label>
                <Input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="support_admin">Support Admin</option>
                  <option value="finance_admin">Finance Admin</option>
                  <option value="content_admin">Content Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Bekor qilish
                </Button>
                <Button
                  onClick={() => createAdminMutation.mutate(newAdmin)}
                  disabled={createAdminMutation.isPending || !newAdmin.username || !newAdmin.email || !newAdmin.password}
                >
                  {createAdminMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Yaratilmoqda...
                    </>
                  ) : (
                    'Yaratish'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
