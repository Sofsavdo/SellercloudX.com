// Admin Manual Payment Form Component
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Upload } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Partner {
  id: string;
  businessName: string;
  email: string;
  pricingTier: string;
}

export function AdminManualPaymentForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    partnerId: '',
    invoiceId: '',
    amount: '',
    paymentMethod: 'manual',
    notes: '',
  });

  // Fetch partners
  const { data: partners = [] } = useQuery<Partner[]>({
    queryKey: ['/api/admin/partners'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/partners');
      return response.json();
    },
  });

  // Fetch partner invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ['/api/admin/invoices', formData.partnerId],
    queryFn: async () => {
      if (!formData.partnerId) return [];
      const response = await apiRequest('GET', `/api/admin/partners/${formData.partnerId}/invoices`);
      return response.json();
    },
    enabled: !!formData.partnerId,
  });

  // Record payment mutation
  const recordPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/payments/manual', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "To'lov qo'shildi",
        description: "To'lov muvaffaqiyatli qayd qilindi",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/invoices'] });
      setOpen(false);
      setFormData({
        partnerId: '',
        invoiceId: '',
        amount: '',
        paymentMethod: 'manual',
        notes: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description: error.message || "To'lovni qayd qilishda xatolik",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.partnerId) {
      toast({
        title: "Xatolik",
        description: "Hamkorni tanlang",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Xatolik",
        description: "To'g'ri summa kiriting",
        variant: "destructive",
      });
      return;
    }

    recordPaymentMutation.mutate({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Qo'lda To'lov Qo'shish
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Qo'lda To'lov Qo'shish</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Partner Selection */}
          <div>
            <Label htmlFor="partner">Hamkor *</Label>
            <Select
              value={formData.partnerId}
              onValueChange={(value) => setFormData({ ...formData, partnerId: value, invoiceId: '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Hamkorni tanlang" />
              </SelectTrigger>
              <SelectContent>
                {partners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.businessName} ({partner.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Invoice Selection (Optional) */}
          {formData.partnerId && invoices.length > 0 && (
            <div>
              <Label htmlFor="invoice">Hisob-faktura (ixtiyoriy)</Label>
              <Select
                value={formData.invoiceId}
                onValueChange={(value) => {
                  const invoice = invoices.find((inv: any) => inv.id === value);
                  setFormData({ 
                    ...formData, 
                    invoiceId: value,
                    amount: invoice ? invoice.amount.toString() : formData.amount
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hisob-fakturani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.map((invoice: any) => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      {invoice.id} - ${invoice.amount} ({invoice.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Amount */}
          <div>
            <Label htmlFor="amount">Summa (USD) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="method">To'lov Usuli *</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Qo'lda</SelectItem>
                <SelectItem value="cash">Naqd</SelectItem>
                <SelectItem value="bank_transfer">Bank O'tkazma</SelectItem>
                <SelectItem value="click">Click</SelectItem>
                <SelectItem value="payme">Payme</SelectItem>
                <SelectItem value="uzcard">Uzcard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Izoh</Label>
            <Textarea
              id="notes"
              placeholder="To'lov haqida qo'shimcha ma'lumot..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Receipt Upload (Future) */}
          <div>
            <Label htmlFor="receipt">Kvitansiya (kelajakda)</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Fayl yuklash funksiyasi tez orada qo'shiladi
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Bekor Qilish
            </Button>
            <Button
              type="submit"
              disabled={recordPaymentMutation.isPending}
            >
              {recordPaymentMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
