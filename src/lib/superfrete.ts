import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const SUPERFRETE_API_URL = "https://api.superfrete.com"; // Default to production, but usually we use a setting

export interface SuperFreteSettings {
  token: string;
  environment: 'sandbox' | 'production';
  from_zip: string;
  from_number: string;
  from_street: string;
  from_neighborhood: string;
  from_city: string;
  from_state: string;
}

export const useSuperFreteSettings = () => {
  return useQuery({
    queryKey: ["superfrete-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("superfrete_settings")
        .eq("key", "superfrete_config")
        .maybeSingle();
      
      if (error) throw error;
      
      return (data as any)?.superfrete_settings as SuperFreteSettings || {
        token: "",
        environment: "sandbox",
        from_zip: "",
        from_number: "",
        from_street: "",
        from_neighborhood: "",
        from_city: "",
        from_state: ""
      };
    },
  });
};

export const useUpdateSuperFreteSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: SuperFreteSettings) => {
      const { error } = await supabase
        .from("store_settings")
        .upsert({ 
          key: "superfrete_config", 
          value: JSON.stringify(settings),
          superfrete_settings: settings as any
        } as any, { onConflict: 'key' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superfrete-settings"] });
    },
  });
};

const callProxy = async (payload: any) => {
  if (!payload.token || !String(payload.token).trim()) {
    throw new Error("Token da SuperFrete não configurado. Preencha em Configurações > SuperFrete.");
  }

  const { data, error } = await supabase.functions.invoke('superfrete-proxy', { body: payload });

  if (error) {
    let detail = error.message;
    try {
      const res = (error as any).context;
      if (res && typeof res.json === "function") {
        const body = await res.json();
        detail = body?.message || body?.error || detail;
      }
    } catch (_) { /* ignore */ }

    if (/token/i.test(String(detail)) || /não autorizado/i.test(String(detail)) || (data as any)?.superfrete_status === 401) {
      detail = `Token da SuperFrete inválido para o ambiente "${payload.environment === 'production' ? 'Produção' : 'Sandbox'}". Certifique-se que o token salvo em Configurações > SuperFrete corresponde ao ambiente selecionado.`;
    }
    throw new Error(detail);
  }

  if (data && (data.error || data.message) && !data.id && !Array.isArray(data)) {
    const detail = data.message || data.error;
    if ((/token/i.test(String(detail)) || /não autorizado/i.test(String(detail)) || data.superfrete_status === 401)) {
      throw new Error(`Token da SuperFrete inválido para o ambiente "${payload.environment === 'production' ? 'Produção' : 'Sandbox'}". Verifique o token em Configurações.`);
    }
    throw new Error(detail);
  }

  return data;
};

export const calculateShipping = async (params: {
  from_zip: string;
  to_zip: string;
  weight: number;
  length: number;
  height: number;
  width: number;
  token: string;
  environment: 'sandbox' | 'production';
}) => {
  return await callProxy({
      token: params.token,
      environment: params.environment,
      endpoint: "/api/v0/calculator",
      userAgent: "Superfrete (integracao@superfrete.com)",
      body: {
        from: { postal_code: params.from_zip.replace(/\D/g, "") },
        to: { postal_code: params.to_zip.replace(/\D/g, "") },
        package: {
          weight: params.weight,
          width: params.width,
          height: params.height,
          length: params.length
        },
        services: "1,2,17", // PAC, SEDEX, Mini Envios
        options: {
          own_hand: false,
          receipt: false,
          insurance_value: 0,
          use_origin_package: true
        }
      }
  });
};

export const generateOrderTag = async (params: {
  token: string;
  environment: 'sandbox' | 'production';
  order: any;
  items: any[];
  settings: SuperFreteSettings;
}) => {
  return await callProxy({
      token: params.token,
      environment: params.environment,
      endpoint: "/api/v0/cart",
      userAgent: "Superfrete (integracao@superfrete.com)",
      body: {
        from: {
          postal_code: params.settings.from_zip.replace(/\D/g, ""),
          address: params.settings.from_street,
          number: params.settings.from_number,
          district: params.settings.from_neighborhood,
          city: params.settings.from_city,
          state: params.settings.from_state,
          country: "BR"
        },
        to: {
          name: params.order.customers?.name || "Cliente",
          phone: (params.order.customers?.phone || "").replace(/\D/g, ""),
          email: params.order.customers?.email || "",
          postal_code: (params.order.address_cep || "").replace(/\D/g, ""),
          address: params.order.address_street || "",
          number: params.order.address_number || "S/N",
          district: params.order.address_neighborhood || "",
          city: params.order.address_city || "",
          state: params.order.address_state || "CE",
          country: "BR"
        },
        package: {
          weight: 0.3,
          width: 20,
          height: 10,
          length: 20
        },
        service: 1, // PAC default
        agency: 1, // Any agency
        options: {
          own_hand: false,
          receipt: false,
          insurance_value: params.order.total,
          use_origin_package: true
        }
      }
  });
};
