// Cálculo de frete por região (CEP → UF → região → tabela de preços)
// Integra com ViaCEP (gratuito, sem cadastro) e usa a tabela de frete configurada
// pelo admin em `store_settings.shipping_config`.

export type RegionCode = "N" | "NE" | "CO" | "SE" | "S";

export type RegionCfg = {
  pac_price: number;
  pac_days: string;
  sedex_price: number;
  sedex_days: string;
};

export const DEFAULT_SHIPPING: Record<RegionCode, RegionCfg> = {
  NE: { pac_price: 19.9, pac_days: "5 a 8", sedex_price: 34.9, sedex_days: "2 a 4" },
  SE: { pac_price: 24.9, pac_days: "6 a 9", sedex_price: 39.9, sedex_days: "3 a 5" },
  S:  { pac_price: 29.9, pac_days: "8 a 11", sedex_price: 49.9, sedex_days: "4 a 6" },
  CO: { pac_price: 27.9, pac_days: "7 a 10", sedex_price: 44.9, sedex_days: "3 a 5" },
  N:  { pac_price: 34.9, pac_days: "10 a 15", sedex_price: 59.9, sedex_days: "5 a 8" },
};

export const ufToRegion = (uf: string): RegionCode => {
  const u = uf?.toUpperCase() || "";
  if (["CE", "PE", "BA", "MA", "PI", "RN", "PB", "AL", "SE"].includes(u)) return "NE";
  if (["SP", "RJ", "MG", "ES"].includes(u)) return "SE";
  if (["PR", "SC", "RS"].includes(u)) return "S";
  if (["GO", "MT", "MS", "DF"].includes(u)) return "CO";
  return "N";
};

// Mesma regra usada no servidor ao criar o pedido (faixas de CEP).
export const cepToRegion = (cep: string): RegionCode => {
  const n = parseInt(cep.replace(/\D/g, ""), 10) || 0;
  if (n >= 1000000 && n <= 39999999) return "SE";
  if (n >= 40000000 && n <= 65999999) return "NE";
  if ((n >= 66000000 && n <= 69999999) || (n >= 76800000 && n <= 77999999)) return "N";
  if ((n >= 70000000 && n <= 76799999) || (n >= 78000000 && n <= 79999999)) return "CO";
  if (n >= 80000000 && n <= 99999999) return "S";
  return "NE";
};

export const parseShippingConfig = (raw?: string | null): Record<string, RegionCfg> => {
  if (!raw) return DEFAULT_SHIPPING;
  try {
    return { ...DEFAULT_SHIPPING, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SHIPPING;
  }
};

export type ShippingOption = {
  name: "PAC" | "SEDEX";
  days: string;
  price: number;
  free: boolean;
};

export const estimateShippingOptions = (
  cep: string,
  cfg: Record<string, RegionCfg>,
  allFree: boolean
): ShippingOption[] => {
  const r = cfg[cepToRegion(cep)] || DEFAULT_SHIPPING.SE;
  return [
    { name: "PAC", days: `${r.pac_days} dias úteis`, price: allFree ? 0 : r.pac_price, free: allFree },
    { name: "SEDEX", days: `${r.sedex_days} dias úteis`, price: r.sedex_price, free: false },
  ];
};

export type ViaCepResult = {
  cep: string;
  localidade: string;
  uf: string;
  bairro?: string;
  logradouro?: string;
  erro?: boolean;
};

export const fetchViaCep = async (cep: string): Promise<ViaCepResult | null> => {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  try {
    const r = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    const data = (await r.json()) as ViaCepResult;
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
};
