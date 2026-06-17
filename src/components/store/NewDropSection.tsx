import { Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "./storeData";

type Props = {
  products: Product[];
  onSelect: (productId: number) => void;
};

const NewDropSection = ({ products, onSelect }: Props) => {
  if (products.length === 0) return null;

  return (
    <section className="max-w-[1200px] mx-auto px-4 pt-10 pb-2">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center gap-2 mb-1">
          <Sparkles size={14} className="text-primary animate-pulse" />
          <p className="text-[0.65rem] text-primary font-bold tracking-[0.3em] uppercase">Acabou de chegar</p>
          <Sparkles size={14} className="text-primary animate-pulse" />
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground uppercase tracking-wider">
          NEW DROP
        </h2>
        <div className="w-12 h-0.5 bg-primary mx-auto mt-3 rounded-full neon-glow" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onClick={() => onSelect(p.id)} />
        ))}
      </div>
    </section>
  );
};

export default NewDropSection;
