import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Package, ShoppingCart, Users, FileText, 
  Clock, X, Command, ArrowRight
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResult {
  id: string;
  type: "product" | "order" | "partner" | "report";
  title: string;
  subtitle: string;
  meta?: string;
  icon: string;
}

// TODO: Replace with real search API
const mockResults: SearchResult[] = [
  { id: "1", type: "product", title: "iPhone 15 Pro Max Case", subtitle: "SKU-001 • $25.00", meta: "Faol", icon: "📱" },
  { id: "2", type: "product", title: "Samsung Galaxy S24 Ultra", subtitle: "SKU-002 • $1,199.00", meta: "Kam zahira", icon: "📱" },
  { id: "3", type: "order", title: "Buyurtma #12345", subtitle: "Anvar Electronics • $450.00", meta: "Jarayonda", icon: "📦" },
  { id: "4", type: "order", title: "Buyurtma #12344", subtitle: "Tech Store UZ • $1,250.00", meta: "Yetkazildi", icon: "📦" },
  { id: "5", type: "partner", title: "Anvar Electronics", subtitle: "Gold tier • Tashkent", meta: "$45,200", icon: "👤" },
  { id: "6", type: "partner", title: "Tech Store UZ", subtitle: "Platinum tier • Samarkand", meta: "$128,500", icon: "👤" },
  { id: "7", type: "report", title: "Oylik daromad hisoboti", subtitle: "Dekabr 2024", meta: "PDF", icon: "📊" },
  { id: "8", type: "report", title: "Mahsulot tahlili", subtitle: "Noyabr 2024", meta: "Excel", icon: "📊" },
];

const typeConfig = {
  product: { icon: Package, label: "Mahsulotlar", color: "text-blue-400" },
  order: { icon: ShoppingCart, label: "Buyurtmalar", color: "text-emerald-400" },
  partner: { icon: Users, label: "Hamkorlar", color: "text-violet-400" },
  report: { icon: FileText, label: "Hisobotlar", color: "text-amber-400" },
};

interface UniversalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UniversalSearch({ open, onOpenChange }: UniversalSearchProps) {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "iPhone case",
    "Buyurtma #12345",
    "Anvar Electronics",
  ]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return mockResults.filter(
      r => r.title.toLowerCase().includes(lowerQuery) || 
           r.subtitle.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    filteredResults.forEach(result => {
      if (!groups[result.type]) groups[result.type] = [];
      groups[result.type].push(result);
    });
    return groups;
  }, [filteredResults]);

  const handleSelect = (result: SearchResult) => {
    // Add to recent searches
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== result.title);
      return [result.title, ...filtered].slice(0, 5);
    });
    onOpenChange(false);
    setQuery("");
    // TODO: Navigate to result
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-border/50">
          <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mahsulot, buyurtma, hamkor qidiring..."
            className="border-0 p-0 h-auto text-base focus-visible:ring-0 bg-transparent"
            autoFocus
          />
          <Badge variant="outline" className="flex-shrink-0 gap-1 text-xs">
            <Command className="h-3 w-3" />K
          </Badge>
        </div>

        <ScrollArea className="max-h-[400px]">
          <AnimatePresence mode="wait">
            {query.trim() === "" ? (
              /* Recent Searches */
              <motion.div
                key="recent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4"
              >
                {recentSearches.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Oxirgi qidiruvlar
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Tozalash
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <motion.button
                          key={search}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setQuery(search)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 text-sm">{search}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Qidiruv so'zini kiriting</p>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="mt-6">
                  <span className="text-xs font-medium text-muted-foreground">Tez amallar</span>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {Object.entries(typeConfig).map(([type, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={type}
                          onClick={() => setQuery(`type:${type} `)}
                          className="flex items-center gap-2 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
                        >
                          <Icon className={`h-4 w-4 ${config.color}`} />
                          <span className="text-sm">{config.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : filteredResults.length === 0 ? (
              /* No Results */
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center text-muted-foreground"
              >
                <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">"{query}" bo'yicha natija topilmadi</p>
                <p className="text-xs mt-1">Boshqa so'z bilan qidirib ko'ring</p>
              </motion.div>
            ) : (
              /* Search Results */
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-2"
              >
                {Object.entries(groupedResults).map(([type, results]) => {
                  const config = typeConfig[type as keyof typeof typeConfig];
                  const Icon = config.icon;
                  
                  return (
                    <div key={type} className="mb-4 last:mb-0">
                      <div className="flex items-center gap-2 px-2 py-1.5">
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        <span className="text-xs font-medium text-muted-foreground">
                          {config.label}
                        </span>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">
                          {results.length}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        {results.map((result, index) => (
                          <motion.button
                            key={result.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => handleSelect(result)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-lg flex-shrink-0">
                              {result.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{result.title}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {result.subtitle}
                              </div>
                            </div>
                            {result.meta && (
                              <Badge variant="outline" className="text-[10px] flex-shrink-0">
                                {result.meta}
                              </Badge>
                            )}
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-border/50 bg-muted/30 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">↑↓</kbd>
              tanlash
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">Enter</kbd>
              ochish
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">Esc</kbd>
              yopish
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
