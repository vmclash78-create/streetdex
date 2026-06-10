import { useState, useMemo, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, Package, ShoppingBag, Settings, LogOut,
  Plus, Edit2, Trash2, TrendingUp, DollarSign, Box, ChevronDown,
  Crown, Search, Bell, BarChart3, Save, X, Loader2,
  Receipt, Wallet, Calendar, Download, ArrowUpRight, ArrowDownRight,
  ShoppingCart, CreditCard, Users, Tag, FileText, AlertTriangle,
  Image, ClipboardList, Eye, ChevronRight, Upload, Volume2,
} from "lucide-react";
import ThemeToggle from "@/components/store/ThemeToggle";
import StreetDexLogo from "@/components/store/StreetDexLogo";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  useAdminProducts, useUpsertProduct, useDeleteProduct,
  useStoreSettings, useUpdateSetting,
  useSales, useAllSaleItems, useCreateSale, useDeleteSale,
  useExpenses, useCreateExpense, useDeleteExpense,
  useAdminBanners, useUpsertBanner, useDeleteBanner,
  useCoupons, useUpsertCoupon, useDeleteCoupon,
  type DBProduct, type DBSale, type DBSaleItem, type DBExpense, type DBBanner, type DBCoupon,
} from "@/hooks/useStoreData";
import { 
  useOrders, 
  useOrderItems, 
  useUpdateOrderStatus, 
  useUpdateOrder,
  useDeleteOrder,
  ORDER_STATUSES, 
  getStatusInfo,
  type DBOrder
} from "@/hooks/useOrders";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

type AdminView = "dashboard" | "products" | "banners" | "sales" | "orders" | "coupons" | "finances" | "settings";

const formatPrice = (v: number) => `R$${Number(v).toFixed(2).replace(".", ",")}`;
const formatDate = (d: string) => {
  const date = new Date(d + "T12:00:00");
  return date.toLocaleDateString("pt-BR");
};

