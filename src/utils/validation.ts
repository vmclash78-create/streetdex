export const BRAZIL_DDDS = [
  "11", "12", "13", "14", "15", "16", "17", "18", "19",
  "21", "22", "24", "27", "28", "31", "32", "33", "34", "35", "37", "38",
  "41", "42", "43", "44", "45", "46", "47", "48", "49",
  "51", "53", "54", "55", "61", "62", "63", "64", "65", "66", "67", "68", "69",
  "71", "73", "74", "75", "77", "79", "81", "82", "83", "84", "85", "86", "87", "88", "89",
  "91", "92", "93", "94", "95", "96", "97", "98", "99"
];

export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.length !== 11) {
    return { isValid: false, error: "O número deve ter 11 dígitos: 2 do DDD + o 9 + 8 do telefone." };
  }

  // Check for invalid repeating digits
  if (/^(\d)\1+$/.test(cleaned)) {
    return { isValid: false, error: "Número de telefone inválido (digitos repetidos)." };
  }

  const ddd = cleaned.substring(0, 2);
  if (!BRAZIL_DDDS.includes(ddd)) {
    return { isValid: false, error: "DDD inválido. Verifique os dois primeiros dígitos." };
  }

  if (cleaned[2] !== "9") {
    return { isValid: false, error: "O número de celular deve começar com o dígito 9 após o DDD." };
  }

  return { isValid: true };
};

export const validateCEP = async (cep: string) => {
  const cleaned = cep.replace(/\D/g, "");
  if (cleaned.length !== 8) return { isValid: false, error: "CEP deve ter 8 dígitos." };

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      return { isValid: false, error: "CEP não encontrado." };
    }

    return { isValid: true, data };
  } catch (error) {
    return { isValid: false, error: "Erro ao verificar CEP. Tente novamente." };
  }
};
