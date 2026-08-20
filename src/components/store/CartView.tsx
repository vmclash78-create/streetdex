import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingCart, X, Trash2, Minus, Plus, Truck, MessageCircle, Sparkles } from "lucide-react";
import StreetDexLogo from "./StreetDexLogo";
import { type CartItem, formatPrice, pixPrice, fallbackImg, WHATSAPP } from "./storeData";
import { useStoreSettings, useProducts } from "@/hooks/useStoreData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface CartViewProps {
  cartItems: CartItem[];
  onBack: () => void;
  onUpdateQty: (id: string, q: number) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onCheckout: () => void;
}

const CartView = ({ cartItems, onBack, onUpdateQty, onRemove, onClearAll, onCheckout }: CartViewProps) => {
  const [note, setNote] = useState("");
  const { data: settings } = useStoreSettings();
  const { data: allProducts } = useProducts();
  const total = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  
  const pixDiscount = Number(settings?.pix_discount || "0");
  const cashDiscount = Number(settings?.cash_discount || "0");
  
  const pixTotal = total * (1 - pixDiscount / 100);
  const cashTotal = total * (1 - cashDiscount / 100);

  const upsellProducts = allProducts 
    ? allProducts
        .filter(p => p.status === "active" && !cartItems.some(item => item.product.id.toString() === parseInt(p.id.slice(0, 8), 16).toString()))
        .slice(0, 4)
    : [];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col max-w-5xl mx-auto">
        <header className="bg-card border-b border-border sticky top-0 z-50 flex items-center px-4 h-14">
          <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft size={20} /></Button>
          <div className="flex-1 flex justify-center"><StreetDexLogo size="sm" /></div>
          <div className="w-8" />
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
          <ShoppingCart size={56} className="text-muted-foreground/30" />
          <h2 className="text-xl font-semibold text-foreground">Carrinho vazio</h2>
          <p className="text-muted-foreground text-sm">Navegue pelo catálogo e adicione itens!</p>
          <Button onClick={onBack} size="lg">Continuar navegando</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-5xl mx-auto">
      <header className="bg-card border-b border-border sticky top-0 z-50 flex items-center px-4 h-14">
        <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft size={20} /></Button>
        <div className="flex-1 flex justify-center"><StreetDexLogo size="sm" /></div>
        <div className="w-8" />
      </header>
      <div className="flex-1 px-4 pt-3 pb-36">
        <h1 className="font-bold text-lg text-foreground mb-3">Carrinho ({cartItems.length})</h1>
        <div className="flex flex-col gap-2.5 mb-3">
          <AnimatePresence initial={false}>
            {cartItems.map((item) => (
              <motion.div
                key={item.cartId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="relative shadow-sm hover:border-primary/30 transition-colors">
                  <CardContent className="p-2.5">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 rounded-full" onClick={() => onRemove(item.cartId)}>
                      <X size={12} />
                    </Button>
                    <div className="flex gap-2.5 items-start">
                      <img src={item.product.img} alt="" className="rounded-lg object-cover flex-shrink-0 w-16 h-16" onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }} />
                      <div className="flex-1 min-w-0 pr-5">
                        <p className="text-sm text-foreground font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.size}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-sm font-bold text-foreground">{formatPrice(item.product.price)}</p>
                          <div className="flex items-center gap-1.5">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemove(item.cartId)}><Trash2 size={14} /></Button>
                            <div className="flex items-center border border-border rounded-lg overflow-hidden bg-muted/30">
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none" onClick={() => onUpdateQty(item.cartId, item.qty - 1)}><Minus size={12} /></Button>
                              <span className="text-xs font-bold px-1.5">{item.qty}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none" onClick={() => onUpdateQty(item.cartId, item.qty + 1)}><Plus size={12} /></Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex justify-end mb-3">
          <Button variant="link" onClick={onClearAll} className="text-foreground">Limpar carrinho</Button>
        </div>
        <Button variant="ghost" onClick={onBack} className="flex items-center justify-center gap-1 w-full mb-4">
          Ver mais produtos <ChevronRight size={16} />
        </Button>
        <div className="mb-3">
          <h2 className="text-sm font-bold text-foreground mb-1.5">Observação</h2>
          <Textarea className="resize-none" rows={2} maxLength={200} placeholder="Observação do pedido..." value={note} onChange={(e) => setNote(e.target.value)} />
          <p className="text-[0.65rem] text-muted-foreground text-right mt-0.5">{note.length}/200</p>
        </div>
        <Card>
          <CardContent className="p-2.5 flex items-center gap-2.5">
            <Truck size={18} className="text-foreground flex-shrink-0" />
            <p className="text-sm text-foreground">Entregamos em Hidrolândia e região</p>
          </CardContent>
        </Card>

        {upsellProducts.length > 0 && (
          <div className="mt-8 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Complete seu Drop</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {upsellProducts.map((p) => (
                <div 
                  key={p.id} 
                  className="bg-card border border-border/50 rounded-lg p-2 flex gap-2 cursor-pointer hover:border-primary/30 transition-all group"
                  onClick={onBack}
                >
                  <img src={p.img} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0 group-hover:scale-105 transition-transform" />
                  <div className="min-w-0">
                    <p className="text-[0.7rem] font-bold line-clamp-1 uppercase">{p.name}</p>
                    <p className="text-[0.65rem] text-primary font-black mt-0.5">{formatPrice(Number(p.price))}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl bg-card border-t border-border px-4 pt-2.5 pb-3 shadow-2xl">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-sm text-foreground">Total:</span>
          <span className="text-lg font-bold text-foreground">{formatPrice(total)}</span>
        </div>
        <div className="flex flex-col text-right mb-1.5">
          {(pixDiscount > 0 || cashDiscount > 0) && (
            <p className="text-xs text-green-600 font-semibold">
              {formatPrice(Math.min(pixTotal, cashTotal))} no PIX ou Dinheiro
            </p>
          )}
        </div>
        <Button onClick={onCheckout} className="w-full" size="lg">Finalizar Pedido</Button>
      </div>
    </div>
  );
};

export default CartView;
