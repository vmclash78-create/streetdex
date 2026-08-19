import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DBProduct = {
  id: string;
  name: string;
  price: number;
  old_price: number | null;
  cost: number;
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
  description?: string | null;
  measurements?: { size: string; chest?: number; length?: number; sleeve?: number }[] | null;
  shipping_cost?: number;
};

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, old_price, img, img2, sizes, colors, free_shipping, category, stock, status, sort_order, created_at, updated_at")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as unknown as DBProduct[];
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
      return data as unknown as DBProduct[];
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
