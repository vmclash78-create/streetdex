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
