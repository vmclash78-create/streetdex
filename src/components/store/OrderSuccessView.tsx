import { useState } from "react";
import { Check, ExternalLink, Copy, CheckCheck, MessageCircle } from "lucide-react";
import DuarttLogo from "./DuarttLogo";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useStoreSettings } from "@/hooks/useStoreData";
import { WHATSAPP } from "./storeData";
import { getWhatsAppLink } from "@/utils/whatsapp";

interface OrderSuccessViewProps {
  orderId: string;
  orderNumber: number;
  onBackToStore: () => void;
}

const OrderSuccessView = ({ orderId, orderNumber, onBackToStore }: OrderSuccessViewProps) => {
  const [copied, setCopied] = useState(false);
  const { data: settings } = useStoreSettings();
  const whatsapp = settings?.whatsapp_store || settings?.whatsapp || WHATSAPP;

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(String(orderNumber));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendOrderNumberToWhatsApp = () => {
    const msg = `Olá! Acabei de realizar o pedido #${orderNumber} no site. Aguardo confirmação!`;
    window.open(getWhatsAppLink(whatsapp, msg), "_blank");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-2xl mx-auto">
      <header className="bg-card border-b border-border sticky top-0 z-50 flex items-center justify-center px-4 h-14">
        <DuarttLogo size="sm" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check size={32} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Pedido realizado!</h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          Seu pedido <span className="font-semibold text-foreground">#{orderNumber}</span> foi registrado com sucesso.
          Você será notificado sobre atualizações do status.
        </p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Button variant="outline" onClick={copyOrderNumber} className="gap-2">
            {copied ? <CheckCheck size={16} className="text-green-600" /> : <Copy size={16} />}
            {copied ? "Copiado!" : `Copiar nº do pedido: #${orderNumber}`}
          </Button>
          <Button variant="outline" onClick={sendOrderNumberToWhatsApp} className="gap-2 text-green-600 border-green-600/50 hover:bg-green-500/10">
            <MessageCircle size={16} />
            Enviar número via WhatsApp
          </Button>
        </div>
        <Button variant="link" asChild>
          <Link to={`/pedido/${orderId}`} className="gap-2">
            <ExternalLink size={16} /> Acompanhar pedido
          </Link>
        </Button>
        <Button onClick={onBackToStore} size="lg" className="mt-2">
          Continuar comprando
        </Button>
      </div>
    </div>
  );
};

export default OrderSuccessView;
