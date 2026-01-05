import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, Copy, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AnydeskAccessProps {
  anydeskId?: string | null;
  anydeskPassword?: string | null;
}

export function AnydeskAccess({ anydeskId, anydeskPassword }: AnydeskAccessProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Nusxalandi",
      description: `${label} nusxalandi`,
    });
  };

  if (!anydeskId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Masofaviy Ulanish (AnyDesk)
          </CardTitle>
          <CardDescription>
            Admin tomonidan masofaviy ulanish sozlanmagan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Monitor className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>AnyDesk ulanish ma'lumotlari hali mavjud emas</p>
            <p className="text-sm mt-2">Admin bilan bog'laning</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Masofaviy Ulanish (AnyDesk)
          <Badge variant="outline" className="ml-auto">Faol</Badge>
        </CardTitle>
        <CardDescription>
          Kompyuteringizga masofaviy ulanish uchun ma'lumotlar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">AnyDesk ID</label>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-lg">
              {anydeskId}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(anydeskId, "AnyDesk ID")}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {anydeskPassword && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Parol</label>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-muted rounded-lg font-mono">
                {showPassword ? anydeskPassword : '••••••••'}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(anydeskPassword, "Parol")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button
            variant="default"
            className="w-full"
            onClick={() => window.open('https://anydesk.com/download', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            AnyDesk Yuklab Olish
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>📌 AnyDesk dasturini yuklab oling va o'rnating</p>
          <p>📌 Yuqoridagi ID va parolni kiriting</p>
          <p>📌 Muammolar bo'lsa admin bilan bog'laning</p>
        </div>
      </CardContent>
    </Card>
  );
}
