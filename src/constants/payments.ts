/**
 * Métodos de pagamento — fonte única de labels e opções.
 *
 * O painel Admin registra vendas históricas com uma lista mais ampla (inclui débito/crédito
 * e transferência). O Checkout público oferece um subconjunto ao cliente final.
 */

/** Rótulos amigáveis para todos os métodos de pagamento conhecidos. */
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  "cartão crédito": "Cartão Crédito",
  "cartão débito": "Cartão Débito",
  transferência: "Transferência",
};

/** Métodos aceitos no formulário de registro de vendas do Admin. */
export const ADMIN_PAYMENT_METHODS: readonly string[] = [
  "dinheiro",
  "pix",
  "cartão crédito",
  "cartão débito",
  "transferência",
] as const;

export type CheckoutPaymentOption = {
  value: "pix" | "dinheiro" | "cartao";
  label: string;
  description: string;
};

/** Opções apresentadas ao cliente no fluxo de Checkout. */
export const CHECKOUT_PAYMENT_OPTIONS: readonly CheckoutPaymentOption[] = [
  { value: "pix", label: "PIX", description: "Pagamento instantâneo com desconto" },
  { value: "dinheiro", label: "Dinheiro na entrega", description: "Pague ao receber o pedido" },
  { value: "cartao", label: "Cartão na entrega", description: "Débito ou crédito na entrega" },
] as const;

/** Retorna o rótulo amigável de um método, com fallback para o próprio valor. */
export const getPaymentLabel = (method: string): string =>
  PAYMENT_METHOD_LABELS[method] ?? method;
