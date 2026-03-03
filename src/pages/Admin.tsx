import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut,
  Plus, Edit2, Trash2, Eye, TrendingUp, DollarSign, Box, ChevronDown,
  Crown, Search, Bell, BarChart3,
} from "lucide-react";
import ThemeToggle from "@/components/store/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

// ─── TYPES ───
type AdminView = "dashboard" | "products" | "orders" | "customers" | "settings";

type Product = {
  id: number; name: string; price: number; stock: number; status: "active" | "draft" | "out";
  category: string; img: string;
};

type Order = {
  id: string; customer: string; total: number; status: "pending" | "shipped" | "delivered" | "cancelled";
  date: string; items: number;
};

// ─── MOCK DATA ───
const mockProducts: Product[] = [
  { id: 1, name: "KIT PRINCESA E PRINCIPE CLASH ROYALE", price: 169.99, stock: 24, status: "active", category: "Camisas Casais", img: "https://placehold.co/60x60/7c3aed/fff?text=1" },
  { id: 2, name: "CAMISA OLHAR + TIME", price: 84.99, stock: 18, status: "active", category: "Camisas Personalizadas", img: "https://placehold.co/60x60/7c3aed/fff?text=2" },
  { id: 3, name: "CAMISA OLHAR APAIXONADO", price: 84.99, stock: 0, status: "out", category: "Camisas Olhar", img: "https://placehold.co/60x60/7c3aed/fff?text=3" },
  { id: 4, name: "CAMISA ERICK PULGAR 2.0", price: 84.99, stock: 32, status: "active", category: "Camisas Jogadores", img: "https://placehold.co/60x60/7c3aed/fff?text=4" },
  { id: 5, name: "KIT ENROLADOS RAPUNZEL E JOSÉ", price: 169.99, stock: 5, status: "active", category: "Camisas Casais", img: "https://placehold.co/60x60/7c3aed/fff?text=5" },
  { id: 6, name: "CAMISA OROCHI 4.0", price: 85.00, stock: 12, status: "draft", category: "Camisas Personalizadas", img: "https://placehold.co/60x60/7c3aed/fff?text=6" },
];

const mockOrders: Order[] = [
  { id: "#DU-1042", customer: "João Silva", total: 169.99, status: "pending", date: "01/03/2026", items: 2 },
  { id: "#DU-1041", customer: "Maria Santos", total: 84.99, status: "shipped", date: "28/02/2026", items: 1 },
  { id: "#DU-1040", customer: "Carlos Oliveira", total: 254.98, status: "delivered", date: "27/02/2026", items: 3 },
  { id: "#DU-1039", customer: "Ana Costa", total: 85.00, status: "cancelled", date: "26/02/2026", items: 1 },
  { id: "#DU-1038", customer: "Pedro Almeida", total: 339.98, status: "delivered", date: "25/02/2026", items: 4 },
];

const formatPrice = (v: number) => `R$${v.toFixed(2).replace(".", ",")}`;

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-600 dark:text-green-400",
  draft: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  out: "bg-destructive/20 text-destructive",
  pending: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  shipped: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  delivered: "bg-green-500/20 text-green-600 dark:text-green-400",
  cancelled: "bg-destructive/20 text-destructive",
};

const statusLabels: Record<string, string> = {
  active: "Ativo", draft: "Rascunho", out: "Esgotado",
  pending: "Pendente", shipped: "Enviado", delivered: "Entregue", cancelled: "Cancelado",
};

