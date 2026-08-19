import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert(payload.sale)
        .select()
        .single();
      if (saleError) throw saleError;

      const itemsWithSaleId = payload.items.map((item) => ({
        ...item,
        sale_id: saleData.id,
      }));
      const { error: itemsError } = await supabase.from("sale_items").insert(itemsWithSaleId);
      if (itemsError) throw itemsError;

      // Note: This manual stock update is not atomic with the sale insertion.
      // In a high-concurrency environment, this should be handled by a database trigger or RPC.
      for (const item of payload.items) {
        if (!item.product_id) continue;
        const { data: prod } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();
        if (prod && typeof prod.stock === "number") {
          await supabase
            .from("products")
            .update({ stock: Math.max(0, prod.stock - item.quantity) })
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
