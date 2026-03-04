import {
  ShoppingCart,
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Trash2,
  MessageCircle,
  Minus,
  Plus,
  Menu,
  User,
  Truck,
  Percent,
  Headphones,
  Heart,
  ChevronDown,
  Crown,
} from "lucide-react";

// ─── CDN BASE ────────────────────────────────────────────────────────────────
export const CDN = "https://acdn-us.mitiendanube.com/stores/005/091/071";
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

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
export const products: Product[] = [
  { id: 1, name: "KIT PRINCESA E PRINCIPE CLASH ROYALE", price: 169.99, img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`, img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`, sizes: ["P", "M", "G", "GG", "XG"], freeShipping: true },
  { id: 2, name: "CAMISA OLHAR + TIME", price: 84.99, oldPrice: 99.90, img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`, img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`, sizes: ["P", "M", "G", "GG", "XG"], freeShipping: true, colors: ["#000", "#fff", "#888"] },
  { id: 3, name: "CAMISA OLHAR APAIXONADO", price: 84.99, img: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`, img2: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`, sizes: ["PP", "P", "M", "G", "GG", "XG"], freeShipping: true, colors: ["#000", "#fff"] },
  { id: 4, name: "CAMISA ERICK PULGAR 2.0", price: 84.99, img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`, img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`, sizes: ["PP", "P", "M", "G", "GG", "XG"], freeShipping: true, colors: ["#c00", "#000", "#fff"] },
  { id: 5, name: "KIT ENROLADOS RAPUNZEL E JOSÉ", price: 169.99, oldPrice: 199.00, img: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`, img2: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`, sizes: ["P", "M", "G", "GG", "XG"], freeShipping: true },
  { id: 6, name: "CAMISA OROCHI 4.0", price: 85.00, img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`, img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`, sizes: ["P", "M", "G", "GG", "XG"], freeShipping: true, colors: ["#c00", "#000", "#fff"] },
  { id: 7, name: "CAMISA ERICK PULGAR", price: 84.99, img: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`, img2: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`, sizes: ["P", "M", "G", "GG", "XG"], freeShipping: true, colors: ["#000", "#fff"] },
  { id: 8, name: "CAMISA BACO EXU DO BLUES", price: 84.95, img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`, img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`, sizes: ["P", "M", "G", "GG", "XG"], freeShipping: true, colors: ["#000", "#fff", "#d2b48c", "#c00"] },
  { id: 9, name: "CAMISA NEYMAR JR", price: 85.00, img: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`, img2: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`, sizes: ["P", "M", "G", "GG", "XG"], freeShipping: true, colors: ["#d2b48c", "#fff", "#000"] },
  { id: 10, name: "CAMISA OROCHI 3.0", price: 90.00, img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`, img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`, sizes: ["P", "M", "G", "GG", "XG"], freeShipping: true, colors: ["#000", "#fff", "#c00"] },
  { id: 11, name: "CAMISA FILIPE RET", price: 92.00, oldPrice: 100.00, img: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`, img2: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`, sizes: ["P", "M", "G", "GG", "XG"], freeShipping: true },
  { id: 12, name: "KIT CAMISAS GOTEN E TRUNKS DRAGON BALL", price: 169.98, img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`, img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`, sizes: ["P", "M", "G", "GG", "XG"], freeShipping: true, colors: ["#fff", "#000"] },
  { id: 13, name: "CAMISA CRISTIANO R. Cr7", price: 85.00, oldPrice: 95.00, img: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`, img2: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`, sizes: ["P", "M", "G", "GG", "XG"], freeShipping: true, colors: ["#fff", "#000", "#d2b48c"] },
  { id: 14, name: "KIT CARROS CASAL Mcqueen e Sally", price: 170.00, oldPrice: 180.00, img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`, img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`, sizes: ["P", "M", "G", "GG", "XG"], freeShipping: true },
  { id: 15, name: "CAMISA BACO RED", price: 85.00, img: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`, img2: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`, sizes: ["P", "M", "G", "GG", "XG"], freeShipping: true },
  { id: 16, name: "CAMISA LOVE BACO", price: 85.00, img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`, img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`, sizes: ["P", "M", "G", "GG", "XG"], freeShipping: true },
];

export const heroBanners = [
  { img: `${CDN}/themes/amazonas/2-slide-1770404284561-4963972633-0713ee8b7b0d3c27726d17f0755a3bd11770404287-480-0.webp?7172772863971010629`, cta: "Ver mais" },
  { img: `${CDN}/themes/amazonas/2-slide-1770404890729-4911396590-e0930bc3b860a8ee8b43cd3e3c0a25b11770404891-1024-1024.webp?7172772863971010629`, cta: "Conferir" },
  { img: `${CDN}/themes/amazonas/2-slide-1760882611297-7444640501-6d800da970b95bfeaf33b04532b9cecf1760882614-1024-1024.webp?7172772863971010629`, cta: "compre aqui" },
  { img: `${CDN}/themes/amazonas/2-slide-1730488980929-3985781362-1630789a06e837949f7cc6d51ba368dd1730488981-1024-1024.webp?7172772863971010629`, cta: "conferir tudo" },
  { img: `${CDN}/themes/amazonas/2-slide-1755815378030-4062347978-24c327312210fb86f51a9cd92b4f85681755815378-1024-1024.webp?7172772863971010629`, cta: "Ver mais" },
];

export const infoStripImg = `${CDN}/themes/amazonas/2-img-833320502-1767889965-ce359877708e7ce7a3e777240d8b566e1767889965-240-0.webp?7172772863971010629`;
