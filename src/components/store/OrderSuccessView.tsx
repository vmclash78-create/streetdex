import { Check, ShoppingBag, ExternalLink } from "lucide-react";
import DuarttLogo from "./DuarttLogo";
import { Link } from "react-router-dom";

interface OrderSuccessViewProps {
  orderId: string;
  orderNumber: number;
  onBackToStore: () => void;
}

const OrderSuccessView = ({ orderId, orderNumber, onBackToStore }: OrderSuccessViewProps) => {
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
        <Link to={`/pedido/${orderId}`} className="flex items-center gap-2 text-primary font-semibold text-sm hover:underline">
          <ExternalLink size={16} /> Acompanhar pedido
        </Link>
        <button onClick={onBackToStore} className="bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-xl mt-2">
          Continuar comprando
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessView;
