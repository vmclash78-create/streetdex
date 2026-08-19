import { useState, useMemo } from "react";
import { useProducts, useStoreSettings, type DBProduct } from "@/hooks/useStoreData";
import { PRICE_RANGES } from "@/constants/store";

export const useStoreFilters = (dbProducts: DBProduct[] | undefined, searchQuery: string, selectedCategory: string | null, selectedSizes: string[], selectedPriceRange: number | null) => {
  const filteredProducts = useMemo(() => {
    if (!dbProducts) return [];
    let result = dbProducts.filter((p) => p.status === "active");
    if (searchQuery) result = result.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
    if (selectedSizes.length > 0) result = result.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    if (selectedPriceRange !== null) {
      const range = PRICE_RANGES[selectedPriceRange];
      result = result.filter((p) => Number(p.price) >= range.min && Number(p.price) < range.max);
    }
    return result;
  }, [dbProducts, searchQuery, selectedCategory, selectedSizes, selectedPriceRange]);

  const hasActiveFilters = selectedSizes.length > 0 || selectedPriceRange !== null || selectedCategory !== null;

  const newDropProducts = useMemo(() => {
    if (!dbProducts) return [];
    return [...dbProducts]
      .filter((p) => p.status === "active")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4);
  }, [dbProducts]);

  return { filteredProducts, hasActiveFilters, newDropProducts };
};