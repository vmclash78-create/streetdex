import { useState } from "react";
import { MessageCircle, ShoppingCart, Heart, Check, Loader2 } from "lucide-react";
import { type Product, type CartItem, formatPrice, pixPrice, discountPct, fallbackImg, WHATSAPP } from "./storeData";
import { useStoreSettings } from "@/hooks/useStoreData";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
        product_id: product.id as any
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
            <a href={`https://wa.me/${(settings?.whatsapp_store || settings?.whatsapp || WHATSAPP).replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-green-500/10 rounded-xl px-4 py-3 mt-4 transition-colors hover:bg-green-500/20 border border-green-500/20">
              <MessageCircle size={18} className="text-green-500 flex-shrink-0" />
              <p className="text-sm text-foreground font-medium">Dúvidas? <span className="text-green-500 font-bold">WhatsApp</span></p>
            </a>
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

export default ProductDetail;