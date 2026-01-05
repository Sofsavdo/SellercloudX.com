import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Crown, Loader2 } from 'lucide-react';

interface TierUpgradeRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentTier: string;
}

const TIERS = {
  free_starter: { name: 'Free Starter', price: '$0/oy' },
  basic: { name: 'Basic', price: '$69/oy' },
  starter_pro: { name: 'Starter Pro', price: '$349/oy' },
  professional: { name: 'Professional', price: '$899/oy' }
};

export function TierUpgradeRequestForm({ isOpen, onClose, onSuccess, currentTier }: TierUpgradeRequestFormProps) {
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState('');
  const [reason, setReason] = useState('');

  const upgradeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/tier-upgrade-requests', {
        requestedTier: selectedTier,
        reason
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: '✅ So\'rov yuborildi',
        description: 'Admin tez orada ko\'rib chiqadi'
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast({
        title: '❌ Xatolik',
        description: 'So\'rov yuborishda xatolik',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = () => {
    if (!selectedTier) {
      toast({
        title: '⚠️ Diqqat',
        description: 'Tarifni tanlang',
        variant: 'destructive'
      });
      return;
    }
    upgradeMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Tarif O'zgartirish So'rovi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Hozirgi tarif</Label>
            <div className="p-3 bg-muted rounded-md mt-1">
              {TIERS[currentTier as keyof typeof TIERS]?.name || currentTier}
            </div>
          </div>

          <div>
            <Label>Yangi tarif</Label>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger>
                <SelectValue placeholder="Tarifni tanlang" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIERS)
                  .filter(([key]) => key !== currentTier)
                  .map(([key, tier]) => (
                    <SelectItem key={key} value={key}>
                      {tier.name} - {tier.price}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Sabab (ixtiyoriy)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nima uchun bu tarifga o'tmoqchisiz?"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={upgradeMutation.isPending}
              className="flex-1"
            >
              {upgradeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Yuborilmoqda...
                </>
              ) : (
                'So\'rov Yuborish'
              )}
            </Button>
            <Button onClick={onClose} variant="outline">
              Bekor qilish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
