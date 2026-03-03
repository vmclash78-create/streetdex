import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, Settings, LogOut,
  Plus, Edit2, Trash2, TrendingUp, DollarSign, Box, ChevronDown,
  Crown, Search, Bell, BarChart3, Save, X, Loader2, Image,
} from "lucide-react";
import ThemeToggle from "@/components/store/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useAdminProducts, useUpsertProduct, useDeleteProduct, useStoreSettings, useUpdateSetting, type DBProduct } from "@/hooks/useStoreData";

type AdminView = "dashboard" | "products" | "settings";

const formatPrice = (v: number) => `R$${Number(v).toFixed(2).replace(".", ",")}`;

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
        <a href="/" className="flex-1 flex flex-col items-center gap-0.5 py-2 text-[0.6rem] text-muted-foreground">
          <LogOut size={18} />
          Loja
        </a>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3 bg-muted rounded-lg px-3 py-2 flex-1 max-w-xs">
            <Search size={16} className="text-muted-foreground" />
            <input type="text" placeholder="Buscar..." className="bg-transparent text-sm text-foreground outline-none flex-1 placeholder:text-muted-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">AD</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {view === "dashboard" && <DashboardView />}
          {view === "products" && <ProductsView />}
          {view === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

// ─── DASHBOARD ───
const DashboardView = () => {
  const { data: products } = useAdminProducts();

  const activeCount = products?.filter((p) => p.status === "active").length || 0;
  const lowStock = products?.filter((p) => p.stock <= 5) || [];

  const stats = [
    { label: "Produtos Ativos", value: String(activeCount), icon: Box, change: "" },
    { label: "Estoque Baixo", value: String(lowStock.length), icon: TrendingUp, change: lowStock.length > 0 ? "⚠️" : "✓" },
    { label: "Total Produtos", value: String(products?.length || 0), icon: Package, change: "" },
    { label: "Categorias", value: String(new Set(products?.map((p) => p.category).filter(Boolean)).size), icon: BarChart3, change: "" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl p-5 border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <s.icon size={20} className="text-primary" />
              <span className="text-xs font-semibold text-muted-foreground">{s.change}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-xl p-5 border border-border bg-card">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><Package size={16} className="text-primary" /> Estoque Baixo</h3>
          <div className="space-y-3">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-border">
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

  const openNew = () => setEditingProduct({ name: "", price: 0, img: "", sizes: ["P", "M", "G", "GG", "XG"], status: "active", stock: 0, free_shipping: true, category: "" });
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
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-muted">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Produto</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">Categoria</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Preço</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">Estoque</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.img} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <span className="text-sm text-foreground truncate max-w-[180px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{p.category}</td>
                  <td className="px-4 py-3 text-sm text-foreground font-semibold">{formatPrice(Number(p.price))}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{p.stock}</td>
                  <td className="px-4 py-3"><span className={`text-[0.65rem] px-2 py-1 rounded-full font-semibold ${statusColors[p.status] || ""}`}>{statusLabels[p.status] || p.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit2 size={15} /></button>
                      <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
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
            <p className="text-sm text-muted-foreground mb-4">Esta ação não pode ser desfeita. O produto será removido da loja.</p>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Preço *</label>
                  <input type="number" step="0.01" value={editingProduct.price || ""} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
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
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Nome da Loja</label>
            <input value={getValue("store_name")} onChange={(e) => setLocalSettings({ ...localSettings, store_name: e.target.value })}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-foreground outline-none border border-border bg-muted focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">WhatsApp</label>
            <input value={getValue("whatsapp")} onChange={(e) => setLocalSettings({ ...localSettings, whatsapp: e.target.value })}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-foreground outline-none border border-border bg-muted focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Texto do Anúncio (topo)</label>
            <input value={getValue("announcement_text")} onChange={(e) => setLocalSettings({ ...localSettings, announcement_text: e.target.value })}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-foreground outline-none border border-border bg-muted focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Código do Cupom</label>
            <input value={getValue("coupon_code")} onChange={(e) => setLocalSettings({ ...localSettings, coupon_code: e.target.value })}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-foreground outline-none border border-border bg-muted focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Desconto do Cupom (%)</label>
            <input value={getValue("coupon_discount")} onChange={(e) => setLocalSettings({ ...localSettings, coupon_discount: e.target.value })}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-foreground outline-none border border-border bg-muted focus:border-primary transition-colors" />
          </div>
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

export default Admin;
