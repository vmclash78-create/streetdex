import { useParams, Link } from "react-router-dom";
import { useOrderById, getStatusInfo, ORDER_STATUSES } from "@/hooks/useOrders";
import { ShoppingBag, Check, Loader2, ArrowLeft, MessageCircle } from "lucide-react";
import DuarttLogo from "@/components/store/DuarttLogo";
import { formatPrice, fallbackImg } from "@/components/store/storeData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStoreSettings } from "@/hooks/useStoreData";
import { getWhatsAppLink } from "@/utils/whatsapp";

const OrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useOrderById(id);
  const { data: settings } = useStoreSettings();
  const whatsapp = settings?.whatsapp_store || settings?.whatsapp || "8899999999999";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag size={48} className="text-muted-foreground/30" />
        <h1 className="text-xl font-bold text-foreground">Pedido não encontrado</h1>
        <p className="text-sm text-muted-foreground text-center">O pedido que você está procurando não existe ou foi removido.</p>
        <Button asChild>
          <Link to="/">Ir para a loja</Link>
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const currentIdx = ORDER_STATUSES.findIndex((s) => s.value === order.status);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50 flex items-center px-4 h-14 max-w-2xl mx-auto">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/"><ArrowLeft size={20} /></Link>
        </Button>
        <div className="flex-1 flex justify-center"><DuarttLogo size="sm" /></div>
        <div className="w-8" />
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground">Pedido #{order.order_number}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(order.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Status tracker */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-foreground">Status do pedido</p>
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            </div>
            <div className="flex items-center justify-between">
              {ORDER_STATUSES.map((s, i) => (
                <div key={s.value} className="flex items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    i <= currentIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {i < currentIdx ? <Check size={12} /> : i + 1}
                  </div>
                  {i < ORDER_STATUSES.length - 1 && <div className={`w-6 sm:w-10 h-0.5 mx-0.5 ${i < currentIdx ? "bg-primary" : "bg-border"}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {ORDER_STATUSES.map((s) => (
                <span key={s.value} className="text-[0.5rem] sm:text-[0.6rem] text-muted-foreground text-center w-12 sm:w-16">{s.label}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-bold text-foreground mb-3">Produtos</p>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.product_img || fallbackImg} alt="" className="w-12 h-12 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">{item.size && `${item.size} • `}{item.quantity}x</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{formatPrice(Number(item.price) * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-3 pt-3 flex justify-between">
              <span className="text-sm font-bold text-foreground">Total</span>
              <span className="text-lg font-bold text-foreground">{formatPrice(Number(order.total))}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Forma de pagamento</p>
            <p className="text-sm font-semibold text-foreground capitalize">{order.payment_method}</p>
          </CardContent>
        </Card>

        <Button asChild className="w-full gap-2 bg-green-600 hover:bg-green-500 h-12 text-white">
          <a href={getWhatsAppLink(whatsapp, `Olá! Gostaria de informações sobre meu pedido #${order.order_number}`)} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={20} /> Suporte via WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
};

export default OrderTracking;