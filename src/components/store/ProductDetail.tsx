import { useState } from "react";
import { ChevronLeft, ShoppingCart, MessageCircle, X } from "lucide-react";
import DuarttLogo from "./DuarttLogo";
import { type Product, type CartItem, formatPrice, pixPrice, discountPct, fallbackImg, WHATSAPP } from "./storeData";

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
  const images = [product.img, product.img2 || product.img];

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={onBack}>
      <div
        className="bg-card rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button onClick={onBack} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors">
          <X size={16} className="text-foreground" />
        </button>

        {/* Content: side-by-side on desktop */}
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
            {/* Thumbnails */}
            <div className="flex gap-2 mt-2 justify-center">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${imgIndex === i ? "border-primary" : "border-border"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }} />
                </button>
              ))}
            </div>
          </div>

          {/* Info section */}
          <div className="md:w-1/2 p-4 md:pl-2 flex flex-col">
            <h1 className="text-lg font-semibold text-foreground mb-2">{product.name}</h1>

            {/* Badges */}
            <div className="flex gap-1.5 mb-3">
              {product.freeShipping && <span className="text-[0.65rem] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">Frete grátis</span>}
              {product.oldPrice && <span className="text-[0.65rem] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">{discountPct(product.oldPrice, product.price)}% OFF</span>}
            </div>

            {/* Price */}
            <div className="mb-4">
              {product.oldPrice && <p className="text-muted-foreground text-sm line-through">{formatPrice(product.oldPrice)}</p>}
              <p className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</p>
              <p className="text-sm mt-0.5">
                <span className="text-green-600 font-semibold">{pixPrice(product.price)}</span>{" "}
                <span className="text-muted-foreground">com Pix</span>
              </p>
            </div>

            {/* Sizes */}
            <div className="mb-4">
              <p className="text-sm text-foreground font-semibold mb-2">Tamanho</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`rounded-lg border text-sm font-medium px-4 py-2 transition-all ${
                      selectedSize === s
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Buy button */}
            <button
              onClick={() => {
                if (!selectedSize) return;
                onAddToCart({ cartId: `${product.id}-${selectedSize}-${Date.now()}`, product, size: selectedSize, qty: 1 });
              }}
              disabled={!selectedSize}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl text-base disabled:opacity-40 hover:bg-primary/90 transition-colors mb-3"
            >
              Comprar
            </button>

            {/* WhatsApp */}
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
              <MessageCircle size={18} className="text-green-600 flex-shrink-0" />
              <p className="text-sm text-foreground">Dúvidas? <span className="text-green-600 font-semibold">WhatsApp</span></p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
