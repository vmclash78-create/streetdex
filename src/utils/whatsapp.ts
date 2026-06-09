export const getWhatsAppLink = (number: any, message?: string) => {
  if (!number) return "https://wa.me";
  
  // Remove tudo que não for dígito
  const cleanedNumber = number.toString().replace(/\D/g, "");
  
  // Regra básica para números do Brasil:
  // Se tem 10 ou 11 dígitos, adiciona o 55 (Brasil)
  let finalNumber = cleanedNumber;
  if ((cleanedNumber.length === 10 || cleanedNumber.length === 11) && !cleanedNumber.startsWith("55")) {
    finalNumber = `55${cleanedNumber}`;
  }
  
  const baseUrl = `https://wa.me/${finalNumber}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
};
