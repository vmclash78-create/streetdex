/**
 * Categorias de status de produtos e banners.
 */
export const PRODUCT_STATUS = {
  ACTIVE: "active",
  DRAFT: "draft",
  OUT_OF_STOCK: "out",
} as const;

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  [PRODUCT_STATUS.ACTIVE]: "Ativo",
  [PRODUCT_STATUS.DRAFT]: "Rascunho",
  [PRODUCT_STATUS.OUT_OF_STOCK]: "Esgotado",
};

export const PRODUCT_STATUS_COLORS: Record<string, string> = {
  [PRODUCT_STATUS.ACTIVE]: "bg-green-500/20 text-green-600 dark:text-green-400",
  [PRODUCT_STATUS.DRAFT]: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  [PRODUCT_STATUS.OUT_OF_STOCK]: "bg-destructive/20 text-destructive",
};

/**
 * Categorias de navegação do painel administrativo.
 */
export type AdminView = "dashboard" | "products" | "banners" | "sales" | "orders" | "coupons" | "finances" | "settings";

/**
 * Configurações padrão de áudio.
 */
export const AUDIO_CONFIG = {
  DEFAULT_VOLUME: 0.8,
  DEFAULT_PRESET: "classico",
} as const;
