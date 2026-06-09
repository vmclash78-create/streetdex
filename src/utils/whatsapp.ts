export const getWhatsAppLink = (number: string, message?: string) => {
  // Remove tudo que não for dígito
  const cleanedNumber = number.toString().replace(/\D/g, "");
  
  // Garante que o número comece com o código do país se necessário (assumindo Brasil 55 se tiver 11 dígitos sem o 55)
  let finalNumber = cleanedNumber;
  if (cleanedNumber.length === 11 && !cleanedNumber.startsWith("55")) {
    finalNumber = `55${cleanedNumber}`;
  }
  
  const baseUrl = `https://wa.me/${finalNumber}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
};
