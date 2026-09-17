// ─── CDN BASE ────────────────────────────────────────────────────────────────
const CDN = "https://acdn-us.mitiendanube.com/stores/005/091/071";
export const WHATSAPP = "";

// ─── TYPES ───────────────────────────────────────────────────────────────────
export type Measurement = { size: string; chest?: number; length?: number; sleeve?: number };
export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  img: string;
  img2?: string;
  sizes: string[];
  freeShipping?: boolean;
  colors?: string[];
  description?: string;
  measurements?: Measurement[];
  stock?: number;
};

export type CartItem = { cartId: string; product: Product; size: string; qty: number };
export type AppView = "store" | "cart" | "product" | "checkout" | "order-success";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
// Fonte real vive em `@/lib/format`. Re-exportamos aqui como barrel-bridge
// para não quebrar os 6+ arquivos que ainda importam de `./storeData`.
export { formatPrice, pixPrice, discountPct } from "@/lib/format";
export const fallbackImg = "https://placehold.co/400x500/f3f4f6/999?text=Produto";

// ─── NAV LINKS ───────────────────────────────────────────────────────────────
export const navLinks = [
  { label: "Início", key: "Início" },
  {
    label: "Produtos",
    key: "Produtos",
    dropdown: [
      "Camisas Casais",
      "Camisas Jogadores",
      "Camisas Olhar Apaixonado",
      "Camisas Baco Exu do Blues",
    ],
  },
  { label: "Contato", key: "Contato" },
  { label: "Guia de medidas", key: "Guia" },
  { label: "Camisas Jogadores", key: "Camisas Jogadores" },
  { label: "Camisas Casais", key: "Camisas Casais" },
  { label: "Perguntas Frequentes", key: "FAQ" },
];

export const heroBanners: { img: string; cta: string; active?: boolean }[] = [];

export const infoStripImg = `${CDN}/themes/amazonas/2-img-833320502-1767889965-ce359877708e7ce7a3e777240d8b566e1767889965-240-0.webp?7172772863971010629`;
