import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, Package, ShoppingBag, Settings, LogOut,
  Plus, Edit2, Trash2, TrendingUp, DollarSign, Box, ChevronDown,
  Crown, Search, Bell, BarChart3, Save, X, Loader2,
  Receipt, Wallet, Calendar, Download, ArrowUpRight, ArrowDownRight,
  ShoppingCart, CreditCard, Users, Tag, FileText, AlertTriangle,
  Image, ClipboardList, Eye, ChevronRight, Upload, Volume2, Truck, Printer,
  ShieldCheck, ExternalLink
} from "lucide-react";
import ThemeToggle from "@/components/store/ThemeToggle";
import StreetDexLogo from "@/components/store/StreetDexLogo";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useStoreSettings } from "@/hooks/useStoreData";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { 
  unlockAudioContext, 
  playNotificationSound, 
  type SoundPresetId 
} from "@/lib/notification-sounds";

import { useAdminNotifications } from "@/hooks/common/useAdminNotifications";

// Vistas Refatoradas
import DashboardView from "@/components/admin/dashboard/DashboardView";
import ProductsView from "@/components/admin/products/ProductsView";
import BannersView from "@/components/admin/banners/BannersView";
import SalesView from "@/components/admin/sales/SalesView";
import OrdersAdminView from "@/components/admin/orders/OrdersAdminView";
import CouponsView from "@/components/admin/coupons/CouponsView";
import FinancesView from "@/components/admin/finances/FinancesView";
import SettingsView from "@/components/admin/settings/SettingsView";

type AdminView = "dashboard" | "products" | "banners" | "sales" | "orders" | "coupons" | "finances" | "settings";

const Admin = () => {
  const [view, setView] = useState<AdminView>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const lastOrderRef = useRef<string | null>(null);

  const { data: settings } = useStoreSettings();
  
  const {
    somLiberado,
    presetSelecionado,
    volumeNotificacao,
    desbloquearAudioComGesto,
    tocarSomPedido,
    testarNotificacao
  } = useAdminNotifications(settings);

  useEffect(() => {
    console.log("Configurando canal de notificações de pedidos...");
    
    const channel = supabase
      .channel('admin-order-notifications-v3')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          console.log('RECEBIDO: Novo pedido no banco de dados:', payload);
          
          if (lastOrderRef.current === payload.new.id) return;
          lastOrderRef.current = payload.new.id;

          toast({
            title: "🔔 NOVO PEDIDO RECEBIDO!",
            description: `Pedido #${payload.new.order_number} - ${formatPrice(payload.new.total)}`,
            duration: 10000,
          });

          // Notificação Desktop (Browser)
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("🔔 Novo Pedido Street Dex!", {
              body: `Pedido #${payload.new.order_number} - ${formatPrice(payload.new.total)}`,
              tag: 'new-order',
              requireInteraction: true
            });
          }

          void tocarSomPedido();

          queryClient.invalidateQueries({ queryKey: ["orders"] });
          queryClient.invalidateQueries({ queryKey: ["order-items"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, queryClient, tocarSomPedido]);

  const navItems: { icon: any; label: string; key: AdminView }[] = [
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

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] border-t border-border bg-card/95 backdrop-blur-md shadow-lg">
        <nav className="flex w-full justify-between items-center gap-1 overflow-x-auto scrollbar-none px-2 py-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setView(item.key)}
              className={`min-h-[3.75rem] min-w-[4.2rem] flex-1 flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-1 text-[0.62rem] font-medium transition-all ${view === item.key ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
            >
              <item.icon size={18} className="shrink-0" />
              <span className="max-w-full truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-3 px-3 py-3 md:px-6 border-b border-border bg-card">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg bg-muted px-3 py-2 md:max-w-xs">
            <Search size={16} className="text-muted-foreground" />
            <input type="text" placeholder="Buscar..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            {!somLiberado && (
              <Badge variant="outline" className="hidden sm:flex text-[10px] py-0 px-1.5 h-6 border-yellow-500/50 text-yellow-500/80 animate-pulse bg-yellow-500/5">
                Áudio aguardando clique
              </Badge>
            )}
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold uppercase">
              {settings?.store_name?.substring(0, 2) || "AD"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 pb-24 md:p-6 md:pb-6">
          {view === "dashboard" && <DashboardView />}
          {view === "products" && <ProductsView />}
          {view === "banners" && <BannersView />}
          {view === "orders" && <OrdersAdminView somLiberado={somLiberado} testarNotificacao={testarNotificacao} />}
          {view === "sales" && <SalesView />}
          {view === "coupons" && <CouponsView />}
          {view === "finances" && <FinancesView />}
          {view === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default Admin;
