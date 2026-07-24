import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { meApi } from "./api";

export type Shipment = {
  id: string;
  order_id: string;
  carrier: string;
  carrier_service: string | null;
  carrier_order_id: string | null;
  tracking_code: string | null;
  label_url: string | null;
  status: string;
  shipping_cost: number | null;
  posted_at: string | null;
  delivered_at: string | null;
  created_at: string;
};

export function useShipmentByOrder(orderId?: string) {
  return useQuery({
    enabled: !!orderId,
    queryKey: ["shipment", orderId],
    queryFn: async (): Promise<Shipment | null> => {
      const { data, error } = await supabase
        .from("shipments" as any)
        .select("*")
        .eq("order_id", orderId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as Shipment) ?? null;
    },
  });
}

export function useShippingQuote(toZip?: string, insurance?: number) {
  return useQuery({
    enabled: !!toZip && toZip.replace(/\D/g, "").length === 8,
    queryKey: ["me-quote", toZip, insurance],
    queryFn: async () => {
      const res = await meApi.calculate({ to_zip: toZip!, insurance_value: insurance });
      return (res as any).services as Array<any>;
    },
  });
}

export function useGenerateShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { order_id: string; service_id: number }) => meApi.generate(v),
    onSuccess: (_data, v) => {
      qc.invalidateQueries({ queryKey: ["shipment", v.order_id] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
