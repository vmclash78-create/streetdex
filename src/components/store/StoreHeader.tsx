import { useEffect, useState, memo } from "react"; from "react";
import { ShoppingCart, Search, Menu, MessageCircle, Truck, Heart, X, ChevronRight, Instagram, Sparkles, Tag } from "lucide-react";
import StreetDexLogo from "./StreetDexLogo";
import ThemeToggle from "./ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { navLinks, WHATSAPP } from "./storeData";
import { getWhatsAppLink } from "@/utils/whatsapp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";

interface StoreHeaderProps {
  cartCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onCartClick: () => void;
  categories?: string[];
  selectedCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
  whatsapp?: string;
  announcementText?: string;
}

const StoreHeader = memo(({ cartCount, searchQuery, onSearchChange, onCartClick, categories = [], selectedCategory, onCategoryChange, whatsapp, announcementText }: StoreHeaderProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const whatsappNumber = whatsapp || WHATSAPP;
  const announcement = announcementText || "ENVIO COM 5 DIAS ÚTEIS | CUPOM: HAPPY | ❤️ FRETE GRÁTIS A PARTIR DE R$399,99";

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (!sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    document.body.style.overflow = "unset";
  };

  // Close on ESC
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSidebar();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarOpen]);

  return (
    <>
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeSidebar}
              className="fixed inset-0 bg-background/70 backdrop-blur-md z-[100] cursor-pointer"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navegação"
              className="fixed inset-y-0 left-0 w-[88vw] max-w-[340px] z-[101] flex flex-col bg-background border-r border-primary/20 shadow-[8px_0_40px_-12px_hsl(var(--primary)/0.4)]"
            >
              {/* Neon edge */}
              <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-primary/60 to-transparent" />

              {/* Header with gradient */}
              <div className="relative overflow-hidden border-b border-border/50">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />
                <div className="relative flex items-center justify-between p-5">
                  <div className="flex flex-col gap-1">
                    <StreetDexLogo size="sm" />
                    <p className="text-[0.6rem] uppercase tracking-[0.3em] text-primary/80 font-bold flex items-center gap-1">
                      <Sparkles size={10} /> Streetwear Drop
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeSidebar}
                    aria-label="Fechar menu"
                    className="rounded-full hover:bg-primary/10 hover:rotate-90 transition-all duration-300"
                  >
                    <X size={20} />
                  </Button>
                </div>

                {/* Quick search */}
                <div className="relative px-5 pb-5">
                  <Search size={14} className="absolute left-8 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="O que você procura?"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-10 pl-9 pr-3 rounded-full bg-background/60 border-border/60 focus:border-primary/60 text-sm backdrop-blur-sm"
                  />
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto py-4 scrollbar-none">
                {/* Categorias em destaque (vem primeiro no mobile) */}
                {categories.length > 0 && (
                  <div className="px-5 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag size={12} className="text-primary" />
                      <p className="text-[0.6rem] uppercase font-black text-primary tracking-[0.3em]">Categorias</p>
                      <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => { onCategoryChange(null); closeSidebar(); }}
                        className={`group relative flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                          selectedCategory === null
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {selectedCategory === null && (
                            <motion.span layoutId="cat-indicator" className="w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary))]" />
                          )}
                          Todos os produtos
                        </span>
                        <ChevronRight size={12} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </button>
                      {categories.map((cat, i) => {
                        const active = selectedCategory === cat;
                        return (
                          <motion.button
                            key={cat}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 + i * 0.025 }}
                            onClick={() => { onCategoryChange(active ? null : cat); closeSidebar(); }}
                            className={`group relative flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                              active
                                ? "bg-primary/10 text-primary"
                                : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {active && (
                                <motion.span layoutId="cat-indicator" className="w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary))]" />
                              )}
                              {cat}
                            </span>
                            <ChevronRight size={12} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Nav principal */}
                <div className="px-5 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[0.6rem] uppercase font-black text-muted-foreground tracking-[0.3em]">Navegação</p>
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                  </div>
                  <ul className="flex flex-col gap-0.5">
                    {navLinks.map((link, i) => {
                      const isContact = link.key === "Contato";
                      const baseCls = "group flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-bold text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200 tracking-wider uppercase";
                      return (
                        <motion.li
                          key={link.key}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.04 }}
                        >
                          {isContact ? (
                            <a href={getWhatsAppLink(whatsappNumber)} target="_blank" rel="noopener noreferrer" onClick={closeSidebar} className={baseCls}>
                              <span>{link.label}</span>
                              <ChevronRight size={12} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </a>
                          ) : (
                            <button onClick={closeSidebar} className={`${baseCls} w-full text-left`}>
                              <span>{link.label}</span>
                              <ChevronRight size={12} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </button>
                          )}
                        </motion.li>
                      );
                    })}
                  </ul>
                </div>

                {/* Acessos rápidos */}
                <div className="px-5">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[0.6rem] uppercase font-black text-muted-foreground tracking-[0.3em]">Atalhos</p>
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    <li>
                      <a href={getWhatsAppLink(whatsappNumber)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-primary/5 transition-all duration-200 group">
                        <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 group-hover:scale-105 transition-all">
                          <MessageCircle size={16} className="text-green-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground tracking-wide uppercase">WhatsApp</span>
                          <span className="text-[0.65rem] text-muted-foreground">Tire suas dúvidas</span>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a href="/rastrear" onClick={closeSidebar} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-primary/5 transition-all duration-200 group">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-105 transition-all">
                          <Truck size={16} className="text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground tracking-wide uppercase">Rastrear pedido</span>
                          <span className="text-[0.65rem] text-muted-foreground">Acompanhe a entrega</span>
                        </div>
                      </a>
                    </li>
                    <li>
                      <button className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-primary/5 transition-all duration-200 group">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-105 transition-all">
                          <Heart size={16} className="text-primary" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold text-foreground tracking-wide uppercase">Lista de desejos</span>
                          <span className="text-[0.65rem] text-muted-foreground">Seus favoritos</span>
                        </div>
                      </button>
                    </li>
                  </ul>
                </div>
              </nav>

              {/* Footer */}
              <div className="border-t border-border/50 p-5 bg-muted/20">
                <p className="text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground mb-3 font-bold">Siga-nos</p>
                <div className="flex items-center gap-2">
                  <a href={getWhatsAppLink(whatsappNumber)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center hover:border-primary hover:bg-primary/10 hover:text-primary transition-all">
                    <MessageCircle size={14} />
                  </a>
                  <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center hover:border-primary hover:bg-primary/10 hover:text-primary transition-all">
                    <Instagram size={14} />
                  </a>
                  <div className="ml-auto text-right">
                    <p className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">© Street Dex</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>


      {/* Announcement bar */}
      <div className="bg-primary text-primary-foreground text-center py-1.5 text-[0.65rem] font-semibold tracking-[0.15em] uppercase">
        {announcement}
      </div>

      {/* Fixed header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-[1200px] mx-auto grid grid-cols-3 items-center px-4 h-16 relative">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary hover:scale-105 active:scale-95 transition-all duration-200 relative group"
              aria-label="Abrir menu de navegação"
              aria-expanded={sidebarOpen}
              onClick={toggleSidebar}
            >
              <Menu size={20} strokeWidth={2} />
              <span className="absolute inset-0 rounded-full ring-1 ring-primary/0 group-hover:ring-primary/40 transition-all" />
            </Button>
            
            <div className="sm:block hidden">
              <StreetDexLogo size="sm" />
            </div>
          </div>

          {/* Center: search (PC) or Logo (Mobile) */}
          <div className="flex justify-center">
            {/* Desktop Search */}
            <div className="hidden sm:block w-full max-w-md relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-9 pl-9 pr-3 rounded-full bg-muted/50 border-border/50 focus:border-primary/50 w-full"
              />
            </div>
            {/* Mobile Center Logo */}
            <div className="sm:hidden">
              <StreetDexLogo size="sm" />
            </div>
          </div>

          {/* Right: theme + cart */}
          <div className="flex items-center justify-end gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={onCartClick} className="relative">
              <ShoppingCart size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[9px] animate-pulse-neon">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden px-4 pb-2.5">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 pl-9 pr-3 rounded-full bg-muted/50 border-border/50 text-sm"
            />
          </div>
        </div>

        {/* Desktop category nav */}
        {!isMobile && categories.length > 0 && (
          <div className="max-w-[1200px] mx-auto px-4 pb-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <Button
              variant={selectedCategory === null ? "default" : "ghost"}
              size="sm"
              className={`flex-shrink-0 rounded-full text-[0.7rem] h-7 tracking-wider uppercase font-semibold ${selectedCategory === null ? "neon-glow" : ""}`}
              onClick={() => onCategoryChange(null)}
            >
              Todos
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "ghost"}
                size="sm"
                className={`flex-shrink-0 rounded-full text-[0.7rem] h-7 tracking-wider uppercase font-semibold ${selectedCategory === cat ? "neon-glow" : ""}`}
                onClick={() => onCategoryChange(selectedCategory === cat ? null : cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}
      </header>
    </>
  );
};

export default memo(StoreHeader);
