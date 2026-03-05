import { MessageCircle, Truck } from "lucide-react";
import StreetDexLogo from "./StreetDexLogo";

interface StoreFooterProps {
  onNavigateHome: () => void;
  whatsapp?: string;
  storeName?: string;
}

const StoreFooter = ({ onNavigateHome, whatsapp, storeName }: StoreFooterProps) => {
  const whatsappNumber = whatsapp || "5585992783973";
  const name = storeName || "Street Dex";

  return (
    <footer className="bg-card border-t border-border transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-5 pt-8 pb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="mb-2">
              <StreetDexLogo size="sm" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">Camisas personalizadas com qualidade e estilo.</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Navegação</h4>
            <ul className="space-y-1.5">
              <li><button onClick={onNavigateHome} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Início</button></li>
              <li><button onClick={onNavigateHome} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Catálogo</button></li>
              <li><a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contato</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Contato</h4>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2 text-sm text-muted-foreground"><MessageCircle size={14} /> WhatsApp</li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground"><Truck size={14} /> Entrega via Correios</li>
            </ul>
          </div>
        </div>
        <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full max-w-sm mx-auto py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors mb-5">
          <MessageCircle size={16} /> Falar no WhatsApp
        </a>
        <div className="border-t border-border pt-3">
          <p className="text-center text-xs text-muted-foreground">© {new Date().getFullYear()} OppsEvo SaaS. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;
