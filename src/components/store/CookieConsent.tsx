import { useState } from "react";
import { Button } from "@/components/ui/button";

const CookieConsent = () => {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("cookie_consent") === "true");
  if (dismissed) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] bg-card border-t border-border text-foreground px-4 py-2.5 flex items-center justify-center gap-4 transition-colors duration-300">
      <p className="text-xs leading-relaxed">
        Ao navegar por este site <strong>você aceita o uso de cookies</strong> para agilizar a sua experiência de compra.
      </p>
      <Button
        size="sm"
        onClick={() => { localStorage.setItem("cookie_consent", "true"); setDismissed(true); }}
      >
        ENTENDI
      </Button>
    </div>
  );
};

export default CookieConsent;
