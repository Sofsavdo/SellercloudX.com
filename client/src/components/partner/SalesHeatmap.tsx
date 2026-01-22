import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, TrendingUp } from "lucide-react";

// TODO: Replace with real sales data from API
const generateMockHeatmapData = () => {
  const days = ["Dush", "Sesh", "Chor", "Pay", "Jum", "Shan", "Yak"];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const data: { day: number; hour: number; value: number; orders: number }[] = [];
  
  days.forEach((_, dayIndex) => {
    hours.forEach((hour) => {
      // Simulate realistic patterns: higher during work hours, peaks at lunch and evening
      let baseValue = Math.random() * 30;
      
      // Work hours boost
      if (hour >= 9 && hour <= 18) baseValue += 40;
      
      // Lunch peak
      if (hour >= 12 && hour <= 14) baseValue += 30;
      
      // Evening peak
      if (hour >= 19 && hour <= 22) baseValue += 25;
      
      // Weekend different pattern
      if (dayIndex >= 5) {
        baseValue = baseValue * 0.7;
        if (hour >= 10 && hour <= 20) baseValue += 20;
      }
      
      data.push({
        day: dayIndex,
        hour,
        value: Math.round(baseValue),
        orders: Math.round(baseValue / 10),
      });
    });
  });
  
  return data;
};

const getHeatmapColor = (value: number, maxValue: number) => {
  const intensity = value / maxValue;
  if (intensity < 0.2) return "bg-primary/10";
  if (intensity < 0.4) return "bg-primary/25";
  if (intensity < 0.6) return "bg-primary/40";
  if (intensity < 0.8) return "bg-primary/60";
  return "bg-primary/90";
};

export function SalesHeatmap() {
  const data = useMemo(() => generateMockHeatmapData(), []);
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);
  
  const days = ["Dush", "Sesh", "Chor", "Pay", "Jum", "Shan", "Yak"];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Find peak time
  const peakData = useMemo(() => {
    const peak = data.reduce((max, d) => d.value > max.value ? d : max, data[0]);
    return {
      day: days[peak.day],
      hour: peak.hour,
      value: peak.value,
    };
  }, [data]);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Savdo Vaqtlari</CardTitle>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            <TrendingUp className="h-3 w-3 mr-1" />
            Eng faol: {peakData.day} {peakData.hour}:00
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hours header */}
            <div className="flex gap-0.5 mb-1 ml-12">
              {hours.filter((_, i) => i % 3 === 0).map((hour) => (
                <div 
                  key={hour} 
                  className="text-[10px] text-muted-foreground w-[36px] text-center"
                >
                  {hour.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            <TooltipProvider delayDuration={0}>
              <div className="space-y-0.5">
                {days.map((day, dayIndex) => (
                  <div key={day} className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground w-10">{day}</span>
                    <div className="flex gap-0.5">
                      {hours.map((hour) => {
                        const cellData = data.find(d => d.day === dayIndex && d.hour === hour);
                        const value = cellData?.value || 0;
                        const orders = cellData?.orders || 0;
                        
                        return (
                          <Tooltip key={`${dayIndex}-${hour}`}>
                            <TooltipTrigger asChild>
                              <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ 
                                  delay: (dayIndex * 24 + hour) * 0.002,
                                  duration: 0.2
                                }}
                                className={`w-3 h-6 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${getHeatmapColor(value, maxValue)}`}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <div className="font-medium">{day} {hour}:00 - {hour + 1}:00</div>
                              <div className="text-muted-foreground">
                                ${value.toLocaleString()} savdo • {orders} buyurtma
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </TooltipProvider>
            
            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-3">
              <span className="text-[10px] text-muted-foreground">Kam</span>
              <div className="flex gap-0.5">
                {["bg-primary/10", "bg-primary/25", "bg-primary/40", "bg-primary/60", "bg-primary/90"].map((color, i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">Ko'p</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
