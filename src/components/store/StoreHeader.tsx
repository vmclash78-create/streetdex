import { useState } from "react";
import { ShoppingCart, Search, Menu, MessageCircle, Truck, Heart, X, ChevronRight } from "lucide-react";
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

const StoreHeader = ({ cartCount, searchQuery, onSearchChange, onCartClick, categories = [], selectedCategory, onCategoryChange, whatsapp, announcementText }: StoreHeaderProps) => {
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
              onClick={closeSidebar}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[100] cursor-pointer"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[300px] bg-background border-r border-border/50 z-[101] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/50">
                <StreetDexLogo size="sm" />
                <Button variant="ghost" size="icon" onClick={closeSidebar} aria-label="Fechar menu">
                  <X size={20} />
                </Button>
              </div>

              <nav className="flex-1 overflow-y-auto py-6">
                <ul className="space-y-1">
                  {navLinks.map((link) => {
                    const isContact = link.key === "Contato";
                    return (
                      <li key={link.key}>
                        {isContact ? (
                          <a
                            href={getWhatsAppLink(whatsappNumber)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={closeSidebar}
                            className="flex items-center justify-between px-6 py-3.5 text-sm font-bold text-foreground hover:bg-primary/5 hover:text-primary transition-all duration-200 tracking-wider uppercase group"
                          >
                            <span>{link.label}</span>
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                          </a>
                        ) : (
                          <button
                            onClick={closeSidebar}
                            className="flex items-center justify-between w-full text-left px-6 py-3.5 text-sm font-bold text-foreground hover:bg-primary/5 hover:text-primary transition-all duration-200 tracking-wider uppercase group"
                          >
                            <span>{link.label}</span>
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-8 pt-8 border-t border-border/50">
                  <ul className="space-y-1">
                    <li>
                      <a href={getWhatsAppLink(whatsappNumber)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3.5 hover:bg-primary/5 transition-all duration-200 group">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                          <MessageCircle size={16} className="text-green-500" />
                        </div>
                        <span className="text-sm font-bold text-foreground tracking-wide uppercase">WhatsApp</span>
                      </a>
                    </li>
                    <li>
                      <a href="/rastrear" onClick={closeSidebar} className="flex items-center gap-3 px-6 py-3.5 hover:bg-primary/5 transition-all duration-200 group">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Truck size={16} className="text-primary" />
                        </div>
                        <span className="text-sm font-bold text-foreground tracking-wide uppercase">Rastrear pedido</span>
                      </a>
                    </li>
                    <li>
                      <button className="flex items-center gap-3 w-full px-6 py-3.5 hover:bg-primary/5 transition-all duration-200 group">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Heart size={16} className="text-primary" />
                        </div>
                        <span className="text-sm font-bold text-foreground tracking-wide uppercase">Lista de desejos</span>
                      </button>
                    </li>
                  </ul>
                </div>

                {categories.length > 0 && (
                  <div className="mt-8 px-6">
                    <p className="text-[0.65rem] uppercase font-black text-primary tracking-[0.3em] mb-4">Categorias</p>
                    <div className="flex flex-col gap-1">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            onCategoryChange(selectedCategory === cat ? null : cat);
                            closeSidebar();
                          }}
                          className={`text-left py-2 text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                            selectedCategory === cat ? "text-primary neon-text" : "text-foreground/60 hover:text-primary"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Announcement bar */}
      <div className="bg-primary text-primary-foreground text-center py-1.5 text-[0.65rem] font-semibold tracking-[0.15em] uppercase">
        {announcement}
      </div>

      {/* Fixed header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-[1200px] mx-auto flex items-center gap-3 px-4 h-16">
          {/* Left: hamburger + logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-primary/10 transition-colors"
              aria-label="Abrir menu de navegação"
              onClick={toggleSidebar}
            >
              <Menu size={20} strokeWidth={1.5} />
            </Button>
            <StreetDexLogo size="sm" />
          </div>

          {/* Center: search */}
          <div className="flex-1 max-w-md mx-auto relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 pl-9 pr-3 rounded-full bg-muted/50 border-border/50 focus:border-primary/50"
            />
          </div>

          {/* Right: theme + cart */}
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
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

export default StoreHeader;
