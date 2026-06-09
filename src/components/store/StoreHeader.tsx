import { useState } from "react";
import { ShoppingCart, Search, Menu, MessageCircle, Truck, Heart } from "lucide-react";
import StreetDexLogo from "./StreetDexLogo";
import ThemeToggle from "./ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { navLinks } from "./storeData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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

  const whatsappNumber = whatsapp || "5585992783973";
  const announcement = announcementText || "ENVIO COM 5 DIAS ÚTEIS | CUPOM: HAPPY | ❤️ FRETE GRÁTIS A PARTIR DE R$399,99";

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-primary text-primary-foreground text-center py-1.5 text-[0.65rem] font-semibold tracking-[0.15em] uppercase">
        {announcement}
      </div>

      {/* Fixed header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-[1200px] mx-auto flex items-center gap-3 px-4 h-16">
          {/* Left: hamburger + logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Abrir menu de navegação">
                  <Menu size={20} strokeWidth={1.5} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 bg-background border-r border-border/50">
                <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/50">
                  <SheetTitle className="flex items-center">
                    <StreetDexLogo size="sm" />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex-1 py-3 overflow-y-auto">
                  {navLinks.map((link) => (
                    <button
                      key={link.key}
                      onClick={() => setSidebarOpen(false)}
                      className="block w-full text-left px-5 py-3 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors tracking-wide uppercase"
                    >
                      {link.label}
                    </button>
                  ))}
                  <div className="border-t border-border/50 my-3 mx-5" />
                  <a href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-3 hover:bg-primary/10 transition-colors">
                    <MessageCircle size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-foreground">WhatsApp</span>
                  </a>
                  <a href="/rastrear" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-primary/10 w-full text-left transition-colors">
                    <Truck size={16} className="text-foreground" />
                    <span className="text-sm font-medium text-foreground">Rastrear pedido</span>
                  </a>
                  <button className="flex items-center gap-3 px-5 py-3 hover:bg-primary/10 w-full text-left transition-colors">
                    <Heart size={16} className="text-foreground" />
                    <span className="text-sm font-medium text-foreground">Lista de desejos</span>
                  </button>
                  {categories.length > 0 && (
                    <>
                      <div className="border-t border-border/50 my-3 mx-5" />
                      <div className="px-5 py-2">
                        <p className="text-[0.6rem] uppercase font-bold text-primary tracking-[0.2em] mb-2">Categorias</p>
                        {categories.map((cat) => (
                          <button key={cat} onClick={() => { onCategoryChange(selectedCategory === cat ? null : cat); setSidebarOpen(false); }} className={`block w-full text-left py-2 text-sm font-medium transition-colors ${selectedCategory === cat ? "text-primary" : "text-foreground/70 hover:text-primary"}`}>
                            {cat}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
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
