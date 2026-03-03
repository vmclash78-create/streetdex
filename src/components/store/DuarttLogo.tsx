import { Crown } from "lucide-react";

const DuarttLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const textSize = size === "sm" ? "text-xl" : size === "lg" ? "text-4xl" : "text-3xl";
  const crownSize = size === "sm" ? 10 : size === "lg" ? 16 : 13;
  return (
    <div className="flex flex-col items-center leading-none">
      <Crown size={crownSize} className="text-foreground mb-[-2px]" strokeWidth={1.5} />
      <span className={`${textSize} font-light tracking-tight text-foreground font-serif`}>
        duartt
      </span>
    </div>
  );
};

export default DuarttLogo;
