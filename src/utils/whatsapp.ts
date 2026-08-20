
/**
 * Formata a mensagem de pedido para o WhatsApp com emojis e estrutura streetwear.
 */
export const formatWhatsAppOrderMessage = (data: {
  orderNumber: number;
  customer: { name: string; phone: string };
  items: Array<{ quantity: number; product_name: string; size: string; price: number }>;
  address: { street: string; number: string; neighborhood: string; city: string; uf: string; cep: string };
  shipping: { name: string; price: number; days?: string };
  payment: { method: string; discount?: { label: string; value: number } };
  total: number;
  notes?: string;
}) => {
  const formatMoney = (val: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const cleanPhone = (p: string) => {
    const c = p.replace(/\D/g, "");
    if (c.length === 11) return `(${c.slice(0, 2)}) ${c.slice(2, 7)}-${c.slice(7)}`;
    if (c.length === 10) return `(${c.slice(0, 2)}) ${c.slice(2, 6)}-${c.slice(6)}`;
    return p;
  };

  const cleanCep = (c: string) => {
    const v = c.replace(/\D/g, "");
    if (v.length === 8) return `${v.slice(0, 5)}-${v.slice(5)}`;
    return c;
  };

  const itemsList = data.items
    .map(i => `• ${i.quantity}x ${i.product_name} — Tamanho ${i.size}\n💵 Valor: ${formatMoney(i.price)}`)
    .join("\n\n");

  const shippingText = data.shipping.price === 0 ? "*GRÁTIS*" : formatMoney(data.shipping.price);
  const paymentMethodLabel = data.payment.method.charAt(0).toUpperCase() + data.payment.method.slice(1).toLowerCase();

  const lines = [
    `🏷️ *NOVO PEDIDO #${data.orderNumber}*`,
    "",
    `👤 *Cliente:* ${data.customer.name}`,
    `📱 *WhatsApp:* ${cleanPhone(data.customer.phone)}`,
    "",
    `👕 *PRODUTO*`,
    itemsList,
    "",
    `📍 *ENDEREÇO DE ENTREGA*`,
    `${data.address.street}, ${data.address.number}`,
    `${data.address.neighborhood} — ${data.address.city}/${data.address.uf}`,
    `CEP: ${cleanCep(data.address.cep)}`,
    "",
    `🚚 *FRETE:* ${data.shipping.name}${data.shipping.days ? ` — ${data.shipping.days}` : ""}`,
    `🚚 Frete: ${shippingText}`,
    "",
    `💳 *PAGAMENTO:* ${paymentMethodLabel}`,
  ];

  if (data.payment.discount && data.payment.discount.value > 0) {
    lines.push(`💸 *Desconto (${data.payment.discount.label}):* -${formatMoney(data.payment.discount.value)}`);
  }

  lines.push(
    "",
    `✅ *TOTAL FINAL: ${formatMoney(data.total)}*`,
    "",
    `💬 *OBSERVAÇÃO:* ${data.notes || "Nenhuma"}`,
    "",
    "━━━━━━━━━━━━━━━━━━",
    "🔥 *Street Dex*",
    "Moda street para quem vive intensamente.",
    "━━━━━━━━━━━━━━━━━━"
  );

  return lines.join("\n");
};

/**
 * Gera um link para o WhatsApp com sanitização rigorosa do número.
 */
export const getWhatsAppLink = (number: string | number, message?: string) => {
  if (!number) return "https://wa.me";
  
  // Extrai apenas os números
  let cleaned = number.toString().replace(/\D/g, "");
  
  // Previne injeção de caracteres no link
  cleaned = cleaned.replace(/[^0-9]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  if (cleaned.startsWith("5555")) {
    cleaned = cleaned.substring(2);
  }
  
  if ((cleaned.length === 10 || cleaned.length === 11) && !cleaned.startsWith("55")) {
    cleaned = `55${cleaned}`;
  }
  
  const url = new URL(`https://wa.me/${cleaned}`);
  if (message && message.trim().length > 0) {
    // Usar encodeURIComponent manualmente para garantir que caracteres especiais/emojis não sejam corrompidos
    return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
  }
  
  return `https://wa.me/${cleaned}`;
};
