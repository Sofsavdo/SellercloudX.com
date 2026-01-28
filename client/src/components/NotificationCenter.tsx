import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Check, X, TrendingUp, Package, User, Brain, 
  Settings, ChevronRight, Sparkles, AlertTriangle, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiRequest } from "@/lib/queryClient";

interface Notification {
  id: string;
  type: "revenue" | "stock" | "partner" | "ai" | "system" | "success" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

// TODO: Replace with real notifications from API
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "revenue",
    title: "Kunlik daromad maqsadiga erishildi!",
    message: "Bugun $1,250 ishladingiz (+15% kechagiga nisbatan)",
    timestamp: "2 daqiqa oldin",
    read: false,
    action: { label: "Dashboard", href: "/dashboard" },
  },
  {
    id: "2",
    type: "stock",
    title: "Kam zahira ogohlantirishi",
    message: "SKU-12345 (iPhone Case) faqat 5 dona qoldi",
    timestamp: "1 soat oldin",
    read: false,
    action: { label: "Zahira qo'shish", href: "/products" },
  },
  {
    id: "3",
    type: "partner",
    title: "Yangi hamkor ro'yxatdan o'tdi",
    message: "Anvar Electronics 3 daqiqa oldin qo'shildi",
    timestamp: "3 daqiqa oldin",
    read: false,
    action: { label: "Ko'rib chiqish", href: "/partners" },
  },
  {
    id: "4",
    type: "ai",
    title: "Narx taklifi",
    message: "SKU-789 narxini 5% ga tushiring, savdo ~15% oshadi",
    timestamp: "5 soat oldin",
    read: true,
    action: { label: "Qo'llash", href: "/pricing" },
  },
  {
    id: "5",
    type: "system",
    title: "Platforma yangilandi",
    message: "Yangi marketplace integratsiyasi: Kaspi.kz mavjud",
    timestamp: "1 kun oldin",
    read: true,
    action: { label: "Batafsil", href: "/settings" },
  },
];

const typeConfig = {
  revenue: {
    icon: TrendingUp,
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconBg: "bg-emerald-500/20 text-emerald-400",
  },
  stock: {
    icon: AlertTriangle,
    gradient: "from-amber-500/20 to-amber-500/5",
    iconBg: "bg-amber-500/20 text-amber-400",
  },
  partner: {
    icon: User,
    gradient: "from-blue-500/20 to-blue-500/5",
    iconBg: "bg-blue-500/20 text-blue-400",
  },
  ai: {
    icon: Brain,
    gradient: "from-violet-500/20 to-violet-500/5",
    iconBg: "bg-violet-500/20 text-violet-400",
  },
  system: {
    icon: Info,
    gradient: "from-muted/50 to-muted/20",
    iconBg: "bg-muted text-muted-foreground",
  },
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiRequest('GET', '/api/notifications');
        if (response.ok) {
          const data = await response.json();
          // Map API response to component format
          const mapped = (Array.isArray(data) ? data : []).map((n: any) => ({
            id: n.id,
            type: n.type || 'system',
            title: n.title,
            message: n.message,
            timestamp: n.timestamp ? new Date(n.timestamp).toLocaleString('uz-UZ') : 'Hozir',
            read: n.read || false,
            action: n.action
          }));
          setNotifications(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    
    fetchNotifications();
  }, [isOpen]);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filterByType = (type: string) => {
    if (type === "all") return notifications;
    return notifications.filter(n => n.type === type);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge 
                  className="h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white border-0 text-[10px]"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[400px] p-0" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Bildirishnomalar</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} yangi
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7"
                onClick={markAllAsRead}
              >
                <Check className="h-3 w-3 mr-1" />
                Hammasini o'qilgan deb belgilash
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent h-auto p-0">
            {[
              { value: "all", label: "Hammasi" },
              { value: "revenue", label: "Savdo" },
              { value: "stock", label: "Zahira" },
              { value: "ai", label: "AI" },
            ].map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {["all", "revenue", "stock", "ai"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="m-0">
              <ScrollArea className="h-[400px]">
                <AnimatePresence mode="popLayout">
                  {filterByType(tabValue).length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">Yangi bildirishnoma yo'q</p>
                      <p className="text-xs text-muted-foreground/60">Siz hamma narsani ko'rib chiqdingiz! 🎉</p>
                    </motion.div>
                  ) : (
                    filterByType(tabValue).map((notification, index) => {
                      const config = typeConfig[notification.type];
                      const Icon = config.icon;
                      
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-3 border-b border-border/30 hover:bg-muted/30 transition-colors group ${
                            !notification.read ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-lg ${config.iconBg} flex-shrink-0`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className={`text-sm font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                                    {notification.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                    {notification.message}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-[10px] text-muted-foreground">
                                  {notification.timestamp}
                                </span>
                                <div className="flex items-center gap-1">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-[10px] px-2"
                                      onClick={() => markAsRead(notification.id)}
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      O'qildi
                                    </Button>
                                  )}
                                  {notification.action && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 text-[10px] px-2"
                                    >
                                      {notification.action.label}
                                      <ChevronRight className="h-3 w-3 ml-1" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
