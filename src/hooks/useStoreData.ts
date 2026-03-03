import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DBProduct = {
  id: string;
  name: string;
  price: number;
  old_price: number | null;
  img: string;
  img2: string | null;
  sizes: string[];
  colors: string[] | null;
  free_shipping: boolean;
  category: string | null;
  stock: number;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as DBProduct[];
    },
  });
};

export const useAdminProducts = () => {
  return useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as DBProduct[];
    },
  });
};

export const useUpsertProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Partial<DBProduct> & { name: string; price: number; img: string }) => {
      if (product.id) {
        const { error } = await supabase.from("products").update(product).eq("id", product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(product);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
};

export const useHeroBanners = () => {
  return useQuery({
    queryKey: ["hero-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_banners")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as { id: string; img: string; cta: string; sort_order: number; active: boolean }[];
    },
  });
};

export const useStoreSettings = () => {
  return useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("store_settings").select("*");
      if (error) throw error;
      const map: Record<string, string> = {};
      (data as { key: string; value: string }[]).forEach((s) => (map[s.key] = s.value));
      return map;
    },
  });
};

export const useUpdateSetting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase.from("store_settings").update({ value }).eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store-settings"] }),
  });
};
