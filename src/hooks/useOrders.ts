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
        .select("*, customers(*), order_items(*)")
        .eq("id", orderId!)
        .single();
      if (error) throw error;
      return data as DBOrder & { customers: DBCustomer; order_items: DBOrderItem[] };
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
      // Insert customer
      const { data: customer, error: custErr } = await supabase
        .from("customers")
        .insert({ name: payload.customer.name, phone: payload.customer.phone, email: payload.customer.email || null })
        .select()
        .single();
      if (custErr) throw custErr;

      // Insert order
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({ ...payload.order, customer_id: customer.id } as any)
        .select()
        .single();
      if (orderErr) throw orderErr;

      // Insert items
      const items = payload.items.map((item) => ({
        ...item,
        order_id: order.id,
      }));
      const { error: itemsErr } = await supabase.from("order_items").insert(items);
      if (itemsErr) throw itemsErr;

      return order as DBOrder;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
