import { useState, useMemo, useCallback, useEffect } from "react";
import { Search, MessageCircle, Percent, Truck, SlidersHorizontal, X, Zap } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import StoreHeader from "@/components/store/StoreHeader";
import HeroCarousel from "@/components/store/HeroCarousel";
import ProductCard from "@/components/store/ProductCard";
import ProductDetail from "@/components/store/ProductDetail";
import CartView from "@/components/store/CartView";
import CheckoutView from "@/components/store/CheckoutView";
import OrderSuccessView from "@/components/store/OrderSuccessView";
import CookieConsent from "@/components/store/CookieConsent";
import StoreFooter from "@/components/store/StoreFooter";
import FAQSection from "@/components/store/FAQSection";
import NewDropSection from "@/components/store/NewDropSection";
import { WHATSAPP } from "@/components/store/storeData";
import { getWhatsAppLink } from "@/utils/whatsapp";
import { useProducts, useStoreSettings } from "@/hooks/useStoreData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
const ALL_SIZES = ["PP", "P", "M", "G", "GG", "XG"];
const PRICE_RANGES = [
    { label: "Até R$90", min: 0, max: 90 },
    { label: "R$90 - R$150", min: 90, max: 150 },
    { label: "Acima de R$150", min: 150, max: 9999 },
];
const Store = () => {
    const [view, setView] = useState(() => {
        const saved = localStorage.getItem("store_view");
        return saved || "store";
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem("store_cart");
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);
    const { data: dbProducts, isLoading } = useProducts();
    const { data: settings } = useStoreSettings();
    const isMobile = useIsMobile();
    // Persist view and cart
    useEffect(() => {
        localStorage.setItem("store_cart", JSON.stringify(cartItems));
    }, [cartItems]);
    useEffect(() => {
        if (view !== "order-success") {
            localStorage.setItem("store_view", view);
        }
        else {
            localStorage.removeItem("store_view");
        }
    }, [view]);
    // Handle product persistence if in product view
    useEffect(() => {
        if (view === "product" && selectedProduct) {
            localStorage.setItem("store_selected_product_id", selectedProduct.id);
        }
        else if (view !== "product") {
            localStorage.removeItem("store_selected_product_id");
        }
    }, [view, selectedProduct]);
    useEffect(() => {
        const savedProductId = localStorage.getItem("store_selected_product_id");
        if (view === "product" && !selectedProduct && savedProductId && dbProducts) {
            const found = dbProducts.find(p => p.id === savedProductId);
            if (found)
                setSelectedProduct(found);
        }
    }, [view, selectedProduct, dbProducts]);
    const whatsapp = settings?.whatsapp_store || settings?.whatsapp || WHATSAPP;
    const whatsappSupport = whatsapp;
    const storeName = settings?.store_name || "Street Dex";
    const announcementText = settings?.announcement_text || "";
    const couponCode = settings?.coupon_code || "PRIMEIRACOMPRA";
    const couponDiscount = settings?.coupon_discount || "5";
    const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
    const toProduct = useCallback((p) => ({
        id: parseInt(p.id.slice(0, 8), 16),
        name: p.name,
        price: Number(p.price),
        oldPrice: p.old_price ? Number(p.old_price) : undefined,
        img: p.img,
        img2: p.img2 || undefined,
        sizes: p.sizes,
        freeShipping: p.free_shipping,
        colors: p.colors || undefined,
        description: p.description || undefined,
        measurements: p.measurements || undefined,
        stock: typeof p.stock === "number" ? p.stock : undefined,
    }), []);
    const addToCart = (item) => {
        setCartItems((prev) => {
            const existing = prev.find((i) => i.product.id === item.product.id && i.size === item.size);
            if (existing)
                return prev.map((i) => i.cartId === existing.cartId ? { ...i, qty: i.qty + item.qty } : i);
            return [...prev, item];
        });
    };
    const updateQty = (cartId, qty) => {
        if (qty < 1)
            setCartItems((prev) => prev.filter((i) => i.cartId !== cartId));
        else
            setCartItems((prev) => prev.map((i) => i.cartId === cartId ? { ...i, qty } : i));
    };
    const removeItem = (cartId) => setCartItems((prev) => prev.filter((i) => i.cartId !== cartId));
    const toggleSize = (size) => {
        setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
    };
    const categories = useMemo(() => {
        if (!dbProducts)
            return [];
        const cats = new Set();
        dbProducts.forEach((p) => { if (p.category && p.status === "active")
            cats.add(p.category); });
        return Array.from(cats).sort();
    }, [dbProducts]);
    const filteredProducts = useMemo(() => {
        if (!dbProducts)
            return [];
        let result = dbProducts.filter((p) => p.status === "active");
        if (searchQuery)
            result = result.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        if (selectedCategory)
            result = result.filter((p) => p.category === selectedCategory);
        if (selectedSizes.length > 0)
            result = result.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
        if (selectedPriceRange !== null) {
            const range = PRICE_RANGES[selectedPriceRange];
            result = result.filter((p) => Number(p.price) >= range.min && Number(p.price) < range.max);
        }
        return result;
    }, [dbProducts, searchQuery, selectedCategory, selectedSizes, selectedPriceRange]);
    const hasActiveFilters = selectedSizes.length > 0 || selectedPriceRange !== null || selectedCategory !== null;
    const newDropProducts = useMemo(() => {
        if (!dbProducts)
            return [];
        return [...dbProducts]
            .filter((p) => p.status === "active")
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 4);
    }, [dbProducts]);
    const openProductById = useCallback((pid) => {
        const found = dbProducts?.find((p) => parseInt(p.id.slice(0, 8), 16) === pid);
        if (found) {
            setSelectedProduct(found);
            setView("product");
        }
    }, [dbProducts]);
    const clearFilters = () => {
        setSelectedSizes([]);
        setSelectedPriceRange(null);
        setSelectedCategory(null);
    };
    if (view === "cart") {
        return <CartView cartItems={cartItems} onBack={() => setView("store")} onUpdateQty={updateQty} onRemove={removeItem} onClearAll={() => setCartItems([])} onCheckout={() => setView("checkout")}/>;
    }
    if (view === "checkout") {
        return (<CheckoutView cartItems={cartItems} onBack={() => setView("cart")} onOrderComplete={(id, num) => {
                setCompletedOrder({ id, number: num });
                setCartItems([]);
                setView("order-success");
            }}/>);
    }
    if (view === "order-success" && completedOrder) {
        return (<OrderSuccessView orderId={completedOrder.id} orderNumber={completedOrder.number} onBackToStore={() => { setCompletedOrder(null); setView("store"); }}/>);
    }
    return (<div className="min-h-screen bg-background">
      <StoreHeader cartCount={cartCount} searchQuery={searchQuery} onSearchChange={setSearchQuery} onCartClick={() => setView("cart")} categories={categories} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} whatsapp={whatsapp} announcementText={announcementText}/>

      {/* Mobile category filter */}
      {isMobile && categories.length > 0 && (<div className="bg-background border-b border-border/50 relative">
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"/>
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"/>
          <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-center gap-2 overflow-x-auto scrollbar-none">
            <Button variant={selectedCategory === null ? "default" : "ghost"} size="sm" className={`flex-shrink-0 rounded-full tracking-wider uppercase text-[0.65rem] font-bold ${selectedCategory === null ? "neon-glow" : ""}`} onClick={() => setSelectedCategory(null)}>
              Todos
            </Button>
            {categories.map((cat) => (<Button key={cat} variant={selectedCategory === cat ? "default" : "ghost"} size="sm" className={`flex-shrink-0 rounded-full tracking-wider uppercase text-[0.65rem] font-bold ${selectedCategory === cat ? "neon-glow" : ""}`} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}>
                {cat}
              </Button>))}
          </div>
        </div>)}

      <HeroCarousel />

      {/* Ticker */}
      <div className="py-2.5 overflow-hidden whitespace-nowrap bg-primary relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-transparent to-primary z-10 pointer-events-none"/>
        <div className="animate-marquee inline-block text-primary-foreground text-xs font-bold tracking-[0.15em] uppercase">
          <span className="mx-6">⚡ Cupom: {couponCode} &nbsp;|&nbsp; Parcelamos até 12x &nbsp;|&nbsp; Enviamos para todo o Brasil &nbsp;|&nbsp; Frete Grátis acima de R$399,99 &nbsp;|&nbsp;</span>
          <span className="mx-6">⚡ Cupom: {couponCode} &nbsp;|&nbsp; Parcelamos até 12x &nbsp;|&nbsp; Enviamos para todo o Brasil &nbsp;|&nbsp; Frete Grátis acima de R$399,99 &nbsp;|&nbsp;</span>
        </div>
      </div>

      {/* Info strip */}
      <div className="bg-card/50 border-b border-border/50">
        <div className="max-w-[1200px] mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href={getWhatsAppLink(whatsappSupport)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group/info">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover/info:bg-primary/20 transition-colors">
              <MessageCircle size={18} className="text-primary"/>
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Canais de Atendimento</p>
              <p className="text-[0.65rem] text-muted-foreground">Whatsapp e Instagram</p>
            </div>
          </a>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Percent size={18} className="text-primary"/>
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">PIX e DINHEIRO • {settings?.pix_discount || "0"}% OFF</p>
              <p className="text-[0.65rem] text-primary font-mono font-bold">{couponCode}</p>
            </div>
          </div>
          <a href={getWhatsAppLink(whatsappSupport)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group/info">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover/info:bg-primary/20 transition-colors">
              <Zap size={18} className="text-primary"/>
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Estampa diferente?</p>
              <p className="text-[0.65rem] text-muted-foreground">Nos chame que fazemos!</p>
            </div>
          </a>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Truck size={18} className="text-primary"/>
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Fretes Econômicos</p>
              <p className="text-[0.65rem] text-muted-foreground">Calcule sem compromisso.</p>
            </div>
          </div>
        </div>
      </div>

      {!isLoading && (<NewDropSection products={newDropProducts.map(toProduct)} onSelect={openProductById}/>)}

      {/* Products */}
      <main id="best-sellers" className="max-w-[1200px] mx-auto px-4 pt-8 pb-10">
        <div className="text-center mb-6">
          <p className="text-[0.65rem] text-primary font-bold tracking-[0.3em] uppercase mb-1">Coleção</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground uppercase tracking-wider">BEST SELLERS</h2>
          <div className="w-12 h-0.5 bg-primary mx-auto mt-3 rounded-full neon-glow"/>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <Button variant="outline" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="gap-1.5 border-border/50 tracking-wider uppercase text-[0.65rem] font-bold">
            <SlidersHorizontal size={14}/>
            Filtros
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"/>}
          </Button>

          {selectedSizes.map((s) => (<Badge key={s} variant="secondary" className="gap-1 cursor-pointer bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" onClick={() => toggleSize(s)}>
              {s} <X size={12}/>
            </Badge>))}
          {selectedCategory && (<Badge variant="secondary" className="gap-1 cursor-pointer bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" onClick={() => setSelectedCategory(null)}>
              {selectedCategory} <X size={12}/>
            </Badge>)}
          {selectedPriceRange !== null && (<Badge variant="secondary" className="gap-1 cursor-pointer bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" onClick={() => setSelectedPriceRange(null)}>
              {PRICE_RANGES[selectedPriceRange].label} <X size={12}/>
            </Badge>)}
          {hasActiveFilters && (<Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground hover:text-primary">
              Limpar filtros
            </Button>)}
        </div>

        {/* Filter panel */}
        {filtersOpen && (<Card className="mb-5 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-primary mb-2 uppercase tracking-[0.2em]">Tamanho</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SIZES.map((size) => (<Button key={size} onClick={() => toggleSize(size)} variant={selectedSizes.includes(size) ? "default" : "outline"} size="sm" className={`tracking-wider font-bold ${selectedSizes.includes(size) ? "neon-glow" : "border-border/50"}`}>
                        {size}
                      </Button>))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-primary mb-2 uppercase tracking-[0.2em]">Preço</p>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map((range, i) => (<Button key={range.label} onClick={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)} variant={selectedPriceRange === i ? "default" : "outline"} size="sm" className={`tracking-wider font-bold ${selectedPriceRange === i ? "neon-glow" : "border-border/50"}`}>
                        {range.label}
                      </Button>))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>)}

        {isLoading ? (<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="flex flex-col gap-2">
                <Skeleton className="aspect-[3/4] w-full rounded-lg"/>
                <Skeleton className="h-4 w-3/4"/>
                <Skeleton className="h-5 w-1/2"/>
              </div>))}
          </div>) : filteredProducts.length === 0 ? (<div className="flex flex-col items-center justify-center py-20 gap-3">
            <Search size={40} className="text-muted-foreground/20"/>
            <p className="text-sm text-muted-foreground font-medium">Nenhum produto encontrado</p>
          </div>) : (<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => (<ProductCard key={p.id} productId={p.id} product={toProduct(p)} onClick={() => { setSelectedProduct(p); setView("product"); }}/>))}
          </div>)}
      </main>


      <FAQSection />

      <StoreFooter onNavigateHome={() => setView("store")} whatsapp={whatsappSupport} storeName={storeName}/>

      {/* WhatsApp floating button */}
      <a href={getWhatsAppLink(whatsappSupport)} target="_blank" rel="noopener noreferrer" className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-400 hover:scale-110 transition-all duration-300" style={{ boxShadow: "0 0 20px hsl(145 63% 42% / 0.4)" }}>
        <MessageCircle size={24} className="text-white"/>
      </a>

      {/* Coupon floating button */}
      <div className="fixed bottom-5 left-5 z-50 w-14 h-14 bg-primary rounded-full flex flex-col items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-all duration-300 animate-pulse-neon">
        <Zap size={14} className="text-primary-foreground mb-0.5"/>
        <span className="text-primary-foreground text-[0.55rem] font-bold leading-none">{settings?.pix_discount || "0"}% OFF</span>
      </div>

      {view === "product" && selectedProduct && (<ProductDetail product={toProduct(selectedProduct)} onBack={() => setView("store")} onAddToCart={(item) => { addToCart(item); setView("store"); }} onGoToCart={() => setView("cart")} cartCount={cartCount}/>)}

      <CookieConsent />
    </div>);
};
export default Store;
