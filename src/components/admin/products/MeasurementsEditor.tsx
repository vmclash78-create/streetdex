import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MeasurementRow = { size: string; chest?: number; length?: number; sleeve?: number };

interface MeasurementsEditorProps {
  sizes: string[];
  value: MeasurementRow[];
  onChange: (rows: MeasurementRow[]) => void;
}

const DEFAULT_MEASUREMENTS: MeasurementRow[] = [
  { size: "P", chest: 54, length: 73, sleeve: 20 },
  { size: "M", chest: 58, length: 75, sleeve: 22 },
  { size: "G", chest: 62, length: 79, sleeve: 24 },
  { size: "GG", chest: 66, length: 81, sleeve: 25 },
  { size: "XG", chest: 70, length: 83, sleeve: 26 },
];

/**
 * Editor de tabela de medidas para produtos.
 */
const MeasurementsEditor = ({ sizes, value, onChange }: MeasurementsEditorProps) => {
  const byKey = new Map((value || []).map((r) => [r.size, r]));
  const rows: MeasurementRow[] = (sizes && sizes.length ? sizes : ["P", "M", "G", "GG", "XG"]).map(
    (s) => byKey.get(s) || { size: s }
  );

  const update = (size: string, field: keyof Omit<MeasurementRow, 'size'>, val: string) => {
    const num = val === "" ? undefined : Number(val);
    const next = rows.map((r) => (r.size === size ? { ...r, [field]: num } : r));
    onChange(next);
  };

  return (
    <div className="pt-4 border-t border-border">
      <Label className="text-sm font-medium">Tabela de Medidas (cm)</Label>
      <p className="text-[11px] text-muted-foreground mt-1 mb-2">
        Preencha as medidas para cada tamanho. Linhas em branco usam o padrão da loja.
      </p>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-2 py-1.5 text-left font-bold">Tam.</th>
              <th className="px-2 py-1.5 text-left font-bold">Largura</th>
              <th className="px-2 py-1.5 text-left font-bold">Comprimento</th>
              <th className="px-2 py-1.5 text-left font-bold">Manga</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.size} className="border-t border-border">
                <td className="px-2 py-1 font-bold">{r.size}</td>
                <td className="px-1 py-1">
                  <Input 
                    type="number" 
                    value={r.chest ?? ""} 
                    onChange={(e) => update(r.size, "chest", e.target.value)} 
                    className="h-8 text-xs" 
                    placeholder="—" 
                  />
                </td>
                <td className="px-1 py-1">
                  <Input 
                    type="number" 
                    value={r.length ?? ""} 
                    onChange={(e) => update(r.size, "length", e.target.value)} 
                    className="h-8 text-xs" 
                    placeholder="—" 
                  />
                </td>
                <td className="px-1 py-1">
                  <Input 
                    type="number" 
                    value={r.sleeve ?? ""} 
                    onChange={(e) => update(r.size, "sleeve", e.target.value)} 
                    className="h-8 text-xs" 
                    placeholder="—" 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MeasurementsEditor;
export type { MeasurementRow };
