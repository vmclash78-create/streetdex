import { useState, useMemo } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, Settings, LogOut,
  Plus, Edit2, Trash2, TrendingUp, DollarSign, Box, ChevronDown,
  Crown, Search, Bell, BarChart3, Save, X, Loader2,
  Receipt, Wallet, Calendar, Download, ArrowUpRight, ArrowDownRight,
  ShoppingCart, CreditCard, Users, Tag, FileText, AlertTriangle,
  Image, ClipboardList, Eye, ChevronRight,
} from "lucide-react";
import ThemeToggle from "@/components/store/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import {
  useAdminProducts, useUpsertProduct, useDeleteProduct,
  useStoreSettings, useUpdateSetting,
  useSales, useAllSaleItems, useCreateSale, useDeleteSale,
  useExpenses, useCreateExpense, useDeleteExpense,
  useAdminBanners, useUpsertBanner, useDeleteBanner,
  type DBProduct, type DBSale, type DBSaleItem, type DBExpense, type DBBanner,
} from "@/hooks/useStoreData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

type AdminView = "dashboard" | "products" | "banners" | "sales" | "orders" | "finances" | "settings";

const formatPrice = (v: number) => `R$${Number(v).toFixed(2).replace(".", ",")}`;
const formatDate = (d: string) => {
  const date = new Date(d + "T12:00:00");
  return date.toLocaleDateString("pt-BR");
};

const PAYMENT_METHODS = ["Dinheiro", "PIX", "Cartão Crédito", "Cartão Débito", "Transferência"];
const EXPENSE_CATEGORIES = ["Fornecedores", "Marketing", "Logística", "Aluguel", "Embalagens", "Funcionários", "Impostos", "Outros"];

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-600 dark:text-green-400",
  draft: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  out: "bg-destructive/20 text-destructive",
};
const statusLabels: Record<string, string> = { active: "Ativo", draft: "Rascunho", out: "Esgotado" };

