import streetdexLogo from "@/assets/streetdex-logo.png";

const StreetDexLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const imgSize = size === "sm" ? "h-8" : size === "lg" ? "h-14" : "h-10";
  return (
    <img
      src={streetdexLogo}
      alt="Street Dex"
      className={`${imgSize} w-auto object-contain dark:brightness-100 brightness-0`}
    />
  );
};

export default StreetDexLogo;
