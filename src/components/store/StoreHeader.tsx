import { useState } from "react";
import { ShoppingCart, Search, Menu, X, MessageCircle, Truck, Heart, ChevronDown, User, LogOut, Lock, Mail, Loader2, Crown } from "lucide-react";
import DuarttLogo from "./DuarttLogo";
import ThemeToggle from "./ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { navLinks, WHATSAPP } from "./storeData";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface StoreHeaderProps {
  cartCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onCartClick: () => void;
}

const StoreHeader = ({ cartCount, searchQuery, onSearchChange, onCartClick }: StoreHeaderProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const isMobile = useIsMobile();
  const { user, isAdmin, signIn, signUp, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAuthLoading(true);
    const result = isLoginMode ? await signIn(email, password) : await signUp(email, password);
    if (result.error) {
      setError(result.error.message);
    } else if (!isLoginMode) {
      setSuccess("Conta criada! Você já pode fazer login.");
      setIsLoginMode(true);
    } else {
      setLoginOpen(false);
      setEmail("");
      setPassword("");
    }
    setAuthLoading(false);
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-primary text-primary-foreground text-center py-1 text-[0.65rem] font-medium tracking-wide">
        ENVIO COM 5 DIAS ÚTEIS | CUPOM: HAPPY | ❤️ FRETE GRÁTIS A PARTIR DE R$399,99
      </div>

      {/* Fixed header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-[1200px] mx-auto flex items-center gap-3 px-3 h-14">
          {/* Left: logo (clickable on mobile to open menu) */}
          <div className="flex-shrink-0">
            {isMobile ? (
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-1 cursor-pointer"
                role="button"
                aria-label="Abrir menu de navegação"
              >
                <DuarttLogo size="sm" />
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
            ) : (
              <DuarttLogo size="sm" />
            )}
          </div>

          {/* Center: search */}
          <div className="flex-1 max-w-md mx-auto relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-full border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Right: user + theme + cart */}
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
            {user ? (
              <div className="flex items-center gap-1">
                {isAdmin && (
                  <button onClick={() => navigate("/admin")} className="text-foreground w-9 h-9 flex items-center justify-center hover:text-primary transition-colors" title="Painel Admin">
                    <Crown size={18} strokeWidth={1.5} />
                  </button>
                )}
                <button onClick={signOut} className="text-foreground w-9 h-9 flex items-center justify-center hover:text-destructive transition-colors" title="Sair">
                  <LogOut size={18} strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <button onClick={() => { setLoginOpen(true); setError(""); setSuccess(""); }} className="text-foreground w-9 h-9 flex items-center justify-center hover:text-primary transition-colors" title="Entrar">
                <User size={20} strokeWidth={1.5} />
              </button>
            )}
            <ThemeToggle />
            <button onClick={onCartClick} className="relative text-foreground w-9 h-9 flex items-center justify-center">
              <ShoppingCart size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden px-3 pb-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-8 pl-9 pr-3 rounded-full border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </header>

      {/* Sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute top-0 left-0 h-full w-[280px] bg-card shadow-2xl flex flex-col animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
              <DuarttLogo size="sm" />
              <button onClick={() => setSidebarOpen(false)}>
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
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
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted">
                <MessageCircle size={16} className="text-green-600" />
                <span className="text-sm text-foreground">WhatsApp</span>
              </a>
              <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted w-full text-left">
                <Truck size={16} className="text-foreground" />
                <span className="text-sm text-foreground">Rastrear pedido</span>
              </button>
              <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted w-full text-left">
                <Heart size={16} className="text-foreground" />
                <span className="text-sm text-foreground">Lista de desejos</span>
              </button>
              <div className="border-t border-border my-2 mx-4" />
              <div className="px-4 py-2">
                <p className="text-[0.6rem] uppercase font-bold text-muted-foreground tracking-widest mb-1.5">Categorias</p>
                {["Camisas Personalizadas", "Camisas Casais", "Camisas Jogadores", "Camisas Olhar Apaixonado"].map((cat) => (
                  <button key={cat} onClick={() => setSidebarOpen(false)} className="block w-full text-left py-1.5 text-sm text-foreground hover:text-primary transition-colors">
                    {cat}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Login modal */}
      {loginOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setLoginOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLoginOpen(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
            <div className="flex flex-col items-center mb-5">
              <Crown size={22} className="text-primary mb-1" strokeWidth={1.5} />
              <span className="text-2xl font-light tracking-tight text-foreground font-serif">duartt</span>
            </div>
            <h2 className="text-base font-semibold text-foreground mb-4 text-center">
              {isLoginMode ? "Entrar" : "Criar conta"}
            </h2>
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Senha</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              {error && <p className="text-destructive text-xs">{error}</p>}
              {success && <p className="text-green-600 dark:text-green-400 text-xs">{success}</p>}
              <button type="submit" disabled={authLoading} className="w-full h-9 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {authLoading && <Loader2 size={15} className="animate-spin" />}
                {isLoginMode ? "Entrar" : "Criar conta"}
              </button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-3">
              {isLoginMode ? "Não tem conta?" : "Já tem conta?"}{" "}
              <button onClick={() => { setIsLoginMode(!isLoginMode); setError(""); setSuccess(""); }} className="text-primary font-semibold hover:underline">
                {isLoginMode ? "Criar conta" : "Entrar"}
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default StoreHeader;
