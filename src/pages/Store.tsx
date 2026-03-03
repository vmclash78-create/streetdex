import { useState, useMemo } from "react";
import { Search, MessageCircle, Percent, Truck, SlidersHorizontal, X } from "lucide-react";
import StoreHeader from "@/components/store/StoreHeader";
import HeroCarousel from "@/components/store/HeroCarousel";
import ProductCard from "@/components/store/ProductCard";
import ProductDetail from "@/components/store/ProductDetail";
import CartView from "@/components/store/CartView";
import CookieConsent from "@/components/store/CookieConsent";
import StoreFooter from "@/components/store/StoreFooter";
import { type CartItem, type AppView, WHATSAPP, infoStripImg, formatPrice } from "@/components/store/storeData";
import { useProducts, type DBProduct } from "@/hooks/useStoreData";

const ALL_SIZES = ["PP", "P", "M", "G", "GG", "XG"];
const PRICE_RANGES = [
  { label: "Até R$90", min: 0, max: 90 },
  { label: "R$90 - R$150", min: 90, max: 150 },
  { label: "Acima de R$150", min: 150, max: 9999 },
];

const Store = () => {
  const [view, setView] = useState<AppView>("store");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<DBProduct | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: dbProducts, isLoading } = useProducts();

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  // Convert DBProduct to Product for cart/detail compatibility
  const toProduct = (p: DBProduct) => ({
    id: parseInt(p.id.slice(0, 8), 16),
    name: p.name,
    price: Number(p.price),
    oldPrice: p.old_price ? Number(p.old_price) : undefined,
    img: p.img,
    img2: p.img2 || undefined,
    sizes: p.sizes,
    freeShipping: p.free_shipping,
    colors: p.colors || undefined,
  });

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

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  };

  const filteredProducts = useMemo(() => {
    if (!dbProducts) return [];
    let result = dbProducts.filter((p) => p.status === "active");

    if (searchQuery) {
      result = result.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedSizes.length > 0) {
      result = result.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    }
    if (selectedPriceRange !== null) {
      const range = PRICE_RANGES[selectedPriceRange];
      result = result.filter((p) => Number(p.price) >= range.min && Number(p.price) < range.max);
    }
    return result;
  }, [dbProducts, searchQuery, selectedSizes, selectedPriceRange]);

  const hasActiveFilters = selectedSizes.length > 0 || selectedPriceRange !== null;

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedPriceRange(null);
  };

  if (view === "cart") {
    return <CartView cartItems={cartItems} onBack={() => setView("store")} onUpdateQty={updateQty} onRemove={removeItem} onClearAll={() => setCartItems([])} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader cartCount={cartCount} searchQuery={searchQuery} onSearchChange={setSearchQuery} onCartClick={() => setView("cart")} />

      <HeroCarousel />

      {/* Ticker */}
      <div className="py-2 overflow-hidden whitespace-nowrap bg-primary">
        <div className="animate-marquee inline-block text-primary-foreground text-xs font-bold tracking-wide">
          <span className="mx-6">Cupom: PRIMEIRACOMPRA &nbsp;|&nbsp; Parcelamos até 12x &nbsp;|&nbsp; Enviamos para todo o Brasil &nbsp;|&nbsp; Frete Grátis acima de R$399,99 &nbsp;|&nbsp;</span>
          <span className="mx-6">Cupom: PRIMEIRACOMPRA &nbsp;|&nbsp; Parcelamos até 12x &nbsp;|&nbsp; Enviamos para todo o Brasil &nbsp;|&nbsp; Frete Grátis acima de R$399,99 &nbsp;|&nbsp;</span>
        </div>
      </div>

      {/* Info strip */}
      <div className="bg-card border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full border-2 border-foreground/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle size={18} className="text-foreground" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Canais de Atendimento</p>
              <p className="text-[0.65rem] text-muted-foreground">Whatsapp e Instagram</p>
            </div>
          </a>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full border-2 border-foreground/20 flex items-center justify-center flex-shrink-0">
              <Percent size={18} className="text-foreground" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">CUPOM • Até 5% OFF</p>
              <p className="text-[0.65rem] text-muted-foreground font-mono">PRIMEIRACOMPRA</p>
            </div>
          </div>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <img src={infoStripImg} alt="Estampa diferente" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Estampa diferente?</p>
              <p className="text-[0.65rem] text-muted-foreground">Nos chame que fazemos!</p>
            </div>
          </a>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full border-2 border-foreground/20 flex items-center justify-center flex-shrink-0">
              <Truck size={18} className="text-foreground" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Fretes Econômicos</p>
              <p className="text-[0.65rem] text-muted-foreground">Calcule sem compromisso.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <main className="max-w-[1200px] mx-auto px-4 pt-6 pb-8">
        <div className="text-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-primary uppercase">BEST SELLERS</h2>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors">
            <SlidersHorizontal size={14} />
            Filtros
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
          </button>

          {/* Active filter tags */}
          {selectedSizes.map((s) => (
            <span key={s} className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {s}
              <button onClick={() => toggleSize(s)}><X size={12} /></button>
            </span>
          ))}
          {selectedPriceRange !== null && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {PRICE_RANGES[selectedPriceRange].label}
              <button onClick={() => setSelectedPriceRange(null)}><X size={12} /></button>
            </span>
          )}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Limpar filtros
            </button>
          )}
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="mb-4 p-4 rounded-xl border border-border bg-card">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">Tamanho</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map((size) => (
                    <button key={size} onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${selectedSizes.includes(size) ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:bg-muted"}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">Preço</p>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((range, i) => (
                    <button key={range.label} onClick={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${selectedPriceRange === i ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:bg-muted"}`}>
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Search size={36} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={toProduct(p)} onClick={() => { setSelectedProduct(p); setView("product"); }} />
            ))}
          </div>
        )}
      </main>

      <StoreFooter onNavigateHome={() => setView("store")} />

      <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors">
        <MessageCircle size={22} className="text-white" />
      </a>

      <div className="fixed bottom-5 left-5 z-50 w-12 h-12 bg-destructive rounded-full flex flex-col items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
        <span className="text-destructive-foreground text-[0.6rem] font-bold leading-none">5%</span>
        <span className="text-destructive-foreground text-[0.45rem] font-bold leading-none">OFF</span>
      </div>

      {view === "product" && selectedProduct && (
        <ProductDetail
          product={toProduct(selectedProduct)}
          onBack={() => setView("store")}
          onAddToCart={(item) => { addToCart(item); setView("store"); }}
          onGoToCart={() => setView("cart")}
          cartCount={cartCount}
        />
      )}

      <CookieConsent />
    </div>
  );
};

export default Store;
