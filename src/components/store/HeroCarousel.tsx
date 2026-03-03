import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHeroBanners } from "@/hooks/useStoreData";
import { heroBanners as fallbackBanners } from "./storeData";

const HeroCarousel = () => {
  const { data: dbBanners } = useHeroBanners();
  const banners = dbBanners && dbBanners.length > 0
    ? dbBanners.filter((b) => b.active)
    : fallbackBanners;

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
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {banners.map((banner, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0 relative bg-foreground/5">
              <img
                src={banner.img}
                alt={`Carrossel ${i + 1}`}
                className="w-full object-cover object-center"
                style={{ maxHeight: "70vh" }}
              />
              {banner.cta && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                  <button className="bg-primary text-primary-foreground font-semibold px-6 py-2 rounded text-sm hover:bg-primary/90 transition-colors uppercase">
                    {banner.cta}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <button onClick={scrollPrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card/80 hover:bg-card flex items-center justify-center text-foreground transition-colors shadow">
        <ChevronLeft size={20} />
      </button>
      <button onClick={scrollNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card/80 hover:bg-card flex items-center justify-center text-foreground transition-colors shadow">
        <ChevronRight size={20} />
      </button>
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`rounded-full transition-all ${selectedIndex === i ? "w-2.5 h-2.5 bg-primary" : "w-2 h-2 bg-foreground/30"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
