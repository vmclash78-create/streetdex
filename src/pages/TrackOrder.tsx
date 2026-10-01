import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ArrowLeft, Package, MessageCircle } from "lucide-react";
import StreetDexLogo from "@/components/store/StreetDexLogo";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStoreSettings } from "@/hooks/useStoreData";
import { getWhatsAppLink } from "@/utils/whatsapp";

const TrackOrder = () => {
  const [orderNum, setOrderNum] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { data: settings } = useStoreSettings();
  const whatsapp = settings?.whatsapp_store || settings?.whatsapp || "";

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(orderNum.replace("#", "").trim(), 10);
    if (!num) { setError("Digite um número de pedido válido."); return; }
    if (phone.replace(/\D/g, "").length < 10) { setError("Digite o telefone usado no pedido."); return; }

    setLoading(true);
    setError("");
    const { data, error: err } = await supabase.rpc("find_storefront_order", {
      p_order_number: num,
      p_customer_phone: phone,
    });

    setLoading(false);
    if (err || !data) { setError("Pedido não encontrado. Confira o número e o telefone."); return; }
    sessionStorage.setItem(`tracking-phone:${data}`, phone);
    navigate(`/pedido/${data}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50 flex items-center px-4 h-14 max-w-2xl mx-auto">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/"><ArrowLeft size={20} /></Link>
        </Button>
        <div className="flex-1 flex justify-center"><StreetDexLogo size="sm" /></div>
        <div className="w-8" />
      </header>

      <div className="max-w-md mx-auto px-4 pt-16 flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Package size={32} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Rastrear pedido</h1>
        <p className="text-sm text-muted-foreground">Digite o número e o telefone usados no pedido.</p>

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
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="Telefone do pedido"
            value={phone}
            onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
            maxLength={11}
            className="h-12 text-center"
          />
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={loading} size="lg">
            {loading ? "Buscando..." : "Buscar pedido"}
          </Button>
        </form>

        <div className="pt-4 border-t border-border w-full mt-4">
          <p className="text-xs text-muted-foreground mb-3">Ainda com dúvidas?</p>
          {whatsapp && <Button variant="outline" asChild className="w-full gap-2 border-green-600/50 text-green-600 hover:bg-green-500/10">
            <a href={getWhatsAppLink(whatsapp)} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} /> Chamar no WhatsApp
            </a>
          </Button>}
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;