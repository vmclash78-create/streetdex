/**
 * Gera um link para o WhatsApp com sanitização rigorosa do número.
 */
export const getWhatsAppLink = (number: string | number, message?: string) => {
  if (!number) return "https://wa.me";
  
  // Extrai apenas os números
  let cleaned = number.toString().replace(/\D/g, "");
  
  // Previne injeção de caracteres no link
  cleaned = cleaned.replace(/[^0-9]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  if (cleaned.startsWith("5555")) {
    cleaned = cleaned.substring(2);
  }
  
  if ((cleaned.length === 10 || cleaned.length === 11) && !cleaned.startsWith("55")) {
    cleaned = `55${cleaned}`;
  }
  
  const url = new URL(`https://wa.me/${cleaned}`);
  if (message && message.trim().length > 0) {
    url.searchParams.set("text", message);
  }
  
  return url.toString();
};
