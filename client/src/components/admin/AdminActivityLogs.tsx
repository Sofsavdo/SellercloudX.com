import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, History, User, UserPlus, Edit, Trash2, CheckCircle, XCircle, MessageSquare, CreditCard, Package, FileText } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { uz } from 'date-fns/locale';

interface Admin {
  id: string;
  username: string;
}

interface ActivityLog {
  id: string;
  adminId: string;
  adminUsername: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  create: UserPlus,
  update: Edit,
  delete: Trash2,
  confirm: CheckCircle,
  reject: XCircle,
  chat: MessageSquare,
  payment: CreditCard,
  product: Package,
  default: FileText,
};

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  update: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  confirm: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  reject: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  default: 'bg-muted text-muted-foreground',
};

const resourceLabels: Record<string, string> = {
  admin: 'Admin',
  partner: 'Hamkor',
  payment: "To'lov",
  product: 'Mahsulot',
  chat: 'Chat',
  invoice: 'Invoice',
  role: 'Role',
};

export function AdminActivityLogs() {
  const [adminFilter, setAdminFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');

  const { data: admins = [] } = useQuery<Admin[]>({
    queryKey: ['/api/admin-management/admins'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin-management/admins');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: logs = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: ['/api/admin-management/activity-logs', adminFilter, resourceFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (adminFilter !== 'all') params.set('adminId', adminFilter);
      if (resourceFilter !== 'all') params.set('resourceType', resourceFilter);
      params.set('limit', '100');
      
      const res = await apiRequest('GET', `/api/admin-management/activity-logs?${params}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const getActionIcon = (action: string) => {
    const Icon = actionIcons[action] || actionIcons.default;
    return Icon;
  };

  const getActionColor = (action: string) => {
    return actionColors[action] || actionColors.default;
  };

  const formatDetails = (details: Record<string, unknown> | undefined) => {
    if (!details) return null;
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Admin Faoliyat Tarixi
        </CardTitle>
        <CardDescription>
          Barcha admin harakatlarini kuzating
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <Select value={adminFilter} onValueChange={setAdminFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Admin tanlang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha adminlar</SelectItem>
              {admins.map((admin) => (
                <SelectItem key={admin.id} value={admin.id}>
                  {admin.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Resurs turi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha resurslar</SelectItem>
              {Object.entries(resourceLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Logs List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Faoliyat tarixi topilmadi</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {logs.map((log) => {
                const Icon = getActionIcon(log.action);
                const colorClass = getActionColor(log.action);
                
                return (
                  <div
                    key={log.id}
                    className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{log.adminUsername}</span>
                        <Badge variant="outline" className="text-xs">
                          {resourceLabels[log.resourceType] || log.resourceType}
                        </Badge>
                      </div>
                      
                      <p className="text-sm">
                        <span className="font-medium capitalize">{log.action}</span>
                        {log.resourceId && (
                          <span className="text-muted-foreground"> - ID: {log.resourceId}</span>
                        )}
                      </p>
                      
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          📋 {formatDetails(log.details)}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                      <p>{format(new Date(log.createdAt), 'HH:mm')}</p>
                      <p className="text-xs">
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                          locale: uz,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

