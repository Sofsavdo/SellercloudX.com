import { AlertCircle, RefreshCw, WifiOff, ServerCrash, ShieldAlert } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: Error | string | null;
  type?: 'default' | 'network' | 'server' | 'permission' | 'notfound';
  onRetry?: () => void;
  compact?: boolean;
}

const iconMap = {
  default: AlertCircle,
  network: WifiOff,
  server: ServerCrash,
  permission: ShieldAlert,
  notfound: AlertCircle,
};

const defaultMessages: Record<string, { title: string; description: string }> = {
  default: { title: 'Xatolik yuz berdi', description: 'Nimadir noto\'g\'ri ketdi. Iltimos qayta urinib ko\'ring.' },
  network: { title: 'Internet aloqasi yo\'q', description: 'Iltimos internet ulanishingizni tekshiring.' },
  server: { title: 'Server xatosi', description: 'Server bilan bog\'lanishda muammo. Keyinroq urinib ko\'ring.' },
  permission: { title: 'Ruxsat yo\'q', description: 'Bu amalni bajarish uchun ruxsatingiz yo\'q.' },
  notfound: { title: 'Topilmadi', description: 'So\'ralgan resurs topilmadi.' },
};

export function ErrorState({ 
  title, 
  description, 
  error, 
  type = 'default', 
  onRetry,
  compact = false 
}: ErrorStateProps) {
  const Icon = iconMap[type];
  const defaultMsg = defaultMessages[type];
  const errorMessage = error instanceof Error ? error.message : error;
  
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <Icon className="w-5 h-5 text-destructive flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-destructive truncate">
            {title || defaultMsg.title}
          </p>
          {errorMessage && (
            <p className="text-xs text-destructive/80 truncate">{errorMessage}</p>
          )}
        </div>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry} className="flex-shrink-0">
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-destructive">
          <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
            <Icon className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{title || defaultMsg.title}</h3>
            <p className="text-sm font-normal text-destructive/80">
              {description || defaultMsg.description}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {errorMessage && (
          <div className="mb-4 p-3 bg-background/50 rounded-lg">
            <p className="text-xs font-mono text-muted-foreground break-all">
              {errorMessage}
            </p>
          </div>
        )}
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Qayta urinish
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
