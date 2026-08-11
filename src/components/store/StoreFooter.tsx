import { MessageCircle, Instagram, Mail, MapPin, Shield, Truck, CreditCard, Zap } from "lucide-react";
import StreetDexLogo from "./StreetDexLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWhatsAppLink } from "@/utils/whatsapp";
import { WHATSAPP } from "./storeData";

interface StoreFooterProps {
  onNavigateHome: () => void;
  whatsapp?: string;
  storeName?: string;
}

const StoreFooter = ({ onNavigateHome, whatsapp, storeName }: StoreFooterProps) => {
  const whatsappNumber = whatsapp || WHATSAPP;
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-card border-t border-primary/30 transition-colors duration-300 overflow-hidden">
      {/* Neon top accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent neon-glow" />

      {/* CTA Band */}
      <div className="relative border-b border-border/40 bg-gradient-to-r from-primary/10 via-card to-primary/10">
        <div className="max-w-[1200px] mx-auto px-5 py-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <p className="text-[0.65rem] text-primary font-bold tracking-[0.3em] uppercase mb-1">Newsletter</p>
            <h3 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wider text-foreground leading-tight">
              Entre na lista. <span className="text-primary">Sai na frente.</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5">
              Drops, cupons e lançamentos antes de todo mundo.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex gap-2 w-full"
          >
            <Input
              type="email"
              required
              placeholder="seu@email.com"
              className="bg-background/60 border-border/60 h-11 text-sm focus-visible:ring-primary"
            />
            <Button
              type="submit"
              className="h-11 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-xs neon-glow gap-1.5"
            >
              <Zap size={14} /> Assinar
            </Button>
          </form>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-[1200px] mx-auto px-5 pt-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3">
              <StreetDexLogo size="md" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-[260px]">
              Streetwear autêntico. Estilo que define quem você é.
            </p>
            <div className="flex gap-2">
              <a
                href={getWhatsAppLink(whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-md border border-border/60 bg-background/40 hover:border-primary hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all"
              >
                <MessageCircle size={15} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-md border border-border/60 bg-background/40 hover:border-primary hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all"
              >
                <Instagram size={15} />
              </a>
              <a
                href={`mailto:contato@${(storeName || "streetdex").toLowerCase().replace(/\s+/g, "")}.com`}
                aria-label="Email"
                className="w-9 h-9 rounded-md border border-border/60 bg-background/40 hover:border-primary hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all"
              >
                <Mail size={15} />
              </a>
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-primary mb-4 flex items-center gap-2">
              <span className="w-4 h-px bg-primary" /> Loja
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={onNavigateHome} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                  Início
                </button>
              </li>
              <li>
                <button onClick={onNavigateHome} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                  Catálogo
                </button>
              </li>
              <li>
                <a href="#best-sellers" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                  Best Sellers
                </a>
              </li>
              <li>
                <a href={getWhatsAppLink(whatsappNumber)} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                  Estampa personalizada
                </a>
              </li>
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-primary mb-4 flex items-center gap-2">
              <span className="w-4 h-px bg-primary" /> Ajuda
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck size={13} className="text-primary/80" /> Envio para todo BR
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield size={13} className="text-primary/80" /> Compra segura
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard size={13} className="text-primary/80" /> Parcelamos 12x
              </li>
              <li>
                <a href="#faq" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                  Perguntas Frequentes
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-primary mb-4 flex items-center gap-2">
              <span className="w-4 h-px bg-primary" /> Contato
            </h4>
            <ul className="space-y-2.5 mb-4">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MessageCircle size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
                <a href={getWhatsAppLink(whatsappNumber)} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  WhatsApp / Suporte
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin size={13} className="text-primary/80 mt-0.5 flex-shrink-0" />
                <span>Brasil — envios via Correios</span>
              </li>
            </ul>
            <Button asChild size="sm" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold tracking-wider uppercase text-xs h-10 gap-2">
              <a href={getWhatsAppLink(whatsappNumber)} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={14} /> Falar agora
              </a>
            </Button>
          </div>
        </div>

        {/* Copy */}
        <div className="pt-6 border-t border-border/40">
          <p className="text-[0.65rem] text-muted-foreground tracking-wider text-center">
            © {year} <span className="text-foreground font-bold">{storeName || "Street Dex"}</span> — Todos os direitos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default StoreFooter;
