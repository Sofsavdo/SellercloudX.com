// AdminLeadsManagement - Leads from Landing Page
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Users, Phone, MapPin, DollarSign, Calendar, MessageSquare,
  CheckCircle, Clock, XCircle, UserCheck, AlertTriangle,
  Building, TrendingUp, Filter, Search, RefreshCw
} from 'lucide-react';

interface Lead {
  id: string;
  full_name: string;
  phone: string;
  region: string | null;
  current_sales_volume: string | null;
  business_type: string | null;
  marketplaces: string | null;
  message: string | null;
  source: string | null;
  campaign: string | null;
  status: string;
  assigned_to: string | null;
  notes: string | null;
  next_follow_up: string | null;
  created_at: string;
}

interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
  today: number;
  thisWeek: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: "Yangi", color: "bg-blue-500", icon: AlertTriangle },
  contacted: { label: "Bog'lanildi", color: "bg-amber-500", icon: Phone },
  qualified: { label: "Kvalifikatsiya", color: "bg-purple-500", icon: UserCheck },
  converted: { label: "Hamkor bo'ldi", color: "bg-green-500", icon: CheckCircle },
  lost: { label: "Yo'qotildi", color: "bg-red-500", icon: XCircle }
};

export function AdminLeadsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch leads
  const { data: leads = [], isLoading, refetch: refetchLeads } = useQuery<Lead[]>({
    queryKey: ['/api/admin/leads', statusFilter],
    queryFn: async () => {
      const url = statusFilter === 'all' ? '/api/admin/leads' : `/api/admin/leads?status=${statusFilter}`;
      const response = await apiRequest('GET', url);
      if (!response.ok) {
        console.error('Leads fetch failed:', response.status);
        return [];
      }
      return response.json();
    },
    refetchOnMount: true,
    staleTime: 0
  });

  // Fetch stats
  const { data: stats, refetch: refetchStats } = useQuery<LeadStats>({
    queryKey: ['/api/admin/leads/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/leads/stats');
      if (!response.ok) {
        console.error('Leads stats fetch failed:', response.status);
        return { total: 0, new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0, today: 0, thisWeek: 0 };
      }
      return response.json();
    },
    refetchOnMount: true,
    staleTime: 0
  });

  // Update lead mutation
  const updateMutation = useMutation({
    mutationFn: async ({ leadId, data }: { leadId: string; data: any }) => {
      const response = await apiRequest('PUT', `/api/admin/leads/${leadId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Muvaffaqiyatli", description: "Lead yangilandi" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/leads/stats'] });
      setShowDetailsModal(false);
    },
    onError: () => {
      toast({ title: "Xatolik", description: "Lead yangilanmadi", variant: "destructive" });
    }
  });

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        lead.full_name?.toLowerCase().includes(search) ||
        lead.phone?.includes(search) ||
        lead.region?.toLowerCase().includes(search) ||
        lead.business_type?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const openDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setEditNotes(lead.notes || '');
    setEditStatus(lead.status);
    setShowDetailsModal(true);
  };

  const handleUpdateLead = () => {
    if (selectedLead) {
      updateMutation.mutate({
        leadId: selectedLead.id,
        data: {
          status: editStatus,
          notes: editNotes
        }
      });
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{stats?.total || 0}</p>
            <p className="text-xs text-blue-600">Jami</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{stats?.new || 0}</p>
            <p className="text-xs text-amber-600">Yangi</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-700">{stats?.contacted || 0}</p>
            <p className="text-xs text-purple-600">Bog'lanildi</p>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-indigo-700">{stats?.qualified || 0}</p>
            <p className="text-xs text-indigo-600">Kvalifikatsiya</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{stats?.converted || 0}</p>
            <p className="text-xs text-green-600">Hamkor</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-700">{stats?.lost || 0}</p>
            <p className="text-xs text-red-600">Yo'qotildi</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-50 border-cyan-200">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-cyan-700">{stats?.today || 0}</p>
            <p className="text-xs text-cyan-600">Bugun</p>
          </CardContent>
        </Card>
        <Card className="bg-teal-50 border-teal-200">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-teal-700">{stats?.thisWeek || 0}</p>
            <p className="text-xs text-teal-600">Hafta</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Qidirish (ism, telefon, hudud...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barchasi</SelectItem>
              <SelectItem value="new">Yangi</SelectItem>
              <SelectItem value="contacted">Bog'lanildi</SelectItem>
              <SelectItem value="qualified">Kvalifikatsiya</SelectItem>
              <SelectItem value="converted">Hamkor bo'ldi</SelectItem>
              <SelectItem value="lost">Yo'qotildi</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="icon"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/leads'] })}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Leads List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Yuklanmoqda...
            </CardContent>
          </Card>
        ) : filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Leadlar topilmadi
            </CardContent>
          </Card>
        ) : (
          filteredLeads.map((lead) => {
            const statusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
            const StatusIcon = statusConfig.icon;
            
            return (
              <Card 
                key={lead.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openDetails(lead)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{lead.full_name}</h3>
                        <Badge className={`${statusConfig.color} text-white`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{lead.phone}</span>
                        </div>
                        {lead.region && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{lead.region}</span>
                          </div>
                        )}
                        {lead.current_sales_volume && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>{lead.current_sales_volume}</span>
                          </div>
                        )}
                        {lead.business_type && (
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            <span>{lead.business_type}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(lead.created_at)}</span>
                      </div>
                      {lead.source && (
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          {lead.source}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lead tafsilotlari</DialogTitle>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Ism Familiya</Label>
                  <p className="font-medium">{selectedLead.full_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Telefon</Label>
                  <p className="font-medium">{selectedLead.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Hudud</Label>
                  <p className="font-medium">{selectedLead.region || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Savdo hajmi</Label>
                  <p className="font-medium">{selectedLead.current_sales_volume || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Biznes turi</Label>
                  <p className="font-medium">{selectedLead.business_type || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Manba</Label>
                  <p className="font-medium">{selectedLead.source || '-'}</p>
                </div>
              </div>
              
              {selectedLead.message && (
                <div>
                  <Label className="text-muted-foreground text-xs">Xabar</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedLead.message}</p>
                </div>
              )}
              
              <div>
                <Label className="text-muted-foreground text-xs">Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Yangi</SelectItem>
                    <SelectItem value="contacted">Bog'lanildi</SelectItem>
                    <SelectItem value="qualified">Kvalifikatsiya</SelectItem>
                    <SelectItem value="converted">Hamkor bo'ldi</SelectItem>
                    <SelectItem value="lost">Yo'qotildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-muted-foreground text-xs">Izohlar</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Izohlar yozing..."
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpdateLead} 
                  className="flex-1"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open(`tel:${selectedLead.phone}`)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Qo'ng'iroq
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
