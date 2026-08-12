import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { useHeroBanners, useStoreSettings } from "@/hooks/useStoreData";
import { heroBanners as fallbackBanners, WHATSAPP } from "./storeData";
import { Button } from "@/components/ui/button";
import { getWhatsAppLink } from "@/utils/whatsapp";

const HeroCarousel = () => {
  const { data: dbBanners } = useHeroBanners();
  const { data: settings } = useStoreSettings();
  const banners = dbBanners && dbBanners.length > 0
    ? dbBanners.filter((b) => b.active)
    : fallbackBanners;
  
  const whatsapp = settings?.whatsapp_store || settings?.whatsapp || WHATSAPP;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  if (banners.length === 0) return null;

  return (
    <section className="relative">
      {/* Carousel images */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {banners.map((banner, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0 relative overflow-hidden bg-background">
              {/* Liquid-glass ambient backdrop: blurred, scaled image fills the frame so the sides are never plain black */}
              <div className="absolute inset-0 hidden md:block">
                <img
                  src={banner.img}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover object-center scale-110 blur-3xl opacity-60"
                />
                {/* Blue-purple glass tint to keep the streetwear neon identity */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#340b79]/40 via-transparent to-[#340b79]/40" />
                <div className="absolute inset-0 bg-[#141414]/30 backdrop-saturate-150" />
              </div>
              {/* Foreground image: contained on desktop, cover on mobile */}
              <img
                src={banner.img}
                alt={`Carrossel ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                decoding={i === 0 ? "sync" : "async"}
                className="relative h-[500px] w-full object-cover object-center md:h-auto md:max-h-[75vh] md:object-contain"
              />
              {/* Dark gradient overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* Hero content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-16 px-4 z-10">
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground font-bold tracking-wider uppercase text-center leading-none mb-3">
          STREET<span className="gradient-text">DEX</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base tracking-[0.2em] uppercase mb-6 text-center">
          Vista o que te define
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Button 
            size="lg" 
            className="text-sm font-bold tracking-wider uppercase px-8 neon-glow hover:neon-glow-strong transition-all"
            onClick={() => {
              const element = document.getElementById("best-sellers");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            Ver Coleção
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-sm font-bold tracking-wider uppercase px-8 border-green-500/50 text-green-500 hover:bg-green-500/10 hover:border-green-500"
          >
            <a href={getWhatsAppLink(whatsapp)} target="_blank" rel="noopener noreferrer" className="gap-2">
              <MessageCircle size={16} /> WhatsApp
            </a>
          </Button>
        </div>
      </div>

      {/* Navigation arrows */}
      <button onClick={scrollPrev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/30 backdrop-blur-sm hover:bg-background/50 flex items-center justify-center text-foreground transition-all border border-border/30">
        <ChevronLeft size={20} />
      </button>
      <button onClick={scrollNext} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/30 backdrop-blur-sm hover:bg-background/50 flex items-center justify-center text-foreground transition-all border border-border/30">
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`rounded-full transition-all ${selectedIndex === i ? "w-6 h-1.5 bg-primary neon-glow" : "w-1.5 h-1.5 bg-foreground/30"}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
