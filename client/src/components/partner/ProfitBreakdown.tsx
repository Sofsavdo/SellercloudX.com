import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PieChart as PieChartIcon, TrendingUp } from "lucide-react";

interface CategoryData {
  id: string;
  name: string;
  profit: number;
  percentage: number;
  color: string;
  trend: number;
}

// TODO: Replace with real profit data from API
const mockCategories: CategoryData[] = [
  { id: "1", name: "Elektronika", profit: 45200, percentage: 35, color: "#6366F1", trend: 12.5 },
  { id: "2", name: "Telefon aksessuarlari", profit: 28400, percentage: 22, color: "#A855F7", trend: 8.2 },
  { id: "3", name: "Kompyuterlar", profit: 23100, percentage: 18, color: "#10B981", trend: -3.4 },
  { id: "4", name: "Audio qurilmalar", profit: 18200, percentage: 14, color: "#F59E0B", trend: 15.8 },
  { id: "5", name: "Smart soatlar", profit: 14100, percentage: 11, color: "#EF4444", trend: 22.1 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="font-medium text-sm">{data.name}</span>
        </div>
        <div className="text-lg font-bold">${data.profit.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">{data.percentage}% umumiy foydadan</div>
        <div className={`text-xs flex items-center gap-1 mt-1 ${data.trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          <TrendingUp className="h-3 w-3" />
          {data.trend >= 0 ? "+" : ""}{data.trend}% o'tgan oyga nisbatan
        </div>
      </div>
    );
  }
  return null;
};

export function ProfitBreakdown() {
  const [visibleCategories, setVisibleCategories] = useState<string[]>(
    mockCategories.map(c => c.id)
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filteredData = useMemo(() => 
    mockCategories.filter(c => visibleCategories.includes(c.id)),
    [visibleCategories]
  );

  const totalProfit = useMemo(() => 
    filteredData.reduce((sum, c) => sum + c.profit, 0),
    [filteredData]
  );

  const toggleCategory = (id: string) => {
    setVisibleCategories(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Foyda Taqsimoti</CardTitle>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            Jami: ${totalProfit.toLocaleString()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Donut Chart */}
          <div className="relative flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={filteredData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="profit"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {filteredData.map((entry, index) => (
                    <Cell 
                      key={entry.id}
                      fill={entry.color}
                      stroke="transparent"
                      style={{
                        transform: activeIndex === index ? "scale(1.05)" : "scale(1)",
                        transformOrigin: "center",
                        transition: "transform 0.2s ease-out",
                        filter: activeIndex === index ? "brightness(1.2)" : "none",
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <motion.div 
                  key={totalProfit}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-bold"
                >
                  ${(totalProfit / 1000).toFixed(1)}k
                </motion.div>
                <div className="text-xs text-muted-foreground">Jami foyda</div>
              </div>
            </div>
          </div>
          
          {/* Legend with checkboxes */}
          <div className="space-y-2 min-w-[180px]">
            {mockCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer ${
                  visibleCategories.includes(category.id) 
                    ? "hover:bg-muted/50" 
                    : "opacity-50"
                }`}
                onClick={() => toggleCategory(category.id)}
              >
                <Checkbox 
                  checked={visibleCategories.includes(category.id)}
                  className="pointer-events-none"
                />
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: category.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{category.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    ${category.profit.toLocaleString()} ({category.percentage}%)
                  </div>
                </div>
                <div className={`text-[10px] font-medium ${
                  category.trend >= 0 ? "text-emerald-400" : "text-red-400"
                }`}>
                  {category.trend >= 0 ? "+" : ""}{category.trend}%
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
