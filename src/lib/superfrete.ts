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
        .select("*")
        .single();
      
      if (error) throw error;
      return (data as any).superfrete_settings as SuperFreteSettings || {
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
      const { data: storeData } = await supabase.from("store_settings").select("id").single();
      const { error } = await supabase
        .from("store_settings")
        .update({ ["superfrete_settings" as any]: settings })
        .eq("id", storeData?.id);
      
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

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${params.token}`,
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
