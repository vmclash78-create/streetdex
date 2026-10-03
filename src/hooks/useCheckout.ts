import { useState, useEffect, useRef } from "react";
import { type CartItem } from "@/components/store/storeData";
import { useToast } from "@/hooks/use-toast";
import { validatePhone, validateCEP } from "@/utils/validation";
import { parseShippingConfig, estimateShippingOptions, type ShippingOption } from "@/lib/shipping";
import { useStoreSettings, type DBCoupon } from "@/hooks/useStoreData";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";
import { useCreateOrder } from "@/hooks/useOrders";
import { getWhatsAppLink, formatWhatsAppOrderMessage } from "@/utils/whatsapp";

export type Step = 1 | 2 | 3 | 4;

interface UseCheckoutProps {
  cartItems: CartItem[];
  onOrderComplete: (orderId: string, orderNumber: number, whatsappLink?: string) => void;
}

export const useCheckout = ({ cartItems, onOrderComplete }: UseCheckoutProps) => {
  const { data: settings } = useStoreSettings();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const finalizing = useRef(false);

  const [step, setStep] = useState<Step>(() => {
    const saved = localStorage.getItem("checkout_step");
    const step = Number(saved);
    return step >= 1 && step <= 4 ? step as Step : 1;
  });

  const [customer, setCustomer] = useState(() => {
    const saved = localStorage.getItem("checkout_customer");
    try { return saved ? JSON.parse(saved) : { name: "", phone: "", email: "" }; }
    catch { return { name: "", phone: "", email: "" }; }
  });

  const [address, setAddress] = useState(() => {
    const saved = localStorage.getItem("checkout_address");
    try { return saved ? JSON.parse(saved) : { cep: "", street: "", number: "", neighborhood: "", city: "", complement: "" }; }
    catch { return { cep: "", street: "", number: "", neighborhood: "", city: "", complement: "" }; }
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
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingLoc, setShippingLoc] = useState<{ city: string; uf: string } | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<DBCoupon | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isValidatingCep, setIsValidatingCep] = useState(false);

  // Persistence
  useEffect(() => { localStorage.setItem("checkout_step", step.toString()); }, [step]);
  useEffect(() => { localStorage.setItem("checkout_customer", JSON.stringify(customer)); }, [customer]);
  useEffect(() => { localStorage.setItem("checkout_address", JSON.stringify(address)); }, [address]);
  useEffect(() => { localStorage.setItem("checkout_payment_method", paymentMethod); }, [paymentMethod]);
  useEffect(() => { localStorage.setItem("checkout_notes", notes); }, [notes]);

  const pixDiscount = Number(settings?.pix_discount || "0") / 100;
  const cashDiscount = Number(settings?.cash_discount || "0") / 100;
  const total = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const allItemsFreeShipping = cartItems.length > 0 && cartItems.every((i) => !!i.product.freeShipping);

  const couponDiscountAmount = appliedCoupon ? (
    appliedCoupon.discount_type === "percentage" 
      ? total * (appliedCoupon.discount_value / 100) 
      : appliedCoupon.discount_value
  ) : 0;

  const totalAfterCoupon = total - couponDiscountAmount;
  const shippingCost = selectedShipping ? selectedShipping.price : 0;

  const finalTotal = (() => {
    let subtotal = totalAfterCoupon;
    if (paymentMethod === "pix") subtotal = subtotal * (1 - pixDiscount);
    else if (paymentMethod === "dinheiro") subtotal = subtotal * (1 - cashDiscount);
    return subtotal + shippingCost;
  })();

  const validateStep1 = () => {
    if (customer.name.trim().length < 2) {
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
    if (!address.number.trim()) {
      toast({ title: "Número faltando", description: "Por favor, informe o número da residência.", variant: "destructive" });
      return false;
    }
    if (!selectedShipping || shippingOptions.length === 0) {
      toast({ title: "Selecione o frete", description: "Confirme o CEP para calcular o frete.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleCepBlur = async () => {
    const cep = address.cep.replace(/\D/g, "");
    if (cep.length === 8) {
      setSelectedShipping(null);
      setIsValidatingCep(true);
       const validation = await validateCEP(cep);
      setIsValidatingCep(false);
      if (!validation.isValid) {
        toast({ title: "CEP inválido", description: validation.error, variant: "destructive" });
        return;
      }
      const data = validation.data;
      setAddress(prev => ({ ...prev, street: data.logradouro || prev.street, neighborhood: data.bairro || prev.neighborhood, city: data.localidade || prev.city }));
      setOfficialStreet(data.logradouro || null);
      const cfg = parseShippingConfig(settings?.shipping_config);
      const opts = estimateShippingOptions(cep, cfg, allItemsFreeShipping);
      setShippingOptions(opts);
      setSelectedShipping(opts[0] || null);
      setShippingLoc({ city: data.localidade, uf: data.uf });
      toast({ title: "CEP localizado", description: `${data.localidade} - ${data.uf}` });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    const { data, error } = await supabase.rpc("validate_coupon", { p_code: couponCode.trim(), p_total: total });
    setIsApplyingCoupon(false);
    if (error) { toast({ title: "Erro ao validar cupom", description: error.message, variant: "destructive" }); return; }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || !row.valid) { toast({ title: "Cupom inválido", description: "Não foi possível aplicar este cupom.", variant: "destructive" }); return; }
    setAppliedCoupon({ id: row.id, code: row.code, discount_type: row.discount_type, discount_value: Number(row.discount_value), min_purchase_amount: Number(row.min_purchase_amount) } as DBCoupon);
    toast({ title: "Cupom aplicado!" });
  };

  const handleNext = () => {
    if (cartItems.length === 0) { toast({ title: "Carrinho vazio", variant: "destructive" }); return; }
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && paymentMethod === "pix" && !settings?.pix_api_key) {
      toast({ title: "PIX indisponível", description: "Escolha dinheiro ou cartão na entrega.", variant: "destructive" });
      return;
    }
    setStep((current) => Math.min(4, current + 1) as Step);
  };

  const handleFinalize = async () => {
    if (finalizing.current || createOrder.isPending) return;
    try {
      if (cartItems.length === 0) { toast({ title: "Carrinho vazio", variant: "destructive" }); return; }
      if (!validateStep1() || !validateStep2()) return;
      if (!settings?.whatsapp_store && !settings?.whatsapp) {
        toast({ title: "Loja indisponível", description: "O contato da loja ainda não está configurado.", variant: "destructive" });
        return;
      }
      if (paymentMethod === "pix" && !settings?.pix_api_key) {
        toast({ title: "PIX indisponível", description: "Escolha outra forma de pagamento.", variant: "destructive" });
        return;
      }
      finalizing.current = true;
      const order = await createOrder.mutateAsync({
        customer: { name: customer.name.trim(), phone: customer.phone.trim(), email: customer.email.trim() || undefined },
         order: { total: finalTotal, payment_method: paymentMethod, address_cep: address.cep, address_street: address.street, address_number: address.number, address_neighborhood: address.neighborhood, address_city: address.city, address_complement: address.complement || undefined, notes: notes.trim() || undefined },
        coupon_code: appliedCoupon?.code,
        shipping_service: selectedShipping?.name || "PAC",
        items: cartItems.map((i) => ({ product_id: i.product.id, product_name: i.product.name, product_img: i.product.img, size: i.size, quantity: i.qty, price: i.product.price }))
      });
      if (!order?.id) throw new Error("Erro ao salvar o pedido.");
      
      const whatsapp = settings?.whatsapp_store || settings?.whatsapp;
      
      const waMessage = formatWhatsAppOrderMessage({
        orderNumber: order.order_number,
        customer: { name: customer.name.trim(), phone: customer.phone.trim() },
        items: cartItems.map((i) => ({ 
          quantity: i.qty, 
          product_name: i.product.name, 
          size: i.size, 
          price: i.product.price 
        })),
        address: { 
          street: address.street, 
          number: address.number, 
          neighborhood: address.neighborhood, 
          city: address.city, 
          uf: shippingLoc?.uf || "", 
          cep: address.cep 
        },
        shipping: { 
          name: selectedShipping?.name || "Padrão", 
          price: shippingCost,
          days: selectedShipping?.days
        },
        payment: { 
          method: paymentMethod,
          discount: couponDiscountAmount > 0 
            ? { label: "Cupom", value: couponDiscountAmount }
            : (paymentMethod === "pix" && pixDiscount > 0)
              ? { label: `PIX ${pixDiscount * 100}%`, value: totalAfterCoupon * pixDiscount }
              : (paymentMethod === "dinheiro" && cashDiscount > 0)
                ? { label: `Dinheiro ${cashDiscount * 100}%`, value: totalAfterCoupon * cashDiscount }
                : undefined
        },
        total: Number(order.total),
        notes: notes.trim() || undefined
      });

      const whatsappLink = whatsapp ? getWhatsAppLink(whatsapp, waMessage) : undefined;
      onOrderComplete(order.id, order.order_number, whatsappLink);

      ["checkout_step", "checkout_customer", "checkout_address", "checkout_payment_method", "checkout_notes"].forEach(k => localStorage.removeItem(k));
    } catch (err: unknown) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : "Não foi possível concluir o pedido.", variant: "destructive" });
    } finally {
      finalizing.current = false;
    }
  };

  return {
    step, setStep, customer, setCustomer, address, setAddress, paymentMethod, setPaymentMethod, notes, setNotes,
    pixConfirmed, setPixConfirmed, shippingOptions, selectedShipping, setSelectedShipping, shippingLoc,
    couponCode, setCouponCode, appliedCoupon, setAppliedCoupon, isApplyingCoupon, isValidatingCep,
    total, finalTotal, shippingCost, couponDiscountAmount, handleCepBlur, handleApplyCoupon, handleNext, handleFinalize,
    pixDiscount, cashDiscount, settings, isSubmitting: createOrder.isPending
  };
};