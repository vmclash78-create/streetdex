export const getWhatsAppLink = (number: any, message?: string) => {
  if (!number) return "https://wa.me";
  
  // Extrai apenas os números para garantir um formato limpo
  let cleaned = number.toString().replace(/\D/g, "");
  
  // Se o número começar com 0 (ex: 088...), remove o zero inicial
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }
  
  // Se o número tiver 10 ou 11 dígitos (DDD + número), adiciona o 55 do Brasil
  if ((cleaned.length === 10 || cleaned.length === 11) && !cleaned.startsWith("55")) {
    cleaned = `55${cleaned}`;
  }
  
  // Construção do link wa.me (padrão oficial simplificado)
  const baseUrl = `https://wa.me/${cleaned}`;
  
  if (!message) return baseUrl;
  
  // Adiciona a mensagem apenas se houver conteúdo, evitando parâmetros vazios
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
};
