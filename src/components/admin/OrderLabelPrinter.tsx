import React from "react";
import { DBOrder, DBOrderItem, DBCustomer } from "@/hooks/useOrders";
import { formatPrice } from "@/lib/format";
import { Printer, Instagram, Globe, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStoreSettings } from "@/hooks/useStoreData";
import { useSuperFreteSettings, generateOrderTag } from "@/lib/superfrete";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import streetdexLogo from "@/assets/streetdex-logo.png";

interface OrderLabelPrinterProps {
  order: DBOrder & { customers: DBCustomer };
  items: DBOrderItem[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  storeName?: string;
}

/** Barras pseudo-aleatórias determinísticas (mesma etiqueta = mesmo desenho) */
const Barcode = ({ seed, height, count }: { seed: number; height: number; count: number }) => (
  <div className="flex items-end justify-center gap-[2px]" style={{ height }}>
    {Array.from({ length: count }).map((_, i) => {
      const v = (Math.sin((i + 1) * (seed % 97) * 12.9898) * 43758.5453) % 1;
      const w = Math.abs(v) > 0.62 ? 4 : Math.abs(v) > 0.32 ? 2 : 1;
      return <div key={i} style={{ width: w, height: "100%", background: "#000" }} />;
    })}
  </div>
);

const QrCodeMock = ({ size = 78 }: { size?: number }) => {
  const cells = 13;
  const px = size / cells;
  const isFinder = (r: number, c: number) =>
    (r < 4 && c < 4) || (r < 4 && c >= cells - 4) || (r >= cells - 4 && c < 4);
  return (
    <div style={{ width: size, height: size, display: "grid", gridTemplateColumns: `repeat(${cells}, ${px}px)` }}>
      {Array.from({ length: cells * cells }).map((_, i) => {
        const r = Math.floor(i / cells);
        const c = i % cells;
        let on: boolean;
        if (isFinder(r, c)) {
          const rr = r < 4 ? r : cells - 1 - r;
          const cc = c < 4 ? c : cells - 1 - c;
          on = rr === 0 || cc === 0 || (rr === 2 && cc === 2);
        } else {
          on = Math.abs((Math.sin((r + 1) * 12.9 + (c + 1) * 78.2) * 43758.5453) % 1) > 0.5;
        }
        return <div key={i} style={{ width: px, height: px, background: on ? "#000" : "#fff" }} />;
      })}
    </div>
  );
};

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span
    className="inline-block bg-black text-white rounded-[4px] px-2 py-[2px] text-[11px] font-bold tracking-tight"
    style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as React.CSSProperties}
  >
    {children}
  </span>
);

