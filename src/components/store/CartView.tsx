import { useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart, X, Trash2, Minus, Plus, Truck, MessageCircle } from "lucide-react";
import DuarttLogo from "./DuarttLogo";
import { type CartItem, formatPrice, pixPrice, fallbackImg, WHATSAPP } from "./storeData";

interface CartViewProps {
  cartItems: CartItem[];
  onBack: () => void;
  onUpdateQty: (id: string, q: number) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const CartView = ({ cartItems, onBack, onUpdateQty, onRemove, onClearAll }: CartViewProps) => {
  const [note, setNote] = useState("");
  const total = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col max-w-5xl mx-auto">
        <header className="bg-card border-b border-border sticky top-0 z-50 flex items-center px-4 h-14">
          <button onClick={onBack}><ChevronLeft size={20} className="text-foreground" /></button>
          <div className="flex-1 flex justify-center"><DuarttLogo size="sm" /></div>
          <div className="w-8" />
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
          <ShoppingCart size={56} className="text-muted-foreground/30" />
          <h2 className="text-xl font-semibold text-foreground">Carrinho vazio</h2>
          <p className="text-muted-foreground text-sm">Navegue pelo catálogo e adicione itens!</p>
          <button onClick={onBack} className="bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-xl">Continuar navegando</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-5xl mx-auto">
      <header className="bg-card border-b border-border sticky top-0 z-50 flex items-center px-4 h-14">
        <button onClick={onBack}><ChevronLeft size={20} className="text-foreground" /></button>
        <div className="flex-1 flex justify-center"><DuarttLogo size="sm" /></div>
        <div className="w-8" />
      </header>
      <div className="flex-1 px-4 pt-3 pb-36">
        <h1 className="font-bold text-lg text-foreground mb-3">Carrinho ({cartItems.length})</h1>
        <div className="flex flex-col gap-2.5 mb-3">
          {cartItems.map((item) => (
            <div key={item.cartId} className="bg-card rounded-xl border border-border p-2.5 relative shadow-sm">
              <button onClick={() => onRemove(item.cartId)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <X size={12} className="text-muted-foreground" />
              </button>
              <div className="flex gap-2.5 items-start">
                <img src={item.product.img} alt="" className="rounded-lg object-cover flex-shrink-0 w-16 h-16" onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }} />
                <div className="flex-1 min-w-0 pr-5">
                  <p className="text-sm text-foreground">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.size}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-sm font-bold text-foreground">{formatPrice(item.product.price)}</p>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => onRemove(item.cartId)}><Trash2 size={14} className="text-muted-foreground" /></button>
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button onClick={() => onUpdateQty(item.cartId, item.qty - 1)} className="px-1.5 py-0.5 hover:bg-muted"><Minus size={12} /></button>
                        <span className="text-xs font-bold px-1.5">{item.qty}</span>
                        <button onClick={() => onUpdateQty(item.cartId, item.qty + 1)} className="px-1.5 py-0.5 hover:bg-muted"><Plus size={12} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mb-3"><button onClick={onClearAll} className="text-foreground text-sm underline">Limpar carrinho</button></div>
        <button onClick={onBack} className="flex items-center justify-center gap-1 text-foreground text-sm font-semibold w-full mb-4">Ver mais produtos <ChevronRight size={16} /></button>
        <div className="mb-3">
          <h2 className="text-sm font-bold text-foreground mb-1.5">Observação</h2>
          <textarea className="w-full bg-card border border-border rounded-xl p-2.5 text-sm outline-none resize-none text-foreground" rows={2} maxLength={200} placeholder="Observação do pedido..." value={note} onChange={(e) => setNote(e.target.value)} />
          <p className="text-[0.65rem] text-muted-foreground text-right mt-0.5">{note.length}/200</p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground mb-1.5">Entrega</h2>
          <div className="bg-card border border-border rounded-xl p-2.5 flex items-center gap-2.5">
            <Truck size={18} className="text-foreground flex-shrink-0" />
            <p className="text-sm text-foreground">Enviamos via CORREIOS para todo o Brasil</p>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl bg-card border-t border-border px-4 pt-2.5 pb-3 shadow-2xl">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-sm text-foreground">Total:</span>
          <span className="text-lg font-bold text-foreground">{formatPrice(total)}</span>
        </div>
        <p className="text-xs text-green-600 text-right mb-1.5">{pixPrice(total)} com Pix</p>
        <button onClick={() => {
          const msg = cartItems.map((i) => `• ${i.product.name} (${i.size}) x${i.qty} — ${formatPrice(i.product.price * i.qty)}`).join("\n");
          window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Quero finalizar meu pedido:\n\n${msg}\n\nTotal: ${formatPrice(total)}\n\n${note ? `Obs: ${note}` : ""}`)}`, "_blank");
        }} className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl text-base hover:bg-primary/90 transition-colors">Finalizar pelo WhatsApp</button>
      </div>
    </div>
  );
};

export default CartView;
