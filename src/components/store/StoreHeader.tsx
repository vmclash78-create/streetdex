import { useState } from "react";
import { ShoppingCart, Search, Menu, X, MessageCircle, Truck, Heart } from "lucide-react";
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
      <div className="bg-primary text-primary-foreground text-center py-1 text-[0.65rem] font-medium tracking-wide">
        {announcement}
      </div>

      {/* Fixed header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-[1200px] mx-auto flex items-center gap-3 px-3 h-14">
          {/* Left: hamburger + logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Abrir menu de navegação">
                  <Menu size={20} strokeWidth={1.5} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
                  <SheetTitle className="flex items-center justify-between">
                    <StreetDexLogo size="sm" />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex-1 py-2 overflow-y-auto">
                  {navLinks.map((link) => (
                    <button
                      key={link.key}
                      onClick={() => setSidebarOpen(false)}
                      className="block w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}
                  <div className="border-t border-border my-2 mx-4" />
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted">
                    <MessageCircle size={16} className="text-green-600" />
                    <span className="text-sm text-foreground">WhatsApp</span>
                  </a>
                  <a href="/rastrear" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted w-full text-left">
                    <Truck size={16} className="text-foreground" />
                    <span className="text-sm text-foreground">Rastrear pedido</span>
                  </a>
                  <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted w-full text-left">
                    <Heart size={16} className="text-foreground" />
                    <span className="text-sm text-foreground">Lista de desejos</span>
                  </button>
                  <div className="border-t border-border my-2 mx-4" />
                  <div className="px-4 py-2">
                    <p className="text-[0.6rem] uppercase font-bold text-muted-foreground tracking-widest mb-1.5">Categorias</p>
                    {categories.map((cat) => (
                      <button key={cat} onClick={() => { onCategoryChange(selectedCategory === cat ? null : cat); setSidebarOpen(false); }} className={`block w-full text-left py-1.5 text-sm transition-colors ${selectedCategory === cat ? "text-primary font-semibold" : "text-foreground hover:text-primary"}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
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
              className="h-9 pl-9 pr-3 rounded-full"
            />
          </div>

          {/* Right: theme + cart */}
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={onCartClick} className="relative">
              <ShoppingCart size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[9px]">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden px-3 pb-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 pl-9 pr-3 rounded-full text-sm"
            />
          </div>
        </div>

        {/* Desktop category nav */}
        {!isMobile && categories.length > 0 && (
          <div className="max-w-[1200px] mx-auto px-3 pb-2 flex items-center gap-1 overflow-x-auto">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              className="flex-shrink-0 rounded-full text-[0.7rem] h-7"
              onClick={() => onCategoryChange(null)}
            >
              Todos
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className="flex-shrink-0 rounded-full text-[0.7rem] h-7"
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
