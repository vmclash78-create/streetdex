// ─── CDN BASE ────────────────────────────────────────────────────────────────
const CDN = "https://acdn-us.mitiendanube.com/stores/005/091/071";
export const WHATSAPP = "5585992783973";

// ─── TYPES ───────────────────────────────────────────────────────────────────
export type Product = {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  img: string;
  img2?: string;
  sizes: string[];
  freeShipping?: boolean;
  colors?: string[];
};

export type CartItem = { cartId: string; product: Product; size: string; qty: number };
export type AppView = "store" | "cart" | "product" | "checkout" | "order-success";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
export const formatPrice = (v: number) => `R$${v.toFixed(2).replace(".", ",")}`;
export const pixPrice = (v: number) => `R$${(v * 0.98).toFixed(2).replace(".", ",")}`;
export const discountPct = (old: number, cur: number) => Math.round(((old - cur) / old) * 100);
export const fallbackImg = "https://placehold.co/400x500/f3f4f6/999?text=Produto";

// ─── NAV LINKS ───────────────────────────────────────────────────────────────
export const navLinks = [
  { label: "Início", key: "Início" },
  {
    label: "Produtos",
    key: "Produtos",
    dropdown: [
      "Camisas Personalizadas",
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

export const heroBanners = [
  { img: `${CDN}/themes/amazonas/2-slide-1770404284561-4963972633-0713ee8b7b0d3c27726d17f0755a3bd11770404287-480-0.webp?7172772863971010629`, cta: "Ver mais" },
  { img: `${CDN}/themes/amazonas/2-slide-1770404890729-4911396590-e0930bc3b860a8ee8b43cd3e3c0a25b11770404891-1024-1024.webp?7172772863971010629`, cta: "Conferir" },
  { img: `${CDN}/themes/amazonas/2-slide-1760882611297-7444640501-6d800da970b95bfeaf33b04532b9cecf1760882614-1024-1024.webp?7172772863971010629`, cta: "compre aqui" },
  { img: `${CDN}/themes/amazonas/2-slide-1730488980929-3985781362-1630789a06e837949f7cc6d51ba368dd1730488981-1024-1024.webp?7172772863971010629`, cta: "conferir tudo" },
  { img: `${CDN}/themes/amazonas/2-slide-1755815378030-4062347978-24c327312210fb86f51a9cd92b4f85681755815378-1024-1024.webp?7172772863971010629`, cta: "Ver mais" },
];

export const infoStripImg = `${CDN}/themes/amazonas/2-img-833320502-1767889965-ce359877708e7ce7a3e777240d8b566e1767889965-240-0.webp?7172772863971010629`;
