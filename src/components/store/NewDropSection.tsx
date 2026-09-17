import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import type { Product } from "./storeData";

type Props = {
  products: Product[];
  onSelect: (productId: string) => void;
};

const NewDropSection = ({ products, onSelect }: Props) => {
  if (products.length === 0) return null;

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="max-w-[1200px] mx-auto px-4 pt-10 pb-2"
    >
      <div className="text-center mb-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/5 blur-[80px] -z-10 pointer-events-none" />
        <div className="inline-flex items-center justify-center gap-2 mb-1">
          <Sparkles size={14} className="text-primary animate-pulse" />
          <p className="text-[0.65rem] text-primary font-bold tracking-[0.3em] uppercase">Acabou de chegar</p>
          <Sparkles size={14} className="text-primary animate-pulse" />
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-black text-foreground uppercase tracking-tight italic">
          NEW DROP
        </h2>
        <div className="w-12 h-0.5 bg-primary mx-auto mt-3 rounded-full neon-glow" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} productId={p.id} onClick={() => onSelect(p.id)} />
        ))}
      </div>
    </motion.section>
  );
};

export default NewDropSection;
