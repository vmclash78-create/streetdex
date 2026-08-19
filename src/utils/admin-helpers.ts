import { DBProduct } from "@/hooks/useStoreData";
import { PRODUCT_STATUS_COLORS, PRODUCT_STATUS_LABELS } from "@/constants/admin";

/**
 * Retorna a cor semântica do Badge baseada no status do produto.
 */
export const getProductStatusColor = (status: string): string => {
  return PRODUCT_STATUS_COLORS[status] || "bg-muted text-muted-foreground";
};

/**
 * Retorna o rótulo legível do status do produto.
 */
export const getProductStatusLabel = (status: string): string => {
  return PRODUCT_STATUS_LABELS[status] || status;
};

/**
 * Calcula a margem de lucro (markup) baseada no preço e custo.
 */
export const calculateMarkup = (price: number, cost: number): string | null => {
  if (!price || !cost || cost <= 0) return null;
  const margin = ((price - cost) / cost) * 100;
  return margin.toFixed(1).replace(".", ",");
};
