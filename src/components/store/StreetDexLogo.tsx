import streetdexLogo from "@/assets/streetdex-logo.png";

const StreetDexLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const imgSize = size === "sm" ? "h-8" : size === "lg" ? "h-14" : "h-10";
  return (
    <img
      src={streetdexLogo}
      alt="Street Dex"
      className={`${imgSize} w-auto object-contain brightness-0 invert dark:invert`}
      style={{ filter: "brightness(0) invert(1)" }}
    />
  );
};

export default StreetDexLogo;
