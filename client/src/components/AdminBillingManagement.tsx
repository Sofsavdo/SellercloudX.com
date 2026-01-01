// Admin Billing Management Component
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DollarSign, 
  FileText, 
  TrendingUp,
  Download,
  Search,
  Filter,
  Calendar,
  Users
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface Invoice {
  id: string;
  partnerId: string;
  partnerName: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  paidAt: string;
  createdAt: string;
}

interface Payment {
  id: string;
  partnerId: string;
  partnerName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

interface Commission {
  id: string;
  partnerId: string;
  partnerName: string;
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: string;
  createdAt: string;
}

export function AdminBillingManagement() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Fetch invoices
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/admin/invoices'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/invoices');
      return response.json();
    },
  });

  // Fetch payments
  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ['/api/admin/payments'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/payments');
      return response.json();
    },
  });

  // Fetch commissions
  const { data: commissions = [], isLoading: commissionsLoading } = useQuery<Commission[]>({
    queryKey: ['/api/admin/commissions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/commissions');
      return response.json();
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    }
    return `${amount.toLocaleString()} ${currency}`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: { variant: 'default', text: 'To\'landi' },
      paid: { variant: 'default', text: 'To\'landi' },
      pending: { variant: 'secondary', text: 'Kutilmoqda' },
      failed: { variant: 'destructive', text: 'Xato' },
      cancelled: { variant: 'outline', text: 'Bekor qilindi' },
    };

    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => row[h]).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Calculate stats
  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingInvoices = invoices
    .filter(i => i.status === 'pending')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalCommissions = commissions
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const thisMonthRevenue = payments
    .filter(p => {
      const date = new Date(p.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && 
             date.getFullYear() === now.getFullYear() &&
             p.status === 'completed';
    })
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Jami Daromad</div>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Kutilayotgan</div>
                <div className="text-2xl font-bold">{formatCurrency(pendingInvoices)}</div>
              </div>
              <FileText className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Komissiyalar</div>
                <div className="text-2xl font-bold">{formatCurrency(totalCommissions)}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Ushbu Oy</div>
                <div className="text-2xl font-bold">{formatCurrency(thisMonthRevenue)}</div>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Billing Boshqaruvi</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (activeTab === 'invoices') exportToCSV(invoices, 'invoices');
                  if (activeTab === 'payments') exportToCSV(payments, 'payments');
                  if (activeTab === 'commissions') exportToCSV(commissions, 'commissions');
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="invoices">
                <FileText className="w-4 h-4 mr-2" />
                Hisob-fakturalar
              </TabsTrigger>
              <TabsTrigger value="payments">
                <DollarSign className="w-4 h-4 mr-2" />
                To'lovlar
              </TabsTrigger>
              <TabsTrigger value="commissions">
                <TrendingUp className="w-4 h-4 mr-2" />
                Komissiyalar
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex gap-4 my-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Hamkor nomi yoki ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  <SelectItem value="pending">Kutilmoqda</SelectItem>
                  <SelectItem value="completed">To'landi</SelectItem>
                  <SelectItem value="failed">Xato</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sana" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha vaqt</SelectItem>
                  <SelectItem value="today">Bugun</SelectItem>
                  <SelectItem value="week">Bu hafta</SelectItem>
                  <SelectItem value="month">Bu oy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Invoices Tab */}
            <TabsContent value="invoices">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hamkor</TableHead>
                      <TableHead>Summa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>To'lov Sanasi</TableHead>
                      <TableHead>Yaratilgan</TableHead>
                      <TableHead>Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoicesLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Yuklanmoqda...
                        </TableCell>
                      </TableRow>
                    ) : invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500">
                          Hisob-fakturalar topilmadi
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.partnerName}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(invoice.amount, invoice.currency)}
                          </TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                          <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hamkor</TableHead>
                      <TableHead>Summa</TableHead>
                      <TableHead>Usul</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sana</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Yuklanmoqda...
                        </TableCell>
                      </TableRow>
                    ) : payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          To'lovlar topilmadi
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {payment.partnerName}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{payment.paymentMethod}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell>{formatDate(payment.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Commissions Tab */}
            <TabsContent value="commissions">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hamkor</TableHead>
                      <TableHead>Savdo</TableHead>
                      <TableHead>Stavka</TableHead>
                      <TableHead>Komissiya</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sana</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Yuklanmoqda...
                        </TableCell>
                      </TableRow>
                    ) : commissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500">
                          Komissiyalar topilmadi
                        </TableCell>
                      </TableRow>
                    ) : (
                      commissions.map((commission) => (
                        <TableRow key={commission.id}>
                          <TableCell className="font-medium">
                            {commission.partnerName}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(commission.saleAmount)}
                          </TableCell>
                          <TableCell>
                            {(commission.commissionRate * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell className="font-semibold text-green-600">
                            {formatCurrency(commission.commissionAmount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(commission.status)}</TableCell>
                          <TableCell>{formatDate(commission.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
