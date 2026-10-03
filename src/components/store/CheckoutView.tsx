import { ChevronLeft, User, MapPin, CreditCard, Check, Loader2 } from "lucide-react";
import StreetDexLogo from "./StreetDexLogo";
import { type CartItem, fallbackImg } from "./storeData";
import { formatPrice } from "@/lib/format";
import { CHECKOUT_PAYMENT_OPTIONS as PAYMENT_METHODS } from "@/constants/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCheckout, type Step } from "@/hooks/useCheckout";
import { useToast } from "@/hooks/use-toast";

interface CheckoutViewProps {
  cartItems: CartItem[];
  onBack: () => void;
  onOrderComplete: (orderId: string, orderNumber: number, whatsappLink?: string) => void;
}

const CheckoutView = ({ cartItems, onBack, onOrderComplete }: CheckoutViewProps) => {
  const { toast } = useToast();
  const {
    step, setStep, customer, setCustomer, address, setAddress, paymentMethod, setPaymentMethod, notes, setNotes,
    pixConfirmed, setPixConfirmed, shippingOptions, selectedShipping, setSelectedShipping,
    couponCode, setCouponCode, appliedCoupon, setAppliedCoupon, isApplyingCoupon, isValidatingCep,
    total, finalTotal, shippingCost, couponDiscountAmount, handleCepBlur, handleApplyCoupon, handleNext, handleFinalize,
    pixDiscount, cashDiscount, settings, isSubmitting
  } = useCheckout({ cartItems, onOrderComplete });

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

      <div className="flex-1 px-4 pb-32">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><User size={20} className="text-primary" /> Seus dados</h2>
            <div>
              <Label>Nome completo *</Label>
              <Input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Ex: João Silva" className="mt-1" />
            </div>
            <div>
              <Label>WhatsApp (Telefone) *</Label>
              <Input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, "") })} placeholder="85999999999" maxLength={11} className="mt-1" />
            </div>
            <div>
              <Label>Email (opcional)</Label>
              <Input value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="seuemail@exemplo.com" type="email" className="mt-1" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><MapPin size={20} className="text-primary" /> Endereço</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1 relative">
                <Label>CEP *</Label>
                <div className="relative">
                  <Input value={address.cep} onChange={(e) => { setAddress({ ...address, cep: e.target.value.replace(/\D/g, "") }); setSelectedShipping(null); }} onBlur={handleCepBlur} placeholder="60000000" maxLength={8} className="mt-1" />
                  {isValidatingCep && <Loader2 size={16} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
                </div>
              </div>
              <div className="col-span-2">
                <Label>Rua *</Label>
                <Input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Número *</Label>
                <Input value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Bairro *</Label>
                <Input value={address.neighborhood} onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Cidade *</Label>
                <Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="mt-1" />
              </div>
            </div>
            {shippingOptions.length > 0 && (
              <div className="space-y-2">
                <Label className="text-primary font-bold">Frete</Label>
                {shippingOptions.map((opt) => (
                  <div key={opt.name} onClick={() => setSelectedShipping(opt)} className={`p-3 rounded-lg border cursor-pointer ${selectedShipping?.name === opt.name ? "border-primary bg-primary/5" : "border-border/40"}`}>
                    <div className="flex justify-between">
                      <span className="text-sm font-bold">{opt.name} ({opt.days})</span>
                      <span className="text-sm font-bold text-primary">{opt.free ? "Grátis" : formatPrice(opt.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><CreditCard size={20} className="text-primary" /> Pagamento</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <Card key={method.value} className={`${method.value === "pix" && !settings?.pix_api_key ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${paymentMethod === method.value ? "border-primary bg-primary/5" : ""}`} onClick={() => {
                  if (method.value !== "pix" || settings?.pix_api_key) setPaymentMethod(method.value);
                }}>
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div>
              <Label>Cupom</Label>
              <div className="flex gap-2 mt-1">
                <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="flex-1" />
                <Button onClick={handleApplyCoupon} disabled={isApplyingCoupon}>{isApplyingCoupon ? <Loader2 className="animate-spin" /> : "Aplicar"}</Button>
              </div>
            </div>
            {paymentMethod === "pix" && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                {settings?.pix_api_key ? (
                  <p className="text-sm font-bold">Chave PIX: {settings.pix_api_key}</p>
                ) : (
                  <p className="text-sm font-medium text-destructive">PIX indisponível. Escolha outra forma de pagamento.</p>
                )}
                <Button variant={pixConfirmed ? "default" : "secondary"} className="w-full" onClick={() => setPixConfirmed(!pixConfirmed)}>
                  {pixConfirmed ? "✓ Vou enviar o comprovante no WhatsApp" : "Já fiz o Pix (enviarei o comprovante)"}
                </Button>
              </div>
            )}
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações..." className="mt-1" />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Revisão</h2>
            <Card className="p-4 text-sm space-y-2">
              <p><strong>Cliente:</strong> {customer.name} ({customer.phone})</p>
              <p><strong>Endereço:</strong> {address.street}, {address.number} - {address.city}</p>
              <p><strong>Total:</strong> {formatPrice(finalTotal)}</p>
            </Card>
            <div className="space-y-2">
              {cartItems.map(item => (
                <div key={item.cartId} className="flex items-center gap-3 text-xs">
                  <img src={item.product.img} alt="" className="w-8 h-8 rounded object-cover" onError={(e) => (e.target as HTMLImageElement).src = fallbackImg} />
                  <span>{item.qty}x {item.product.name} ({item.size})</span>
                  <span className="ml-auto">{formatPrice(item.product.price * item.qty)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-card border-t p-4 shadow-2xl">
        <div className="flex justify-between mb-2 font-bold">
          <span>Total</span>
          <span>{formatPrice(finalTotal)}</span>
        </div>
        <Button onClick={step === 4 ? handleFinalize : handleNext} disabled={isSubmitting || (paymentMethod === "pix" && !settings?.pix_api_key && step >= 3)} className="w-full" size="lg">
          {isSubmitting ? "Registrando pedido..." : step === 4 ? "Finalizar Pedido" : "Continuar"}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutView;