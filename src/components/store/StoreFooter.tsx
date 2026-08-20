import { MessageCircle, Instagram, Mail, MapPin, Shield, Truck, CreditCard, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import StreetDexLogo from "./StreetDexLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWhatsAppLink } from "@/utils/whatsapp";
import { WHATSAPP } from "./storeData";
import { useStoreSettings } from "@/hooks/useStoreData";

interface StoreFooterProps {
  onNavigateHome: () => void;
  whatsapp?: string;
  storeName?: string;
}

const StoreFooter = ({ onNavigateHome, whatsapp, storeName }: StoreFooterProps) => {
  const whatsappNumber = whatsapp || WHATSAPP;
  const year = new Date().getFullYear();
  const { data: settings } = useStoreSettings();

  return (
    <footer className="relative bg-card border-t border-primary/30 transition-colors duration-300 overflow-hidden">
      {/* Neon top accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent neon-glow" />

      {/* CTA Band */}
      <div className="relative border-b border-border/40 bg-gradient-to-r from-primary/10 via-card to-primary/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={12} className="text-primary animate-pulse" />
              <p className="text-[0.65rem] text-primary font-bold tracking-[0.3em] uppercase">Comunidade Street</p>
            </div>
            <h3 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground leading-[0.9] italic mb-3">
              ENTRE NO GRUPO. <br/><span className="text-primary neon-text-glow">SAI NA FRENTE.</span>
            </h3>
            <p className="text-sm text-muted-foreground font-medium max-w-md">
              Acesso exclusivo a drops limitados, cupons secretos e lançamentos antes de todo o mercado.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex w-full md:justify-end"
          >
            <Button
              asChild
              className="h-14 px-10 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-wider text-sm neon-glow hover:neon-glow-strong transition-all duration-300 gap-3 w-full md:w-auto rounded-none skew-x-[-12deg]"
            >
              <a 
                href={settings?.whatsapp_group_url || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center"
              >
                <span className="skew-x-[12deg] flex items-center gap-2">
                  <MessageCircle size={20} /> Entrar no Grupo VIP
                </span>
              </a>
            </Button>
          </motion.div>
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
                  Fale Conosco
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
