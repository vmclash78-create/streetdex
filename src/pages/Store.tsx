import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
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
const CDN = "https://acdn-us.mitiendanube.com/stores/005/091/071";
const WHATSAPP = "5585992783973";

// ─── DATA ────────────────────────────────────────────────────────────────────

const navLinks = [
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

type Product = {
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

const products: Product[] = [
  {
    id: 1,
    name: "KIT PRINCESA E PRINCIPE CLASH ROYALE",
    price: 169.99,
    img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`,
    img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`,
    sizes: ["P", "M", "G", "GG", "XG"],
    freeShipping: true,
  },
  {
    id: 2,
    name: "CAMISA OLHAR + TIME",
    price: 84.99,
    oldPrice: 99.90,
    img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`,
    img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`,
    sizes: ["P", "M", "G", "GG", "XG"],
    freeShipping: true,
    colors: ["#000", "#fff", "#888"],
  },
  {
    id: 3,
    name: "CAMISA OLHAR APAIXONADO",
    price: 84.99,
    img: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`,
    img2: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`,
    sizes: ["PP", "P", "M", "G", "GG", "XG"],
    freeShipping: true,
    colors: ["#000", "#fff"],
  },
  {
    id: 4,
    name: "CAMISA ERICK PULGAR 2.0",
    price: 84.99,
    img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`,
    img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`,
    sizes: ["PP", "P", "M", "G", "GG", "XG"],
    freeShipping: true,
    colors: ["#c00", "#000", "#fff"],
  },
  {
    id: 5,
    name: "KIT ENROLADOS RAPUNZEL E JOSÉ",
    price: 169.99,
    oldPrice: 199.00,
    img: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`,
    img2: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`,
    sizes: ["P", "M", "G", "GG", "XG"],
    freeShipping: true,
  },
  {
    id: 6,
    name: "CAMISA OROCHI 4.0",
    price: 85.00,
    img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`,
    img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`,
    sizes: ["P", "M", "G", "GG", "XG"],
    freeShipping: true,
    colors: ["#c00", "#000", "#fff"],
  },
  {
    id: 7,
    name: "CAMISA ERICK PULGAR",
    price: 84.99,
    img: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`,
    img2: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`,
    sizes: ["P", "M", "G", "GG", "XG"],
    freeShipping: true,
    colors: ["#000", "#fff"],
  },
  {
    id: 8,
    name: "CAMISA BACO EXU DO BLUES",
    price: 84.95,
    img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`,
    img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`,
    sizes: ["P", "M", "G", "GG", "XG"],
    freeShipping: true,
    colors: ["#000", "#fff", "#d2b48c", "#c00"],
  },
  {
    id: 9,
    name: "CAMISA NEYMAR JR",
    price: 85.00,
    img: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`,
    img2: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`,
    sizes: ["P", "M", "G", "GG", "XG"],
    freeShipping: true,
    colors: ["#d2b48c", "#fff", "#000"],
  },
  {
    id: 10,
    name: "CAMISA OROCHI 3.0",
    price: 90.00,
    img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`,
    img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`,
    sizes: ["P", "M", "G", "GG", "XG"],
    freeShipping: true,
    colors: ["#000", "#fff", "#c00"],
  },
  {
    id: 11,
    name: "CAMISA FILIPE RET",
    price: 92.00,
    oldPrice: 100.00,
    img: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`,
    img2: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`,
    sizes: ["P", "M", "G", "GG", "XG"],
    freeShipping: true,
  },
  {
    id: 12,
    name: "KIT CAMISAS GOTEN E TRUNKS DRAGON BALL",
    price: 169.98,
    img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`,
    img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`,
    sizes: ["P", "M", "G", "GG", "XG"],
    freeShipping: true,
    colors: ["#fff", "#000"],
  },
  {
    id: 13,
    name: "CAMISA CRISTIANO R. Cr7",
    price: 85.00,
    oldPrice: 95.00,
    img: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`,
    img2: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`,
    sizes: ["P", "M", "G", "GG", "XG"],
    freeShipping: true,
    colors: ["#fff", "#000", "#d2b48c"],
  },
  {
    id: 14,
    name: "KIT CARROS CASAL Mcqueen e Sally",
    price: 170.00,
    oldPrice: 180.00,
    img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`,
    img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`,
    sizes: ["P", "M", "G", "GG", "XG"],
    freeShipping: true,
  },
  {
    id: 15,
    name: "CAMISA BACO RED",
    price: 85.00,
    img: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`,
    img2: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`,
    sizes: ["P", "M", "G", "GG", "XG"],
    freeShipping: true,
  },
  {
    id: 16,
    name: "CAMISA LOVE BACO",
    price: 85.00,
    img: `${CDN}/products/img_9527-2ebc70b83bd40ca1a617644287083362-480-0.webp`,
    img2: `${CDN}/products/img_9528-d32d6c557c60b13ed517644287165775-480-0.webp`,
    sizes: ["P", "M", "G", "GG", "XG"],
    freeShipping: true,
  },
];

const heroBanners = [
  { img: `${CDN}/themes/amazonas/2-slide-1770404284561-4963972633-0713ee8b7b0d3c27726d17f0755a3bd11770404287-480-0.webp?7172772863971010629`, cta: "Ver mais" },
  { img: `${CDN}/themes/amazonas/2-slide-1770404890729-4911396590-e0930bc3b860a8ee8b43cd3e3c0a25b11770404891-1024-1024.webp?7172772863971010629`, cta: "Conferir" },
  { img: `${CDN}/themes/amazonas/2-slide-1760882611297-7444640501-6d800da970b95bfeaf33b04532b9cecf1760882614-1024-1024.webp?7172772863971010629`, cta: "compre aqui" },
  { img: `${CDN}/themes/amazonas/2-slide-1730488980929-3985781362-1630789a06e837949f7cc6d51ba368dd1730488981-1024-1024.webp?7172772863971010629`, cta: "conferir tudo" },
  { img: `${CDN}/themes/amazonas/2-slide-1755815378030-4062347978-24c327312210fb86f51a9cd92b4f85681755815378-1024-1024.webp?7172772863971010629`, cta: "Ver mais" },
];

const infoStripImg = `${CDN}/themes/amazonas/2-img-833320502-1767889965-ce359877708e7ce7a3e777240d8b566e1767889965-240-0.webp?7172772863971010629`;

type CartItem = { cartId: string; product: Product; size: string; qty: number };
type AppView = "store" | "cart" | "product";

const formatPrice = (v: number) => `R$${v.toFixed(2).replace(".", ",")}`;
const pixPrice = (v: number) => `R$${(v * 0.98).toFixed(2).replace(".", ",")}`;
const discountPct = (old: number, cur: number) => Math.round(((old - cur) / old) * 100);
const fallbackImg = "https://placehold.co/400x500/f3f4f6/999?text=Produto";

// ─── DUARTT LOGO ─────────────────────────────────────────────────────────────

const DuarttLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const textSize = size === "sm" ? "text-xl" : size === "lg" ? "text-4xl" : "text-3xl";
  const crownSize = size === "sm" ? 10 : size === "lg" ? 16 : 13;
  return (
    <div className="flex flex-col items-center leading-none">
      <Crown size={crownSize} className="text-foreground mb-[-2px]" strokeWidth={1.5} />
      <span className={`${textSize} font-light tracking-tight text-foreground`} style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
        duartt
      </span>
    </div>
  );
};

// ─── HERO CAROUSEL ───────────────────────────────────────────────────────────

const HeroCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {heroBanners.map((banner, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0 relative bg-black">
              <img src={banner.img} alt={`Carrossel ${i + 1}`} className="w-full h-auto object-cover" style={{ maxHeight: 500 }} />
              {banner.cta && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                  <button className="bg-foreground text-background font-semibold px-6 py-2.5 rounded text-sm hover:opacity-90 transition-opacity uppercase">
                    {banner.cta}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <button onClick={scrollPrev} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-card/80 hover:bg-card flex items-center justify-center text-foreground transition-colors shadow-md">
        <ChevronLeft size={24} />
      </button>
      <button onClick={scrollNext} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-card/80 hover:bg-card flex items-center justify-center text-foreground transition-colors shadow-md">
        <ChevronRight size={24} />
      </button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroBanners.map((_, i) => (
          <button key={i} onClick={() => emblaApi?.scrollTo(i)}
            className="rounded-full transition-all"
            style={{ width: 10, height: 10, background: selectedIndex === i ? "#333" : "rgba(255,255,255,0.6)" }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── PRODUCT DETAIL ──────────────────────────────────────────────────────────

const ProductDetail = ({
  product, onBack, onAddToCart, onGoToCart, cartCount,
}: {
  product: Product; onBack: () => void;
  onAddToCart: (item: CartItem) => void; onGoToCart: () => void; cartCount: number;
}) => {
  const [selectedSize, setSelectedSize] = useState("");
  const [imgIndex, setImgIndex] = useState(0);
  const images = [product.img, product.img2 || product.img];

  return (
    <div className="min-h-screen bg-card flex flex-col max-w-5xl mx-auto">
      <header className="sticky top-0 z-50 bg-card flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={onBack}><ChevronLeft size={26} className="text-foreground" /></button>
        <DuarttLogo size="sm" />
        <button onClick={onGoToCart} className="relative">
          <ShoppingCart size={22} className="text-foreground" />
          {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[9px] font-bold w-[17px] h-[17px] rounded-full flex items-center justify-center">{cartCount}</span>}
        </button>
      </header>

      <div className="px-4 pt-3 pb-1">
        <h1 className="text-lg text-foreground font-medium mt-1">{product.name}</h1>
      </div>

      <div className="relative px-4">
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-1.5"
          onScroll={(e) => { const el = e.target as HTMLElement; setImgIndex(Math.round(el.scrollLeft / (el.clientWidth * 0.62))); }}>
          {images.map((img, i) => (
            <div key={i} className="flex-shrink-0 snap-start overflow-hidden rounded-xl bg-muted" style={{ width: "62%", aspectRatio: "3/4" }}>
              <img src={img} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-1.5 py-3">
          {images.map((_, i) => <div key={i} className="rounded-full" style={{ width: imgIndex === i ? 8 : 5, height: imgIndex === i ? 8 : 5, background: imgIndex === i ? "hsl(var(--foreground))" : "#ccc" }} />)}
        </div>
      </div>

      <div className="px-4 flex gap-2 mb-3">
        {product.freeShipping && <span className="text-[0.68rem] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Frete grátis</span>}
        {product.oldPrice && <span className="text-[0.68rem] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{discountPct(product.oldPrice, product.price)}% OFF</span>}
      </div>

      <div className="px-4 pt-1 pb-3">
        <p className="text-sm text-foreground font-semibold mb-2">Tamanho</p>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button key={s} onClick={() => setSelectedSize(s)}
              className="rounded-lg border text-sm font-medium px-5 py-2.5 transition-all"
              style={{ background: selectedSize === s ? "hsl(var(--foreground))" : "hsl(var(--muted))", color: selectedSize === s ? "#fff" : "hsl(var(--foreground))", borderColor: selectedSize === s ? "hsl(var(--foreground))" : "hsl(var(--border))" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-3">
        {product.oldPrice && <p className="text-muted-foreground text-sm line-through">{formatPrice(product.oldPrice)}</p>}
        <p className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</p>
        <p className="text-sm mt-0.5"><span className="text-green-600 font-semibold">{pixPrice(product.price)}</span> <span className="text-muted-foreground">com Pix</span></p>
      </div>

      <div className="px-4 pb-3">
        <button onClick={() => { if (!selectedSize) return; onAddToCart({ cartId: `${product.id}-${selectedSize}-${Date.now()}`, product, size: selectedSize, qty: 1 }); }}
          disabled={!selectedSize} className="w-full bg-foreground text-background font-semibold py-4 rounded-xl text-base disabled:opacity-40">Comprar</button>
      </div>

      <div className="px-4 pb-8">
        <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-muted rounded-xl px-4 py-3">
          <MessageCircle size={22} className="text-green-600 flex-shrink-0" />
          <p className="text-sm text-foreground">Dúvidas? Fale pelo <span className="text-green-600 font-semibold">WhatsApp</span></p>
        </a>
      </div>
    </div>
  );
};

// ─── PRODUCT CARD (Duartt style) ─────────────────────────────────────────────

const ProductCard = ({ product, onClick }: { product: Product; onClick: () => void }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group bg-card border border-border overflow-hidden cursor-pointer relative flex flex-col rounded-lg"
    >
      <div className="w-full aspect-[4/5] overflow-hidden bg-muted relative">
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.oldPrice && <span className="text-[0.6rem] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-sm">{discountPct(product.oldPrice, product.price)}% OFF</span>}
          {product.freeShipping && <span className="text-[0.58rem] font-semibold bg-green-500 text-white px-1.5 py-0.5 rounded-sm">Frete grátis</span>}
        </div>

        <img
          src={hovered && product.img2 ? product.img2 : product.img}
          alt={product.name}
          className="w-full h-full object-cover product-img-zoom transition-opacity duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
        />

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex flex-col items-center justify-end pb-3 gap-2 opacity-0 group-hover:opacity-100">
          <div className="flex flex-wrap gap-1 justify-center px-2 mb-1">
            {product.sizes.map((s) => (
              <span key={s} className="bg-card text-foreground text-[0.6rem] font-semibold px-2 py-1 rounded border border-border hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                onClick={(e) => { e.stopPropagation(); }}>
                {s}
              </span>
            ))}
          </div>
          <button className="bg-foreground text-background text-xs font-bold px-6 py-2 rounded hover:opacity-90 transition-opacity" onClick={(e) => { e.stopPropagation(); onClick(); }}>
            Comprar
          </button>
          <button className="bg-card text-foreground text-xs font-medium px-6 py-1.5 rounded border border-border hover:bg-muted transition-colors" onClick={(e) => { e.stopPropagation(); onClick(); }}>
            Espiar
          </button>
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col">
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1 mb-2">
            {product.colors.map((c, i) => (
              <span key={i} className="w-3.5 h-3.5 rounded-full border border-border" style={{ background: c }} />
            ))}
          </div>
        )}

        <p className="text-[0.82rem] text-foreground leading-snug line-clamp-2 mb-2 flex-1">{product.name}</p>

        <div>
          {product.oldPrice && <p className="text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice)}</p>}
          <p className="text-[1.05rem] font-bold text-foreground">{formatPrice(product.price)}</p>
          <p className="text-[0.7rem] mt-0.5"><span className="text-green-600 font-semibold">{pixPrice(product.price)}</span> <span className="text-muted-foreground">com Pix</span></p>
        </div>
      </div>
    </div>
  );
};

// ─── CART VIEW ────────────────────────────────────────────────────────────────

const CartView = ({ cartItems, onBack, onUpdateQty, onRemove, onClearAll }: {
  cartItems: CartItem[]; onBack: () => void; onUpdateQty: (id: string, q: number) => void; onRemove: (id: string) => void; onClearAll: () => void;
}) => {
  const [note, setNote] = useState("");
  const total = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col max-w-5xl mx-auto">
        <header className="bg-card border-b border-border sticky top-0 z-50 flex items-center px-4 py-3">
          <button onClick={onBack}><ChevronLeft size={22} className="text-foreground" /></button>
          <div className="flex-1 flex justify-center"><DuarttLogo size="sm" /></div>
          <div className="w-8" />
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
          <ShoppingCart size={64} className="text-muted-foreground/30" />
          <h2 className="text-2xl font-semibold text-foreground">Carrinho vazio</h2>
          <p className="text-muted-foreground">Navegue pelo catálogo e adicione itens!</p>
          <button onClick={onBack} className="bg-foreground text-background font-semibold py-3.5 px-8 rounded-xl">Continuar navegando</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-5xl mx-auto">
      <header className="bg-card border-b border-border sticky top-0 z-50 flex items-center px-4 py-3">
        <button onClick={onBack}><ChevronLeft size={22} className="text-foreground" /></button>
        <div className="flex-1 flex justify-center"><DuarttLogo size="sm" /></div>
        <div className="w-8" />
      </header>
      <div className="flex-1 px-4 pt-4 pb-40">
        <h1 className="font-bold text-lg text-foreground mb-4">Carrinho ({cartItems.length})</h1>
        <div className="flex flex-col gap-3 mb-3">
          {cartItems.map((item) => (
            <div key={item.cartId} className="bg-card rounded-xl border border-border p-3 relative shadow-sm">
              <button onClick={() => onRemove(item.cartId)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-muted flex items-center justify-center"><X size={13} className="text-muted-foreground" /></button>
              <div className="flex gap-3 items-start">
                <img src={item.product.img} alt="" className="rounded-lg object-cover flex-shrink-0 w-[76px] h-[76px]" onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }} />
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-sm text-foreground">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.size}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-base font-bold text-foreground">{formatPrice(item.product.price)}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onRemove(item.cartId)}><Trash2 size={16} className="text-muted-foreground" /></button>
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button onClick={() => onUpdateQty(item.cartId, item.qty - 1)} className="px-2 py-1 hover:bg-muted"><Minus size={14} /></button>
                        <span className="text-sm font-bold px-2">{item.qty}</span>
                        <button onClick={() => onUpdateQty(item.cartId, item.qty + 1)} className="px-2 py-1 hover:bg-muted"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mb-4"><button onClick={onClearAll} className="text-foreground text-sm underline">Limpar carrinho</button></div>
        <button onClick={onBack} className="flex items-center justify-center gap-1 text-foreground text-base font-semibold w-full mb-6">Ver mais produtos <ChevronRight size={18} /></button>
        <div className="mb-4">
          <h2 className="text-sm font-bold text-foreground mb-2">Observação</h2>
          <textarea className="w-full bg-card border border-border rounded-xl p-3 text-sm outline-none resize-none" rows={3} maxLength={200} placeholder="Observação do pedido..." value={note} onChange={(e) => setNote(e.target.value)} />
          <p className="text-[0.7rem] text-muted-foreground text-right mt-0.5">{note.length}/200</p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground mb-2">Entrega</h2>
          <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
            <Truck size={20} className="text-foreground flex-shrink-0" />
            <p className="text-sm text-foreground">Enviamos via CORREIOS para todo o Brasil</p>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl bg-card border-t border-border px-4 pt-3 pb-4 shadow-2xl">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-foreground">Total:</span>
          <span className="text-lg font-bold text-foreground">{formatPrice(total)}</span>
        </div>
        <p className="text-xs text-green-600 text-right mb-2">{pixPrice(total)} com Pix</p>
        <button onClick={() => {
          const msg = cartItems.map((i) => `• ${i.product.name} (${i.size}) x${i.qty} — ${formatPrice(i.product.price * i.qty)}`).join("\n");
          window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Quero finalizar meu pedido:\n\n${msg}\n\nTotal: ${formatPrice(total)}\n\n${note ? `Obs: ${note}` : ""}`)}`, "_blank");
        }} className="w-full bg-foreground text-background font-semibold py-3.5 rounded-xl text-base">Finalizar pelo WhatsApp</button>
      </div>
    </div>
  );
};

// ─── COOKIE CONSENT ──────────────────────────────────────────────────────────

const CookieConsent = () => {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("cookie_consent") === "true");
  if (dismissed) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] bg-foreground px-4 py-3 flex items-center justify-center gap-4" style={{ background: "rgba(0,0,0,0.9)" }}>
      <p className="text-xs leading-relaxed text-white">
        Ao navegar por este site <strong>você aceita o uso de cookies</strong> para agilizar a sua experiência de compra.
      </p>
      <button
        onClick={() => { localStorage.setItem("cookie_consent", "true"); setDismissed(true); }}
        className="bg-card text-foreground text-xs font-bold px-5 py-2 rounded border border-border flex-shrink-0 hover:bg-muted transition-colors"
      >
        ENTENDI
      </button>
    </div>
  );
};

// ─── MAIN STORE ───────────────────────────────────────────────────────────────

const Store = () => {
  const [view, setView] = useState<AppView>("store");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [prodDropdownOpen, setProdDropdownOpen] = useState(false);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === item.product.id && i.size === item.size);
      if (existing) return prev.map((i) => i.cartId === existing.cartId ? { ...i, qty: i.qty + item.qty } : i);
      return [...prev, item];
    });
  };

  const updateQty = (cartId: string, qty: number) => {
    if (qty < 1) setCartItems((prev) => prev.filter((i) => i.cartId !== cartId));
    else setCartItems((prev) => prev.map((i) => i.cartId === cartId ? { ...i, qty } : i));
  };

  const removeItem = (cartId: string) => setCartItems((prev) => prev.filter((i) => i.cartId !== cartId));

  const filteredProducts = searchQuery
    ? products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  if (view === "product" && selectedProduct) {
    return <ProductDetail product={selectedProduct} onBack={() => setView("store")} onAddToCart={(item) => { addToCart(item); setView("store"); }} onGoToCart={() => setView("cart")} cartCount={cartCount} />;
  }

  if (view === "cart") {
    return <CartView cartItems={cartItems} onBack={() => setView("store")} onUpdateQty={updateQty} onRemove={removeItem} onClearAll={() => setCartItems([])} />;
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ═══ TOP BAR 1 — Red announcement ═══ */}
      <div className="bg-card text-center py-1.5 text-xs border-b border-border">
        <span className="font-bold text-red-600">CONDIÇÕES ESPECIAIS DE FRETE</span>
        <span className="text-foreground"> esperando por você! </span>
        <span className="font-bold text-red-600 underline cursor-pointer">CLIQUE AQUI</span>
        <span className="text-foreground"> e saiba mais</span>
      </div>

      {/* ═══ TOP BAR 2 — Dark info bar ═══ */}
      <div className="text-center py-1.5 text-[0.7rem] text-white" style={{ background: "hsl(270, 20%, 10%)" }}>
        ENVIO DE CAMISA PERSONALIZADA com 5 dias Úteis! | CUPOM: HAPPY | ❤️ FRETE GRÁTIS APARTIR DE R$399,99 👀🚨
      </div>

      {/* ═══ HEADER ═══ */}
      <header className="bg-card sticky top-0 z-50 border-b border-border">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground">
            <Menu size={24} />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2">
            <DuarttLogo />
          </div>

          <button onClick={() => setView("cart")} className="flex items-center text-foreground hover:text-muted-foreground transition-colors relative">
            <ShoppingCart size={22} strokeWidth={1.5} />
            {cartCount > 0 && <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[9px] font-bold w-[17px] h-[17px] rounded-full flex items-center justify-center">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* ═══ NAV BAR ═══ */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-[1200px] mx-auto flex items-center justify-center gap-1 px-4 py-0 overflow-x-auto scrollbar-none">
          {navLinks.map((link) => (
            <div key={link.key} className="relative flex-shrink-0"
              onMouseEnter={() => link.dropdown && setProdDropdownOpen(true)}
              onMouseLeave={() => link.dropdown && setProdDropdownOpen(false)}
            >
              <button
                onClick={() => {
                  if (link.dropdown) {
                    setProdDropdownOpen(!prodDropdownOpen);
                  } else if (link.key === "Contato") {
                    window.open(`https://wa.me/${WHATSAPP}`, "_blank");
                  }
                }}
                className="flex items-center gap-1 px-3 py-3 text-sm transition-colors whitespace-nowrap hover:text-muted-foreground text-foreground"
              >
                {link.label}
                {link.dropdown && <ChevronDown size={14} className="ml-0.5" />}
              </button>

              {link.dropdown && prodDropdownOpen && (
                <div className="absolute top-full left-0 bg-card border border-border shadow-lg rounded-b-md z-50 min-w-[220px] py-1">
                  {link.dropdown.map((sub) => (
                    <button key={sub} onClick={() => { setProdDropdownOpen(false); }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* ═══ SIDEBAR DRAWER ═══ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute top-0 left-0 h-full w-[300px] bg-card shadow-2xl flex flex-col animate-in slide-in-from-left duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
              <DuarttLogo size="sm" />
              <button onClick={() => setSidebarOpen(false)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <nav className="flex-1 py-3 overflow-y-auto">
              {navLinks.map((link) => (
                <button key={link.key} onClick={() => { setSidebarOpen(false); }}
                  className="block w-full text-left px-5 py-3 text-sm text-foreground hover:bg-muted transition-colors">
                  {link.label}
                </button>
              ))}
              <div className="border-t border-border my-2 mx-5" />
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-3 hover:bg-muted">
                <MessageCircle size={18} className="text-green-600" />
                <span className="text-sm text-foreground">Contato via WhatsApp</span>
              </a>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-3 hover:bg-muted">
                <Headphones size={18} className="text-foreground" />
                <span className="text-sm text-foreground">Atendimento</span>
              </a>
              <button className="flex items-center gap-3 px-5 py-3 hover:bg-muted w-full text-left">
                <Truck size={18} className="text-foreground" />
                <span className="text-sm text-foreground">Rastrear pedido</span>
              </button>
              <button className="flex items-center gap-3 px-5 py-3 hover:bg-muted w-full text-left">
                <Heart size={18} className="text-foreground" />
                <span className="text-sm text-foreground">Lista de desejos</span>
              </button>
              <div className="border-t border-border my-2 mx-5" />
              <div className="px-5 py-2">
                <p className="text-[0.65rem] uppercase font-bold text-muted-foreground tracking-widest mb-2">Categorias</p>
                {["Camisas Personalizadas", "Camisas Casais", "Camisas Jogadores", "Camisas Olhar Apaixonado", "Camisas Baco Exu do Blues"].map((cat) => (
                  <button key={cat} onClick={() => setSidebarOpen(false)} className="block w-full text-left px-0 py-2 text-sm text-foreground hover:text-primary transition-colors">
                    {cat}
                  </button>
                ))}
              </div>
              <div className="border-t border-border my-2 mx-5" />
              <button className="flex items-center gap-3 px-5 py-3 hover:bg-muted w-full text-left">
                <span className="text-sm text-foreground">Guia de medidas</span>
              </button>
              <button className="flex items-center gap-3 px-5 py-3 hover:bg-muted w-full text-left">
                <span className="text-sm text-foreground">Perguntas Frequentes</span>
              </button>
              <button className="flex items-center gap-3 px-5 py-3 hover:bg-muted w-full text-left">
                <span className="text-sm text-foreground">Política de Trocas</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* ═══ HERO CAROUSEL ═══ */}
      <HeroCarousel />

      {/* ═══ TICKER BAR ═══ */}
      <div className="py-2.5 overflow-hidden whitespace-nowrap" style={{ background: "hsl(270, 20%, 10%)" }}>
        <div className="animate-marquee inline-block text-white text-sm font-bold tracking-wide">
          <span className="mx-8">Cupom: PRIMEIRACOMPRA &nbsp;|&nbsp; Parcelamos até 12x &nbsp;|&nbsp; Enviamos para todo o Brasil &nbsp;|&nbsp; Frete Grátis acima de R$399,99 &nbsp;|&nbsp;</span>
          <span className="mx-8">Cupom: PRIMEIRACOMPRA &nbsp;|&nbsp; Parcelamos até 12x &nbsp;|&nbsp; Enviamos para todo o Brasil &nbsp;|&nbsp; Frete Grátis acima de R$399,99 &nbsp;|&nbsp;</span>
        </div>
      </div>

      {/* ═══ INFO STRIP ═══ */}
      <div className="bg-card border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-5">
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-foreground/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle size={22} className="text-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Canais de Atendimento</p>
              <p className="text-xs text-muted-foreground">Whatsapp e Instagram</p>
            </div>
          </a>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-foreground/20 flex items-center justify-center flex-shrink-0">
              <Percent size={22} className="text-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">CUPOM • Ganhe até 5% OFF</p>
              <p className="text-xs text-muted-foreground font-mono">PRIMEIRACOMPRA</p>
            </div>
          </div>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              <img src={infoStripImg} alt="Camisa com estampa diferente?" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Camisa com estampa diferente?</p>
              <p className="text-xs text-muted-foreground">Nos chame que fazemos para você!</p>
            </div>
          </a>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-foreground/20 flex items-center justify-center flex-shrink-0">
              <Truck size={22} className="text-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Fretes Econômicos</p>
              <p className="text-xs text-muted-foreground">Calcule sem compromisso.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PRODUCTS ═══ */}
      <main className="max-w-[1200px] mx-auto px-4 pt-8 pb-12">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Search size={40} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-primary uppercase">BEST SELLERS</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onClick={() => { setSelectedProduct(p); setView("product"); }} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: "hsl(270, 20%, 8%)", color: "#fff" }}>
        <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex flex-col items-start mb-3">
                <Crown size={14} className="text-white mb-[-2px]" strokeWidth={1.5} />
                <span className="text-2xl font-light tracking-tight" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>duartt</span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">Camisas personalizadas com qualidade e estilo.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Navegação</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setView("store")} className="text-sm text-white/60 hover:text-white transition-colors">Início</button></li>
                <li><button onClick={() => setView("store")} className="text-sm text-white/60 hover:text-white transition-colors">Catálogo</button></li>
                <li><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Contato</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-white/60"><MessageCircle size={14} /> WhatsApp</li>
                <li className="flex items-center gap-2 text-sm text-white/60"><Truck size={14} /> Entrega via Correios</li>
              </ul>
            </div>
          </div>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full max-w-sm mx-auto py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors mb-6">
            <MessageCircle size={18} /> Falar no WhatsApp
          </a>
          <div className="border-t border-white/10 pt-4">
            <p className="text-center text-xs text-white/30">© {new Date().getFullYear()} Duartt. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* ═══ FLOATING WHATSAPP ═══ */}
      <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors">
        <MessageCircle size={26} className="text-white" />
      </a>

      {/* ═══ FLOATING DISCOUNT BADGE (bottom-left) ═══ */}
      <div className="fixed bottom-5 left-5 z-50 w-14 h-14 bg-red-600 rounded-full flex flex-col items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
        <span className="text-white text-[0.65rem] font-bold leading-none">5%</span>
        <span className="text-white text-[0.5rem] font-bold leading-none">OFF</span>
      </div>

      {/* ═══ COOKIE CONSENT ═══ */}
      <CookieConsent />
    </div>
  );
};

export default Store;
