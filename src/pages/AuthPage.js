import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStoreSettings } from "@/hooks/useStoreData";
import { Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import StreetDexLogo from "@/components/store/StreetDexLogo";
const AuthPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [authLoading, setAuthLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const { user, isAdmin, loading, signIn } = useAuth();
    const { data: settings } = useStoreSettings();
    const navigate = useNavigate();
    const handleForgotPassword = async () => {
        if (!email) {
            setError("Informe seu e-mail no campo acima para receber o link de recuperação.");
            return;
        }
        setError("");
        setResetLoading(true);
        const { supabase } = await import("@/integrations/supabase/client");
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        setResetLoading(false);
        if (resetErr) {
            setError(resetErr.message);
            return;
        }
        toast.success("Se este e-mail estiver cadastrado, você receberá um link em instantes.");
    };
    useEffect(() => {
        if (!loading && user && isAdmin) {
            navigate("/admin", { replace: true });
        }
    }, [loading, user, isAdmin, navigate]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setAuthLoading(true);
        const result = await signIn(email, password);
        if (result.error) {
            setError(result.error.message);
        }
        else {
            setTimeout(() => navigate("/admin", { replace: true }), 500);
        }
        setAuthLoading(false);
    };
    if (loading) {
        return (<div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary"/>
      </div>);
    }
    return (<div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-2xl bg-card/95 backdrop-blur-sm border-primary/20">
        <CardHeader className="flex flex-col items-center pb-2">
          <StreetDexLogo size="md" className="mb-2"/>
          <span className="text-2xl font-bold tracking-tighter text-foreground uppercase">
            {settings?.store_name || "Street Dex"}
          </span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mt-1">Painel Administrativo</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@email.com" required className="pl-9"/>
              </div>
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative mt-1">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="pl-9"/>
              </div>
            </div>
            {error && (<Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>)}
            <Button type="submit" disabled={authLoading} className="w-full gap-2">
              {authLoading && <Loader2 size={15} className="animate-spin"/>}
              Entrar
            </Button>
            <button type="button" onClick={handleForgotPassword} disabled={resetLoading} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center disabled:opacity-50">
              {resetLoading ? "Enviando..." : "Esqueci minha senha"}
            </button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <a href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Voltar à loja
          </a>
        </CardFooter>
      </Card>
    </div>);
};
export default AuthPage;
