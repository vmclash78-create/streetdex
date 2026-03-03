import { useState } from "react";

const CookieConsent = () => {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("cookie_consent") === "true");
  if (dismissed) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] bg-foreground text-background px-4 py-2.5 flex items-center justify-center gap-4">
      <p className="text-xs leading-relaxed">
        Ao navegar por este site <strong>você aceita o uso de cookies</strong> para agilizar a sua experiência de compra.
      </p>
      <button
        onClick={() => { localStorage.setItem("cookie_consent", "true"); setDismissed(true); }}
        className="bg-background text-foreground text-xs font-bold px-4 py-1.5 rounded border border-border flex-shrink-0 hover:bg-muted transition-colors"
      >
        ENTENDI
      </button>
    </div>
  );
};

export default CookieConsent;
