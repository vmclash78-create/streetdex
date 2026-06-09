import streetdexLogo from "@/assets/streetdex-logo.png";
import { useStoreSettings } from "@/hooks/useStoreData";

const StreetDexLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const { data: settings } = useStoreSettings();
  const imgSize = size === "sm" ? "h-8" : size === "lg" ? "h-14" : "h-10";
  
  const logoUrl = settings?.logo_url;
  
  // Se não houver logo personalizada, usamos a padrão
  const logoSrc = logoUrl || streetdexLogo;
  
  // A classe dark-logo-filter (definida no index.css) inverte as cores no modo escuro
  // se a logo for personalizada. A logo padrão já tem sua própria versão se necessário,
  // mas aqui simplificamos para usar apenas um campo e adaptar via CSS.
  return (
    <div className="flex items-center">
      <img
        src={`${logoSrc}${logoSrc.includes('?') ? '&' : '?'}t=${new Date().getTime()}`}
        alt={settings?.store_name || "Street Dex"}
        className={`${imgSize} w-auto object-contain transition-all duration-300 dark:brightness-0 dark:invert`}
      />
    </div>
  );
};

export default StreetDexLogo;
