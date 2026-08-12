import streetdexLogo from "@/assets/streetdex-logo.png";
import { useStoreSettings } from "@/hooks/useStoreData";
import { useEffect, useState } from "react";

const StreetDexLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const { data: settings } = useStoreSettings();
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    // Check initial state
    setIsDark(document.documentElement.classList.contains('dark'));

    // Observe theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const imgSize = size === "sm" ? "h-12" : size === "lg" ? "h-20" : "h-16";
  
  const logoUrl = settings?.logo_url;
  const logoUrlDark = settings?.logo_url_dark;
  
  // No modo escuro, priorizamos a logo escura se ela existir.
  // Caso contrário, usamos a logo padrão (logoUrl) ou a fallback.
  const logoSrc = (isDark && logoUrlDark) 
    ? logoUrlDark 
    : (logoUrl || streetdexLogo);
    
  return (
    <div className="flex items-center">
      <img
        src={logoSrc}
        alt={settings?.store_name || "Street Dex"}
        className={`${imgSize} w-auto object-contain transition-all duration-300`}
        onError={(e) => {
          // Fallback caso a imagem customizada falhe
          const target = e.target as HTMLImageElement;
          if (target.src !== streetdexLogo) {
            target.src = streetdexLogo;
          }
        }}
      />
    </div>
  );
};

export default StreetDexLogo;
