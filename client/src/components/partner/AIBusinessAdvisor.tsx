import { motion } from "framer-motion";
import { Brain, TrendingUp, Package, AlertTriangle, Sparkles, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Insight {
  id: string;
  type: "growth" | "restock" | "competitor" | "opportunity";
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: string;
  priority: "high" | "medium" | "low";
}

// TODO: Replace with real AI-generated insights from API
const mockInsights: Insight[] = [
  {
    id: "1",
    type: "growth",
    icon: <TrendingUp className="h-4 w-4" />,
    title: "Elektronika kategoriyasi o'sishda",
    description: "O'tgan haftaga nisbatan +25% savdo. Bu trendni davom ettiring!",
    action: "Tahlil ko'rish",
    priority: "high",
  },
  {
    id: "2",
    type: "restock",
    icon: <Package className="h-4 w-4" />,
    title: "SKU-12345 zahirasini to'ldiring",
    description: "Bashorat: 3 kun ichida tugaydi. +50% o'sish kutilmoqda.",
    action: "Buyurtma berish",
    priority: "high",
  },
  {
    id: "3",
    type: "competitor",
    icon: <AlertTriangle className="h-4 w-4" />,
    title: "Raqobatchi narxni tushirdi",
    description: "3 ta o'xshash mahsulotda 10-15% arzonroq narxlar.",
    action: "Narxlarni ko'rish",
    priority: "medium",
  },
  {
    id: "4",
    type: "opportunity",
    icon: <Sparkles className="h-4 w-4" />,
    title: "Yangi trend: Smart soatlar",
    description: "Bu kategoriyada 40% o'sish. Assortimentni kengaytiring.",
    action: "Batafsil",
    priority: "low",
  },
];

const priorityColors = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const typeGradients = {
  growth: "from-emerald-500/20 to-emerald-500/5",
  restock: "from-amber-500/20 to-amber-500/5",
  competitor: "from-red-500/20 to-red-500/5",
  opportunity: "from-violet-500/20 to-violet-500/5",
};

export function AIBusinessAdvisor() {
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
            4 ta yangi
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {mockInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 rounded-lg bg-gradient-to-r ${typeGradients[insight.type]} border border-border/50 hover:border-primary/30 transition-all group cursor-pointer`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-background/50 text-primary">
                {insight.icon}
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
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-7"
                >
                  {insight.action}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </motion.div>
        ))}
        
        <Button variant="outline" className="w-full mt-2 border-primary/30 hover:bg-primary/10">
          <Brain className="h-4 w-4 mr-2" />
          To'liq tahlilni ko'rish
        </Button>
      </CardContent>
    </Card>
  );
}
