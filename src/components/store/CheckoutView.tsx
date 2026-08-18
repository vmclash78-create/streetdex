import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, User, MapPin, CreditCard, Check, Loader2, Copy, Ticket, X, Truck } from "lucide-react";
import StreetDexLogo from "./StreetDexLogo";
import { type CartItem, fallbackImg, WHATSAPP } from "./storeData";
import { formatPrice } from "@/lib/format";
import { CHECKOUT_PAYMENT_OPTIONS as PAYMENT_METHODS } from "@/constants/payments";
import { useCreateOrder } from "@/hooks/useOrders";
import { useStoreSettings, type DBCoupon } from "@/hooks/useStoreData";
import { supabase } from "@/integrations/supabase/client";
import { parseShippingConfig, estimateShippingOptions, type ShippingOption } from "@/lib/shipping";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getWhatsAppLink } from "@/utils/whatsapp";
import { validatePhone, validateCEP } from "@/utils/validation";

interface CheckoutViewProps {
  cartItems: CartItem[];
  onBack: () => void;
  onOrderComplete: (orderId: string, orderNumber: number) => void;
}

type Step = 1 | 2 | 3 | 4;

/** Chave PIX de fallback quando a loja não configurou uma em settings. */
const PIX_KEY = "Sua Chave PIX";

