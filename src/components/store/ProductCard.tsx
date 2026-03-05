import { useState, memo } from "react";
import { type Product, formatPrice, pixPrice, discountPct, fallbackImg } from "./storeData";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard = memo(({ product, onClick }: ProductCardProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group bg-card border border-border overflow-hidden cursor-pointer relative flex flex-col rounded-lg transition-colors duration-300"
    >
      {/* Image with dark mode container */}
      <div className="w-full aspect-[3/4] overflow-hidden bg-muted dark:bg-secondary relative p-1 dark:p-2 dark:border-b dark:border-primary/20 transition-all duration-300">
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-0.5">
          {product.oldPrice && (
            <span className="text-[0.55rem] font-bold bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-sm">
              {discountPct(product.oldPrice, product.price)}% OFF
            </span>
          )}
          {product.freeShipping && (
            <span className="text-[0.55rem] font-semibold bg-green-500 text-white px-1.5 py-0.5 rounded-sm">
              Frete grátis
            </span>
          )}
        </div>

        <img
          src={hovered && product.img2 ? product.img2 : product.img}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover product-img-zoom transition-opacity duration-300 rounded"
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex flex-col items-center justify-end pb-2 gap-1.5 opacity-0 group-hover:opacity-100">
          <div className="flex flex-wrap gap-0.5 justify-center px-1.5 mb-0.5">
            {product.sizes.map((s) => (
              <span key={s} className="bg-card text-foreground text-[0.55rem] font-semibold px-1.5 py-0.5 rounded border border-border hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                onClick={(e) => e.stopPropagation()}>
                {s}
              </span>
            ))}
          </div>
          <button className="bg-primary text-primary-foreground text-xs font-bold px-5 py-1.5 rounded hover:bg-primary/90 transition-colors" onClick={(e) => { e.stopPropagation(); onClick(); }}>
            Comprar
          </button>
          <button className="bg-card text-foreground text-xs font-medium px-5 py-1 rounded border border-border hover:bg-muted transition-colors" onClick={(e) => { e.stopPropagation(); onClick(); }}>
            Espiar
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-2 flex-1 flex flex-col">
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1 mb-1.5">
            {product.colors.map((c, i) => (
              <span key={i} className="w-3 h-3 rounded-full border border-border" style={{ background: c }} />
            ))}
          </div>
        )}
        <p className="text-[0.78rem] text-foreground leading-snug line-clamp-2 mb-1.5 flex-1">{product.name}</p>
        <div>
          {product.oldPrice && <p className="text-[0.65rem] text-muted-foreground line-through">{formatPrice(product.oldPrice)}</p>}
          <p className="text-[0.95rem] font-bold text-foreground">{formatPrice(product.price)}</p>
          <p className="text-[0.65rem] mt-0.5">
            <span className="text-green-600 font-semibold">{pixPrice(product.price)}</span>{" "}
            <span className="text-muted-foreground">com Pix</span>
          </p>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