// ─── ADMIN ───
const Admin = () => {
  const [view, setView] = useState<AdminView>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, signOut } = useAuth();

  const navItems: { icon: typeof LayoutDashboard; label: string; key: AdminView }[] = [
    { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
    { icon: Package, label: "Produtos", key: "products" },
    { icon: ShoppingBag, label: "Pedidos", key: "orders" },
    { icon: Users, label: "Clientes", key: "customers" },
    { icon: Settings, label: "Configurações", key: "settings" },
  ];

  return (
    <div className="flex h-screen bg-background transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? "w-16" : "w-60"} transition-all duration-200 flex flex-col border-r border-border bg-card`}>
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

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3 bg-muted rounded-lg px-3 py-2 w-72">
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

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {view === "dashboard" && <DashboardView />}
          {view === "products" && <ProductsView />}
          {view === "orders" && <OrdersView />}
          {view === "customers" && <CustomersView />}
          {view === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

// ─── DASHBOARD ───
const DashboardView = () => {
  const stats = [
    { label: "Vendas Hoje", value: "R$1.249,97", icon: DollarSign, change: "+12%" },
    { label: "Pedidos", value: "23", icon: ShoppingBag, change: "+5%" },
    { label: "Produtos Ativos", value: "16", icon: Box, change: "0" },
    { label: "Visitantes", value: "342", icon: TrendingUp, change: "+18%" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl p-5 border border-border bg-card transition-colors">
            <div className="flex items-center justify-between mb-3">
              <s.icon size={20} className="text-primary" />
              <span className={`text-xs font-semibold ${s.change.startsWith("+") ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>{s.change}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl p-5 border border-border bg-card">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-primary" /> Vendas Recentes</h3>
          <div className="space-y-3">
            {mockOrders.slice(0, 4).map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="text-sm text-foreground">{o.customer}</p>
                  <p className="text-xs text-muted-foreground">{o.id} • {o.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{formatPrice(o.total)}</p>
                  <span className={`text-[0.6rem] px-2 py-0.5 rounded-full font-semibold ${statusColors[o.status]}`}>{statusLabels[o.status]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-5 border border-border bg-card">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><Package size={16} className="text-primary" /> Estoque Baixo</h3>
          <div className="space-y-3">
            {mockProducts.filter((p) => p.stock <= 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-border">
                <img src={p.img} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                </div>
                <span className="text-xs font-bold text-destructive">{p.stock} un.</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PRODUCTS ───
const ProductsView = () => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
      <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
        <Plus size={16} /> Novo Produto
      </button>
    </div>
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <table className="w-full">
        <thead>
          <tr className="bg-muted">
            <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Produto</th>
            <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Categoria</th>
            <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Preço</th>
            <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Estoque</th>
            <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
            <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {mockProducts.map((p) => (
            <tr key={p.id} className="border-t border-border hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src={p.img} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <span className="text-sm text-foreground truncate max-w-[200px]">{p.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{p.category}</td>
              <td className="px-4 py-3 text-sm text-foreground font-semibold">{formatPrice(p.price)}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{p.stock}</td>
              <td className="px-4 py-3"><span className={`text-[0.65rem] px-2 py-1 rounded-full font-semibold ${statusColors[p.status]}`}>{statusLabels[p.status]}</span></td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Eye size={15} /></button>
                  <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit2 size={15} /></button>
                  <button className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={15} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── ORDERS ───
const OrdersView = () => (
  <div>
    <h1 className="text-2xl font-bold text-foreground mb-6">Pedidos</h1>
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <table className="w-full">
        <thead>
          <tr className="bg-muted">
            <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Pedido</th>
            <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Cliente</th>
            <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Data</th>
            <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Itens</th>
            <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Total</th>
            <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
            <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {mockOrders.map((o) => (
            <tr key={o.id} className="border-t border-border hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3 text-sm font-semibold text-primary">{o.id}</td>
              <td className="px-4 py-3 text-sm text-foreground">{o.customer}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{o.date}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{o.items}</td>
              <td className="px-4 py-3 text-sm text-foreground font-semibold">{formatPrice(o.total)}</td>
              <td className="px-4 py-3"><span className={`text-[0.65rem] px-2 py-1 rounded-full font-semibold ${statusColors[o.status]}`}>{statusLabels[o.status]}</span></td>
              <td className="px-4 py-3 text-right">
                <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Eye size={15} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── CUSTOMERS ───
const CustomersView = () => (
  <div>
    <h1 className="text-2xl font-bold text-foreground mb-6">Clientes</h1>
    <div className="rounded-xl border border-border p-8 text-center bg-card">
      <Users size={48} className="text-primary/30 mx-auto mb-4" />
      <p className="text-muted-foreground text-sm">Módulo de clientes será ativado com o banco de dados.</p>
      <p className="text-muted-foreground/60 text-xs mt-1">Conecte o Lovable Cloud para gerenciar clientes.</p>
    </div>
  </div>
);

// ─── SETTINGS ───
const SettingsView = () => {
  const [storeName, setStoreName] = useState("Duartt");
  const [whatsapp, setWhatsapp] = useState("5585992783973");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Configurações</h1>
      <div className="rounded-xl border border-border p-6 max-w-xl bg-card">
        <h3 className="text-sm font-bold text-foreground mb-4">Dados da Loja</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Nome da Loja</label>
            <input value={storeName} onChange={(e) => setStoreName(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-foreground outline-none border border-border bg-muted focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">WhatsApp</label>
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-foreground outline-none border border-border bg-muted focus:border-primary transition-colors" />
          </div>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
