import { useState, useMemo, useCallback, useEffect } from "react";
import { type CartItem, type AppView } from "@/components/store/storeData";
import { useProducts, useStoreSettings, type DBProduct } from "@/hooks/useStoreData";

export const useStore = () => {
  const [view, setView] = useState<AppView>(() => {
    const saved = localStorage.getItem("store_view");
    return (saved as AppView) || "store";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("store_cart");
    if (!saved) return [];
    try {
      const parsed: unknown = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter((item): item is CartItem =>
        typeof item?.product?.id === "string" && typeof item?.qty === "number" && item.qty > 0
      ) : [];
    } catch { return []; }
  });
  const [selectedProduct, setSelectedProduct] = useState<DBProduct | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{ id: string; number: number; whatsappLink?: string } | null>(null);

  const { data: dbProducts, isLoading } = useProducts();
  const { data: settings } = useStoreSettings();

  // Persist view and cart
  useEffect(() => {
    localStorage.setItem("store_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (!dbProducts) return;
    setCartItems((previous) => {
      const current = previous.flatMap((item) => {
        const product = dbProducts.find((candidate) => candidate.id === item.product.id && candidate.status === "active");
        if (!product || product.stock <= 0) return [];
        const previousEntries = previous.slice(0, previous.indexOf(item)).filter((entry) => entry.product.id === product.id);
        const otherSizes = previousEntries.reduce((sum, entry) => sum + entry.qty, 0);
        const qty = Math.min(item.qty, Math.max(0, product.stock - otherSizes));
        if (qty === 0) return [];
        return [{ ...item, qty, product: { ...item.product, price: Number(product.price), stock: product.stock, name: product.name, img: product.img } }];
      });
      return JSON.stringify(previous) === JSON.stringify(current) ? previous : current;
    });
  }, [dbProducts]);

  useEffect(() => {
    if (view !== "order-success") {
      localStorage.setItem("store_view", view);
    } else {
      localStorage.removeItem("store_view");
    }
  }, [view]);

  // Handle product persistence
  useEffect(() => {
    if (view === "product" && selectedProduct) {
      localStorage.setItem("store_selected_product_id", selectedProduct.id);
    } else if (view !== "product") {
      localStorage.removeItem("store_selected_product_id");
    }
  }, [view, selectedProduct]);

  useEffect(() => {
    const savedProductId = localStorage.getItem("store_selected_product_id");
    if (view === "product" && !selectedProduct && savedProductId && dbProducts) {
      const found = dbProducts.find(p => p.id === savedProductId);
      if (found) setSelectedProduct(found);
    }
  }, [view, selectedProduct, dbProducts]);

  const cartCount = useMemo(() => cartItems.reduce((s, i) => s + i.qty, 0), [cartItems]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === item.product.id && i.size === item.size);
      if (existing) {
        const maxStock = Math.max(0, item.product.stock ?? 0);
        const inOtherSizes = prev.filter((i) => i.product.id === item.product.id && i.cartId !== existing.cartId).reduce((sum, i) => sum + i.qty, 0);
        return prev.map((i) => i.cartId === existing.cartId ? { ...i, qty: Math.min(i.qty + item.qty, Math.max(0, maxStock - inOtherSizes)) } : i);
      }
      const alreadyInCart = prev.filter((i) => i.product.id === item.product.id).reduce((sum, i) => sum + i.qty, 0);
      return alreadyInCart < (item.product.stock ?? 0) ? [...prev, item] : prev;
    });
  };

  const updateQty = (cartId: string, qty: number) => {
    if (qty < 1) setCartItems((prev) => prev.filter((i) => i.cartId !== cartId));
    else setCartItems((prev) => prev.map((i) => {
      if (i.cartId !== cartId) return i;
      const inOtherSizes = prev.filter((other) => other.product.id === i.product.id && other.cartId !== cartId).reduce((sum, other) => sum + other.qty, 0);
      return { ...i, qty: Math.min(qty, Math.max(1, (i.product.stock ?? 0) - inOtherSizes)) };
    }));
  };

  const removeItem = (cartId: string) => setCartItems((prev) => prev.filter((i) => i.cartId !== cartId));

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  };

  const categories = useMemo(() => {
    if (!dbProducts) return [];
    const cats = new Set<string>();
    dbProducts.forEach((p) => { if (p.category && p.status === "active") cats.add(p.category); });
    return Array.from(cats).sort();
  }, [dbProducts]);

  const clearFilters = useCallback(() => {
    setSelectedSizes([]);
    setSelectedPriceRange(null);
    setSelectedCategory(null);
  }, []);

  return {
    view, setView, searchQuery, setSearchQuery, cartItems, setCartItems,
    selectedProduct, setSelectedProduct, selectedSizes, setSelectedSizes,
    selectedPriceRange, setSelectedPriceRange, selectedCategory, setSelectedCategory,
    filtersOpen, setFiltersOpen, completedOrder, setCompletedOrder,
    dbProducts, isLoading, settings, cartCount, addToCart, updateQty, removeItem,
    toggleSize, categories, clearFilters
  };
};