const CheckoutView = ({ cartItems, onBack, onOrderComplete }: CheckoutViewProps) => {
  const { data: settings } = useStoreSettings();


  
  const whatsapp = settings?.whatsapp_store || settings?.whatsapp || WHATSAPP;
  const pixDiscount = Number(settings?.pix_discount || "0") / 100;
  const cashDiscount = Number(settings?.cash_discount || "0") / 100;

  const [step, setStep] = useState<Step>(() => {
    const saved = localStorage.getItem("checkout_step");
    return saved ? (Number(saved) as Step) : 1;
  });
  const [customer, setCustomer] = useState(() => {
    const saved = localStorage.getItem("checkout_customer");
    return saved ? JSON.parse(saved) : { name: "", phone: "", email: "" };
  });
  const [address, setAddress] = useState(() => {
    const saved = localStorage.getItem("checkout_address");
    return saved ? JSON.parse(saved) : { cep: "", street: "", number: "", neighborhood: "", city: "", complement: "" };
  });
  const [officialStreet, setOfficialStreet] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState(() => {
    const saved = localStorage.getItem("checkout_payment_method");
    return saved || "pix";
  });
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("checkout_notes");
    return saved || "";
  });
  const [pixConfirmed, setPixConfirmed] = useState(false);

  // Shipping (auto by CEP → region)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingLoc, setShippingLoc] = useState<{ city: string; uf: string } | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<DBCoupon | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem("checkout_step", step.toString());
  }, [step]);

  useEffect(() => {
    localStorage.setItem("checkout_customer", JSON.stringify(customer));
  }, [customer]);

  useEffect(() => {
    localStorage.setItem("checkout_address", JSON.stringify(address));
  }, [address]);

  useEffect(() => {
    localStorage.setItem("checkout_payment_method", paymentMethod);
  }, [paymentMethod]);

  useEffect(() => {
    localStorage.setItem("checkout_notes", notes);
  }, [notes]);


  const createOrder = useCreateOrder();
  const { toast } = useToast();
  

  const total = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const allItemsFreeShipping = cartItems.length > 0 && cartItems.every((i) => !!i.product.freeShipping);

  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.discount_type === "percentage") {
      return total * (appliedCoupon.discount_value / 100);
    } else {
      return appliedCoupon.discount_value;
    }
  }, [appliedCoupon, total]);

  const totalAfterCoupon = total - couponDiscountAmount;
  const shippingCost = selectedShipping ? selectedShipping.price : 0;

  const finalTotal = useMemo(() => {
    let subtotal = totalAfterCoupon;
    if (paymentMethod === "pix") subtotal = subtotal * (1 - pixDiscount);
    else if (paymentMethod === "dinheiro") subtotal = subtotal * (1 - cashDiscount);
    return subtotal + shippingCost;
  }, [totalAfterCoupon, paymentMethod, pixDiscount, cashDiscount, shippingCost]);



  const validateStep1 = () => {
    const name = customer.name.trim();
    if (name.length < 2) {
      toast({ title: "Nome inválido", description: "Por favor, digite seu nome completo.", variant: "destructive" });
      return false;
    }
    
    const phoneValidation = validatePhone(customer.phone);
    if (!phoneValidation.isValid) {
      toast({ title: "Telefone inválido", description: phoneValidation.error, variant: "destructive" });
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    const cep = address.cep.trim().replace(/\D/g, "");
    if (cep.length !== 8) {
      toast({ title: "CEP inválido", description: "O CEP deve ter 8 dígitos.", variant: "destructive" });
      return false;
    }

    if (!address.street.trim() || !address.neighborhood.trim() || !address.city.trim()) {
      toast({ title: "Endereço incompleto", description: "Por favor, preencha todos os campos obrigatórios.", variant: "destructive" });
      return false;
    }

    // Se o CEP retornou um logradouro específico, verificamos se ele existe no que o usuário digitou
    if (officialStreet && officialStreet.trim() !== "") {
      const typedStreet = address.street.trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents
      const official = officialStreet.trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents
      
      // Verificação mais flexível para evitar bloqueios indevidos por abreviações
      const officialWords = official.split(/\s+/).filter(w => w.length > 2);
      const isMatch = officialWords.length === 0 || officialWords.some(word => typedStreet.includes(word)) || typedStreet.includes(official) || official.includes(typedStreet);

      if (!isMatch) {
        toast({ 
          title: "Rua divergente", 
          description: `O CEP informado pertence à rua "${officialStreet}". Por favor, verifique se digitou corretamente ou use o endereço sugerido.`, 
          variant: "destructive" 
        });
        return false;
      }
    }

    if (!address.number.trim()) {
      toast({ title: "Número faltando", description: "Por favor, informe o número da residência.", variant: "destructive" });
      return false;
    }

    if (!selectedShipping) {
      toast({ title: "Selecione o frete", description: "Confirme o CEP para calcular o frete e escolha uma opção de entrega.", variant: "destructive" });
      return false;
    }

    return true;
  };

  const [isValidatingCep, setIsValidatingCep] = useState(false);

  const handleCepBlur = async () => {
    const cep = address.cep.replace(/\D/g, "");
    if (cep.length === 8) {
      setIsValidatingCep(true);
      const validation = await validateCEP(cep);
      setIsValidatingCep(false);

      if (!validation.isValid) {
        toast({ 
          title: "CEP inválido", 
          description: validation.error, 
          variant: "destructive" 
        });
        return;
      }

      const data = validation.data;

      setAddress(prev => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city
      }));
      setOfficialStreet(data.logradouro || null);

      // Calcula opções de frete automaticamente pela região do CEP (Manual)
      const cfg = parseShippingConfig(settings?.shipping_config);
      const opts = estimateShippingOptions(data.uf, cfg, allItemsFreeShipping);
      setShippingOptions(opts);
      setSelectedShipping(opts[0] || null);
      setShippingLoc({ city: data.localidade, uf: data.uf });

      toast({
        title: "CEP localizado",
        description: `${data.localidade} - ${data.uf}`,
      });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);

    const { data, error } = await supabase.rpc("validate_coupon", {
      p_code: couponCode.trim(),
      p_total: total,
    });

    if (error) {
      toast({ title: "Erro ao validar cupom", description: error.message, variant: "destructive" });
      setIsApplyingCoupon(false);
      return;
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row || !row.valid) {
      const reason = row?.reason;
      const messages: Record<string, { title: string; description: string }> = {
        not_found: { title: "Cupom inválido", description: "O código informado não existe." },
        inactive: { title: "Cupom inativo", description: "Este cupom não está mais ativo." },
        expired: { title: "Cupom expirado", description: "Este cupom já expirou." },
        limit_reached: { title: "Limite atingido", description: "Este cupom já atingiu o limite de usos." },
        min_purchase: { title: "Valor mínimo não atingido", description: `O valor mínimo para este cupom é ${formatPrice(row?.min_purchase_amount ?? 0)}.` },
      };
      const msg = messages[reason] || { title: "Cupom inválido", description: "Não foi possível aplicar este cupom." };
      toast({ ...msg, variant: "destructive" });
      setIsApplyingCoupon(false);
      return;
    }

    setAppliedCoupon({
      id: row.id,
      code: row.code,
      discount_type: row.discount_type,
      discount_value: Number(row.discount_value),
      min_purchase_amount: Number(row.min_purchase_amount),
      max_uses: null,
      used_count: 0,
      expires_at: null,
      status: "active",
      created_at: "",
      updated_at: "",
    } as DBCoupon);
    setIsApplyingCoupon(false);
    toast({ title: "Cupom aplicado!", description: "O desconto foi aplicado ao seu pedido." });
  };


  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleFinalize = async () => {

    try {
      // Final validation before submitting
      if (!validateStep1() || !validateStep2()) {
        return;
      }

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
          notes: [
            selectedShipping
              ? `Frete: ${selectedShipping.name} - ${selectedShipping.free ? "Grátis" : formatPrice(selectedShipping.price)} (${selectedShipping.days})`
              : null,
            notes || null,
          ].filter(Boolean).join(" | ") || undefined,
        },
        items: cartItems.map((i) => ({
          product_name: i.product.name,
          product_img: i.product.img,
          size: i.size,
          quantity: i.qty,
          price: i.product.price,
        })),
      });

      if (!order || !order.id) {
        throw new Error("Erro ao processar o pedido no servidor.");
      }

      // Update coupon usage if applicable
      if (appliedCoupon) {
        await supabase.rpc("redeem_coupon", { p_id: appliedCoupon.id });
      }

      // Fire-and-forget: envia e-mail com o cupom ativo, se cliente informou e-mail
      if (customer.email.trim()) {
        supabase.functions
          .invoke("send-coupon-email", {
            body: { email: customer.email.trim(), name: customer.name.trim() },
          })
          .catch((err) => console.warn("coupon email failed:", err));
      }

      onOrderComplete(order.id, order.order_number);

      // Abrir WhatsApp com resumo do pedido
      const itemsList = cartItems.map(i => `- ${i.qty}x ${i.product.name} (${i.size}): ${formatPrice(i.product.price)}`).join('\n');
      const addressInfo = `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}\n${address.neighborhood}, ${address.city}/${shippingLoc?.uf || ''}\nCEP: ${address.cep}`;
      const shippingInfo = selectedShipping ? `${selectedShipping.name} (${selectedShipping.days}): ${selectedShipping.free ? 'Grátis' : formatPrice(selectedShipping.price)}` : 'A combinar';
      
      let discountDetails = "";
      if (appliedCoupon) {
        discountDetails += `\n*Cupom (${appliedCoupon.code}):* -${formatPrice(couponDiscountAmount)}`;
      }
      if (paymentMethod === "pix" && pixDiscount > 0) {
        discountDetails += `\n*Desconto PIX (${pixDiscount * 100}%):* -${formatPrice(totalAfterCoupon * pixDiscount)}`;
      } else if (paymentMethod === "dinheiro" && cashDiscount > 0) {
        discountDetails += `\n*Desconto Dinheiro (${cashDiscount * 100}%):* -${formatPrice(totalAfterCoupon * cashDiscount)}`;
      }

      const message = `*NOVO PEDIDO #${order.order_number}*\n\n` +
        `*Cliente:* ${customer.name}\n` +
        `*WhatsApp:* ${customer.phone}\n\n` +
        `*Produtos:*\n${itemsList}\n\n` +
        `*Endereço de Entrega:*\n${addressInfo}\n\n` +
        `*Frete:* ${shippingInfo}\n` +
        `*Pagamento:* ${paymentMethod.toUpperCase()}${discountDetails}\n\n` +
        `*TOTAL FINAL:* ${formatPrice(finalTotal)}\n\n` +
        `*Observação:* ${notes || 'Nenhuma'}\n\n` +
        `--- \nGerado via Street Dex`;

      // Limpar persistência após sucesso
      const keysToRemove = [
        "checkout_step", "checkout_customer", "checkout_address", 
        "checkout_payment_method", "checkout_notes", "store_view",
        "store_selected_product_id"
      ];
      keysToRemove.forEach(k => localStorage.removeItem(k));
      
      const waLink = getWhatsAppLink(whatsapp, message);
      window.open(waLink, '_blank');




      
    } catch (error: any) {
      console.error("Order creation error:", error);
      toast({ 
        title: "Erro ao criar pedido", 
        description: error.message || "Ocorreu um problema ao salvar seu pedido. Tente novamente.", 
        variant: "destructive" 
      });
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    } else if (step === 3) {
      if (paymentMethod === "pix" && !pixConfirmed) {
        toast({ title: "Confirmação pendente", description: "Por favor, confirme que realizou o pagamento via PIX.", variant: "warning" as any });
        return;
      }
      setStep(4);
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
              <Input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Ex: João Silva" className="mt-1" />
            </div>
            <div>
              <Label>WhatsApp (Telefone) *</Label>
              <Input 
                value={customer.phone} 
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setCustomer({ ...customer, phone: val });
                }} 
                placeholder="85999999999" 
                maxLength={11} 
                className="mt-1" 
              />
              <p className="text-[10px] text-muted-foreground mt-1">É neste número que você receberá o comprovante do pedido.</p>
            </div>

            {customer.email && (
              <div>
                <Label>Email (opcional)</Label>
                <Input value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="seuemail@exemplo.com" type="email" className="mt-1" />
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><MapPin size={20} className="text-primary" /> Endereço de entrega</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1 relative">
                <Label>CEP *</Label>
                <div className="relative">
                  <Input 
                    value={address.cep} 
                    onChange={(e) => setAddress({ ...address, cep: e.target.value.replace(/[^0-9]/g, "") })} 
                    onBlur={handleCepBlur} 
                    placeholder="60000000" 
                    maxLength={8} 
                    className="mt-1" 
                  />
                  {isValidatingCep && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
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

            {shippingOptions.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Truck size={18} />
                  <span className="text-sm font-bold uppercase tracking-wider">Opções de Entrega</span>
                </div>
                <div className="space-y-2">
                  {shippingOptions.map((opt) => (
                    <div
                      key={opt.name}
                      onClick={() => setSelectedShipping(opt)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedShipping?.name === opt.name
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border/40 hover:border-border bg-background/40"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{opt.name}</span>
                        <span className="text-[10px] text-muted-foreground">{opt.days}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {opt.free ? "Grátis" : formatPrice(opt.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

            <div className="space-y-3 pt-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Ticket size={16} className="text-primary" /> Cupom de desconto
              </Label>
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <Input 
                    value={couponCode} 
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                    placeholder="Digite seu cupom" 
                    className="flex-1"
                  />
                  <Button 
                    variant="secondary" 
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                  >
                    {isApplyingCoupon ? <Loader2 size={16} className="animate-spin" /> : "Aplicar"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <div>
                      <p className="text-sm font-bold text-primary">{appliedCoupon.code}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Cupom aplicado: {appliedCoupon.discount_type === "percentage" ? `${appliedCoupon.discount_value}%` : formatPrice(appliedCoupon.discount_value)} de desconto
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleRemoveCoupon}>
                    <X size={16} />
                  </Button>
                </div>
              )}
            </div>


            {paymentMethod === "pix" && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-bold text-foreground">Chave PIX:</p>
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                    <span className="text-sm text-foreground flex-1 font-mono">{settings?.pix_api_key || PIX_KEY}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(settings?.pix_api_key || PIX_KEY); toast({ title: "Chave copiada!" }); }}>
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
                {appliedCoupon && (
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-green-600">Cupom ({appliedCoupon.code})</span>
                    <span className="text-sm text-green-600">-{formatPrice(couponDiscountAmount)}</span>
                  </div>
                )}
                {paymentMethod === "pix" && pixDiscount > 0 && (
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-green-600">Desconto PIX ({pixDiscount * 100}%)</span>
                    <span className="text-sm text-green-600">-{formatPrice(totalAfterCoupon * pixDiscount)}</span>
                  </div>
                )}
                {paymentMethod === "dinheiro" && cashDiscount > 0 && (
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-green-600">Desconto Dinheiro ({cashDiscount * 100}%)</span>
                    <span className="text-sm text-green-600">-{formatPrice(totalAfterCoupon * cashDiscount)}</span>
                  </div>
                {selectedShipping && (
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Frete ({selectedShipping.name})</span>
                    <span className="text-sm text-foreground">{selectedShipping.free ? "Grátis" : formatPrice(selectedShipping.price)}</span>
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
            onClick={handleNext}
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
            Finalizar Pedido
          </Button>
        )}
      </div>
    </div>
  );
};

export default CheckoutView;