const OrderLabelPrinter: React.FC<OrderLabelPrinterProps> = ({
  order,
  items,
  isOpen,
  onOpenChange,
  storeName = "Street Dex",
}) => {
  const { data: settings } = useStoreSettings();
  const { data: sfSettings } = useSuperFreteSettings();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [tagData, setTagData] = React.useState<any>(null);

  // Fundo dos boxes é preto: prioriza a logo do tema escuro (clara)
  const logoSrc = settings?.logo_url_dark || settings?.logo_url || streetdexLogo;

  const handlePrint = () => window.print();

  const handleGenerateRealTag = async () => {
    if (!sfSettings?.token) {
      toast({
        title: "Configuração incompleta",
        description: "Configure o Token da SuperFrete nas configurações primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const data = await generateOrderTag({
        token: sfSettings.token,
        environment: sfSettings.environment,
        order,
        items,
        settings: sfSettings
      });
      
      setTagData(data);
      toast({
        title: "Etiqueta Gerada",
        description: "A etiqueta real foi gerada com sucesso via SuperFrete.",
      });
    } catch (err: any) {
      toast({
        title: "Erro ao gerar etiqueta",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const brand = `${(settings?.store_name || storeName).toUpperCase()} | STREETWEAR`;
  const instagram = settings?.instagram_url?.replace(/^.*instagram\.com\//, "@").replace(/\/$/, "") || "@street.dex";
  const site = "streetdex.com.br";
  const cnpj = settings?.store_cnpj || "58.123.456/0001-90";
  const senderAddr = sfSettings?.from_street 
    ? [`${sfSettings.from_street}, ${sfSettings.from_number} – ${sfSettings.from_neighborhood}`, `${sfSettings.from_city} – ${sfSettings.from_state} – CEP: ${sfSettings.from_zip}`]
    : ["Rua das Estrelas, 123 – Centro", "Fortaleza – CE – CEP: 60000-000"];
  const uf = sfSettings?.from_state || "CE";
  const destCity = order.address_city || "FORTALEZA";
  const weight = tagData?.package?.weight || "0,250";
  const nf = tagData?.invoice?.number || String(order.order_number).padStart(8, "0");
  const tracking = tagData?.tracking || `BR ${String(order.order_number).padStart(3, "0")} 456 789 00 1 BR`;
  const plp = tagData?.protocol || "0001234567890";

  const contentSummary =
    items.length > 0
      ? items.map((i) => `${i.quantity} ${i.product_name.toLowerCase()}`).join(" / ")
      : "1 camiseta / vestuário";

  const LogoBox = ({ size, withHandle }: { size: number; withHandle?: boolean }) => (
    <div
      className="bg-black flex flex-col items-center justify-center shrink-0"
      style={{ width: size, height: size, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as React.CSSProperties}
    >
      <img
        src={logoSrc}
        alt={brand}
        className="object-contain"
        style={{ width: size - 12, height: withHandle ? size - 44 : size - 12 }}
      />
      {withHandle && (
        <div className="flex items-center gap-1 text-white text-[12px] font-bold mt-1">
          <Instagram size={13} strokeWidth={2.5} />
          <Globe size={13} strokeWidth={2.5} />
          <span>{instagram}</span>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1100px] w-[96vw] bg-[#141414] border-zinc-800 p-0 overflow-y-auto max-h-[92vh] focus-visible:outline-none">
        <DialogHeader className="print:hidden px-6 pt-5 pb-4 border-b border-zinc-800">
          <DialogTitle className="flex items-center gap-2 text-white font-bold">
            <Truck size={18} className="text-primary" /> Etiqueta de Envio — SuperFrete
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 print:p-0 print-container">
          <div
            id="label-content"
            className="bg-white text-black mx-auto rounded-[10px] border-2 border-black overflow-hidden"
            style={{ width: 1000, fontFamily: "Arial, Helvetica, sans-serif" }}
          >
            {/* LINHA 1 — Correios / PAC / Peso */}
            <div className="flex border-b-2 border-black">
              <div className="flex items-center gap-3 px-5 py-3" style={{ width: "31%" }}>
                <div className="bg-[#003399] p-1.5 rounded">
                  <Truck size={24} className="text-white" />
                </div>
                <span className="text-[26px] font-extrabold tracking-tighter leading-none text-[#003399]">SuperFrete</span>
              </div>
              <div className="flex flex-col items-center justify-center py-2" style={{ width: "38%" }}>
                <span className="text-[30px] font-bold leading-none">PAC</span>
                <span className="text-[13px] mt-1">Contrato: 9912445588</span>
              </div>
              <div className="flex items-center justify-end gap-4 px-5 py-2" style={{ width: "31%" }}>
                <div className="flex flex-col items-center">
                  <div
                    className="rounded-full bg-black"
                    style={{ width: 44, height: 44, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as React.CSSProperties}
                  />
                  <span className="text-[12px] mt-1 whitespace-nowrap">NF: {nf}</span>
                </div>
                <div className="text-right leading-tight">
                  <p className="text-[12px]">Peso (kg)</p>
                  <p className="text-[19px] font-bold leading-none">{weight}</p>
                  <p className="text-[11px] mt-1">Data da Postagem</p>
                  <p className="text-[14px] font-bold leading-none">{new Date().toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            </div>

            {/* LINHA 2 — Remetente / Serviço / Destino */}
            <div className="flex border-b-2 border-black">
              <div className="px-5 py-3 border-r-2 border-black" style={{ width: "55%" }}>
                <Tag>REMETENTE</Tag>
                <div className="flex gap-4 mt-3">
                  <LogoBox size={150} />
                  <div className="text-[15px] leading-[1.45]">
                    <p className="text-[18px] font-bold">{brand}</p>
                    <p>Moda para quem vive intensamente</p>
                    <p>Unissex</p>
                    <p>CNPJ: {cnpj}</p>
                    {senderAddr.map((l) => (
                      <p key={l}>{l}</p>
                    ))}
                    <p>Instagram: {instagram}</p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-r-2 border-black flex flex-col" style={{ width: "28%" }}>
                <Tag>SERVIÇO</Tag>
                <p className="text-[36px] font-bold leading-none mt-2">PAC</p>
                <div className="mt-4 space-y-[14px]">
                  {["Recebedor", "Assinatura", "Documento"].map((l) => (
                    <div key={l} className="flex items-end gap-2">
                      <span className="text-[13px] whitespace-nowrap">{l}</span>
                      <div className="flex-1 border-b border-black/70" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 py-3 flex flex-col items-center" style={{ width: "17%" }}>
                <Tag>DESTINO</Tag>
                <p className="text-[46px] font-bold leading-none mt-1">{uf}</p>
                <p className="text-[17px] font-bold uppercase leading-none mt-1 text-center">{destCity}</p>
                <div className="mt-3">
                  <QrCodeMock size={86} />
                </div>
              </div>
            </div>

            {/* LINHA 3 — Destinatário / Logo / Declaração / Frete */}
            <div className="flex border-b-2 border-black">
              <div className="px-5 py-3" style={{ width: "33%" }}>
                <Tag>DESTINATÁRIO</Tag>
                <p className="text-[20px] font-bold uppercase mt-3">{order.customers.name}</p>
                <div className="text-[16px] leading-[1.5] mt-1">
                  <p>
                    {order.address_street}, {order.address_number}
                    {order.address_neighborhood ? ` – ${order.address_neighborhood}` : ""}
                  </p>
                  <p>
                    {order.address_city} – {uf}
                  </p>
                  <p>CEP: {order.address_cep}</p>
                  <p>Tel: {order.customers.phone}</p>
                </div>
              </div>

              <div className="flex items-center justify-center py-4" style={{ width: "22%" }}>
                <LogoBox size={170} withHandle />
              </div>

              <div className="px-4 py-3 border-l-2 border-black flex flex-col justify-center" style={{ width: "28%" }}>
                <p className="text-[16px] font-bold text-center mb-2">DECLARAÇÃO DE CONTEÚDO</p>
                <div className="border border-black">
                  <p className="text-[15px] text-center py-2 px-2">{contentSummary}</p>
                  <p
                    className="bg-black text-white text-[14px] font-bold text-center py-1"
                    style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as React.CSSProperties}
                  >
                    VALOR DECLARADO
                  </p>
                  <p className="text-[16px] text-center py-2">{formatPrice(order.total)}</p>
                </div>
              </div>

              <div className="border-l-2 border-black flex flex-col" style={{ width: "17%" }}>
                <div className="px-4 py-3 border-b-2 border-black">
                  <Tag>FRETE</Tag>
                  <p className="text-[20px] font-bold mt-1">PAGO</p>
                </div>
                <div className="px-4 py-3">
                  <Tag>PLP</Tag>
                  <p className="text-[16px] font-bold mt-1">{plp}</p>
                </div>
              </div>
            </div>

            {/* LINHA 4 — Rastreamento / Código de barras */}
            <div className="flex items-stretch">
              <div className="px-6 py-4 flex flex-col items-center justify-center" style={{ width: "62%" }}>
                <p className="text-[15px] font-bold">CÓDIGO DE RASTREAMENTO</p>
                <p className="text-[34px] font-bold tracking-wide leading-none my-2">{tracking}</p>
                <Barcode seed={order.order_number + 7} height={78} count={72} />
              </div>
              <div className="border-l-2 border-dashed border-black/60" />
              <div className="px-6 py-4 flex flex-col items-center justify-center" style={{ width: "38%" }}>
                <Tag>CÓDIGO DE BARRAS</Tag>
                <div className="mt-3">
                  <Barcode seed={order.order_number + 31} height={82} count={44} />
                </div>
                <p className="text-[17px] font-bold mt-2">12345678901234</p>
              </div>
            </div>

            {/* RODAPÉ PRETO */}
            <div
              className="bg-black text-white flex items-center justify-between px-6 py-3 text-[15px] font-bold"
              style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as React.CSSProperties}
            >
              <span className="flex items-center gap-2">
                <Globe size={16} /> {site}
              </span>
              <span className="flex items-center gap-2">
                <Star size={14} fill="currentColor" /> {brand}
              </span>
              <span>Obrigado pela preferência!</span>
              <img src={logoSrc} alt="" className="h-8 w-auto object-contain" />
            </div>
          </div>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media print {
            @page { margin: 8mm; size: landscape; }
            /* Esconde tudo no body */
            body > * { display: none !important; }
            /* Garante que o portal do Dialog (onde está a etiqueta) seja exibido */
            body > div[id^="radix-"] { display: block !important; }
            /* Esconde elementos internos do Dialog que não são a etiqueta */
            div[role="dialog"] > *:not(.print-container) { display: none !important; }
            /* Container da etiqueta */
            .print-container { display: block !important; padding: 0 !important; margin: 0 !important; position: static !important; }
            #label-content {
              position: static !important;
              display: block !important;
              width: 1000px !important;
              margin: 0 auto !important;
              border: none !important;
              box-shadow: none !important;
              visibility: visible !important;
            }
            #label-content * { visibility: visible !important; }
            .print\\:hidden { display: none !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `,
          }}
        />

        <div className="flex justify-end gap-3 p-5 bg-zinc-900 border-t border-zinc-800 print:hidden">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/10">
            Cancelar
          </Button>
          <Button 
            onClick={handleGenerateRealTag} 
            disabled={isGenerating || !!tagData}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 gap-2 font-bold"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Truck size={18} />}
            {tagData ? "Etiqueta Gerada" : "Gerar Etiqueta Real"}
          </Button>
          <Button onClick={handlePrint} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8 font-bold">
            <Printer size={18} /> Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderLabelPrinter;
