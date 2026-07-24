import { supabase } from "@/integrations/supabase/client";

async function invoke<T = any>(path: string, body?: unknown, method: "GET" | "POST" = "POST"): Promise<T> {
  const { data, error } = await supabase.functions.invoke(`melhor-envio${path}`, {
    method,
    body: body ?? {},
  });
  if (error) {
    const details = (error as any)?.context ? await (error as any).context.text().catch(() => "") : error.message;
    throw new Error(details || error.message);
  }
  return data as T;
}

export const meApi = {
  status: () => invoke("/auth/status", undefined, "POST"),
  saveCredentials: (b: { environment?: string; client_id?: string; client_secret?: string; redirect_uri?: string; scopes?: string }) =>
    invoke("/auth/save-credentials", b),
  saveSender: (b: Record<string, unknown>) => invoke("/auth/save-sender", b),
  authorizeUrl: () => invoke<{ url: string; state: string }>("/auth/authorize-url"),
  exchange: (code: string) => invoke("/auth/exchange", { code }),
  disconnect: () => invoke("/auth/disconnect"),
  calculate: (b: { to_zip: string; insurance_value?: number }) => invoke("/calculate", b),
  generate: (b: { order_id: string; service_id: number }) =>
    invoke<{ ok: boolean; tracking_code: string | null; label_url: string | null; carrier_order_id: string }>("/generate", b),
  print: (carrier_order_id: string) => invoke<{ url: string | null }>("/print", { carrier_order_id }),
  track: (carrier_order_id: string) => invoke("/track", { carrier_order_id }),
};