const PAYMENT_METHODS = ["dinheiro", "pix", "cartão crédito", "cartão débito", "transferência"];
const PAYMENT_LABELS: Record<string, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  "cartão crédito": "Cartão Crédito",
  "cartão débito": "Cartão Débito",
  transferência: "Transferência"
};
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [somLiberado, setSomLiberado] = useState(false);
  const somLiberadoRef = useRef(false);
  const audioPedidoRef = useRef<HTMLAudioElement | null>(null);
  const lastOrderRef = useRef<string | null>(null);

  const { data: settings } = useStoreSettings();

  // Inicializa e atualiza o áudio quando as configurações mudam
  useEffect(() => {
    const soundUrl = settings?.notification_sound || "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3";
    
    if (!audioPedidoRef.current) {
      audioPedidoRef.current = new Audio(soundUrl);
    } else if (audioPedidoRef.current.src !== soundUrl) {
      audioPedidoRef.current.src = soundUrl;
      audioPedidoRef.current.load();
    }
  }, [settings?.notification_sound]);

  useEffect(() => {
    const liberarAudio = async () => {
      if (!audioPedidoRef.current || somLiberadoRef.current) return;
      
      try {
        console.log("Tentando desbloquear áudio...");
        // Alguns navegadores exigem que o áudio seja tocado em resposta a um clique
        audioPedidoRef.current.muted = true;
        await audioPedidoRef.current.play();
        audioPedidoRef.current.pause();
        audioPedidoRef.current.muted = false;
        audioPedidoRef.current.currentTime = 0;
        
        somLiberadoRef.current = true;
        setSomLiberado(true);
        console.log("Áudio desbloqueado com sucesso!");
      } catch (erro) {
        console.log("Erro ao desbloquear áudio:", erro);
      }
    };

    const handleInteraction = () => {
      liberarAudio();
      // Removemos o listener após o primeiro clique bem-sucedido (ou tentativa)
      document.removeEventListener("click", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);
    
    return () => {
      document.removeEventListener("click", handleInteraction);
    };
  }, []);

  const tocarSomPedido = () => {
    console.log("Chamando tocarSomPedido. somLiberadoRef:", somLiberadoRef.current);
    
    if (!audioPedidoRef.current) {
      console.log("Erro: Objeto de áudio não inicializado");
      return;
    }

    if (!somLiberadoRef.current) {
      console.log("Aviso: Áudio ainda não foi liberado pelo usuário");
      return;
    }

    const audio = audioPedidoRef.current;
    audio.currentTime = 0;
    audio.volume = 1;
    
    audio.play()
      .then(() => {
        console.log("Som de novo pedido reproduzido com sucesso");
      })
      .catch(err => {
        console.log("Erro crítico ao reproduzir som:", err);
        // Tenta re-desbloquear se falhar
        setSomLiberado(false);
        somLiberadoRef.current = false;
      });
  };

  const testarNotificacao = () => {
    if (!somLiberadoRef.current) {
      toast({
        title: "Áudio bloqueado",
        description: "Por favor, clique em 'Clique para Ativar Som' no topo ou em qualquer lugar da tela.",
        variant: "destructive"
      });
      return;
    }
    
    tocarSomPedido();
    toast({
      title: "Teste de Som",
      description: "O sinal sonoro foi enviado. Você ouviu?",
    });
  };

  useEffect(() => {
    console.log("Configurando canal de notificações de pedidos...");
    
    const channel = supabase
      .channel('admin-order-notifications-v2')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          console.log('RECEBIDO: Novo pedido no banco de dados:', payload);
          
          if (lastOrderRef.current === payload.new.id) {
            console.log('Ignorando notificação duplicada para o ID:', payload.new.id);
            return;
          }
          lastOrderRef.current = payload.new.id;

          toast({
            title: "🔔 NOVO PEDIDO RECEBIDO!",
            description: `Pedido #${payload.new.order_number} - ${formatPrice(payload.new.total)}`,
            duration: 10000, // 10 segundos para dar tempo de ver
          });

          tocarSomPedido();

          queryClient.invalidateQueries({ queryKey: ["orders"] });
          queryClient.invalidateQueries({ queryKey: ["order-items"] });
        }
      )
      .subscribe((status) => {
        console.log("Status da conexão Realtime:", status);
      });

    return () => {
      console.log("Removendo canal de notificações");
      supabase.removeChannel(channel);
    };
  }, [toast, queryClient]); // Removi somLiberado das dependências para evitar re-subscribe desnecessário

  const navItems: { icon: typeof LayoutDashboard; label: string; key: AdminView }[] = [
    { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
    { icon: Package, label: "Produtos", key: "products" },
    { icon: Image, label: "Banners", key: "banners" },
    { icon: ClipboardList, label: "Pedidos", key: "orders" },
    { icon: ShoppingCart, label: "Vendas", key: "sales" },
    { icon: Tag, label: "Cupons", key: "coupons" },
    { icon: Wallet, label: "Finanças", key: "finances" },
    { icon: Settings, label: "Configurações", key: "settings" },
  ];

  return (
    <div className="flex h-screen bg-background transition-colors duration-300">
      <aside className={`${sidebarCollapsed ? "w-16" : "w-60"} transition-all duration-200 flex flex-col border-r border-border bg-card hidden md:flex`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border overflow-hidden">
          <StreetDexLogo size="sm" />
          {!sidebarCollapsed && <span className="text-lg font-light tracking-tight text-foreground truncate">{settings?.store_name || "Street Dex"}</span>}
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
          <Button variant="ghost" className="w-full justify-start px-4 gap-3 text-muted-foreground" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <ChevronDown size={18} className={`transform transition-transform ${sidebarCollapsed ? "rotate-90" : "-rotate-90"}`} />
            {!sidebarCollapsed && <span>Recolher</span>}
          </Button>
          <Button variant="ghost" className="w-full justify-start px-4 gap-3 text-muted-foreground" asChild>
            <a href="/"><LogOut size={18} className="flex-shrink-0" />{!sidebarCollapsed && <span>Voltar à Loja</span>}</a>
          </Button>
          <Button variant="ghost" className="w-full justify-start px-4 gap-3 text-destructive hover:text-destructive/80" onClick={signOut}>
            <LogOut size={18} className="flex-shrink-0" />
            {!sidebarCollapsed && <span>Sair</span>}
          </Button>
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
            <Button 
              variant="outline" 
              size="sm" 
              className={`gap-2 ${!somLiberado ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" : "text-muted-foreground"}`}
              onClick={testarNotificacao}
            >
              <Volume2 size={16} /> 
              {somLiberado ? "Som Ativo" : "Clique para Ativar Som"}
            </Button>
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
          {view === "coupons" && <CouponsView />}
          {view === "finances" && <FinancesView />}
          {view === "settings" && <SettingsView />}
        </main>
      </div>
      <audio id="somPedido" key={settings?.notification_sound || "/sons/notificacao.mp3"} preload="auto">
        <source src={settings?.notification_sound || "/sons/notificacao.mp3"} type="audio/mpeg" />
      </audio>
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
  const supplierExpenses = expenses?.filter(e => e.category === "Fornecedores").reduce((s, e) => s + Number(e.amount), 0) || 0;
  const totalCost = (saleItems?.reduce((s, item) => s + Number(item.unit_cost) * item.quantity, 0) || 0) + supplierExpenses;
  const totalExpenses = (expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0) - supplierExpenses;
  const estimatedProfit = totalRevenue - totalCost - totalExpenses;

  const lowStock = products?.filter((p) => (p.stock ?? 0) <= 5 && p.status === "active") || [];

  const monthlyData = useMemo(() => {
    if (!sales) return [];
    const months: Record<string, number> = {};
    sales.forEach((s) => { const key = s.sale_date.substring(0, 7); months[key] = (months[key] || 0) + Number(s.total); });
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
      .map(([month, value]) => ({ month: new Date(month + "-15").toLocaleDateString("pt-BR", { month: "short" }), valor: value }));
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
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-primary" /> Faturamento Mensal</h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [formatPrice(value), "Faturamento"]} />
                  <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">Nenhuma venda registrada</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
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
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-yellow-500" /> Estoque Baixo</h3>
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

// ─── PRODUCTS ───
const ProductsView = () => {
  const { data: products, isLoading } = useAdminProducts();
  const upsertProduct = useUpsertProduct();
  const deleteProduct = useDeleteProduct();
  const [editingProduct, setEditingProduct] = useState<Partial<DBProduct> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openNew = () => {
    setEditingProduct({ 
      name: "", 
      price: 0, 
      cost: 0, 
      img: "", 
      sizes: ["P", "M", "G", "GG", "XG"], 
      status: "active", 
      stock: 0, 
      free_shipping: true, 
      category: "" 
    });
    setLocalMargin("");
    setLastChanged(null);
  };
  const openEdit = (p: DBProduct) => {
    setEditingProduct({ ...p });
    setLastChanged(null);
    if (p.price && p.cost && p.cost > 0) {
      const margin = ((p.price - p.cost) / p.cost) * 100;
      setLocalMargin(margin.toFixed(1).replace(".", ","));
    } else {
      setLocalMargin("");
    }
  };



  const [lastChanged, setLastChanged] = useState<"price" | "cost" | "margin" | null>(null);
  const [localMargin, setLocalMargin] = useState<string>("");


  const { toast } = useToast();

  const handleSave = async () => {
    if (!editingProduct?.name) {
      toast({ title: "Erro", description: "O nome do produto é obrigatório.", variant: "destructive" });
      return;
    }
    if (!editingProduct?.img) {
      toast({ title: "Erro", description: "A imagem do produto é obrigatória.", variant: "destructive" });
      return;
    }
    if (editingProduct?.cost === undefined || editingProduct?.cost === null) {
      toast({ title: "Erro", description: "O custo do produto é obrigatório.", variant: "destructive" });
      return;
    }
    if (!editingProduct?.price || editingProduct?.price <= 0) {
      toast({ title: "Erro", description: "O preço de venda deve ser maior que zero.", variant: "destructive" });
      return;
    }
    await upsertProduct.mutateAsync(editingProduct as any);
    setEditingProduct(null);
    setLocalMargin("");
    setLastChanged(null);
  };



  const handleDelete = async (id: string) => {
    await deleteProduct.mutateAsync(id);
    setDeleteConfirm(null);
  };

  const getMarkup = (price: number, cost: number) => {
    if (!cost || cost === 0) return null;
    return (((price - cost) / cost) * 100).toFixed(0);
  };

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedProductIds.length === products?.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products?.map(p => p.id) || []);
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Deseja excluir ${selectedProductIds.length} produtos?`)) {
      for (const id of selectedProductIds) {
        await deleteProduct.mutateAsync(id);
      }
      setSelectedProductIds([]);
    }
  };

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center justify-between mb-6 bg-background/80 backdrop-blur-sm py-4 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
        <div className="flex gap-2">
          {selectedProductIds.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete} className="gap-2">
              <Trash2 size={16} /> Excluir ({selectedProductIds.length})
            </Button>
          )}
          <Button onClick={openNew} className="gap-2"><Plus size={16} /> Novo Produto</Button>
        </div>
      </div>

      {isLoading ? (

        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={products && products.length > 0 && selectedProductIds.length === products.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Margem</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {products?.map((p) => {
                const margin = getMarkup(Number(p.price), Number(p.cost));
                return (
                  <TableRow key={p.id} className={selectedProductIds.includes(p.id) ? "bg-primary/5" : ""}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedProductIds.includes(p.id)}
                        onCheckedChange={() => toggleSelectProduct(p.id)}
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={p.img} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div>
                          <span className="text-sm text-foreground truncate block max-w-[180px]">{p.name}</span>
                          <span className="text-[0.65rem] text-muted-foreground">{p.category}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatPrice(Number(p.price))}</TableCell>
                    <TableCell className="text-muted-foreground">{Number(p.cost) > 0 ? formatPrice(Number(p.cost)) : "—"}</TableCell>
                    <TableCell>{margin ? <span className="text-green-600 dark:text-green-400 font-semibold">{margin}%</span> : "—"}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${(p.stock ?? 0) <= 5 ? "text-destructive" : "text-foreground"}`}>{p.stock}</span>
                    </TableCell>
                    <TableCell><Badge className={statusColors[p.status] || ""} variant="secondary">{statusLabels[p.status] || p.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Edit2 size={15} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(p.id)}><Trash2 size={15} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir produto?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="gap-1">
              {deleteProduct.isPending && <Loader2 size={14} className="animate-spin" />} Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/New modal */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct?.id ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nome do Produto *</Label>
                  <Input 
                    value={editingProduct.name || ""} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} 
                    className="mt-1"
                    placeholder="Ex: T-Shirt Streetwear"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Tamanhos (separados por vírgula)</Label>
                  <Input 
                    value={(editingProduct.sizes || []).join(", ")} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, sizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} 
                    className="mt-1"
                    placeholder="Ex: P, M, G, GG"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Estoque</Label>
                    <Input 
                      type="number" 
                      value={editingProduct.stock || 0} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })} 
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Custo *</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={editingProduct.cost || ""} 
                      onChange={(e) => {
                        const cost = parseFloat(e.target.value) || 0;
                        const updates: any = { cost };
                        setLastChanged("cost");
                        
                        // If we have a margin already set, update price
                        if (cost > 0 && localMargin) {
                          const marginPercent = parseFloat(localMargin.replace(",", "."));
                          if (!isNaN(marginPercent)) {
                            updates.price = parseFloat((cost * (1 + marginPercent / 100)).toFixed(2));
                          }
                        } 
                        // If we have price but no margin, update margin string
                        else if (cost > 0 && editingProduct.price) {
                          const margin = ((editingProduct.price - cost) / cost) * 100;
                          setLocalMargin(margin.toFixed(1).replace(".", ","));
                        }
                        
                        setEditingProduct({ ...editingProduct, ...updates });
                      }} 
                      className="mt-1 border-primary/50" 
                      placeholder="0.00"
                    />
                  </div>



                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Margem de Lucro (%)</Label>
                    <Input 
                      type="text" 
                      value={localMargin} 
                      onChange={(e) => {
                        const inputVal = e.target.value;
                        setLocalMargin(inputVal);
                        
                        const val = inputVal.replace(",", ".");
                        if (val === "") {
                          setEditingProduct({ ...editingProduct, price: 0 });
                          return;
                        }
                        
                        const marginPercent = parseFloat(val);
                        if (!isNaN(marginPercent)) {
                          // Logic based on what the user edited most recently:
                          // If price was the last thing touched, keep price fixed and update cost
                          if (lastChanged === "price" && editingProduct.price) {
                            const newCost = editingProduct.price / (1 + marginPercent / 100);
                            setEditingProduct({ ...editingProduct, cost: parseFloat(newCost.toFixed(2)) });
                          } 
                          // Default or if cost was last touched, keep cost fixed and update price
                          else if (editingProduct.cost) {
                            const newPrice = editingProduct.cost * (1 + marginPercent / 100);
                            setEditingProduct({ ...editingProduct, price: parseFloat(newPrice.toFixed(2)) });
                          }
                        }
                      }} 
                      placeholder="Ex: 50"
                      className="mt-1"
                    />
                  </div>





                  <div>
                    <Label className="text-sm font-medium">Preço de Venda (Final) *</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={editingProduct.price || ""} 
                      onChange={(e) => {
                        const newPrice = parseFloat(e.target.value) || 0;
                        const updates: any = { price: newPrice };
                        setLastChanged("price");
                        
                        // If we have cost already, update margin
                        if (newPrice > 0 && editingProduct.cost && editingProduct.cost > 0) {
                          const margin = ((newPrice - editingProduct.cost) / editingProduct.cost) * 100;
                          setLocalMargin(margin.toFixed(1).replace(".", ","));
                        }
                        // If we have margin but no cost, update cost
                        else if (newPrice > 0 && localMargin) {
                          const marginPercent = parseFloat(localMargin.replace(",", "."));
                          if (!isNaN(marginPercent) && marginPercent !== -100) {
                            updates.cost = parseFloat((newPrice / (1 + marginPercent / 100)).toFixed(2));
                          }
                        } else if (newPrice === 0) {
                          setLocalMargin("");
                        }
                        
                        setEditingProduct({ ...editingProduct, ...updates });
                      }} 
                      className="mt-1" 
                      placeholder="0.00"
                    />
                  </div>


                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Preço Antigo (De:)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={editingProduct.old_price || ""} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, old_price: parseFloat(e.target.value) || null })} 
                      className="mt-1" 
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Select value={editingProduct.status || "active"} onValueChange={(v) => setEditingProduct({ ...editingProduct, status: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="out">Esgotado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">URL da Imagem Principal *</Label>
                  <Input 
                    value={editingProduct.img || ""} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, img: e.target.value })} 
                    className="mt-1" 
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">URL da Imagem 2</Label>
                  <Input 
                    value={editingProduct.img2 || ""} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, img2: e.target.value || null })} 
                    className="mt-1" 
                    placeholder="https://exemplo.com/imagem2.jpg"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Categoria</Label>
                  <Input 
                    value={editingProduct.category || ""} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} 
                    className="mt-1" 
                    placeholder="Ex: Camisetas"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Checkbox 
                    id="free_shipping"
                    checked={editingProduct.free_shipping || false} 
                    onCheckedChange={(c) => setEditingProduct({ ...editingProduct, free_shipping: !!c })} 
                  />
                  <Label htmlFor="free_shipping" className="text-sm cursor-pointer">Oferecer Frete Grátis</Label>
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancelar</Button>
                <Button onClick={handleSave} disabled={upsertProduct.isPending} className="gap-1 px-8">
                  {upsertProduct.isPending && <Loader2 size={14} className="animate-spin" />}
                  <Save size={14} /> Salvar Produto
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
    if (product) setEditing((prev) => prev ? { ...prev, img: product.img } : prev);
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
        <Button onClick={openNew} className="gap-2"><Plus size={16} /> Novo Banner</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : !banners || banners.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Nenhum banner cadastrado</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((b) => (
            <Card key={b.id} className="overflow-hidden">
              <div className="aspect-[16/9] relative">
                <img src={b.img} alt="Banner" className="w-full h-full object-cover" />
                <Badge className={`absolute top-2 left-2 ${b.active ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-muted text-muted-foreground"}`} variant="secondary">
                  {b.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">CTA: <span className="text-foreground font-semibold">{b.cta || "—"}</span></p>
                  <p className="text-xs text-muted-foreground">Ordem: {b.sort_order}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing({ ...b }); setUseProduct(false); setSelectedProductId(""); }}><Edit2 size={15} /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(b.id)}><Trash2 size={15} /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Excluir banner?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir este banner?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar Banner" : "Novo Banner"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox checked={useProduct} onCheckedChange={(c) => setUseProduct(!!c)} />
                <Label>Usar imagem de um produto</Label>
              </div>

              {useProduct && products && (
                <div>
                  <Label>Selecionar Produto</Label>
                  <Select value={selectedProductId} onValueChange={handleSelectProduct}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>URL da Imagem *</Label>
                <Input value={editing.img || ""} onChange={(e) => setEditing({ ...editing, img: e.target.value })} placeholder="https://..." className="mt-1" />
              </div>

              {editing.img && (
                <div className="rounded-lg border border-border overflow-hidden aspect-[16/9]">
                  <img src={editing.img} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Texto do Botão (CTA)</Label>
                  <Input value={editing.cta || ""} onChange={(e) => setEditing({ ...editing, cta: e.target.value })} placeholder="Ver mais" className="mt-1" />
                </div>
                <div>
                  <Label>Ordem</Label>
                  <Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} className="mt-1" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox checked={editing.active ?? true} onCheckedChange={(c) => setEditing({ ...editing, active: !!c })} />
                <Label>Ativo (visível na loja)</Label>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                <Button onClick={handleSave} disabled={upsertBanner.isPending || !editing.img} className="gap-1">
                  {upsertBanner.isPending && <Loader2 size={14} className="animate-spin" />}
                  <Save size={14} /> Salvar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [discount, setDiscount] = useState(0);
  const [cartLines, setCartLines] = useState<{ productId: string; quantity: number; size: string }[]>([{ productId: "", quantity: 1, size: "" }]);

  // Filtros
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    return sales.filter(s => {
      const dateMatch = (!filterDateFrom || s.sale_date >= filterDateFrom) && 
                        (!filterDateTo || s.sale_date <= filterDateTo);
      const paymentMatch = filterPayment === "all" || s.payment_method === filterPayment;
      const amount = Number(s.total);
      const minMatch = !filterMinAmount || amount >= Number(filterMinAmount);
      const maxMatch = !filterMaxAmount || amount <= Number(filterMaxAmount);
      return dateMatch && paymentMatch && minMatch && maxMatch;
    });
  }, [sales, filterDateFrom, filterDateTo, filterPayment, filterMinAmount, filterMaxAmount]);


  const activeProducts = products?.filter((p) => p.status === "active") || [];

  const addLine = () => setCartLines([...cartLines, { productId: "", quantity: 1, size: "" }]);
  const removeLine = (i: number) => setCartLines(cartLines.filter((_, idx) => idx !== i));
  const updateLine = (i: number, data: Partial<typeof cartLines[0]>) => setCartLines(cartLines.map((l, idx) => idx === i ? { ...l, ...data } : l));

  const subtotal = cartLines.reduce((s, l) => {
    const p = products?.find((pr) => pr.id === l.productId);
    return s + (p ? Number(p.price) * l.quantity : 0);
  }, 0);
  const total = Math.max(0, subtotal - discount);

  const handleSubmit = async () => {
    const items = cartLines.filter((l) => l.productId).map((l) => {
      const p = products?.find((pr) => pr.id === l.productId)!;
      return { product_id: l.productId, product_name: p.name, unit_price: Number(p.price), unit_cost: Number(p.cost) || 0, quantity: l.quantity, size: l.size || null };
    });
    if (items.length === 0) return;
    await createSale.mutateAsync({ sale: { sale_date: saleDate, customer_name: customerName || null, payment_method: paymentMethod, discount, total, notes: null, order_number: null }, items });
    setShowForm(false);
    setCartLines([{ productId: "", quantity: 1, size: "" }]);
    setCustomerName("");
    setDiscount(0);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Vendas</h1>
        <Button onClick={() => setShowForm(true)} className="gap-2"><Plus size={16} /> Nova Venda</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 bg-card p-4 rounded-lg border border-border">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-2">
            <Calendar size={12} className="text-primary" /> De
          </Label>
          <Input 
            type="date" 
            value={filterDateFrom} 
            onChange={(e) => setFilterDateFrom(e.target.value)} 
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-2">
            <Calendar size={12} className="text-primary" /> Até
          </Label>
          <Input 
            type="date" 
            value={filterDateTo} 
            onChange={(e) => setFilterDateTo(e.target.value)} 
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-2">
            <CreditCard size={12} className="text-primary" /> Pagamento
          </Label>
          <Select value={filterPayment} onValueChange={setFilterPayment}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Métodos</SelectItem>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m}>{PAYMENT_LABELS[m] || m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-2">
            <DollarSign size={12} className="text-primary" /> Valor Mín.
          </Label>
          <Input 
            type="number" 
            placeholder="0,00"
            value={filterMinAmount} 
            onChange={(e) => setFilterMinAmount(e.target.value)} 
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5 flex flex-col justify-end">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-2 md:hidden">
                <DollarSign size={12} className="text-primary" /> Valor Máx.
              </Label>
              <Input 
                type="number" 
                placeholder="Máx"
                value={filterMaxAmount} 
                onChange={(e) => setFilterMaxAmount(e.target.value)} 
                className="h-9 text-sm"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setFilterDateFrom("");
                setFilterDateTo("");
                setFilterPayment("all");
                setFilterMinAmount("");
                setFilterMaxAmount("");
              }}
              className="h-9 text-xs"
            >
              Limpar
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : filteredSales && filteredSales.length > 0 ? (
        <Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{formatDate(s.sale_date)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{s.customer_name || "—"}</span>
                      {s.order_number && <span className="text-[10px] text-muted-foreground">Pedido #{s.order_number}</span>}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{PAYMENT_LABELS[s.payment_method] || s.payment_method}</Badge></TableCell>
                  <TableCell className="font-bold">{formatPrice(Number(s.total))}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteSale.mutate(s.id)}><Trash2 size={15} /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <ShoppingBag size={36} className="opacity-30" />
          <p className="text-sm">Nenhuma venda registrada</p>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Registrar Venda</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label>Data da Venda</Label>
                <Input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Cliente (opcional)</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nome do cliente" className="mt-1" />
              </div>
              <div>
                <Label>Forma de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{PAYMENT_LABELS[m]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="uppercase tracking-wider">Produtos</Label>
                <Button variant="link" size="sm" onClick={addLine} className="gap-1"><Plus size={12} /> Adicionar item</Button>
              </div>
              <div className="space-y-2">
                {cartLines.map((line, i) => {
                  const selectedProduct = products?.find((p) => p.id === line.productId);
                  return (
                    <div key={i} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Select value={line.productId} onValueChange={(v) => updateLine(i, { productId: v })}>
                          <SelectTrigger><SelectValue placeholder="Selecionar produto" /></SelectTrigger>
                          <SelectContent>{activeProducts.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} - {formatPrice(Number(p.price))}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="w-20">
                        <Input type="number" min={1} value={line.quantity} onChange={(e) => updateLine(i, { quantity: parseInt(e.target.value) || 1 })} placeholder="Qtd" />
                      </div>
                      <div className="w-24">
                        <Select value={line.size} onValueChange={(v) => updateLine(i, { size: v })}>
                          <SelectTrigger><SelectValue placeholder="Tam." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Nenhum</SelectItem>
                            {(selectedProduct?.sizes || []).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeLine(i)}><Trash2 size={14} /></Button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Desconto (R$)</Label>
                <Input type="number" step="0.01" value={discount || ""} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="mt-1" />
              </div>
              <div className="flex flex-col justify-end">
                <div className="bg-muted rounded-lg px-3 py-2 text-right">
                  <p className="text-xs text-muted-foreground">Subtotal: {formatPrice(subtotal)}</p>
                  {discount > 0 && <p className="text-xs text-destructive">Desconto: -{formatPrice(discount)}</p>}
                  <p className="text-lg font-bold text-foreground">{formatPrice(total)}</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createSale.isPending || cartLines.some((l) => !l.productId)} className="gap-1">
                {createSale.isPending && <Loader2 size={14} className="animate-spin" />}
                <Save size={14} /> Registrar Venda
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
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
  const [tab, setTab] = useState("overview");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expName, setExpName] = useState("");
  const [expAmount, setExpAmount] = useState(0);
  const [expCategory, setExpCategory] = useState("Outros");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterPayment, setFilterPayment] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const totalRevenue = sales?.reduce((s, sale) => s + Number(sale.total), 0) || 0;
  const supplierExpenses = expenses?.filter(e => e.category === "Fornecedores").reduce((s, e) => s + Number(e.amount), 0) || 0;
  const totalCost = (saleItems?.reduce((s, item) => s + Number(item.unit_cost) * item.quantity, 0) || 0) + supplierExpenses;
  const totalExp = (expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0) - supplierExpenses;
  const netProfit = totalRevenue - totalCost - totalExp;

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    let result = [...sales];
    if (filterPayment) result = result.filter((s) => s.payment_method === filterPayment);
    if (filterDateFrom) result = result.filter((s) => s.sale_date >= filterDateFrom);
    if (filterDateTo) result = result.filter((s) => s.sale_date <= filterDateTo);
    return result;
  }, [sales, filterPayment, filterDateFrom, filterDateTo]);

  const monthlyChart = useMemo(() => {
    if (!sales || !expenses) return [];
    const months: Record<string, { receita: number; despesa: number }> = {};
    sales.forEach((s) => { const key = s.sale_date.substring(0, 7); if (!months[key]) months[key] = { receita: 0, despesa: 0 }; months[key].receita += Number(s.total); });
    expenses.forEach((e) => { 
      const key = e.expense_date.substring(0, 7); 
      if (!months[key]) months[key] = { receita: 0, despesa: 0 }; 
      if (e.category !== "Fornecedores") {
        months[key].despesa += Number(e.amount); 
      }
    });
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
      .map(([month, data]) => ({ month: new Date(month + "-15").toLocaleDateString("pt-BR", { month: "short" }), ...data }));
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
    const a = document.createElement("a"); a.href = url; a.download = `relatorio-vendas-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Finanças</h1>
        <Button variant="outline" onClick={exportCSV} className="gap-2"><Download size={14} /> Exportar CSV</Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Resumo</TabsTrigger>
          <TabsTrigger value="revenue">Receitas</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-5">
                <ArrowUpRight size={20} className="text-green-500 mb-2" />
                <p className="text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Receitas (Vendas)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <ArrowDownRight size={20} className="text-destructive mb-2" />
                <p className="text-2xl font-bold text-foreground">{formatPrice(totalExp)}</p>
                <p className="text-xs text-muted-foreground">Despesas (Custos Fixos)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <Box size={20} className="text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-foreground">{formatPrice(totalCost)}</p>
                <p className="text-xs text-muted-foreground">Custo dos Produtos (CPV)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <TrendingUp size={20} className={netProfit >= 0 ? "text-green-500" : "text-destructive"} />
                <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>{formatPrice(netProfit)}</p>
                <p className="text-xs text-muted-foreground">Lucro Líquido Real</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-5">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <div className="flex flex-wrap gap-3 mb-4">
            <div>
              <Label>De</Label>
              <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Até</Label>
              <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Pagamento</Label>
              <Select value={filterPayment || "all"} onValueChange={(v) => setFilterPayment(v === "all" ? "" : v)}>
                <SelectTrigger className="mt-1 w-[160px]"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{PAYMENT_LABELS[m]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{formatDate(s.sale_date)}</TableCell>
                    <TableCell>{s.customer_name || "—"}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{PAYMENT_LABELS[s.payment_method] || s.payment_method}</Badge></TableCell>
                    <TableCell className="font-bold">{formatPrice(Number(s.total))}</TableCell>
                  </TableRow>
                ))}
                {filteredSales.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhuma venda encontrada</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
          <div className="mt-3 text-right text-sm text-muted-foreground">
            Total filtrado: <span className="font-bold text-foreground">{formatPrice(filteredSales.reduce((s, sale) => s + Number(sale.total), 0))}</span> ({filteredSales.length} vendas)
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowExpenseForm(true)} className="gap-2"><Plus size={16} /> Nova Despesa</Button>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses?.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{formatDate(e.expense_date)}</TableCell>
                    <TableCell>{e.name}</TableCell>
                    <TableCell><Badge variant="outline">{e.category}</Badge></TableCell>
                    <TableCell className="font-bold text-destructive">{formatPrice(Number(e.amount))}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteExpense.mutate(e.id)}><Trash2 size={15} /></Button>
                    </TableCell>
                  </TableRow>
                )) || null}
                {(!expenses || expenses.length === 0) && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhuma despesa registrada</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Nova Despesa</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Nome *</Label>
                  <Input value={expName} onChange={(e) => setExpName(e.target.value)} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Valor *</Label>
                    <Input type="number" step="0.01" value={expAmount || ""} onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Data</Label>
                    <Input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className="mt-1" />
                  </div>
                </div>


                <div>
                  <Label>Categoria</Label>
                  <Select value={expCategory} onValueChange={setExpCategory}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowExpenseForm(false)}>Cancelar</Button>
                  <Button onClick={handleAddExpense} disabled={createExpense.isPending} className="gap-1">
                    {createExpense.isPending && <Loader2 size={14} className="animate-spin" />}
                    <Save size={14} /> Salvar
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ─── SETTINGS ───
const SettingsView = () => {
  const { data: settings, isLoading } = useStoreSettings();
  const updateSetting = useUpdateSetting();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  const getValue = (key: string) => localSettings[key] ?? settings?.[key] ?? "";

  const handleSave = async () => {
    for (const [key, value] of Object.entries(localSettings)) {
      await updateSetting.mutateAsync({ key, value });
    }
    setLocalSettings({});
    toast({ title: "Sucesso", description: "Configurações salvas!" });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(key);
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
        .getPublicUrl(filePath);

      await updateSetting.mutateAsync({ key, value: publicUrl });
      toast({ title: "Sucesso", description: "Logo atualizada em todo o site!" });
    } catch (error: any) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Configurações</h1>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Configurações da Loja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seção de Upload de Logo Simplificada */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">Logo da Loja</Label>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <div className="aspect-video w-full rounded-lg border border-dashed border-border bg-muted flex items-center justify-center overflow-hidden group relative">
                    {getValue("logo_url") && getValue("logo_url") !== '/streetdex-logo.png' ? (
                      <div className="flex w-full h-full">
                        <div className="flex-1 bg-white flex items-center justify-center p-4 border-r border-border">
                          <img src={getValue("logo_url")} alt="Preview Claro" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="flex-1 bg-zinc-900 flex items-center justify-center p-4">
                          <img src={getValue("logo_url")} alt="Preview Escuro" className="max-w-full max-h-full object-contain brightness-0 invert" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-zinc-400 text-xs flex flex-col items-center gap-1">
                        <Upload size={20} />
                        Sem logo
                      </div>
                    )}
                    {uploading === "logo_url" && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="relative cursor-pointer flex-1" disabled={uploading === "logo_url"}>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleUpload(e, "logo_url")} />
                  {uploading === "logo_url" ? "Enviando..." : "Subir Logo da Loja"}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                A logo será adaptada automaticamente para os modos claro e escuro.
              </p>
            </div>
          </div>

          {/* Dados da Loja */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <Label>Nome da Loja</Label>
              <Input value={getValue("store_name")} onChange={(e) => setLocalSettings({ ...localSettings, store_name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>WhatsApp Principal</Label>
              <Input value={getValue("whatsapp_store")} onChange={(e) => setLocalSettings({ ...localSettings, whatsapp_store: e.target.value })} placeholder="Ex: 5585999999999" className="mt-1" />
            </div>
          </div>

          {/* Configurações de Desconto e Pagamento */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider">Pagamentos e Descontos</h3>
            <div>
              <Label>Desconto para PIX e Dinheiro (%)</Label>
              <Input 
                type="number" 
                value={getValue("pix_discount")} 
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalSettings({ 
                    ...localSettings, 
                    pix_discount: val,
                    cash_discount: val 
                  });
                }} 
                className="mt-1" 
              />
            </div>
          </div>

          {/* Configurações de Notificação */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider">Notificações</h3>
            <div>
              <Label>Som de Novo Pedido</Label>
              <Select 
                value={getValue("notification_sound")} 
                onValueChange={(v) => {
                  setLocalSettings({ ...localSettings, notification_sound: v });
                  try {
                    const audio = new Audio(v);
                    audio.play().catch(err => console.warn("Could not play sound preview:", err));
                  } catch (e) {
                    console.error("Error playing sound preview:", e);
                  }
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione um som" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const defaultSounds = [
                      { name: "Clássico", url: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3" },
                      { name: "Sino Digital", url: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" },
                      { name: "Alerta Suave", url: "https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3" },
                      { name: "Notificação Elegante", url: "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3" },
                      { name: "Dinheiro", url: "https://assets.mixkit.co/active_storage/sfx/1070/1070-preview.mp3" },
                    ];
                    
                    try {
                      const savedSounds = JSON.parse(getValue("notification_sounds") || "[]");
                      const allSounds = savedSounds.length > 0 ? savedSounds : defaultSounds;
                      return allSounds.map((s: any) => (
                        <SelectItem key={s.url} value={s.url}>{s.name}</SelectItem>
                      ));
                    } catch (e) {
                      return defaultSounds.map((s: any) => (
                        <SelectItem key={s.url} value={s.url}>{s.name}</SelectItem>
                      ));
                    }
                  })()}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSave} disabled={updateSetting.isPending || Object.keys(localSettings).length === 0} className="w-full gap-2 mt-4" size="lg">
            {updateSetting.isPending && <Loader2 size={16} className="animate-spin" />}
            <Save size={16} /> Salvar Tudo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── ORDERS ADMIN ───
const OrdersAdminView = () => {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const createSale = useCreateSale();
  const { toast } = useToast();
  
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<DBOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  
  // Filtros
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");
  
  const { data: orderItems } = useOrderItems(selectedOrderId || undefined);

  const selectedOrder = orders?.find((o) => o.id === selectedOrderId);

  const handleStatusChange = async (orderId: string, status: string) => {
    const order = orders?.find(o => o.id === orderId);
    if (!order) return;

    // Se o status for alterado para 'entregue', move para vendas
    if (status === "entregue") {
      try {
        const items = await supabase.from("order_items").select("*").eq("order_id", orderId);
        
        if (items.error) throw items.error;

        // Registrar na tabela de vendas
        const saleData = {
          sale_date: new Date().toISOString().split("T")[0],
          customer_name: order.customers?.name || null,
          payment_method: order.payment_method,
          discount: 0,
          total: Number(order.total),
          notes: order.notes,
          order_number: order.order_number // Manter o número do pedido na venda
        };

        const saleItems = items.data.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: Number(item.price),
          unit_cost: 0, 
          size: item.size
        }));

        await createSale.mutateAsync({ sale: saleData as any, items: saleItems as any });
        
        // Atualizar o status para entregue mas NÃO excluir imediatamente
        // (O filtro na visualização cuidará de remover pedidos entregues há mais de 2 dias)
        await updateStatus.mutateAsync({ id: orderId, status });
        
        toast({ title: "Sucesso", description: "Pedido marcado como entregue e registrado em Vendas!" });
        return;
      } catch (error: any) {
        toast({ title: "Erro ao concluir", description: error.message, variant: "destructive" });
        return;
      }
    }

    await updateStatus.mutateAsync({ id: orderId, status });
  };

  const handleEditSave = async () => {
    if (!editingOrder) return;
    await updateOrder.mutateAsync(editingOrder);
    setEditingOrder(null);
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;
    await deleteOrder.mutateAsync(orderToDelete);
    setOrderToDelete(null);
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(order => {
      // Ocultar entregues por padrão (comportamento original mantido ou ajustado se necessário)
      if (order.status === "entregue") return false;

      // Filtro de Datas
      if (filterDateFrom && new Date(order.created_at).toISOString().split("T")[0] < filterDateFrom) return false;
      if (filterDateTo && new Date(order.created_at).toISOString().split("T")[0] > filterDateTo) return false;

      // Filtro de Forma de Pagamento
      if (filterPayment && order.payment_method !== filterPayment) return false;

      // Filtro de Valores
      const total = Number(order.total);
      if (filterMinAmount && total < Number(filterMinAmount)) return false;
      if (filterMaxAmount && total > Number(filterMaxAmount)) return false;

      return true;
    });
  }, [orders, filterDateFrom, filterDateTo, filterPayment, filterMinAmount, filterMaxAmount]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <Label className="text-xs uppercase text-muted-foreground font-bold">Data (De / Até)</Label>
          <div className="flex gap-2">
            <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="h-9" />
            <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="h-9" />
          </div>
        </div>

        <div className="space-y-1.5 w-full md:w-[180px]">
          <Label className="text-xs uppercase text-muted-foreground font-bold">Pagamento</Label>
          <Select value={filterPayment || "all"} onValueChange={(v) => setFilterPayment(v === "all" ? "" : v)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m}>{PAYMENT_LABELS[m] || m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <Label className="text-xs uppercase text-muted-foreground font-bold">Valor (Min / Max)</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-semibold">R$</span>
              <Input 
                type="number" 
                placeholder="0,00" 
                value={filterMinAmount} 
                onChange={(e) => setFilterMinAmount(e.target.value)} 
                className="h-9 pl-7" 
              />
            </div>
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-semibold">R$</span>
              <Input 
                type="number" 
                placeholder="Max" 
                value={filterMaxAmount} 
                onChange={(e) => setFilterMaxAmount(e.target.value)} 
                className="h-9 pl-7" 
              />
            </div>
          </div>
        </div>

        <div className="flex items-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setFilterDateFrom("");
              setFilterDateTo("");
              setFilterPayment("");
              setFilterMinAmount("");
              setFilterMaxAmount("");
            }}
            className="h-9 text-xs text-muted-foreground hover:text-foreground"
          >
            Limpar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : !filteredOrders || filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Nenhum pedido registrado</div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-semibold">#{order.order_number}</TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground">{order.customers?.name}</p>
                      <p className="text-xs text-muted-foreground">{order.customers?.phone}</p>
                    </TableCell>
                    <TableCell className="font-semibold">{formatPrice(Number(order.total))}</TableCell>
                    <TableCell className="capitalize">{order.payment_method}</TableCell>
                    <TableCell>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-semibold border-0 outline-none cursor-pointer ${statusInfo.color}`}
                      >
                        {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrderId(order.id)} title="Ver detalhes">
                          <Eye size={15} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingOrder({ ...order })} title="Editar">
                          <Edit2 size={15} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setOrderToDelete(order.id)} title="Excluir">
                          <Trash2 size={15} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={`/pedido/${order.id}`} target="_blank" rel="noopener noreferrer" title="Abrir página do pedido">
                            <ChevronRight size={15} />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* View Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrderId(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader><DialogTitle>Pedido #{selectedOrder.order_number}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Cliente</p>
                  <p className="text-sm font-semibold text-foreground">{selectedOrder.customers?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customers?.phone}</p>
                  {selectedOrder.customers?.email && <p className="text-sm text-muted-foreground">{selectedOrder.customers?.email}</p>}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Endereço</p>
                  <p className="text-sm text-foreground">{selectedOrder.address_street}, {selectedOrder.address_number}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.address_neighborhood} - {selectedOrder.address_city}</p>
                  <p className="text-sm text-muted-foreground">CEP: {selectedOrder.address_cep}</p>
                  {selectedOrder.address_complement && <p className="text-sm text-muted-foreground">{selectedOrder.address_complement}</p>}
                </div>

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

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Alterar Status</p>
                  <div className="flex flex-wrap gap-2">
                    {ORDER_STATUSES.map((s) => (
                      <Button key={s.value} onClick={() => handleStatusChange(selectedOrder.id, s.value)}
                        variant={selectedOrder.status === s.value ? "default" : "outline"}
                        size="sm" className="text-xs">
                        {s.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Pedido #{editingOrder?.order_number}</DialogTitle></DialogHeader>
          {editingOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={editingOrder.status || ORDER_STATUSES[0].value} 
                    onValueChange={(v) => setEditingOrder({ ...editingOrder, status: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Método de Pagamento</Label>
                  <Select 
                    value={editingOrder.payment_method || PAYMENT_METHODS[0]} 
                    onValueChange={(v) => setEditingOrder({ ...editingOrder, payment_method: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione o pagamento" /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {PAYMENT_LABELS[m]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Total (R$)</Label>
                <Input type="number" step="0.01" value={editingOrder.total} onChange={(e) => setEditingOrder({ ...editingOrder, total: Number(e.target.value) })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rua</Label>
                  <Input value={editingOrder.address_street || ""} onChange={(e) => setEditingOrder({ ...editingOrder, address_street: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input value={editingOrder.address_number || ""} onChange={(e) => setEditingOrder({ ...editingOrder, address_number: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input value={editingOrder.address_neighborhood || ""} onChange={(e) => setEditingOrder({ ...editingOrder, address_neighborhood: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input value={editingOrder.address_city || ""} onChange={(e) => setEditingOrder({ ...editingOrder, address_city: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input value={editingOrder.address_cep || ""} onChange={(e) => setEditingOrder({ ...editingOrder, address_cep: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input value={editingOrder.address_complement || ""} onChange={(e) => setEditingOrder({ ...editingOrder, address_complement: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Input value={editingOrder.notes || ""} onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })} />
              </div>

              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setEditingOrder(null)}>Cancelar</Button>
                <Button onClick={handleEditSave} disabled={updateOrder.isPending}>
                  {updateOrder.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Pedido</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderToDelete(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteOrder.isPending}>
              {deleteOrder.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Trash2 className="mr-2" size={16} />}
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── COUPONS ───
const CouponsView = () => {
  const { data: coupons, isLoading } = useCoupons();
  const upsertCoupon = useUpsertCoupon();
  const deleteCoupon = useDeleteCoupon();
  const [editingCoupon, setEditingCoupon] = useState<Partial<DBCoupon> | null>(null);
  const { toast } = useToast();

  const openNew = () => {
    setEditingCoupon({
      code: "",
      discount_value: undefined,
      discount_type: "percentage",
      min_purchase_amount: undefined,
      status: "active",
      expires_at: null,
      max_uses: null
    });
  };

  const handleSave = async () => {
    if (!editingCoupon?.code) {
      toast({ title: "Erro", description: "O código do cupom é obrigatório.", variant: "destructive" });
      return;
    }
    await upsertCoupon.mutateAsync(editingCoupon);
    setEditingCoupon(null);
    toast({ title: "Sucesso", description: "Cupom salvo com sucesso!" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Cupons de Desconto</h1>
        <Button onClick={openNew} className="gap-2"><Plus size={16} /> Novo Cupom</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Expiração</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons?.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-bold">{c.code}</TableCell>
                  <TableCell>
                    {c.discount_type === "percentage" ? `${c.discount_value}%` : formatPrice(c.discount_value)}
                  </TableCell>
                  <TableCell>
                    {c.min_purchase_amount ? formatPrice(c.min_purchase_amount) : "—"}
                  </TableCell>
                  <TableCell>
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString("pt-BR") : "Nunca"}
                  </TableCell>
                  <TableCell>{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""}</TableCell>
                  <TableCell>
                    <Badge className={c.status === "active" ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}>
                      {c.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingCoupon(c)}><Edit2 size={16} /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCoupon.mutate(c.id)}><Trash2 size={16} /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!editingCoupon} onOpenChange={() => setEditingCoupon(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCoupon?.id ? "Editar Cupom" : "Novo Cupom"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código</Label>
                <Input value={editingCoupon?.code} onChange={(e) => setEditingCoupon({ ...editingCoupon!, code: e.target.value.toUpperCase() })} placeholder="EX: TRINTAOFF" />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={editingCoupon?.discount_type} onValueChange={(v: any) => setEditingCoupon({ ...editingCoupon!, discount_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor do Desconto</Label>
                <Input type="number" value={editingCoupon?.discount_value ?? ""} onChange={(e) => setEditingCoupon({ ...editingCoupon!, discount_value: e.target.value ? Number(e.target.value) : 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Compra Mínima (R$)</Label>
                <Input type="number" value={editingCoupon?.min_purchase_amount ?? ""} onChange={(e) => setEditingCoupon({ ...editingCoupon!, min_purchase_amount: e.target.value ? Number(e.target.value) : 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Expiração</Label>
                <Input type="date" value={editingCoupon?.expires_at ? editingCoupon.expires_at.split("T")[0] : ""} onChange={(e) => setEditingCoupon({ ...editingCoupon!, expires_at: e.target.value ? e.target.value + "T23:59:59Z" : null })} />
              </div>
              <div className="space-y-2">
                <Label>Limite de Usos (Opcional)</Label>
                <Input type="number" value={editingCoupon?.max_uses || ""} onChange={(e) => setEditingCoupon({ ...editingCoupon!, max_uses: e.target.value ? Number(e.target.value) : null })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCoupon(null)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar Cupom</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
