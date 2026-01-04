import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RoleBadge } from '@/components/admin/RoleBadge';
import { CreateAdminModal } from '@/components/admin/CreateAdminModal';
import { EditAdminModal } from '@/components/admin/EditAdminModal';
import { AdminActivityLogs } from '@/components/admin/AdminActivityLogs';
import {
  Loader2,
  Search,
  UserPlus,
  Users,
  Edit,
  Trash2,
  PauseCircle,
  PlayCircle,
  Mail,
  Clock,
  Shield,
  History,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { uz } from 'date-fns/locale';

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
}

export default function AdminManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [deleteAdmin, setDeleteAdmin] = useState<Admin | null>(null);

  const { data: admins = [], isLoading } = useQuery<Admin[]>({
    queryKey: ['/api/admin-management/admins'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin-management/admins');
      if (!res.ok) throw new Error('Failed to fetch admins');
      return res.json();
    },
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['/api/admin-management/roles'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin-management/roles');
      if (!res.ok) return [];
      return res.json();
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
      toast({ title: '❌ Xatolik yuz berdi', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (adminId: string) => {
      const res = await apiRequest('DELETE', `/api/admin-management/admins/${adminId}`);
      if (!res.ok) throw new Error('Failed to delete admin');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Admin o\'chirildi!' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-management/admins'] });
      setDeleteAdmin(null);
    },
    onError: () => {
      toast({ title: '❌ Xatolik yuz berdi', variant: 'destructive' });
    },
  });

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (admin.firstName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (admin.lastName?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const activeAdmins = admins.filter((a) => a.isActive).length;
  const totalAdmins = admins.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Admin Boshqaruv
          </h1>
          <p className="text-muted-foreground mt-1">
            Adminlarni yarating, tahrirlang va boshqaring
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} size="lg">
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
                <p className="text-2xl font-bold">{totalAdmins}</p>
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
                <p className="text-2xl font-bold">{totalAdmins - activeAdmins}</p>
                <p className="text-sm text-muted-foreground">Faol emas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="admins" className="space-y-4">
        <TabsList>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Adminlar
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Faoliyat Tarixi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admins" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Qidiruv..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Barcha rollar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha rollar</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <p className="text-muted-foreground mb-4">
                  Yangi admin qo'shish uchun tugmani bosing
                </p>
                <Button onClick={() => setCreateModalOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Yangi Admin
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAdmins.map((admin) => (
                <Card key={admin.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {admin.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {admin.firstName && admin.lastName
                              ? `${admin.firstName} ${admin.lastName}`
                              : admin.username}
                          </CardTitle>
                          <CardDescription>@{admin.username}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={admin.isActive ? 'default' : 'secondary'}>
                        {admin.isActive ? 'Faol' : 'Faol emas'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <RoleBadge role={admin.role} size="sm" />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{admin.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          {admin.lastLoginAt
                            ? formatDistanceToNow(new Date(admin.lastLoginAt), {
                                addSuffix: true,
                                locale: uz,
                              })
                            : 'Hech qachon kirmagan'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditAdmin(admin)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Tahrirlash
                      </Button>
                      {admin.role !== 'super_admin' && (
                        <>
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
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteAdmin(admin)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <AdminActivityLogs />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateAdminModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      <EditAdminModal admin={editAdmin} open={!!editAdmin} onOpenChange={(open) => !open && setEditAdmin(null)} />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteAdmin} onOpenChange={(open) => !open && setDeleteAdmin(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Adminni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Haqiqatan ham <strong>{deleteAdmin?.username}</strong> adminini o'chirmoqchimisiz?
              Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteAdmin && deleteMutation.mutate(deleteAdmin.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

