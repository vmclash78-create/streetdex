import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, User, MapPin, CreditCard, Check, Loader2, Copy } from "lucide-react";
import StreetDexLogo from "./StreetDexLogo";
import { type CartItem, formatPrice, fallbackImg, WHATSAPP } from "./storeData";
import { useCreateOrder } from "@/hooks/useOrders";
import { useStoreSettings } from "@/hooks/useStoreData";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

const PIX_KEY = "duartt@pix.com";

const CheckoutView = ({ cartItems, onBack, onOrderComplete }: CheckoutViewProps) => {
  const { data: settings } = useStoreSettings();
  const pixDiscount = Number(settings?.pix_discount || "0") / 100;
  const cashDiscount = Number(settings?.cash_discount || "0") / 100;

  const [step, setStep] = useState<Step>(1);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [address, setAddress] = useState({ cep: "", street: "", number: "", neighborhood: "", city: "", complement: "" });
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [notes, setNotes] = useState("");
  const [pixConfirmed, setPixConfirmed] = useState(false);
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  const total = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  
  const finalTotal = useMemo(() => {
    if (paymentMethod === "pix") return total * (1 - pixDiscount);
    if (paymentMethod === "dinheiro") return total * (1 - cashDiscount);
    return total;
  }, [total, paymentMethod, pixDiscount, cashDiscount]);


  const validateStep1 = () => {
    const name = customer.name.trim();
    const phone = customer.phone.trim().replace(/\D/g, "");
    return name.length >= 2 && name.length <= 100 && phone.length >= 10 && phone.length <= 11;
  };
  const validateStep2 = () => {
    const cep = address.cep.trim().replace(/\D/g, "");
    return cep.length === 8 && address.street.trim().length > 0 && address.street.trim().length <= 200 && address.number.trim().length > 0 && address.neighborhood.trim().length > 0 && address.city.trim().length > 0;
  };

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
      <header className="bg-card border-b border-border sticky top-0 z-50 flex items-center px-4 h-14">
        <Button variant="ghost" size="icon" onClick={step === 1 ? onBack : () => setStep((s) => (s - 1) as Step)}>
          <ChevronLeft size={20} />
        </Button>
        <div className="flex-1 flex justify-center"><StreetDexLogo size="sm" /></div>
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
              <Label>Nome completo *</Label>
              <Input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Seu nome completo" className="mt-1" />
            </div>
            <div>
              <Label>Telefone (WhatsApp) *</Label>
              <Input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/[^0-9]/g, "") })} placeholder="85999999999" maxLength={11} className="mt-1" />
            </div>
            <div>
              <Label>Email (opcional)</Label>
              <Input value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="seuemail@exemplo.com" type="email" className="mt-1" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><MapPin size={20} className="text-primary" /> Endereço de entrega</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <Label>CEP *</Label>
                <Input value={address.cep} onChange={(e) => setAddress({ ...address, cep: e.target.value.replace(/[^0-9]/g, "") })} placeholder="60000000" maxLength={8} className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label>Rua *</Label>
                <Input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="Nome da rua" className="mt-1" />
              </div>
              <div>
                <Label>Número *</Label>
                <Input value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} placeholder="123" className="mt-1" />
              </div>
              <div>
                <Label>Bairro *</Label>
                <Input value={address.neighborhood} onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })} placeholder="Bairro" className="mt-1" />
              </div>
              <div>
                <Label>Cidade *</Label>
                <Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="Fortaleza" className="mt-1" />
              </div>
              <div>
                <Label>Complemento</Label>
                <Input value={address.complement} onChange={(e) => setAddress({ ...address, complement: e.target.value })} placeholder="Apto 101" className="mt-1" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><CreditCard size={20} className="text-primary" /> Forma de pagamento</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <Card key={method.value} className={`cursor-pointer transition-colors ${paymentMethod === method.value ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
                  onClick={() => { setPaymentMethod(method.value); setPixConfirmed(false); }}>
                  <CardContent className="p-4">
                    <p className={`text-sm font-semibold ${paymentMethod === method.value ? "text-primary" : "text-foreground"}`}>{method.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
                    {method.value === "pix" && paymentMethod === "pix" && pixDiscount > 0 && (
                      <p className="text-xs text-green-600 mt-1 font-semibold">{pixDiscount * 100}% de desconto = {formatPrice(total * (1 - pixDiscount))}</p>
                    )}
                    {method.value === "dinheiro" && paymentMethod === "dinheiro" && cashDiscount > 0 && (
                      <p className="text-xs text-green-600 mt-1 font-semibold">{cashDiscount * 100}% de desconto = {formatPrice(total * (1 - cashDiscount))}</p>
                    )}

                  </CardContent>
                </Card>
              ))}
            </div>

            {paymentMethod === "pix" && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-bold text-foreground">Chave PIX:</p>
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                    <span className="text-sm text-foreground flex-1 font-mono">{PIX_KEY}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(PIX_KEY); toast({ title: "Chave copiada!" }); }}>
                      <Copy size={14} />
                    </Button>
                  </div>
                  <Button
                    variant={pixConfirmed ? "default" : "secondary"}
                    className={`w-full ${pixConfirmed ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                    onClick={() => setPixConfirmed(!pixConfirmed)}
                  >
                    {pixConfirmed ? "✓ Pagamento confirmado" : "Já realizei o pagamento"}
                  </Button>
                </CardContent>
              </Card>
            )}

            <div>
              <Label>Observação do pedido</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} rows={3} placeholder="Alguma observação sobre o pedido..." className="mt-1 resize-none" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Confirmar pedido</h2>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Dados do cliente</p>
                <p className="text-sm text-foreground font-semibold">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
                {customer.email && <p className="text-sm text-muted-foreground">{customer.email}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Endereço de entrega</p>
                <p className="text-sm text-foreground">{address.street}, {address.number}</p>
                <p className="text-sm text-muted-foreground">{address.neighborhood} - {address.city}</p>
                <p className="text-sm text-muted-foreground">CEP: {address.cep}</p>
                {address.complement && <p className="text-sm text-muted-foreground">{address.complement}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
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
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm text-foreground">{formatPrice(total)}</span>
                </div>
                {paymentMethod === "pix" && pixDiscount > 0 && (
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-green-600">Desconto PIX ({pixDiscount * 100}%)</span>
                    <span className="text-sm text-green-600">-{formatPrice(total * pixDiscount)}</span>
                  </div>
                )}
                {paymentMethod === "dinheiro" && cashDiscount > 0 && (
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-green-600">Desconto Dinheiro ({cashDiscount * 100}%)</span>
                    <span className="text-sm text-green-600">-{formatPrice(total * cashDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t border-border mt-2">
                  <span className="text-sm font-bold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">{formatPrice(finalTotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Pagamento: {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}</p>
              </CardContent>
            </Card>

            {notes && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Observação</p>
                  <p className="text-sm text-foreground">{notes}</p>
                </CardContent>
              </Card>
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
          <Button
            onClick={() => setStep((s) => (s + 1) as Step)}
            disabled={(step === 1 && !validateStep1()) || (step === 2 && !validateStep2())}
            className="w-full gap-2"
            size="lg"
          >
            Continuar <ChevronRight size={18} />
          </Button>
        ) : (
          <Button
            onClick={handleFinalize}
            disabled={createOrder.isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
            size="lg"
          >
            {createOrder.isPending ? <Loader2 size={18} className="animate-spin" /> : null}
            Finalizar Pedido via WhatsApp
          </Button>
        )}
      </div>
    </div>
  );
};

export default CheckoutView;
