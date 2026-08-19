import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStoreSettings } from "@/hooks/useStoreData";
import { Lock, Loader2 } from "lucide-react";
import StreetDexLogo from "@/components/store/StreetDexLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const { data: settings } = useStoreSettings();

  useEffect(() => {
    // Supabase auto-consumes the recovery token from the URL hash and fires
    // PASSWORD_RECOVERY; we just need to make sure a session exists before submit.
    const setup = async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" || session) setReady(true);
      });
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setReady(true);
      return () => subscription.unsubscribe();
    };
    setup();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("A senha deve ter ao menos 6 caracteres.");
    if (password !== confirm) return setError("As senhas não coincidem.");

    setLoading(true);
    const { supabase } = await import("@/integrations/supabase/client");
    const { error: updErr } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updErr) {
      setError(updErr.message);
      return;
    }
    toast.success("Senha redefinida com sucesso.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="flex flex-col items-center pb-2">
          <StreetDexLogo size="md" className="mb-2" />
          <span className="text-2xl font-bold tracking-tighter text-foreground uppercase">
            {settings?.store_name || "Street Dex"}
          </span>
          <p className="text-xs text-muted-foreground mt-1">Redefinir senha</p>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <Alert>
              <AlertDescription>
                Abra este link a partir do e-mail de recuperação. Se você já abriu,
                aguarde alguns segundos…
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative mt-1">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="confirm">Confirmar senha</Label>
                <div className="relative mt-1">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={6}
                    className="pl-9"
                  />
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={loading} className="w-full gap-2">
                {loading && <Loader2 size={15} className="animate-spin" />}
                Salvar nova senha
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;