import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DBBanner = {
  id: string;
  img: string;
  cta: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
};

export const useHeroBanners = () => {
  return useQuery({
    queryKey: ["hero-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_banners")
        .select("id, img, cta, sort_order, active")
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
