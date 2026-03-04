import { useState } from "react";
import { ChevronLeft, ChevronRight, User, MapPin, CreditCard, Check, Loader2, Copy } from "lucide-react";
import DuarttLogo from "./DuarttLogo";
import { type CartItem, formatPrice, pixPrice, fallbackImg, WHATSAPP } from "./storeData";
import { useCreateOrder } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";

interface CheckoutViewProps {
  cartItems: CartItem[];
  onBack: () => void;
  onOrderComplete: (orderId: string, orderNumber: number) => void;
}

type Step = 1 | 2 | 3 | 4;

const PAYMENT_METHODS = [
  { value: "pix", label: "PIX", description: "Pagamento instantâneo com desconto" },
  { value: "dinheiro", label: "Dinheiro na entrega", description: "Pague ao receber o pedido" },
  { value: "cartao", label: "Cartão na entrega", description: "Débito ou crédito na entrega" },
];

const PIX_KEY = "duartt@pix.com"; // placeholder

const CheckoutView = ({ cartItems, onBack, onOrderComplete }: CheckoutViewProps) => {
  const [step, setStep] = useState<Step>(1);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [address, setAddress] = useState({ cep: "", street: "", number: "", neighborhood: "", city: "", complement: "" });
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [notes, setNotes] = useState("");
  const [pixConfirmed, setPixConfirmed] = useState(false);
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  const total = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const finalTotal = paymentMethod === "pix" ? total * 0.98 : total;

  const validateStep1 = () => customer.name.trim().length >= 2 && customer.phone.trim().length >= 10;
  const validateStep2 = () => address.cep.trim().length >= 8 && address.street.trim() && address.number.trim() && address.neighborhood.trim() && address.city.trim();

  const handleFinalize = async () => {
    try {
      const order = await createOrder.mutateAsync({
        customer: { name: customer.name.trim(), phone: customer.phone.trim(), email: customer.email.trim() || undefined },
        order: {
          total: finalTotal,
          payment_method: paymentMethod,
          address_cep: address.cep,
          address_street: address.street,
          address_number: address.number,
          address_neighborhood: address.neighborhood,
          address_city: address.city,
          address_complement: address.complement || undefined,
          notes: notes || undefined,
        },
        items: cartItems.map((i) => ({
          product_name: i.product.name,
          product_img: i.product.img,
          size: i.size,
          quantity: i.qty,
          price: i.product.price,
        })),
      });

      // Build WhatsApp message
      const itemsText = cartItems.map((i) => `• ${i.product.name} - ${i.size} - ${i.qty}x`).join("\n");
      const msg = `🛒 *Novo pedido recebido!*\n\n📦 *Pedido:* #${order.order_number}\n\n👤 *Cliente:*\n${customer.name}\n${customer.phone}\n\n📍 *Endereço:*\n${address.street}, ${address.number}\n${address.neighborhood} - ${address.city}\nCEP: ${address.cep}${address.complement ? `\nComplemento: ${address.complement}` : ""}\n\n🛍️ *Produtos:*\n${itemsText}\n\n💰 *Total:* ${formatPrice(finalTotal)}\n💳 *Pagamento:* ${PAYMENT_METHODS.find((p) => p.value === paymentMethod)?.label}\n\n${notes ? `📝 *Obs:* ${notes}\n\n` : ""}🔗 *Ver pedido:* ${window.location.origin}/pedido/${order.id}`;

      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
      onOrderComplete(order.id, order.order_number);
    } catch {
      toast({ title: "Erro ao criar pedido", description: "Tente novamente.", variant: "destructive" });
    }
  };

  const stepLabels = ["Dados", "Endereço", "Pagamento", "Confirmar"];

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 flex items-center px-4 h-14">
        <button onClick={step === 1 ? onBack : () => setStep((s) => (s - 1) as Step)}>
          <ChevronLeft size={20} className="text-foreground" />
        </button>
        <div className="flex-1 flex justify-center"><DuarttLogo size="sm" /></div>
        <div className="w-8" />
      </header>

      {/* Step indicator */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i + 1 <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i + 1 < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:inline ${i + 1 <= step ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{label}</span>
              {i < 3 && <div className={`w-8 sm:w-12 h-0.5 mx-1 ${i + 1 < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 px-4 pb-32">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><User size={20} className="text-primary" /> Seus dados</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nome completo *</label>
              <input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Seu nome completo"
                className="w-full rounded-xl px-4 py-3 text-sm border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Telefone (WhatsApp) *</label>
              <input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/[^0-9]/g, "") })} placeholder="85999999999" maxLength={11}
                className="w-full rounded-xl px-4 py-3 text-sm border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email (opcional)</label>
              <input value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="seuemail@exemplo.com" type="email"
                className="w-full rounded-xl px-4 py-3 text-sm border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><MapPin size={20} className="text-primary" /> Endereço de entrega</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-foreground mb-1">CEP *</label>
                <input value={address.cep} onChange={(e) => setAddress({ ...address, cep: e.target.value.replace(/[^0-9]/g, "") })} placeholder="60000000" maxLength={8}
                  className="w-full rounded-xl px-4 py-3 text-sm border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Rua *</label>
                <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="Nome da rua"
                  className="w-full rounded-xl px-4 py-3 text-sm border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Número *</label>
                <input value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} placeholder="123"
                  className="w-full rounded-xl px-4 py-3 text-sm border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Bairro *</label>
                <input value={address.neighborhood} onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })} placeholder="Bairro"
                  className="w-full rounded-xl px-4 py-3 text-sm border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Cidade *</label>
                <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="Fortaleza"
                  className="w-full rounded-xl px-4 py-3 text-sm border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Complemento</label>
                <input value={address.complement} onChange={(e) => setAddress({ ...address, complement: e.target.value })} placeholder="Apto 101"
                  className="w-full rounded-xl px-4 py-3 text-sm border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><CreditCard size={20} className="text-primary" /> Forma de pagamento</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <button key={method.value} onClick={() => { setPaymentMethod(method.value); setPixConfirmed(false); }}
                  className={`w-full p-4 rounded-xl border text-left transition-colors ${paymentMethod === method.value ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted"}`}>
                  <p className={`text-sm font-semibold ${paymentMethod === method.value ? "text-primary" : "text-foreground"}`}>{method.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
                  {method.value === "pix" && paymentMethod === "pix" && (
                    <p className="text-xs text-green-600 mt-1 font-semibold">2% de desconto = {pixPrice(total)}</p>
                  )}
                </button>
              ))}
            </div>

            {paymentMethod === "pix" && (
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <p className="text-sm font-bold text-foreground">Chave PIX:</p>
                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                  <span className="text-sm text-foreground flex-1 font-mono">{PIX_KEY}</span>
                  <button onClick={() => { navigator.clipboard.writeText(PIX_KEY); toast({ title: "Chave copiada!" }); }}
                    className="p-1.5 rounded-lg hover:bg-background"><Copy size={14} className="text-muted-foreground" /></button>
                </div>
                <button onClick={() => setPixConfirmed(!pixConfirmed)}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${pixConfirmed ? "bg-green-600 text-white" : "bg-muted text-foreground hover:bg-muted/80"}`}>
                  {pixConfirmed ? "✓ Pagamento confirmado" : "Já realizei o pagamento"}
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Observação do pedido</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} rows={3} placeholder="Alguma observação sobre o pedido..."
                className="w-full rounded-xl px-4 py-3 text-sm border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Confirmar pedido</h2>

            {/* Customer summary */}
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Dados do cliente</p>
              <p className="text-sm text-foreground font-semibold">{customer.name}</p>
              <p className="text-sm text-muted-foreground">{customer.phone}</p>
              {customer.email && <p className="text-sm text-muted-foreground">{customer.email}</p>}
            </div>

            {/* Address summary */}
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Endereço de entrega</p>
              <p className="text-sm text-foreground">{address.street}, {address.number}</p>
              <p className="text-sm text-muted-foreground">{address.neighborhood} - {address.city}</p>
              <p className="text-sm text-muted-foreground">CEP: {address.cep}</p>
              {address.complement && <p className="text-sm text-muted-foreground">{address.complement}</p>}
            </div>

            {/* Items summary */}
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Produtos ({cartItems.length})</p>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.cartId} className="flex items-center gap-3">
                    <img src={item.product.img} alt="" className="w-10 h-10 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{item.size} • {item.qty}x</p>
                    </div>
                    <p className="text-xs font-semibold text-foreground">{formatPrice(item.product.price * item.qty)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & total */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm text-foreground">{formatPrice(total)}</span>
              </div>
              {paymentMethod === "pix" && (
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-green-600">Desconto PIX (2%)</span>
                  <span className="text-sm text-green-600">-{formatPrice(total * 0.02)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-border mt-2">
                <span className="text-sm font-bold text-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">{formatPrice(finalTotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pagamento: {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}</p>
            </div>

            {notes && (
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Observação</p>
                <p className="text-sm text-foreground">{notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-card border-t border-border px-4 pt-3 pb-4 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Total do pedido</span>
          <span className="text-lg font-bold text-foreground">{formatPrice(finalTotal)}</span>
        </div>
        {step < 4 ? (
          <button
            onClick={() => setStep((s) => (s + 1) as Step)}
            disabled={(step === 1 && !validateStep1()) || (step === 2 && !validateStep2())}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl text-base hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Continuar <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleFinalize}
            disabled={createOrder.isPending}
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl text-base hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createOrder.isPending ? <Loader2 size={18} className="animate-spin" /> : null}
            Finalizar Pedido via WhatsApp
          </button>
        )}
      </div>
    </div>
  );
};

export default CheckoutView;
