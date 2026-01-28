import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Package, AlertTriangle, Sparkles, ChevronRight, Info, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface Insight {
  id: string;
  type: "growth" | "restock" | "competitor" | "opportunity" | "warning" | "info" | "success" | "products" | "subscription" | "ai";
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
  priority: "high" | "medium" | "low";
  category?: string;
}

const priorityColors = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const typeGradients: Record<string, string> = {
  growth: "from-emerald-500/20 to-emerald-500/5",
  restock: "from-amber-500/20 to-amber-500/5",
  competitor: "from-red-500/20 to-red-500/5",
  opportunity: "from-violet-500/20 to-violet-500/5",
  warning: "from-amber-500/20 to-amber-500/5",
  info: "from-blue-500/20 to-blue-500/5",
  success: "from-emerald-500/20 to-emerald-500/5",
  products: "from-violet-500/20 to-violet-500/5",
  subscription: "from-primary/20 to-primary/5",
  ai: "from-emerald-500/20 to-emerald-500/5",
};

const getIcon = (type: string) => {
  switch (type) {
    case 'growth': return <TrendingUp className="h-4 w-4" />;
    case 'restock': return <Package className="h-4 w-4" />;
    case 'competitor': return <AlertTriangle className="h-4 w-4" />;
    case 'opportunity': return <Sparkles className="h-4 w-4" />;
    case 'warning': return <AlertTriangle className="h-4 w-4" />;
    case 'info': return <Info className="h-4 w-4" />;
    case 'success': return <CheckCircle className="h-4 w-4" />;
    case 'products': return <Package className="h-4 w-4" />;
    case 'subscription': return <Sparkles className="h-4 w-4" />;
    case 'ai': return <Brain className="h-4 w-4" />;
    default: return <Info className="h-4 w-4" />;
  }
};

export function AIBusinessAdvisor() {
  const { partner } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!partner?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await apiRequest('GET', `/api/ai/business-insights/${partner.id}`);
        if (response.ok) {
          const data = await response.json();
          setInsights(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [partner?.id]);

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-violet-500/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-violet-500 shadow-lg shadow-primary/25"
            >
              <Brain className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-lg">AI Biznes Maslahatchisi</CardTitle>
              <p className="text-sm text-muted-foreground">Kunlik tahlil va tavsiyalar</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/10 border-primary/30">
            <Sparkles className="h-3 w-3 mr-1" />
            {insights.length} ta
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Yuklanmoqda...</div>
        ) : insights.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Hozircha tavsiyalar yo'q. Mahsulot qo'shishni boshlang!
          </div>
        ) : (
          insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg bg-gradient-to-r ${typeGradients[insight.type] || typeGradients.info} border border-border/50 hover:border-primary/30 transition-all group cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-background/50 text-primary">
                  {insight.icon || getIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{insight.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] px-1.5 py-0 ${priorityColors[insight.priority]}`}
                    >
                      {insight.priority === "high" ? "Muhim" : insight.priority === "medium" ? "O'rta" : "Past"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {insight.description}
                  </p>
                </div>
                {insight.action && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => insight.actionUrl && (window.location.href = insight.actionUrl)}
                  >
                    {insight.action}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
