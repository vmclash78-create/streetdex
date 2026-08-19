/**
 * Formatação centralizada de valores exibidos ao usuário.
 * Fonte única para preços, datas e descontos — evita divergências entre Admin e Storefront.
 */

/** Formata um número como preço em BRL: `R$1.234,56`. Tolera strings numéricas. */
export const formatPrice = (value: number | string | null | undefined): string => {
  const n = Number(value ?? 0);
  return `R$${n.toFixed(2).replace(".", ",")}`;
};

/** Formata uma data no formato `YYYY-MM-DD` (ou ISO) para `dd/mm/aaaa` em pt-BR. */
export const formatDate = (input: string): string => {
  // Anexa horário fixo para evitar shift de timezone em datas puras (YYYY-MM-DD).
  const iso = input.length === 10 ? `${input}T12:00:00` : input;
  return new Date(iso).toLocaleDateString("pt-BR");
};

/** Aplica desconto percentual e devolve string formatada em BRL. */
export const pixPrice = (value: number, discountPercent = 2): string =>
  formatPrice(value * (1 - discountPercent / 100));

/** Percentual inteiro de desconto entre preço antigo e atual. */
export const discountPct = (oldPrice: number, currentPrice: number): number => {
  if (!oldPrice) return 0;
  return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
};
