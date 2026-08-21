import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Product, formatPrice, pixPrice, discountPct, fallbackImg } from "./storeData";
import { useStoreSettings } from "@/hooks/useStoreData";
import { useFavorites } from "@/hooks/useFavorites";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Heart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  productId?: string;
}

const ProductCard = memo(({ product, onClick, productId }: ProductCardProps) => {
  const [hovered, setHovered] = useState(false);
  const { data: settings } = useStoreSettings();
  const { isFavorite, toggleFavorite } = useFavorites();
  const discount = Number(settings?.pix_discount || "0");
  const soldOut = typeof product.stock === "number" && product.stock <= 0;
  const installments = product.price >= 30 ? 12 : 0;
  
  const id = productId || product.id.toString();
  const favored = isFavorite(id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group bg-card border border-border/50 overflow-hidden cursor-pointer relative flex flex-col rounded-lg card-glow transition-all duration-300"
    >
      {/* Image */}
      <div className="w-full aspect-[3/4] overflow-hidden bg-muted relative">
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {product.oldPrice && !soldOut && (
            <Badge variant="destructive" className="text-[0.6rem] px-2 py-0.5 rounded-sm font-bold tracking-wide">
              -{discountPct(product.oldPrice, product.price)}%
            </Badge>
          )}
          {product.freeShipping && !soldOut && (
            <Badge className="text-[0.6rem] px-2 py-0.5 rounded-sm bg-green-500 hover:bg-green-500 text-white font-semibold">
              Frete grátis
            </Badge>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(id);
          }}
          className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full bg-background/40 backdrop-blur-md border border-white/10 hover:bg-background/60 transition-colors group/heart"
        >
          <Heart
            size={16}
            className={`transition-all duration-300 ${
              favored ? "fill-primary text-primary scale-110" : "text-white group-hover/heart:scale-110"
            }`}
          />
        </button>

        <img
          src={hovered && product.img2 ? product.img2 : product.img}
          alt={product.name}
          loading="lazy"
          decoding="async"
          width={300}
          height={400}
          className={`w-full h-full object-cover product-img-zoom transition-opacity duration-300 ${soldOut ? "grayscale opacity-70" : ""}`}
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
        />

        {/* Sold-out overlay */}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-background/90 text-foreground border border-border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] rounded-sm shadow-md">
              Esgotado
            </span>
          </div>
        )}

        {/* Hover overlay (hidden when sold out) */}
        {!soldOut && (
          <AnimatePresence>
            {hovered && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent flex flex-col items-center justify-end pb-3 gap-2"
              >
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
                  <Eye size={13} /> Visualizar
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
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
        <p className="text-[0.8rem] text-foreground leading-snug line-clamp-2 mb-2 flex-1 font-medium">{product.name} <!-- me fale todas as vantegns desse sistema e o pq deveriam comprar --></p>
        <div>
          {product.oldPrice && <p className="text-[0.65rem] text-muted-foreground line-through">{formatPrice(product.oldPrice)}</p>}
          <p className="text-base font-bold text-foreground">{formatPrice(product.price)}</p>
          <p className="text-[0.65rem] mt-0.5">
            <span className="text-green-500 font-bold">{pixPrice(product.price, discount)}</span>{" "}
            <span className="text-muted-foreground">com Pix</span>
          </p>
          {installments > 0 && (
            <p className="text-[0.65rem] text-muted-foreground mt-0.5">
              ou <span className="text-foreground font-semibold">{installments}x de {formatPrice(product.price / installments)}</span> sem juros
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
