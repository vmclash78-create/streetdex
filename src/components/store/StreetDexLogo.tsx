import streetdexLogo from "@/assets/streetdex-logo.png";
import { useStoreSettings } from "@/hooks/useStoreData";

const StreetDexLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const { data: settings } = useStoreSettings();
  const imgSize = size === "sm" ? "h-12" : size === "lg" ? "h-20" : "h-16";
  
  const logoUrl = settings?.logo_url;
  const logoUrlDark = settings?.logo_url_dark;
  
  // No modo escuro, priorizamos a logo escura se ela existir.
  // Caso contrário, usamos a logo padrão (logoUrl) ou a fallback.
  const logoSrc = (document.documentElement.classList.contains('dark') && logoUrlDark) 
    ? logoUrlDark 
    : (logoUrl || streetdexLogo);
  return (
    <div className="flex items-center">
      <img
        src={logoSrc}
        alt={settings?.store_name || "Street Dex"}
        className={`${imgSize} w-auto object-contain transition-all duration-300 dark:brightness-110`}
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
