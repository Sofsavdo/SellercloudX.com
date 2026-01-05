import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, 
  MoreHorizontal, Eye, Edit, Package, Download, ChevronLeft, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  sku: string;
  image: string;
  sales: number;
  revenue: number;
  profit: number;
  profitMargin: number;
  trend: number; // percentage change
  stock: number;
}

// TODO: Replace with real product data from API
const mockProducts: Product[] = [
  { id: "1", name: "iPhone 15 Pro Max Case", sku: "SKU-001", image: "📱", sales: 342, revenue: 8550, profit: 2565, profitMargin: 30, trend: 15.2, stock: 45 },
  { id: "2", name: "Samsung Galaxy S24 Ultra", sku: "SKU-002", image: "📱", sales: 128, revenue: 153600, profit: 30720, profitMargin: 20, trend: 8.5, stock: 12 },
  { id: "3", name: "AirPods Pro 2", sku: "SKU-003", image: "🎧", sales: 256, revenue: 64000, profit: 16000, profitMargin: 25, trend: -3.2, stock: 89 },
  { id: "4", name: "MacBook Air M3", sku: "SKU-004", image: "💻", sales: 45, revenue: 58500, profit: 11700, profitMargin: 20, trend: 22.1, stock: 8 },
  { id: "5", name: "Apple Watch Ultra 2", sku: "SKU-005", image: "⌚", sales: 89, revenue: 71200, profit: 17800, profitMargin: 25, trend: 5.8, stock: 23 },
  { id: "6", name: "Sony WH-1000XM5", sku: "SKU-006", image: "🎧", sales: 167, revenue: 58450, profit: 14612, profitMargin: 25, trend: -8.4, stock: 56 },
  { id: "7", name: "iPad Pro 12.9", sku: "SKU-007", image: "📱", sales: 78, revenue: 93600, profit: 18720, profitMargin: 20, trend: 12.3, stock: 15 },
  { id: "8", name: "DJI Mini 4 Pro", sku: "SKU-008", image: "🚁", sales: 34, revenue: 27200, profit: 8160, profitMargin: 30, trend: 45.6, stock: 7 },
];

type SortKey = "sales" | "revenue" | "profit" | "profitMargin" | "trend";
type SortOrder = "asc" | "desc";

export function TopProductsTable() {
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const sortedProducts = useMemo(() => {
    return [...mockProducts].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [sortKey, sortOrder]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return sortedProducts.slice(start, start + perPage);
  }, [sortedProducts, currentPage, perPage]);

  const totalPages = Math.ceil(mockProducts.length / perPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    return sortOrder === "desc" 
      ? <ArrowDown className="h-3 w-3 ml-1 text-primary" />
      : <ArrowUp className="h-3 w-3 ml-1 text-primary" />;
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Top Mahsulotlar</CardTitle>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Mahsulot</th>
                <th 
                  className="text-right p-3 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("sales")}
                >
                  <span className="flex items-center justify-end">
                    Savdo <SortIcon columnKey="sales" />
                  </span>
                </th>
                <th 
                  className="text-right p-3 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("revenue")}
                >
                  <span className="flex items-center justify-end">
                    Daromad <SortIcon columnKey="revenue" />
                  </span>
                </th>
                <th 
                  className="text-right p-3 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("profitMargin")}
                >
                  <span className="flex items-center justify-end">
                    Foyda % <SortIcon columnKey="profitMargin" />
                  </span>
                </th>
                <th 
                  className="text-right p-3 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("trend")}
                >
                  <span className="flex items-center justify-end">
                    Trend <SortIcon columnKey="trend" />
                  </span>
                </th>
                <th className="text-right p-3 text-xs font-medium text-muted-foreground">Amallar</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {paginatedProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/30 hover:bg-muted/20 transition-colors group"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-xl">
                          {product.image}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-muted-foreground">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="font-medium text-sm">{product.sales.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">dona</div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="font-medium text-sm">${product.revenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        Foyda: ${product.profit.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <Badge 
                        variant="outline" 
                        className={product.profitMargin >= 25 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                          : "bg-muted text-muted-foreground"
                        }
                      >
                        {product.profitMargin}%
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className={`flex items-center justify-end gap-1 text-sm font-medium ${
                        product.trend >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {product.trend >= 0 ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {product.trend >= 0 ? "+" : ""}{product.trend}%
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Ko'rish
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Package className="h-4 w-4 mr-2" />
                            Zahira qo'shish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between p-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sahifada:</span>
            <Select value={perPage.toString()} onValueChange={(v) => { setPerPage(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              {currentPage} / {totalPages}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
