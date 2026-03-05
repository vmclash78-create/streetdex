import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DBCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
};

export type DBOrder = {
  id: string;
  order_number: number;
  customer_id: string;
  total: number;
  payment_method: string;
  status: string;
  address_cep: string | null;
  address_street: string | null;
  address_number: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_complement: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DBOrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_img: string | null;
  size: string | null;
  quantity: number;
  price: number;
  created_at: string;
};

export const ORDER_STATUSES = [
  { value: "aguardando_pagamento", label: "Aguardando Pagamento", color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" },
  { value: "pago", label: "Pago", color: "bg-blue-500/20 text-blue-600 dark:text-blue-400" },
  { value: "preparando", label: "Preparando", color: "bg-purple-500/20 text-purple-600 dark:text-purple-400" },
  { value: "enviado", label: "Enviado", color: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400" },
  { value: "entregue", label: "Entregue", color: "bg-green-500/20 text-green-600 dark:text-green-400" },
] as const;

export const getStatusInfo = (status: string) => ORDER_STATUSES.find((s) => s.value === status) || ORDER_STATUSES[0];

// ─── ORDERS (admin) ───
export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, customers(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (DBOrder & { customers: DBCustomer })[];
    },
  });
};

export const useOrderItems = (orderId?: string) => {
  return useQuery({
    queryKey: ["order-items", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId!);
      if (error) throw error;
      return data as DBOrderItem[];
    },
  });
};

export const useOrderById = (orderId?: string) => {
  return useQuery({
    queryKey: ["order", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", orderId!)
        .maybeSingle();
      if (error) throw error;
      return data as (DBOrder & { order_items: DBOrderItem[] }) | null;
    },
  });
};

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order"] });
    },
  });
};

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      customer: { name: string; phone: string; email?: string };
      order: {
        total: number;
        payment_method: string;
        address_cep?: string;
        address_street?: string;
        address_number?: string;
        address_neighborhood?: string;
        address_city?: string;
        address_complement?: string;
        notes?: string;
      };
      items: { product_id?: string; product_name: string; product_img?: string; size?: string; quantity: number; price: number }[];
    }) => {
      const { data, error } = await supabase.rpc("create_storefront_order", {
        p_customer_name: payload.customer.name,
        p_customer_phone: payload.customer.phone,
        p_customer_email: payload.customer.email || "",
        p_total: payload.order.total,
        p_payment_method: payload.order.payment_method,
        p_address_cep: payload.order.address_cep || "",
        p_address_street: payload.order.address_street || "",
        p_address_number: payload.order.address_number || "",
        p_address_neighborhood: payload.order.address_neighborhood || "",
        p_address_city: payload.order.address_city || "",
        p_address_complement: payload.order.address_complement || "",
        p_notes: payload.order.notes || "",
        p_items: JSON.stringify(payload.items),
      });
      if (error) throw error;
      const result = data as unknown as { id: string; order_number: number };
      return { id: result.id, order_number: result.order_number } as DBOrder;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
