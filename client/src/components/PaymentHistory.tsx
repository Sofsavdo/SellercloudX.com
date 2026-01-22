// Payment History Component
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  CreditCard, 
  Download, 
  Search,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: string;
  createdAt: string;
  completedAt: string;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  paidAt: string;
  paymentMethod: string;
  createdAt: string;
}

export function PaymentHistory() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Fetch payments
  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ['/api/payments'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/payments');
      return response.json();
    },
  });

  // Fetch invoices
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/invoices');
      return response.json();
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: { variant: 'default', icon: CheckCircle, text: 'To\'landi', color: 'text-green-600' },
      paid: { variant: 'default', icon: CheckCircle, text: 'To\'landi', color: 'text-green-600' },
      pending: { variant: 'secondary', icon: Clock, text: 'Kutilmoqda', color: 'text-yellow-600' },
      failed: { variant: 'destructive', icon: XCircle, text: 'Xato', color: 'text-red-600' },
      cancelled: { variant: 'outline', icon: XCircle, text: 'Bekor qilindi', color: 'text-gray-600' },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    const methods: Record<string, string> = {
      click: 'Click',
      payme: 'Payme',
      uzcard: 'Uzcard',
      manual: 'Qo\'lda',
      bank_transfer: 'Bank o\'tkazma',
      cash: 'Naqd',
    };

    return (
      <Badge variant="outline">
        {methods[method] || method}
      </Badge>
    );
  };

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

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const response = await apiRequest('GET', `/api/invoices/${invoiceId}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter !== 'all' && payment.status !== filter) return false;
    if (search && !payment.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredInvoices = invoices.filter(invoice => {
    if (filter !== 'all' && invoice.status !== filter) return false;
    if (search && !invoice.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (paymentsLoading || invoicesLoading) {
    return <div>Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Jami To'lovlar</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    payments
                      .filter(p => p.status === 'completed')
                      .reduce((sum, p) => sum + p.amount, 0)
                  )}
                </div>
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
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    invoices
                      .filter(i => i.status === 'pending')
                      .reduce((sum, i) => sum + i.amount, 0)
                  )}
                </div>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Ushbu Oy</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    payments
                      .filter(p => {
                        const date = new Date(p.createdAt);
                        const now = new Date();
                        return date.getMonth() === now.getMonth() && 
                               date.getFullYear() === now.getFullYear();
                      })
                      .reduce((sum, p) => sum + p.amount, 0)
                  )}
                </div>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            To'lovlar Tarixi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="ID bo'yicha qidirish..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barchasi</SelectItem>
                <SelectItem value="completed">To'landi</SelectItem>
                <SelectItem value="pending">Kutilmoqda</SelectItem>
                <SelectItem value="failed">Xato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sana</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Summa</TableHead>
                  <TableHead>Usul</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      To'lovlar topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.id.slice(0, 12)}...
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell>{getMethodBadge(payment.paymentMethod)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadInvoice(payment.invoiceId)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Hisob-fakturalar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Yaratilgan</TableHead>
                  <TableHead>To'lov Sanasi</TableHead>
                  <TableHead>Summa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      Hisob-fakturalar topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadInvoice(invoice.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {invoice.status === 'pending' && (
                            <Button size="sm" variant="default">
                              To'lash
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
