import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DBCoupon = {
  id: string;
  code: string;
  discount_value: number;
  discount_type: "percentage" | "fixed";
  min_purchase_amount: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

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
};

export type DBSale = {
  id: string;
  customer_name: string | null;
  payment_method: string;
  discount: number;
  total: number;
  sale_date: string;
  notes: string | null;
  order_number: number | null;
  created_at: string;
};

export type DBSaleItem = {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  size: string | null;
  created_at: string;
};

export type DBExpense = {
  id: string;
  name: string;
  amount: number;
  category: string;
  expense_date: string;
  notes: string | null;
  created_at: string;
};

// ─── PRODUCTS ───
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

export type DBBanner = {
  id: string;
  img: string;
  cta: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
};

// ─── HERO BANNERS ───
export const useHeroBanners = () => {
  return useQuery({
    queryKey: ["hero-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_banners")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as DBBanner[];
    },
  });
};

export const useAdminBanners = () => {
  return useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_banners")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as DBBanner[];
    },
  });
};

export const useUpsertBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (banner: Partial<DBBanner> & { img: string }) => {
      if (banner.id) {
        const { error } = await supabase.from("hero_banners").update(banner).eq("id", banner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("hero_banners").insert(banner);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hero-banners"] });
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
    },
  });
};

export const useDeleteBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hero_banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hero-banners"] });
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
    },
  });
};

// ─── STORE SETTINGS ───
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
      const { error } = await supabase.from("store_settings").upsert({ key, value }, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store-settings"] }),
  });
};

// ─── SALES ───
export const useSales = () => {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("sale_date", { ascending: false });
      if (error) throw error;
      return data as DBSale[];
    },
  });
};

export const useAllSaleItems = () => {
  return useQuery({
    queryKey: ["all-sale-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sale_items").select("*");
      if (error) throw error;
      return data as DBSaleItem[];
    },
  });
};

export const useCreateSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      sale: Omit<DBSale, "id" | "created_at">;
      items: Omit<DBSaleItem, "id" | "sale_id" | "created_at">[];
    }) => {
      // Insert sale
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert(payload.sale)
        .select()
        .single();
      if (saleError) throw saleError;

      // Insert items
      const itemsWithSaleId = payload.items.map((item) => ({
        ...item,
        sale_id: saleData.id,
      }));
      const { error: itemsError } = await supabase.from("sale_items").insert(itemsWithSaleId);
      if (itemsError) throw itemsError;

      // Decrease stock for each item
      for (const item of payload.items) {
        const { data: prod } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();
        if (prod) {
          await supabase
            .from("products")
            .update({ stock: Math.max(0, (prod.stock ?? 0) - item.quantity) })
            .eq("id", item.product_id);
        }
      }

      return saleData;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["all-sale-items"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
};

export const useDeleteSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sales").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["all-sale-items"] });
    },
  });
};

// ─── EXPENSES ───
export const useExpenses = () => {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("expense_date", { ascending: false });
      if (error) throw error;
      return data as DBExpense[];
    },
  });
};

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (expense: Omit<DBExpense, "id" | "created_at">) => {
      const { error } = await supabase.from("expenses").insert(expense);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
};

export const useDeleteExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
};

// ─── COUPONS ───
export const useCoupons = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as DBCoupon[];
    },
  });
};

export const useUpsertCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (coupon: Partial<DBCoupon>) => {
      if (coupon.id) {
        const { data, error } = await supabase.from("coupons").update(coupon).eq("id", coupon.id).select().single();
        if (error) throw error;
        return data as DBCoupon;
      } else {
        const { data, error } = await supabase.from("coupons").insert(coupon as any).select().single();
        if (error) throw error;
        return data as DBCoupon;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
};

export const useDeleteCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
};

export const useCouponByCode = (code: string | null) => {
  return useQuery({
    queryKey: ["coupon", code],
    enabled: !!code,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code!)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      
      const coupon = data as DBCoupon;
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return null;
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) return null;
      
      return coupon;
    },
  });
};
