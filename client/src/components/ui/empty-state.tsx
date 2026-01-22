import { Package, ShoppingCart, Users, BarChart3, MessageCircle, Wallet, FileX, Search, Plus } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';

interface EmptyStateProps {
  title?: string;
  description?: string;
  type?: 'default' | 'products' | 'orders' | 'partners' | 'analytics' | 'chat' | 'wallet' | 'search';
  action?: {
    label: string;
    onClick: () => void;
  };
}

const iconMap = {
  default: FileX,
  products: Package,
  orders: ShoppingCart,
  partners: Users,
  analytics: BarChart3,
  chat: MessageCircle,
  wallet: Wallet,
  search: Search,
};

const defaultMessages: Record<string, { title: string; description: string }> = {
  default: { title: 'Ma\'lumot topilmadi', description: 'Hozircha hech qanday ma\'lumot mavjud emas' },
  products: { title: 'Mahsulotlar yo\'q', description: 'Hali mahsulot qo\'shilmagan' },
  orders: { title: 'Buyurtmalar yo\'q', description: 'Hali buyurtmalar mavjud emas' },
  partners: { title: 'Hamkorlar yo\'q', description: 'Hali hamkorlar ro\'yxatdan o\'tmagan' },
  analytics: { title: 'Statistika yo\'q', description: 'Tahlil qilish uchun ma\'lumotlar yetarli emas' },
  chat: { title: 'Xabarlar yo\'q', description: 'Hali xabarlar mavjud emas' },
  wallet: { title: 'Tranzaksiyalar yo\'q', description: 'Hali moliyaviy operatsiyalar yo\'q' },
  search: { title: 'Natija topilmadi', description: 'Qidiruv bo\'yicha natija topilmadi' },
};

export function EmptyState({ title, description, type = 'default', action }: EmptyStateProps) {
  const Icon = iconMap[type];
  const defaultMsg = defaultMessages[type];
  
  return (
    <Card className="border-2 border-dashed border-muted-foreground/20">
      <CardContent className="py-12 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          {title || defaultMsg.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description || defaultMsg.description}
        </p>
        {action && (
          <Button onClick={action.onClick} className="gap-2">
            <Plus className="w-4 h-4" />
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
