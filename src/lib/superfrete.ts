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
  const url = params.environment === 'sandbox' 
    ? "https://sandbox.superfrete.com/api/v0/calculator"
    : "https://api.superfrete.com/api/v0/calculator";

  const authHeader = params.token.startsWith('Bearer ') ? params.token : `Bearer ${params.token}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/json",
      "User-Agent": "StreetDex (integracao@superfrete.com)"
    },
    body: JSON.stringify({
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
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao calcular frete");
  }

  return response.json();
};

export const generateOrderTag = async (params: {
  token: string;
  environment: 'sandbox' | 'production';
  order: any;
  items: any[];
  settings: SuperFreteSettings;
}) => {
  const url = params.environment === 'sandbox'
    ? "https://sandbox.superfrete.com/api/v0/cart"
    : "https://api.superfrete.com/api/v0/cart";

  const authHeader = params.token.startsWith('Bearer ') ? params.token : `Bearer ${params.token}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/json",
      "User-Agent": "StreetDex (integracao@superfrete.com)"
    },
    body: JSON.stringify({
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
        name: params.order.customers.name,
        phone: params.order.customers.phone.replace(/\D/g, ""),
        email: params.order.customers.email,
        postal_code: params.order.address_cep.replace(/\D/g, ""),
        address: params.order.address_street,
        number: params.order.address_number,
        district: params.order.address_neighborhood,
        city: params.order.address_city,
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
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Erro ${response.status}: Falha ao gerar etiqueta na SuperFrete`);
  }

  return response.json();
};
