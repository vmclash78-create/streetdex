import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Crown, Mail, Lock, Loader2 } from "lucide-react";
import ThemeToggle from "@/components/store/ThemeToggle";

const AuthPage = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const result = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    if (result.error) {
      setError(result.error.message);
    } else if (!isLogin) {
      setSuccess("Conta criada com sucesso! Você já pode fazer login.");
      setIsLogin(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Crown size={24} className="text-primary mb-1" strokeWidth={1.5} />
          <span className="text-3xl font-light tracking-tight text-foreground font-serif">duartt</span>
          <p className="text-sm text-muted-foreground mt-2">Painel de Administração</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
            {isLogin ? "Entrar" : "Criar conta"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
            {success && <p className="text-green-600 text-xs">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isLogin ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }} className="text-primary font-semibold hover:underline">
              {isLogin ? "Criar conta" : "Entrar"}
            </button>
          </p>
        </div>

        <a href="/" className="block text-center text-sm text-muted-foreground mt-4 hover:text-foreground transition-colors">
          ← Voltar à loja
        </a>
      </div>
    </div>
  );
};

export default AuthPage;
