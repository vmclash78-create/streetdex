import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
const SHIPPING_REGIONS = [
    { key: "NE", label: "Nordeste (CE, PE, BA, MA, PI, RN, PB, AL, SE)" },
    { key: "SE", label: "Sudeste (SP, RJ, MG, ES)" },
    { key: "S", label: "Sul (PR, SC, RS)" },
    { key: "CO", label: "Centro-Oeste (GO, MT, MS, DF)" },
    { key: "N", label: "Norte (AM, PA, AC, RO, RR, AP, TO)" },
];
const DEFAULT_SHIPPING = {
    NE: { pac_price: 19.9, pac_days: "5 a 8", sedex_price: 34.9, sedex_days: "2 a 4" },
    SE: { pac_price: 24.9, pac_days: "6 a 9", sedex_price: 39.9, sedex_days: "3 a 5" },
    S: { pac_price: 29.9, pac_days: "8 a 11", sedex_price: 49.9, sedex_days: "4 a 6" },
    CO: { pac_price: 27.9, pac_days: "7 a 10", sedex_price: 44.9, sedex_days: "3 a 5" },
    N: { pac_price: 34.9, pac_days: "10 a 15", sedex_price: 59.9, sedex_days: "5 a 8" },
};
/**
 * Editor da tabela de frete regional manual nas configurações.
 */
const ShippingConfigEditor = ({ getValue, setLocal }) => {
    const raw = getValue("shipping_config");
    let cfg = DEFAULT_SHIPPING;
    if (raw) {
        try {
            cfg = { ...DEFAULT_SHIPPING, ...JSON.parse(raw) };
        }
        catch { /* ignore */ }
    }
    const update = (region, field, val) => {
        const next = {
            ...cfg,
            [region]: {
                ...cfg[region],
                [field]: field.endsWith("price") ? (Number(val) || 0) : val
            }
        };
        setLocal({ shipping_config: JSON.stringify(next) });
    };
    return (<div className="space-y-4 pt-4 border-t border-border">
      <h3 className="text-sm font-bold uppercase tracking-wider">Tabela de Frete Regional</h3>
      <p className="text-xs text-muted-foreground">
        Configure os valores reais cobrados por cada região. Estes valores serão usados no cálculo automático via CEP no checkout.
      </p>
      {SHIPPING_REGIONS.map((r) => {
            const c = cfg[r.key] || DEFAULT_SHIPPING[r.key];
            return (<div key={r.key} className="rounded-lg border border-border p-3 space-y-2">
            <p className="text-xs font-bold text-primary uppercase tracking-tighter">{r.label}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">PAC — Preço (R$)</Label>
                <Input type="number" step="0.01" value={c.pac_price} onChange={(e) => update(r.key, "pac_price", e.target.value)} className="h-8 text-xs"/>
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">PAC — Prazo (dias)</Label>
                <Input value={c.pac_days} onChange={(e) => update(r.key, "pac_days", e.target.value)} className="h-8 text-xs" placeholder="5 a 8"/>
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">SEDEX — Preço (R$)</Label>
                <Input type="number" step="0.01" value={c.sedex_price} onChange={(e) => update(r.key, "sedex_price", e.target.value)} className="h-8 text-xs"/>
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">SEDEX — Prazo (dias)</Label>
                <Input value={c.sedex_days} onChange={(e) => update(r.key, "sedex_days", e.target.value)} className="h-8 text-xs" placeholder="2 a 4"/>
              </div>
            </div>
          </div>);
        })}
    </div>);
};
export default ShippingConfigEditor;
