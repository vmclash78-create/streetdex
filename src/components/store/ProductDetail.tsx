import { useState } from "react";
import { MessageCircle, ShoppingCart, Heart, Check, Loader2, X, Truck, Ruler, Info, ChevronDown } from "lucide-react";
import { type Product, type CartItem, type Measurement, formatPrice, pixPrice, discountPct, fallbackImg, WHATSAPP } from "./storeData";
import { useStoreSettings } from "@/hooks/useStoreData";
import { getWhatsAppLink } from "@/utils/whatsapp";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculateShipping, useSuperFreteSettings } from "@/lib/superfrete";

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (item: CartItem) => void;
  onGoToCart: () => void;
  cartCount: number;
}

const ProductDetail = ({ product, onBack, onAddToCart, onGoToCart, cartCount }: ProductDetailProps) => {
  const [selectedSize, setSelectedSize] = useState("");
  const [imgIndex, setImgIndex] = useState(0);
  const [showWishlist, setShowWishlist] = useState(false);
  const [wishlistName, setWishlistName] = useState("");
  const [wishlistPhone, setWishlistPhone] = useState("");
  const [isSubmittingWishlist, setIsSubmittingWishlist] = useState(false);

  const { data: settings } = useStoreSettings();
  const { toast } = useToast();
  const discount = Number(settings?.pix_discount || "0");
  const images = [product.img, product.img2 || product.img];

  const handleWishlistAction = async () => {
    if (!wishlistName || wishlistPhone.length < 10) {
      toast({ title: "Dados incompletos", description: "Preencha seu nome e WhatsApp corretamente.", variant: "destructive" });
      return;
    }

    setIsSubmittingWishlist(true);
    try {
      const { error } = await supabase.from("wishlist").insert({
        customer_name: wishlistName,
        customer_phone: wishlistPhone,
        product_id: typeof product.id === 'string' && product.id.length > 20 ? product.id : null
      });
      if (error) throw error;
      toast({ title: "Adicionado!", description: "Você será notificado sobre promoções deste produto." });
      setShowWishlist(false);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmittingWishlist(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onBack()}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto bg-card border-border/50">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        {/* Mobile-visible sticky close button (the default X scrolls away on mobile) */}
        <DialogClose
          aria-label="Fechar"
          className="md:hidden fixed top-2 right-2 z-50 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm border border-border/60 shadow-md flex items-center justify-center text-foreground hover:bg-background active:scale-95 transition"
        >
          <X className="h-3.5 w-3.5" />
        </DialogClose>
        <div className="flex flex-col md:flex-row">
          {/* Image section */}
          <div className="md:w-1/2 p-4">
            <div className="rounded-xl overflow-hidden bg-muted max-w-[500px] mx-auto aspect-[3/4]">
              <img
                src={images[imgIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
              />
            </div>
            <div className="flex gap-2 mt-3 justify-center">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${imgIndex === i ? "border-primary neon-glow" : "border-border/50 opacity-60 hover:opacity-100"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }} />
                </button>
              ))}
            </div>
          </div>

          {/* Info section */}
          <div className="md:w-1/2 p-4 md:pl-2 flex flex-col">
            <h1 className="text-lg font-bold text-foreground mb-2 tracking-wide">{product.name}</h1>

            {/* Badges */}
            <div className="flex gap-1.5 mb-3">
              {product.freeShipping && <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-0 font-bold tracking-wider text-[0.65rem]">Frete grátis</Badge>}
              {product.oldPrice && <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 font-bold tracking-wider text-[0.65rem]">-{discountPct(product.oldPrice, product.price)}%</Badge>}
            </div>

            {/* Price */}
            <div className="mb-5">
              {product.oldPrice && <p className="text-muted-foreground text-sm line-through">{formatPrice(product.oldPrice)}</p>}
              <p className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</p>
              <p className="text-sm mt-1">
                <span className="text-green-500 font-bold">{pixPrice(product.price, discount)}</span>{" "}
                <span className="text-muted-foreground">com Pix</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ou até <span className="text-foreground font-semibold">2x de {formatPrice(product.price / 2)}</span> sem juros
              </p>
            </div>

            {/* Sizes */}
            <div className="mb-5">
              <p className="text-sm text-foreground font-bold mb-2 uppercase tracking-wider">Tamanho</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <Button
                    key={s}
                    variant={selectedSize === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 font-bold tracking-wider ${selectedSize === s ? "neon-glow" : "border-border/50"}`}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            {/* Buy and Wishlist buttons */}
            <div className="flex flex-col gap-2 mt-auto">
              <Button
                onClick={() => {
                  if (!selectedSize) return;
                  onAddToCart({ cartId: `${product.id}-${selectedSize}-${Date.now()}`, product, size: selectedSize, qty: 1 });
                }}
                disabled={!selectedSize}
                className="w-full py-3 text-base font-bold tracking-wider uppercase neon-glow gap-2"
                size="lg"
              >
                <ShoppingCart size={18} /> Comprar
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowWishlist(true)}
                className="w-full gap-2 border-primary/20 hover:bg-primary/5 text-primary font-bold uppercase tracking-wider text-xs py-5"
              >
                <Heart size={16} /> Adicionar à Lista de Desejos
              </Button>
            </div>

            {/* WhatsApp */}
            <a href={getWhatsAppLink(settings?.whatsapp_store || settings?.whatsapp || WHATSAPP)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-green-500/10 rounded-xl px-4 py-3 mt-4 transition-colors hover:bg-green-500/20 border border-green-500/20">
              <MessageCircle size={18} className="text-green-500 flex-shrink-0" />
              <p className="text-sm text-foreground font-medium">Dúvidas? <span className="text-green-500 font-bold">WhatsApp</span></p>
            </a>

            {/* Shipping (CEP) calculator */}
            <ShippingCalculator
              freeShipping={!!product.freeShipping}
              shippingConfigRaw={settings?.shipping_config}
            />

            {/* Description / measurements */}
            <ProductDescription
              description={product.description}
              measurements={product.measurements}
            />
          </div>
        </div>

        {/* Wishlist Dialog */}
        <Dialog open={showWishlist} onOpenChange={setShowWishlist}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Lista de Desejos</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-xs text-muted-foreground">Cadastre-se para ser avisado quando este produto entrar em oferta!</p>
              <div>
                <Label>Seu Nome</Label>
                <Input value={wishlistName} onChange={(e) => setWishlistName(e.target.value)} placeholder="João Silva" className="mt-1" />
              </div>
              <div>
                <Label>Seu WhatsApp</Label>
                <Input value={wishlistPhone} onChange={(e) => setWishlistPhone(e.target.value.replace(/\D/g, ""))} placeholder="85999999999" maxLength={11} className="mt-1" />
              </div>

              <Button onClick={handleWishlistAction} disabled={isSubmittingWishlist} className="w-full gap-2 bg-primary neon-glow">
                {isSubmittingWishlist ? <Loader2 className="animate-spin" size={16} /> : <Heart size={16} />}
                Confirmar na Lista
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

// ─── Shipping (CEP) calculator ──────────────────────────────────────────────
type RegionCfg = { pac_price: number; pac_days: string; sedex_price: number; sedex_days: string };
const DEFAULT_SHIPPING: Record<string, RegionCfg> = {
  NE: { pac_price: 19.9, pac_days: "5 a 8", sedex_price: 34.9, sedex_days: "2 a 4" },
  SE: { pac_price: 24.9, pac_days: "6 a 9", sedex_price: 39.9, sedex_days: "3 a 5" },
  S:  { pac_price: 29.9, pac_days: "8 a 11", sedex_price: 49.9, sedex_days: "4 a 6" },
  CO: { pac_price: 27.9, pac_days: "7 a 10", sedex_price: 44.9, sedex_days: "3 a 5" },
  N:  { pac_price: 34.9, pac_days: "10 a 15", sedex_price: 59.9, sedex_days: "5 a 8" },
};
const ufToRegion = (uf: string): keyof typeof DEFAULT_SHIPPING => {
  if (["CE","PE","BA","MA","PI","RN","PB","AL","SE"].includes(uf)) return "NE";
  if (["SP","RJ","MG","ES"].includes(uf)) return "SE";
  if (["PR","SC","RS"].includes(uf)) return "S";
  if (["GO","MT","MS","DF"].includes(uf)) return "CO";
  return "N";
};

const ShippingCalculator = ({ freeShipping, shippingConfigRaw }: { freeShipping: boolean; shippingConfigRaw?: string }) => {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { city: string; state: string; options: { name: string; days: string; price: string }[] }>(null);
  const [error, setError] = useState("");
  
  const { data: sfSettings } = useSuperFreteSettings();

  let cfg: Record<string, RegionCfg> = DEFAULT_SHIPPING;
  if (shippingConfigRaw) {
    try { cfg = { ...DEFAULT_SHIPPING, ...JSON.parse(shippingConfigRaw) }; } catch { /* ignore */ }
  }

  const formatCep = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  };

  const handleCalc = async () => {
    const digits = cep.replace(/\D/g, "");
    setError(""); 
    setResult(null);
    if (digits.length !== 8) { setError("Digite um CEP válido (8 dígitos)."); return; }
    setLoading(true);

    try {
      // Tentar calcular via SuperFrete se configurado
      if (sfSettings?.token && sfSettings?.from_zip) {
        try {
          const sfResult = await calculateShipping({
            from_zip: sfSettings.from_zip,
            to_zip: digits,
            weight: 0.5, // Padrão
            length: 20,
            height: 10,
            width: 15,
            token: sfSettings.token,
            environment: sfSettings.environment as "sandbox" | "production"
          });

          if (sfResult && Array.isArray(sfResult)) {
            setResult({
              city: "Sua Região", // API às vezes não retorna cidade no calc simples
              state: "",
              options: sfResult.map((s: any) => ({
                name: s.name,
                days: `${s.delivery_range.min}-${s.delivery_range.max} dias`,
                price: freeShipping ? "Grátis" : formatPrice(Number(s.price))
              }))
            });
            setLoading(false);
            return;
          }
        } catch (sfErr) {
          console.error("SuperFrete fallback to manual:", sfErr);
        }
      }

      // Fallback manual via ViaCEP + Config da loja
      const r = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await r.json();
      if (data.erro) { setError("CEP não encontrado."); return; }
      
      const uf = data.uf;
      const region = cfg[ufToRegion(uf)] || DEFAULT_SHIPPING.SE;
      const options = [
        { name: "PAC", days: `${region.pac_days} dias úteis`, price: freeShipping ? "Grátis" : formatPrice(region.pac_price) },
        { name: "SEDEX", days: `${region.sedex_days} dias úteis`, price: formatPrice(region.sedex_price) },
      ];

      setResult({ city: data.localidade, state: data.uf, options });
    } catch {
      setError("Erro ao consultar o CEP. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-border/50 bg-card/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Truck size={16} className="text-primary" />
        <p className="text-sm font-bold uppercase tracking-wider text-foreground">Meios de envio</p>
      </div>
      <div className="flex gap-2">
        <Input
          inputMode="numeric"
          placeholder="Seu CEP"
          value={cep}
          onChange={(e) => setCep(formatCep(e.target.value))}
          onKeyDown={(e) => e.key === "Enter" && handleCalc()}
          maxLength={9}
          className="flex-1"
        />
        <Button onClick={handleCalc} disabled={loading} className="font-bold tracking-wider uppercase">
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Calcular"}
        </Button>
      </div>
      <a
        href="https://buscacepinter.correios.com.br/app/endereco/index.php"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary underline mt-2 inline-block"
      >
        Não sei meu CEP
      </a>

      {error && <p className="text-xs text-destructive mt-2">{error}</p>}

      {result && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-muted-foreground">Entrega para <span className="text-foreground font-semibold">{result.city} - {result.state}</span></p>
          {result.options.map((o) => (
            <div key={o.name} className="flex items-center justify-between rounded-lg border border-border/40 bg-background/40 px-3 py-2">
              <div>
                <p className="text-sm font-bold text-foreground">{o.name}</p>
                <p className="text-[11px] text-muted-foreground">{o.days}</p>
              </div>
              <p className={`text-sm font-bold ${o.price === "Grátis" ? "text-green-500" : "text-foreground"}`}>{o.price}</p>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground">* Valores estimados. O frete final é confirmado no checkout.</p>
        </div>
      )}
    </div>
  );
};

// ─── Product description / measurements ────────────────────────────────────
const DEFAULT_MEASUREMENTS: Measurement[] = [
  { size: "P", chest: 54, length: 73, sleeve: 20 },
  { size: "M", chest: 58, length: 75, sleeve: 22 },
  { size: "G", chest: 62, length: 79, sleeve: 24 },
  { size: "GG", chest: 66, length: 81, sleeve: 25 },
  { size: "XG", chest: 70, length: 83, sleeve: 26 },
];

const ProductDescription = ({ description, measurements }: { description?: string; measurements?: Measurement[] }) => {
  const [open, setOpen] = useState(false);
  const rows = (measurements && measurements.length ? measurements : DEFAULT_MEASUREMENTS).filter(
    (m) => m.chest != null || m.length != null || m.sleeve != null
  );
  const list = rows.length ? rows : DEFAULT_MEASUREMENTS;
  return (
    <div className="mt-4 rounded-xl border border-border/50 bg-card/60">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <Ruler size={16} className="text-primary" />
          <p className="text-sm font-bold uppercase tracking-wider text-foreground">Descrição & Medidas</p>
        </div>
        <ChevronDown size={18} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4">
          <div>
            <p className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">Tabela de medidas (cm)</p>
            <div className="overflow-hidden rounded-lg border border-border/40">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-bold">Tam.</th>
                    <th className="px-2 py-1.5 text-left font-bold">Largura</th>
                    <th className="px-2 py-1.5 text-left font-bold">Compr.</th>
                    <th className="px-2 py-1.5 text-left font-bold">Manga</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((m) => (
                    <tr key={m.size} className="border-t border-border/40">
                      <td className="px-2 py-1.5 font-bold text-foreground">{m.size}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{m.chest != null ? `${m.chest} cm` : "—"}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{m.length != null ? `${m.length} cm` : "—"}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{m.sleeve != null ? `${m.sleeve} cm` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {description ? (
            <p className="text-xs text-muted-foreground whitespace-pre-line">{description}</p>
          ) : (
            <>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info size={14} className="text-primary flex-shrink-0 mt-0.5" />
                <p>Modelagem <span className="text-foreground font-semibold">oversized</span>. Modelo tem 1,80m e veste tamanho G.</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Camiseta <span className="text-foreground font-semibold">100% algodão</span>, gola canelada com 3cm.
                Todas as peças são produzidas no Brasil.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetail;