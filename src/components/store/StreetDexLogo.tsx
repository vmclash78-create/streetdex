import streetdexLogo from "@/assets/streetdex-logo.png";
import streetdexLogoDark from "@/assets/streetdex-logo-dark.png";
import { useStoreSettings } from "@/hooks/useStoreData";

const StreetDexLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const { data: settings } = useStoreSettings();
  const imgSize = size === "sm" ? "h-8" : size === "lg" ? "h-14" : "h-10";
  
  const logoUrl = settings?.logo_url;
  const logoUrlDark = settings?.logo_url_dark;
  
  const logoLight = logoUrl || streetdexLogo;
  // If we have an explicit dark logo, use it, otherwise use the light logo with a filter
  const logoDark = logoUrlDark || logoUrl || streetdexLogoDark;
  const useFilter = !logoUrlDark && logoUrl;

  return (
    <>
      <img
        src={logoLight.startsWith('http') ? `${logoLight}${logoLight.includes('?') ? '&' : '?'}t=${new Date().getTime()}` : logoLight}
        alt={settings?.store_name || "Street Dex"}
        className={`${imgSize} w-auto object-contain dark:hidden`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== streetdexLogo) {
            target.src = streetdexLogo;
          }
        }}
      />
      <img
        src={logoDark.startsWith('http') ? `${logoDark}${logoDark.includes('?') ? '&' : '?'}t=${new Date().getTime()}` : logoDark}
        alt={settings?.store_name || "Street Dex"}
        className={`${imgSize} w-auto object-contain hidden dark:block ${useFilter ? 'dark-logo-filter' : ''}`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          const fallback = streetdexLogoDark || streetdexLogo;
          if (target.src !== fallback) {
            target.src = fallback;
          }
        }}
      />
    </>
  );
};

export default StreetDexLogo;
