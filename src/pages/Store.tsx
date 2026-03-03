import { useState } from "react";
import { Search, MessageCircle, Percent, Truck } from "lucide-react";
import StoreHeader from "@/components/store/StoreHeader";
import HeroCarousel from "@/components/store/HeroCarousel";
import ProductCard from "@/components/store/ProductCard";
import ProductDetail from "@/components/store/ProductDetail";
import CartView from "@/components/store/CartView";
import CookieConsent from "@/components/store/CookieConsent";
import StoreFooter from "@/components/store/StoreFooter";
import { type CartItem, type Product, type AppView, products, infoStripImg, WHATSAPP } from "@/components/store/storeData";

const Store = () => {
  const [view, setView] = useState<AppView>("store");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  // Cart view
  if (view === "cart") {
    return <CartView cartItems={cartItems} onBack={() => setView("store")} onUpdateQty={updateQty} onRemove={removeItem} onClearAll={() => setCartItems([])} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCartClick={() => setView("cart")}
      />

      {/* Hero */}
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
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Search size={36} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div>
            <div className="text-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-primary uppercase">BEST SELLERS</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onClick={() => { setSelectedProduct(p); setView("product"); }} />
              ))}
            </div>
          </div>
        )}
      </main>

      <StoreFooter onNavigateHome={() => setView("store")} />

      {/* Floating WhatsApp */}
      <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors">
        <MessageCircle size={22} className="text-white" />
      </a>

      {/* Floating discount */}
      <div className="fixed bottom-5 left-5 z-50 w-12 h-12 bg-destructive rounded-full flex flex-col items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
        <span className="text-destructive-foreground text-[0.6rem] font-bold leading-none">5%</span>
        <span className="text-destructive-foreground text-[0.45rem] font-bold leading-none">OFF</span>
      </div>

      {/* Product detail modal */}
      {view === "product" && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
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
