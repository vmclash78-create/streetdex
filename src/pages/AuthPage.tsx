import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Crown, Mail, Lock, Loader2 } from "lucide-react";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const { user, isAdmin, loading, signIn } = useAuth();
  const navigate = useNavigate();

  // If already logged in as admin, redirect to admin
  if (!loading && user && isAdmin) {
    navigate("/admin", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAuthLoading(true);
    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error.message);
    } else {
      // signIn succeeded — wait briefly for role check then navigate
      setTimeout(() => navigate("/admin", { replace: true }), 500);
    }
    setAuthLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <Crown size={28} className="text-primary mb-2" strokeWidth={1.5} />
          <span className="text-2xl font-light tracking-tight text-foreground font-serif">duartt</span>
          <p className="text-xs text-muted-foreground mt-1">Painel Administrativo</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
                required
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Senha</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          {error && <p className="text-destructive text-xs">{error}</p>}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full h-10 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {authLoading && <Loader2 size={15} className="animate-spin" />}
            Entrar
          </button>
        </form>
        <a href="/" className="block text-center text-xs text-muted-foreground mt-4 hover:text-foreground transition-colors">
          ← Voltar à loja
        </a>
      </div>
    </div>
  );
};

export default AuthPage;
