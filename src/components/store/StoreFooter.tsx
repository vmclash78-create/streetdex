import { MessageCircle, Truck, Crown } from "lucide-react";
import { WHATSAPP } from "./storeData";

interface StoreFooterProps {
  onNavigateHome: () => void;
}

const StoreFooter = ({ onNavigateHome }: StoreFooterProps) => (
  <footer className="bg-foreground text-background">
    <div className="max-w-[1200px] mx-auto px-5 pt-8 pb-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <div className="flex flex-col items-start mb-2">
            <Crown size={12} className="text-background mb-[-2px]" strokeWidth={1.5} />
            <span className="text-2xl font-light tracking-tight font-serif">duartt</span>
          </div>
          <p className="text-sm text-background/50 leading-relaxed">Camisas personalizadas com qualidade e estilo.</p>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-background/40 mb-2">Navegação</h4>
          <ul className="space-y-1.5">
            <li><button onClick={onNavigateHome} className="text-sm text-background/60 hover:text-background transition-colors">Início</button></li>
            <li><button onClick={onNavigateHome} className="text-sm text-background/60 hover:text-background transition-colors">Catálogo</button></li>
            <li><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="text-sm text-background/60 hover:text-background transition-colors">Contato</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-background/40 mb-2">Contato</h4>
          <ul className="space-y-1.5">
            <li className="flex items-center gap-2 text-sm text-background/60"><MessageCircle size={14} /> WhatsApp</li>
            <li className="flex items-center gap-2 text-sm text-background/60"><Truck size={14} /> Entrega via Correios</li>
          </ul>
        </div>
      </div>
      <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full max-w-sm mx-auto py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors mb-5">
        <MessageCircle size={16} /> Falar no WhatsApp
      </a>
      <div className="border-t border-background/10 pt-3">
        <p className="text-center text-xs text-background/30">© {new Date().getFullYear()} Duartt. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
);

export default StoreFooter;
