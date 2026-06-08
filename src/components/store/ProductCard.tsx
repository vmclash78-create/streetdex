import { useState, memo } from "react";
import { type Product, formatPrice, pixPrice, discountPct, fallbackImg } from "./storeData";
import { useStoreSettings } from "@/hooks/useStoreData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard = memo(({ product, onClick }: ProductCardProps) => {
  const [hovered, setHovered] = useState(false);
  const { data: settings } = useStoreSettings();
  const discount = Number(settings?.pix_discount || "0");

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group bg-card border border-border/50 overflow-hidden cursor-pointer relative flex flex-col rounded-lg card-glow transition-all duration-300"
    >
      {/* Image */}
      <div className="w-full aspect-[3/4] overflow-hidden bg-muted relative">
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {product.oldPrice && (
            <Badge variant="destructive" className="text-[0.6rem] px-2 py-0.5 rounded-sm font-bold tracking-wide">
              -{discountPct(product.oldPrice, product.price)}%
            </Badge>
          )}
          {product.freeShipping && (
            <Badge className="text-[0.6rem] px-2 py-0.5 rounded-sm bg-green-500 hover:bg-green-500 text-white font-semibold">
              Frete grátis
            </Badge>
          )}
        </div>

        <img
          src={hovered && product.img2 ? product.img2 : product.img}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover product-img-zoom transition-opacity duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end pb-3 gap-2">
          <div className="flex flex-wrap gap-1 justify-center px-2">
            {product.sizes.map((s) => (
              <span key={s} className="text-[0.6rem] font-bold text-foreground/80 bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded">
                {s}
              </span>
            ))}
          </div>
          <Button size="sm" className="text-xs font-bold px-6 tracking-wider uppercase neon-glow gap-1.5" onClick={(e) => { e.stopPropagation(); onClick(); }}>
            <ShoppingCart size={13} /> Comprar
          </Button>
          <Button variant="ghost" size="sm" className="text-xs font-medium px-5 text-foreground/80 hover:text-foreground gap-1.5" onClick={(e) => { e.stopPropagation(); onClick(); }}>
            <Eye size={13} /> Espiar
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1 mb-2">
            {product.colors.map((c, i) => (
              <span key={i} className="w-3 h-3 rounded-full border border-border/50 ring-1 ring-background" style={{ background: c }} />
            ))}
          </div>
        )}
        <p className="text-[0.8rem] text-foreground leading-snug line-clamp-2 mb-2 flex-1 font-medium">{product.name}</p>
        <div>
          {product.oldPrice && <p className="text-[0.65rem] text-muted-foreground line-through">{formatPrice(product.oldPrice)}</p>}
          <p className="text-base font-bold text-foreground">{formatPrice(product.price)}</p>
          <p className="text-[0.65rem] mt-0.5">
            <span className="text-green-500 font-bold">{pixPrice(product.price, discount)}</span>{" "}
            <span className="text-muted-foreground">com Pix</span>
          </p>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
