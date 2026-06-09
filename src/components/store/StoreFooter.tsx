import { MessageCircle, Truck, Instagram } from "lucide-react";
import StreetDexLogo from "./StreetDexLogo";
import { Button } from "@/components/ui/button";

interface StoreFooterProps {
  onNavigateHome: () => void;
  whatsapp?: string;
  storeName?: string;
}

const StoreFooter = ({ onNavigateHome, whatsapp, storeName }: StoreFooterProps) => {
  const whatsappNumber = whatsapp || "8899999999999";

  return (
    <footer className="bg-card border-t border-border/50 transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-5 pt-10 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="mb-3">
              <StreetDexLogo size="md" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Streetwear autêntico. Estilo que define quem você é.
            </p>
            <div className="flex gap-3 mt-4">
              <a href={`https://wa.me/${whatsappNumber.toString().replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors">
                <MessageCircle size={16} className="text-foreground" />
              </a>
              <button className="w-9 h-9 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Instagram size={16} className="text-foreground" />
              </button>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Navegação</h4>
            <ul className="space-y-2">
              <li>
                <Button variant="link" onClick={onNavigateHome} className="text-muted-foreground hover:text-primary p-0 h-auto text-sm font-medium">
                  Início
                </Button>
              </li>
              <li>
                <Button variant="link" onClick={onNavigateHome} className="text-muted-foreground hover:text-primary p-0 h-auto text-sm font-medium">
                  Catálogo
                </Button>
              </li>
              <li>
                <a href={`https://wa.me/${whatsappNumber.toString().replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                  Contato
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Atendimento</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle size={14} className="text-green-500" /> WhatsApp
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck size={14} className="text-primary" /> Entrega via Correios
              </li>
            </ul>
          </div>
        </div>

        <Button asChild className="w-full max-w-sm mx-auto flex bg-green-600 hover:bg-green-500 text-white mb-6 font-bold tracking-wider uppercase h-11">
          <a href={`https://wa.me/${whatsappNumber.toString().replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="gap-2">
            <MessageCircle size={16} /> Falar no WhatsApp
          </a>
        </Button>

        <div className="border-t border-border/50 pt-4">
          <p className="text-center text-xs text-muted-foreground tracking-wider">
            © {new Date().getFullYear()} OppsEvo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;
