import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ArrowLeft, Package } from "lucide-react";
import DuarttLogo from "@/components/store/DuarttLogo";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TrackOrder = () => {
  const [orderNum, setOrderNum] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(orderNum.replace("#", "").trim(), 10);
    if (!num) { setError("Digite um número de pedido válido."); return; }

    setLoading(true);
    setError("");
    const { data, error: err } = await supabase
      .from("orders")
      .select("id")
      .eq("order_number", num)
      .maybeSingle();

    setLoading(false);
    if (err || !data) { setError("Pedido não encontrado. Verifique o número e tente novamente."); return; }
    navigate(`/pedido/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50 flex items-center px-4 h-14 max-w-2xl mx-auto">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/"><ArrowLeft size={20} /></Link>
        </Button>
        <div className="flex-1 flex justify-center"><DuarttLogo size="sm" /></div>
        <div className="w-8" />
      </header>

      <div className="max-w-md mx-auto px-4 pt-16 flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Package size={32} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Rastrear pedido</h1>
        <p className="text-sm text-muted-foreground">Digite o número do seu pedido para acompanhar o status.</p>

        <form onSubmit={handleSearch} className="w-full flex flex-col gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Ex: 1042"
              value={orderNum}
              onChange={(e) => { setOrderNum(e.target.value); setError(""); }}
              className="h-12 pl-10 pr-4 text-center text-lg font-semibold"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={loading} size="lg">
            {loading ? "Buscando..." : "Buscar pedido"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TrackOrder;
