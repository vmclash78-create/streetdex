import streetdexLogo from "@/assets/streetdex-logo.png";
import streetdexLogoDark from "@/assets/streetdex-logo-dark.png";
import { useStoreSettings } from "@/hooks/useStoreData";

const StreetDexLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const { data: settings } = useStoreSettings();
  const imgSize = size === "sm" ? "h-8" : size === "lg" ? "h-14" : "h-10";
  
  const logoLight = settings?.logo_url || streetdexLogo;
  const logoDark = settings?.logo_url_dark || settings?.logo_url || streetdexLogoDark;

  return (
    <>
      <img
        src={logoLight}
        alt={settings?.store_name || "Street Dex"}
        className={`${imgSize} w-auto object-contain dark:hidden`}
      />
      <img
        src={logoDark}
        alt={settings?.store_name || "Street Dex"}
        className={`${imgSize} w-auto object-contain hidden dark:block`}
      />
    </>
  );
};

export default StreetDexLogo;