const Admin = () => {
  const [view, setView] = useState<AdminView>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { signOut } = useAuth();

  const navItems: { icon: typeof LayoutDashboard; label: string; key: AdminView }[] = [
    { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
    { icon: Package, label: "Produtos", key: "products" },
    { icon: Image, label: "Banners", key: "banners" },
    { icon: ClipboardList, label: "Pedidos", key: "orders" },
    { icon: ShoppingCart, label: "Vendas", key: "sales" },
    { icon: Wallet, label: "Finanças", key: "finances" },
    { icon: Settings, label: "Configurações", key: "settings" },
  ];

  return (
    <div className="flex h-screen bg-background transition-colors duration-300">
      <aside className={`${sidebarCollapsed ? "w-16" : "w-60"} transition-all duration-200 flex flex-col border-r border-border bg-card hidden md:flex`}>
        <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
          <Crown size={18} className="text-primary flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-lg font-light tracking-tight text-foreground font-serif">duartt</span>}
        </div>
        <nav className="flex-1 py-3">
          {navItems.map((item) => (
            <button key={item.key} onClick={() => setView(item.key)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${view === item.key ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              <item.icon size={18} className="flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="border-t border-border py-3">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown size={18} className={`transform transition-transform ${sidebarCollapsed ? "rotate-90" : "-rotate-90"}`} />
            {!sidebarCollapsed && <span>Recolher</span>}
          </button>
          <a href="/" className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut size={18} className="flex-shrink-0" />
            {!sidebarCollapsed && <span>Voltar à Loja</span>}
          </a>
          <button onClick={signOut} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:text-destructive/80 transition-colors">
            <LogOut size={18} className="flex-shrink-0" />
            {!sidebarCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex">
        {navItems.map((item) => (
          <button key={item.key} onClick={() => setView(item.key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[0.6rem] transition-colors ${view === item.key ? "text-primary" : "text-muted-foreground"}`}>
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3 bg-muted rounded-lg px-3 py-2 flex-1 max-w-xs">
            <Search size={16} className="text-muted-foreground" />
            <input type="text" placeholder="Buscar..." className="bg-transparent text-sm text-foreground outline-none flex-1 placeholder:text-muted-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">AD</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {view === "dashboard" && <DashboardView />}
          {view === "products" && <ProductsView />}
          {view === "banners" && <BannersView />}
          {view === "orders" && <OrdersAdminView />}
          {view === "sales" && <SalesView />}
          {view === "finances" && <FinancesView />}
          {view === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

// ─── DASHBOARD ───
const DashboardView = () => {
  const { data: products } = useAdminProducts();
  const { data: sales } = useSales();
  const { data: saleItems } = useAllSaleItems();
  const { data: expenses } = useExpenses();

  const totalRevenue = sales?.reduce((s, sale) => s + Number(sale.total), 0) || 0;
  const totalSales = sales?.length || 0;
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  const totalCost = saleItems?.reduce((s, item) => s + Number(item.unit_cost) * item.quantity, 0) || 0;
  const totalExpenses = expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0;
  const estimatedProfit = totalRevenue - totalCost - totalExpenses;

  const lowStock = products?.filter((p) => (p.stock ?? 0) <= 5 && p.status === "active") || [];

  // Monthly chart data
  const monthlyData = useMemo(() => {
    if (!sales) return [];
    const months: Record<string, number> = {};
    sales.forEach((s) => {
      const key = s.sale_date.substring(0, 7); // YYYY-MM
      months[key] = (months[key] || 0) + Number(s.total);
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, value]) => ({
        month: new Date(month + "-15").toLocaleDateString("pt-BR", { month: "short" }),
        valor: value,
      }));
  }, [sales]);

  // Top selling products
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
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl p-5 border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly revenue chart */}
        <div className="rounded-xl p-5 border border-border bg-card">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-primary" /> Faturamento Mensal</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [formatPrice(value), "Faturamento"]}
                />
                <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">Nenhuma venda registrada</div>
          )}
        </div>

        {/* Top products */}
        <div className="rounded-xl p-5 border border-border bg-card">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><Tag size={16} className="text-primary" /> Produtos Mais Vendidos</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
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
            <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">Nenhuma venda registrada</div>
          )}
        </div>
      </div>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <div className="rounded-xl p-5 border border-border bg-card">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-yellow-500" /> Estoque Baixo</h3>
          <div className="space-y-3">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <img src={p.img} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                </div>
                <span className="text-xs font-bold text-destructive">{p.stock} un.</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PRODUCTS ───
const ProductsView = () => {
  const { data: products, isLoading } = useAdminProducts();
  const upsertProduct = useUpsertProduct();
  const deleteProduct = useDeleteProduct();
  const [editingProduct, setEditingProduct] = useState<Partial<DBProduct> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openNew = () => setEditingProduct({ name: "", price: 0, cost: 0, img: "", sizes: ["P", "M", "G", "GG", "XG"], status: "active", stock: 0, free_shipping: true, category: "" });
  const openEdit = (p: DBProduct) => setEditingProduct({ ...p });

  const handleSave = async () => {
    if (!editingProduct?.name || !editingProduct?.img) return;
    await upsertProduct.mutateAsync(editingProduct as any);
    setEditingProduct(null);
  };

  const handleDelete = async (id: string) => {
    await deleteProduct.mutateAsync(id);
    setDeleteConfirm(null);
  };

  const getMargin = (price: number, cost: number) => {
    if (!cost || cost === 0) return null;
    return ((price - cost) / price * 100).toFixed(0);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus size={16} /> Novo Produto
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-muted">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Produto</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Preço</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Custo</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Margem</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Estoque</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((p) => {
                const margin = getMargin(Number(p.price), Number(p.cost));
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.img} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div>
                          <span className="text-sm text-foreground truncate block max-w-[180px]">{p.name}</span>
                          <span className="text-[0.65rem] text-muted-foreground">{p.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground font-semibold">{formatPrice(Number(p.price))}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{Number(p.cost) > 0 ? formatPrice(Number(p.cost)) : "—"}</td>
                    <td className="px-4 py-3 text-sm">{margin ? <span className="text-green-600 dark:text-green-400 font-semibold">{margin}%</span> : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${(p.stock ?? 0) <= 5 ? "text-destructive" : "text-foreground"}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3"><span className={`text-[0.65rem] px-2 py-1 rounded-full font-semibold ${statusColors[p.status] || ""}`}>{statusLabels[p.status] || p.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit2 size={15} /></button>
                        <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-foreground font-bold mb-2">Excluir produto?</h3>
            <p className="text-sm text-muted-foreground mb-4">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-muted transition-colors">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-1">
                {deleteProduct.isPending && <Loader2 size={14} className="animate-spin" />} Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/New modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setEditingProduct(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground font-bold">{editingProduct.id ? "Editar Produto" : "Novo Produto"}</h3>
              <button onClick={() => setEditingProduct(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Nome *</label>
                <input value={editingProduct.name || ""} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Preço Venda *</label>
                  <input type="number" step="0.01" value={editingProduct.price || ""} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Custo</label>
                  <input type="number" step="0.01" value={editingProduct.cost || ""} onChange={(e) => setEditingProduct({ ...editingProduct, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Preço Antigo</label>
                  <input type="number" step="0.01" value={editingProduct.old_price || ""} onChange={(e) => setEditingProduct({ ...editingProduct, old_price: parseFloat(e.target.value) || null })}
                    className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">URL da Imagem *</label>
                <input value={editingProduct.img || ""} onChange={(e) => setEditingProduct({ ...editingProduct, img: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">URL da Imagem 2</label>
                <input value={editingProduct.img2 || ""} onChange={(e) => setEditingProduct({ ...editingProduct, img2: e.target.value || null })}
                  className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Categoria</label>
                  <input value={editingProduct.category || ""} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Estoque</label>
                  <input type="number" value={editingProduct.stock || 0} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Status</label>
                <select value={editingProduct.status || "active"} onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors">
                  <option value="active">Ativo</option>
                  <option value="draft">Rascunho</option>
                  <option value="out">Esgotado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Tamanhos (separados por vírgula)</label>
                <input value={(editingProduct.sizes || []).join(", ")} onChange={(e) => setEditingProduct({ ...editingProduct, sizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={editingProduct.free_shipping || false} onChange={(e) => setEditingProduct({ ...editingProduct, free_shipping: e.target.checked })}
                  className="rounded border-border" />
                <label className="text-sm text-foreground">Frete grátis</label>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setEditingProduct(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={upsertProduct.isPending} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1 disabled:opacity-50">
                  {upsertProduct.isPending && <Loader2 size={14} className="animate-spin" />}
                  <Save size={14} /> Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── BANNERS ───
const BannersView = () => {
  const { data: banners, isLoading } = useAdminBanners();
  const upsertBanner = useUpsertBanner();
  const deleteBanner = useDeleteBanner();
  const { data: products } = useAdminProducts();
  const [editing, setEditing] = useState<Partial<DBBanner> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [useProduct, setUseProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");

  const openNew = () => {
    setEditing({ img: "", cta: "Ver mais", active: true, sort_order: (banners?.length || 0) + 1 });
    setUseProduct(false);
    setSelectedProductId("");
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    const product = products?.find((p) => p.id === productId);
    if (product) {
      setEditing((prev) => prev ? { ...prev, img: product.img } : prev);
    }
  };

  const handleSave = async () => {
    if (!editing?.img) return;
    await upsertBanner.mutateAsync(editing as any);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    await deleteBanner.mutateAsync(id);
    setDeleteConfirm(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Banners do Carrossel</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus size={16} /> Novo Banner
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : !banners || banners.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Nenhum banner cadastrado</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="aspect-[16/9] relative">
                <img src={b.img} alt="Banner" className="w-full h-full object-cover" />
                {!b.active && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[0.6rem] font-bold">Inativo</div>
                )}
                {b.active && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-[0.6rem] font-bold">Ativo</div>
                )}
              </div>
              <div className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">CTA: <span className="text-foreground font-semibold">{b.cta || "—"}</span></p>
                  <p className="text-xs text-muted-foreground">Ordem: {b.sort_order}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing({ ...b }); setUseProduct(false); setSelectedProductId(""); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit2 size={15} /></button>
                  <button onClick={() => setDeleteConfirm(b.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-foreground text-sm mb-4">Tem certeza que deseja excluir este banner?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-muted transition-colors">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create modal */}
      {editing && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground font-bold">{editing.id ? "Editar Banner" : "Novo Banner"}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {/* Option to use product image */}
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={useProduct} onChange={(e) => setUseProduct(e.target.checked)} className="rounded border-border" />
                <label className="text-sm text-foreground">Usar imagem de um produto</label>
              </div>

              {useProduct && products && (
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Selecionar Produto</label>
                  <select value={selectedProductId} onChange={(e) => handleSelectProduct(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors">
                    <option value="">Selecione...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs text-muted-foreground mb-1">URL da Imagem *</label>
                <input value={editing.img || ""} onChange={(e) => setEditing({ ...editing, img: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
              </div>

              {editing.img && (
                <div className="rounded-lg border border-border overflow-hidden aspect-[16/9]">
                  <img src={editing.img} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Texto do Botão (CTA)</label>
                  <input value={editing.cta || ""} onChange={(e) => setEditing({ ...editing, cta: e.target.value })}
                    placeholder="Ver mais"
                    className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Ordem</label>
                  <input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={editing.active ?? true} onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  className="rounded border-border" />
                <label className="text-sm text-foreground">Ativo (visível na loja)</label>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={upsertBanner.isPending || !editing.img}
                  className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1 disabled:opacity-50">
                  {upsertBanner.isPending && <Loader2 size={14} className="animate-spin" />}
                  <Save size={14} /> Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SALES ───
const SalesView = () => {
  const { data: products } = useAdminProducts();
  const { data: sales, isLoading } = useSales();
  const createSale = useCreateSale();
  const deleteSale = useDeleteSale();
  const [showForm, setShowForm] = useState(false);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [discount, setDiscount] = useState(0);
  const [cartLines, setCartLines] = useState<{ productId: string; quantity: number; size: string }[]>([]);

  const activeProducts = products?.filter((p) => p.status === "active") || [];

  const addLine = () => setCartLines([...cartLines, { productId: "", quantity: 1, size: "" }]);
  const removeLine = (i: number) => setCartLines(cartLines.filter((_, idx) => idx !== i));
  const updateLine = (i: number, update: Partial<typeof cartLines[0]>) => {
    setCartLines(cartLines.map((l, idx) => idx === i ? { ...l, ...update } : l));
  };

  const subtotal = cartLines.reduce((sum, line) => {
    const p = products?.find((pr) => pr.id === line.productId);
    return sum + (p ? Number(p.price) * line.quantity : 0);
  }, 0);
  const total = Math.max(0, subtotal - discount);

  const handleSubmit = async () => {
    if (cartLines.length === 0 || cartLines.some((l) => !l.productId)) return;
    const items = cartLines.map((line) => {
      const p = products!.find((pr) => pr.id === line.productId)!;
      return {
        product_id: p.id,
        product_name: p.name,
        quantity: line.quantity,
        unit_price: Number(p.price),
        unit_cost: Number(p.cost) || 0,
        size: line.size || null,
      };
    });
    await createSale.mutateAsync({
      sale: { customer_name: customerName || null, payment_method: paymentMethod, discount, total, sale_date: saleDate, notes: null },
      items,
    });
    setShowForm(false);
    setCartLines([]);
    setCustomerName("");
    setDiscount(0);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Vendas</h1>
        <button onClick={() => { setShowForm(true); addLine(); }} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus size={16} /> Registrar Venda
        </button>
      </div>

      {/* Sales list */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : sales && sales.length > 0 ? (
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="bg-muted">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Data</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Cliente</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Pagamento</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Total</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-foreground">{formatDate(s.sale_date)}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{s.customer_name || "—"}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">{s.payment_method}</span></td>
                  <td className="px-4 py-3 text-sm font-bold text-foreground">{formatPrice(Number(s.total))}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteSale.mutate(s.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <ShoppingBag size={36} className="opacity-30" />
          <p className="text-sm">Nenhuma venda registrada</p>
        </div>
      )}

      {/* Sale form modal */}
      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground font-bold text-lg">Registrar Venda</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Data da Venda</label>
                  <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Cliente (opcional)</label>
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nome do cliente"
                    className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Forma de Pagamento</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors">
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Product lines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Produtos</label>
                  <button onClick={addLine} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus size={12} /> Adicionar item</button>
                </div>
                <div className="space-y-2">
                  {cartLines.map((line, i) => {
                    const selectedProduct = products?.find((p) => p.id === line.productId);
                    return (
                      <div key={i} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <select value={line.productId} onChange={(e) => updateLine(i, { productId: e.target.value })}
                            className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors">
                            <option value="">Selecionar produto</option>
                            {activeProducts.map((p) => <option key={p.id} value={p.id}>{p.name} - {formatPrice(Number(p.price))}</option>)}
                          </select>
                        </div>
                        <div className="w-20">
                          <input type="number" min={1} value={line.quantity} onChange={(e) => updateLine(i, { quantity: parseInt(e.target.value) || 1 })}
                            className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" placeholder="Qtd" />
                        </div>
                        <div className="w-24">
                          <select value={line.size} onChange={(e) => updateLine(i, { size: e.target.value })}
                            className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors">
                            <option value="">Tam.</option>
                            {(selectedProduct?.sizes || []).map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <button onClick={() => removeLine(i)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Desconto (R$)</label>
                  <input type="number" step="0.01" value={discount || ""} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
                </div>
                <div className="flex flex-col justify-end">
                  <div className="bg-muted rounded-lg px-3 py-2 text-right">
                    <p className="text-xs text-muted-foreground">Subtotal: {formatPrice(subtotal)}</p>
                    {discount > 0 && <p className="text-xs text-destructive">Desconto: -{formatPrice(discount)}</p>}
                    <p className="text-lg font-bold text-foreground">{formatPrice(total)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleSubmit} disabled={createSale.isPending || cartLines.some((l) => !l.productId)}
                  className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1 disabled:opacity-50">
                  {createSale.isPending && <Loader2 size={14} className="animate-spin" />}
                  <Save size={14} /> Registrar Venda
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── FINANCES ───
const FinancesView = () => {
  const { data: sales } = useSales();
  const { data: saleItems } = useAllSaleItems();
  const { data: expenses } = useExpenses();
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();
  const [tab, setTab] = useState<"overview" | "revenue" | "expenses">("overview");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expName, setExpName] = useState("");
  const [expAmount, setExpAmount] = useState(0);
  const [expCategory, setExpCategory] = useState("Outros");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterPayment, setFilterPayment] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const totalRevenue = sales?.reduce((s, sale) => s + Number(sale.total), 0) || 0;
  const totalCost = saleItems?.reduce((s, item) => s + Number(item.unit_cost) * item.quantity, 0) || 0;
  const totalExp = expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0;
  const netProfit = totalRevenue - totalCost - totalExp;

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    let result = [...sales];
    if (filterPayment) result = result.filter((s) => s.payment_method === filterPayment);
    if (filterDateFrom) result = result.filter((s) => s.sale_date >= filterDateFrom);
    if (filterDateTo) result = result.filter((s) => s.sale_date <= filterDateTo);
    return result;
  }, [sales, filterPayment, filterDateFrom, filterDateTo]);

  // Monthly data for chart
  const monthlyChart = useMemo(() => {
    if (!sales || !expenses) return [];
    const months: Record<string, { receita: number; despesa: number }> = {};
    sales.forEach((s) => {
      const key = s.sale_date.substring(0, 7);
      if (!months[key]) months[key] = { receita: 0, despesa: 0 };
      months[key].receita += Number(s.total);
    });
    expenses.forEach((e) => {
      const key = e.expense_date.substring(0, 7);
      if (!months[key]) months[key] = { receita: 0, despesa: 0 };
      months[key].despesa += Number(e.amount);
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, data]) => ({
        month: new Date(month + "-15").toLocaleDateString("pt-BR", { month: "short" }),
        ...data,
      }));
  }, [sales, expenses]);

  const handleAddExpense = async () => {
    if (!expName || expAmount <= 0) return;
    await createExpense.mutateAsync({ name: expName, amount: expAmount, category: expCategory, expense_date: expDate, notes: null });
    setShowExpenseForm(false);
    setExpName(""); setExpAmount(0);
  };

  const exportCSV = () => {
    if (!sales) return;
    const headers = "Data,Cliente,Pagamento,Total\n";
    const rows = filteredSales.map((s) => `${s.sale_date},${s.customer_name || ""},${s.payment_method},${Number(s.total).toFixed(2)}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `relatorio-vendas-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const tabs = [
    { key: "overview" as const, label: "Resumo" },
    { key: "revenue" as const, label: "Receitas" },
    { key: "expenses" as const, label: "Despesas" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Finanças</h1>
        <button onClick={exportCSV} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-2 rounded-lg transition-colors">
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl p-5 border border-border bg-card">
              <ArrowUpRight size={20} className="text-green-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">Receita Total</p>
            </div>
            <div className="rounded-xl p-5 border border-border bg-card">
              <ArrowDownRight size={20} className="text-destructive mb-2" />
              <p className="text-2xl font-bold text-foreground">{formatPrice(totalExp)}</p>
              <p className="text-xs text-muted-foreground">Total Despesas</p>
            </div>
            <div className="rounded-xl p-5 border border-border bg-card">
              <DollarSign size={20} className="text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{formatPrice(totalCost)}</p>
              <p className="text-xs text-muted-foreground">Custo Produtos</p>
            </div>
            <div className="rounded-xl p-5 border border-border bg-card">
              <TrendingUp size={20} className={netProfit >= 0 ? "text-green-500" : "text-destructive"} />
              <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>{formatPrice(netProfit)}</p>
              <p className="text-xs text-muted-foreground">Lucro Líquido</p>
            </div>
          </div>

          {/* Monthly chart */}
          <div className="rounded-xl p-5 border border-border bg-card">
            <h3 className="text-sm font-bold text-foreground mb-4">Receitas vs Despesas</h3>
            {monthlyChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                    formatter={(value: number, name: string) => [formatPrice(value), name === "receita" ? "Receita" : "Despesa"]} />
                  <Bar dataKey="receita" fill="hsl(145, 63%, 42%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesa" fill="hsl(0, 72%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">Nenhum dado disponível</div>
            )}
          </div>
        </div>
      )}

      {tab === "revenue" && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">De</label>
              <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Até</label>
              <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Pagamento</label>
              <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors">
                <option value="">Todos</option>
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-border overflow-x-auto bg-card">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Data</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Cliente</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Pagamento</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((s) => (
                  <tr key={s.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground">{formatDate(s.sale_date)}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{s.customer_name || "—"}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">{s.payment_method}</span></td>
                    <td className="px-4 py-3 text-sm font-bold text-foreground">{formatPrice(Number(s.total))}</td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhuma venda encontrada</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right text-sm text-muted-foreground">
            Total filtrado: <span className="font-bold text-foreground">{formatPrice(filteredSales.reduce((s, sale) => s + Number(sale.total), 0))}</span>
          </div>
        </div>
      )}

      {tab === "expenses" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Total: <span className="font-bold text-foreground">{formatPrice(totalExp)}</span></p>
            <button onClick={() => setShowExpenseForm(true)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              <Plus size={14} /> Nova Despesa
            </button>
          </div>

          <div className="rounded-xl border border-border overflow-x-auto bg-card">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Data</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Despesa</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Categoria</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Valor</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {expenses?.map((e) => (
                  <tr key={e.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground">{formatDate(e.expense_date)}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{e.name}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-semibold">{e.category}</span></td>
                    <td className="px-4 py-3 text-sm font-bold text-destructive">{formatPrice(Number(e.amount))}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => deleteExpense.mutate(e.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
                {(!expenses || expenses.length === 0) && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhuma despesa registrada</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add expense modal */}
          {showExpenseForm && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setShowExpenseForm(false)}>
              <div className="absolute inset-0 bg-black/60" />
              <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-foreground font-bold">Nova Despesa</h3>
                  <button onClick={() => setShowExpenseForm(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Nome *</label>
                    <input value={expName} onChange={(e) => setExpName(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Valor *</label>
                      <input type="number" step="0.01" value={expAmount || ""} onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Data</label>
                      <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)}
                        className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Categoria</label>
                    <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm text-foreground border border-border bg-muted focus:border-primary outline-none transition-colors">
                      {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button onClick={() => setShowExpenseForm(false)} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-muted transition-colors">Cancelar</button>
                    <button onClick={handleAddExpense} disabled={createExpense.isPending}
                      className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1 disabled:opacity-50">
                      {createExpense.isPending && <Loader2 size={14} className="animate-spin" />}
                      <Save size={14} /> Salvar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── SETTINGS ───
const SettingsView = () => {
  const { data: settings, isLoading } = useStoreSettings();
  const updateSetting = useUpdateSetting();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  const getValue = (key: string) => localSettings[key] ?? settings?.[key] ?? "";

  const handleSave = async () => {
    for (const [key, value] of Object.entries(localSettings)) {
      await updateSetting.mutateAsync({ key, value });
    }
    setLocalSettings({});
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Configurações</h1>
      <div className="rounded-xl border border-border p-6 max-w-xl bg-card">
        <h3 className="text-sm font-bold text-foreground mb-4">Dados da Loja</h3>
        <div className="space-y-4">
          {[
            { key: "store_name", label: "Nome da Loja" },
            { key: "whatsapp", label: "WhatsApp" },
            { key: "announcement_text", label: "Texto do Anúncio (topo)" },
            { key: "coupon_code", label: "Código do Cupom" },
            { key: "coupon_discount", label: "Desconto do Cupom (%)" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-xs text-muted-foreground mb-1">{field.label}</label>
              <input value={getValue(field.key)} onChange={(e) => setLocalSettings({ ...localSettings, [field.key]: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-foreground outline-none border border-border bg-muted focus:border-primary transition-colors" />
            </div>
          ))}
          <button onClick={handleSave} disabled={updateSetting.isPending || Object.keys(localSettings).length === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
            {updateSetting.isPending && <Loader2 size={14} className="animate-spin" />}
            <Save size={14} /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ORDERS ADMIN ───
const OrdersAdminView = () => {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { data: orderItems } = useOrderItems(selectedOrderId || undefined);

  const selectedOrder = orders?.find((o) => o.id === selectedOrderId);

  const handleStatusChange = async (orderId: string, status: string) => {
    await updateStatus.mutateAsync({ id: orderId, status });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Pedidos</h1>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Nenhum pedido registrado</div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-muted">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Pedido</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Cliente</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Valor</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Pagamento</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Data</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <tr key={order.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">#{order.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{order.customers?.name}</p>
                      <p className="text-xs text-muted-foreground">{order.customers?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{formatPrice(Number(order.total))}</td>
                    <td className="px-4 py-3 text-sm text-foreground capitalize">{order.payment_method}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-semibold border-0 outline-none cursor-pointer ${statusInfo.color}`}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedOrderId(order.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Eye size={15} />
                        </button>
                        <a href={`/pedido/${order.id}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <ChevronRight size={15} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setSelectedOrderId(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground font-bold">Pedido #{selectedOrder.order_number}</h3>
              <button onClick={() => setSelectedOrderId(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              {/* Customer */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Cliente</p>
                <p className="text-sm font-semibold text-foreground">{selectedOrder.customers?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.customers?.phone}</p>
                {selectedOrder.customers?.email && <p className="text-sm text-muted-foreground">{selectedOrder.customers?.email}</p>}
              </div>

              {/* Address */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Endereço</p>
                <p className="text-sm text-foreground">{selectedOrder.address_street}, {selectedOrder.address_number}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.address_neighborhood} - {selectedOrder.address_city}</p>
                <p className="text-sm text-muted-foreground">CEP: {selectedOrder.address_cep}</p>
                {selectedOrder.address_complement && <p className="text-sm text-muted-foreground">{selectedOrder.address_complement}</p>}
              </div>

              {/* Items */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Produtos</p>
                {orderItems ? (
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-1">
                        {item.product_img && <img src={item.product_img} alt="" className="w-8 h-8 rounded object-cover" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">{item.size && `${item.size} • `}{item.quantity}x</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{formatPrice(Number(item.price) * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Loader2 size={16} className="animate-spin text-primary" />
                )}
              </div>

              {/* Payment & total */}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Pagamento</span>
                  <span className="text-sm text-foreground capitalize">{selectedOrder.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">{formatPrice(Number(selectedOrder.total))}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Observação</p>
                  <p className="text-sm text-foreground">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Status change */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Alterar Status</p>
                <div className="flex flex-wrap gap-2">
                  {ORDER_STATUSES.map((s) => (
                    <button key={s.value} onClick={() => handleStatusChange(selectedOrder.id, s.value)}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${selectedOrder.status === s.value ? s.color : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
