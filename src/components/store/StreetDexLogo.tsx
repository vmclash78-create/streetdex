import streetdexLogo from "@/assets/streetdex-logo.png";
import { useStoreSettings } from "@/hooks/useStoreData";

const StreetDexLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const { data: settings } = useStoreSettings();
  const imgSize = size === "sm" ? "h-12" : size === "lg" ? "h-20" : "h-16";
  
  const logoUrl = settings?.logo_url;
  
  // Se não houver logo personalizada, usamos a padrão
  const logoSrc = logoUrl || streetdexLogo;
  
  // A logo é adaptada para o modo escuro usando filtros CSS
  // No modo escuro, aplicamos inversão se for a logo padrão (preta)
  // ou se for uma logo customizada que precise de contraste.
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
