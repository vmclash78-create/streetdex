import { Percent, Truck, SlidersHorizontal, Zap, Sparkles } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/hooks/useStore";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { ALL_SIZES, PRICE_RANGES } from "@/constants/store";
import { useCallback } from "react";
import { type DBProduct } from "@/hooks/useStoreData";

import { motion, AnimatePresence } from "framer-motion";

const Store = () => {
  const {
    view, setView, searchQuery, setSearchQuery, cartItems, setCartItems,
    selectedProduct, setSelectedProduct, selectedSizes, 
    selectedPriceRange, setSelectedPriceRange, selectedCategory, setSelectedCategory,
    filtersOpen, setFiltersOpen, completedOrder, setCompletedOrder,
    dbProducts, isLoading, settings, cartCount, addToCart, updateQty, removeItem,
    toggleSize, categories, clearFilters
  } = useStore();

  const { filteredProducts, hasActiveFilters, newDropProducts } = useStoreFilters(
    dbProducts, searchQuery, selectedCategory, selectedSizes, selectedPriceRange
  );

  const isMobile = useIsMobile();
  const whatsapp = settings?.whatsapp_store || settings?.whatsapp || WHATSAPP;
  const couponCode = settings?.coupon_code || "PRIMEIRACOMPRA";

  const toProduct = useCallback((p: DBProduct) => ({
    id: p.id,
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

  const openProductById = useCallback((pid: string) => {
    const found = dbProducts?.find((p) => p.id === pid);
    if (found) {
      setSelectedProduct(found);
      setView("product");
    }
  }, [dbProducts, setView, setSelectedProduct]);

  if (view === "cart") {
    return <CartView cartItems={cartItems} onBack={() => setView("store")} onUpdateQty={updateQty} onRemove={removeItem} onClearAll={() => setCartItems([])} onCheckout={() => setView("checkout")} />;
  }

  if (view === "checkout") {
    return (
      <CheckoutView
        cartItems={cartItems}
        onBack={() => setView("cart")}
        onOrderComplete={(id, num, whatsappLink) => {
          const savedCustomer = localStorage.getItem("checkout_customer");
          if (savedCustomer) {
            try {
              const customer = JSON.parse(savedCustomer) as { phone?: string };
              if (customer.phone) sessionStorage.setItem(`tracking-phone:${id}`, customer.phone);
            } catch { /* Tracking will request the phone again. */ }
          }
          setCompletedOrder({ id, number: num, whatsappLink });
          setCartItems([]);
          setView("order-success");
        }}
      />
    );
  }

  if (view === "order-success" && completedOrder) {
    return (
      <OrderSuccessView
        orderId={completedOrder.id}
        orderNumber={completedOrder.number}
        whatsappLink={completedOrder.whatsappLink}
        onBackToStore={() => { setCompletedOrder(null); setView("store"); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCartClick={() => setView("cart")}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        whatsapp={whatsapp}
        announcementText={settings?.announcement_text}
      />

      {isMobile && categories.length > 0 && (
        <div className="bg-background border-b border-border/50 px-4 py-3 flex gap-2 overflow-x-auto">
          <Button variant={selectedCategory === null ? "default" : "ghost"} size="sm" onClick={() => setSelectedCategory(null)}>Todos</Button>
          {categories.map((cat) => (
            <Button key={cat} variant={selectedCategory === cat ? "default" : "ghost"} size="sm" onClick={() => setSelectedCategory(cat)}>{cat}</Button>
          ))}
        </div>
      )}

      <HeroCarousel />

      <div className="py-2.5 bg-primary text-primary-foreground text-center text-xs font-black uppercase overflow-hidden border-y border-white/10 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          {[1, 2, 3].map((i) => (
            <span key={i} className="inline-flex items-center">
              <span className="mx-4">CUPOM: {couponCode}</span>
              <Sparkles size={12} className="text-white/50" />
              <span className="mx-4">PARCELAMOS ATÉ 12X</span>
              <Zap size={12} className="text-white/50" />
              <span className="mx-4">ENVIAMOS PARA TODO O BRASIL</span>
              <Truck size={12} className="text-white/50" />
              <span className="mx-4">FRETE GRÁTIS ACIMA DE R$399,99</span>
              <Percent size={12} className="text-white/50" />
            </span>
          ))}
        </div>
      </div>

      {!isLoading && <NewDropSection products={newDropProducts.map(toProduct)} onSelect={openProductById} />}

      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold uppercase">Best Sellers</h2>
          <Button variant="outline" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="gap-2">
            <SlidersHorizontal size={14} /> Filtros {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
          </Button>
        </div>

        {filtersOpen && (
          <Card className="mb-6 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold mb-2">TAMANHO</p>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map(s => (
                  <Button key={s} size="sm" variant={selectedSizes.includes(s) ? "default" : "outline"} onClick={() => toggleSize(s)}>{s}</Button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold mb-2">PREÇO</p>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map((r, i) => (
                  <Button key={r.label} size="sm" variant={selectedPriceRange === i ? "default" : "outline"} onClick={() => setSelectedPriceRange(i)}>{r.label}</Button>
                ))}
              </div>
            </div>
            {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="col-span-full">Limpar filtros</Button>}
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] w-full" />)}
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {filteredProducts.map((p) => <ProductCard key={p.id} productId={p.id} product={toProduct(p)} onClick={() => { setSelectedProduct(p); setView("product"); }} />)}
          </motion.div>
        )}
      </main>

      {selectedProduct && view === "product" && (
        <ProductDetail product={toProduct(selectedProduct)} onBack={() => setView("store")} onAddToCart={addToCart} onGoToCart={() => setView("cart")} cartCount={cartCount} />
      )}

      <FAQSection />
      <StoreFooter onNavigateHome={() => setView("store")} whatsapp={whatsapp} storeName={settings?.store_name} />
      <CookieConsent />
    </div>
  );
};

export default Store;