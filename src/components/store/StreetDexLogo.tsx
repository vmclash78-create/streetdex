import streetdexLogo from "@/assets/streetdex-logo.png";
import streetdexLogoDark from "@/assets/streetdex-logo-dark.png";

const StreetDexLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const imgSize = size === "sm" ? "h-8" : size === "lg" ? "h-14" : "h-10";
  return (
    <>
      <img
        src={streetdexLogo}
        alt="Street Dex"
        className={`${imgSize} w-auto object-contain dark:hidden`}
      />
      <img
        src={streetdexLogoDark}
        alt="Street Dex"
        className={`${imgSize} w-auto object-contain hidden dark:block`}
      />
    </>
  );
};

export default StreetDexLogo;
