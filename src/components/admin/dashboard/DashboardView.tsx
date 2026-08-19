import { useMemo } from "react";
import { 
  DollarSign, ShoppingCart, Receipt, TrendingUp, BarChart3, Tag, AlertTriangle 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { 
  useAdminProducts, useSales, useAllSaleItems, useExpenses 
} from "@/hooks/useStoreData";

/**
 * Visualização do Dashboard Administrativo.
 * Consolida métricas de faturamento, vendas, lucro e alertas de estoque.
 */
const DashboardView = () => {
  const { data: products } = useAdminProducts();
  const { data: sales } = useSales();
  const { data: saleItems } = useAllSaleItems();
  const { data: expenses } = useExpenses();

  const totalRevenue = sales?.reduce((s, sale) => s + Number(sale.total), 0) || 0;
  const totalSales = sales?.length || 0;
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  const supplierExpenses = expenses?.filter(e => e.category === "Fornecedores").reduce((s, e) => s + Number(e.amount), 0) || 0;
  const totalCost = (saleItems?.reduce((s, item) => s + Number(item.unit_cost) * item.quantity, 0) || 0) + supplierExpenses;
  const totalExpenses = (expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0) - supplierExpenses;
  const estimatedProfit = totalRevenue - totalCost - totalExpenses;

  const lowStock = products?.filter((p) => (p.stock ?? 0) <= 5 && p.status === "active") || [];

  const monthlyData = useMemo(() => {
    if (!sales) return [];
    const months: Record<string, number> = {};
    sales.forEach((s) => { 
      const key = s.sale_date.substring(0, 7); 
      months[key] = (months[key] || 0) + Number(s.total); 
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, value]) => ({ 
        month: new Date(month + "-15").toLocaleDateString("pt-BR", { month: "short" }), 
        valor: value 
      }));
  }, [sales]);

  const topProducts = useMemo(() => {
    if (!saleItems) return [];
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    saleItems.forEach((item) => {
      if (!map[item.product_id]) map[item.product_id] = { name: item.product_name, qty: 0, revenue: 0 };
      map[item.product_id].qty += item.quantity;
      map[item.product_id].revenue += Number(item.unit_price) * item.quantity;
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [saleItems]);

  const stats = [
    { label: "Faturamento", value: formatPrice(totalRevenue), icon: DollarSign, color: "text-green-500" },
    { label: "Total de Vendas", value: String(totalSales), icon: ShoppingCart, color: "text-blue-500" },
    { label: "Ticket Médio", value: formatPrice(avgTicket), icon: Receipt, color: "text-purple-500" },
    { label: "Lucro Estimado", value: formatPrice(estimatedProfit), icon: TrendingUp, color: estimatedProfit >= 0 ? "text-green-500" : "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <s.icon size={20} className={s.color} />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-primary" /> Faturamento Mensal
            </h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))", 
                      borderRadius: 8, 
                      color: "hsl(var(--foreground))" 
                    }}
                    formatter={(value: number) => [formatPrice(value), "Faturamento"]} 
                  />
                  <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
                Nenhuma venda registrada
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Tag size={16} className="text-primary" /> Produtos Mais Vendidos
            </h3>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm text-foreground truncate max-w-[180px]">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{p.qty} un.</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(p.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">
                Nenhuma venda registrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-500" /> Estoque Baixo
            </h3>
            <div className="space-y-3">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <img src={p.img} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </div>
                  <Badge variant="destructive">{p.stock} un.</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardView;
