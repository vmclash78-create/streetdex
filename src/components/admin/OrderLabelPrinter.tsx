import React from "react";
import { DBOrder, DBOrderItem, DBCustomer } from "@/hooks/useOrders";
import { formatPrice } from "@/lib/format";
import { Printer, Instagram, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StreetDexLogo from "@/components/store/StreetDexLogo";

interface OrderLabelPrinterProps {
  order: DBOrder & { customers: DBCustomer };
  items: DBOrderItem[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  storeName?: string;
}

const OrderLabelPrinter: React.FC<OrderLabelPrinterProps> = ({
  order,
  items,
  isOpen,
  onOpenChange,
  storeName = "Street Dex",
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Mock data for elements present in the reference image but not in our DB yet
  const cnpj = "58.123.456/0001-90";
  const instagram = "@street.dex";
  const website = "streetdex.com.br";
  const contract = "9912445588";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-[#141414] border-zinc-800 print:p-0 print:border-0 print:shadow-none print:bg-white print:text-black overflow-hidden p-0">
        <DialogHeader className="print:hidden px-6 pt-6 bg-zinc-900 border-b border-zinc-800 pb-4">
          <DialogTitle className="flex items-center gap-2 text-white font-black uppercase italic tracking-tighter">
            <Printer size={18} className="text-primary" /> Imprimir Etiqueta Padrão Correios
          </DialogTitle>
        </DialogHeader>

        <div id="label-content" className="m-4 bg-white text-black font-sans border border-black relative print:m-0 print:border-0" style={{ width: '1000px', margin: '20px auto' }}>
          
          {/* TOP SECTION: LOGO CORREIOS | PAC | NF/DATE */}
          <div className="flex border-b border-black h-20 items-stretch">
            <div className="flex-1 flex items-center px-4 border-r border-black gap-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                 <div className="w-4 h-4 bg-white rotate-45"></div>
              </div>
              <span className="text-2xl font-black italic tracking-tighter uppercase">Correios</span>
            </div>
            <div className="flex-[1.5] flex flex-col items-center justify-center border-r border-black">
              <span className="text-3xl font-black uppercase tracking-tighter">PAC</span>
              <span className="text-[10px] font-bold">Contrato: {contract}</span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-end px-4 gap-1">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full border-4 border-black"></div>
                 <span className="text-[10px] font-bold">NF: 00012345</span>
              </div>
              <div className="text-right leading-none">
                 <p className="text-[8px] font-bold uppercase text-zinc-500">Peso (kg)</p>
                 <p className="text-xs font-black">0,250</p>
                 <p className="text-[8px] font-bold uppercase text-zinc-500 mt-1">Data da Postagem</p>
                 <p className="text-xs font-black">{new Date().toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </div>

          {/* SENDER AND SERVICE SECTION */}
          <div className="flex border-b border-black min-h-[160px]">
            {/* Sender */}
            <div className="flex-[3.5] border-r border-black p-4">
              <div className="bg-black text-white text-[10px] font-black uppercase px-2 py-0.5 inline-block mb-3">REMETENTE</div>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-black p-2 shrink-0">
                  <StreetDexLogo size="md" className="brightness-0 invert h-full w-full object-contain" />
                </div>
                <div className="text-[11px] leading-tight font-bold">
                  <p className="text-sm font-black uppercase tracking-tighter">{storeName} | STREETWEAR</p>
                  <p className="text-zinc-500 mt-1">Moda para quem vive intensamente Unissex</p>
                  <p className="mt-1">CNPJ: {cnpj}</p>
                  <p className="mt-1 uppercase">Rua das Estrelas, 123 - Centro</p>
                  <p className="uppercase">Fortaleza - CE - CEP: 60000-000</p>
                  <p className="mt-1 lowercase flex items-center gap-1"><Instagram size={10}/> {instagram}</p>
                </div>
              </div>
            </div>
            {/* Service Status */}
            <div className="flex-1 border-r border-black p-4 flex flex-col">
              <div className="bg-black text-white text-[10px] font-black uppercase px-2 py-0.5 inline-block self-start mb-2">SERVIÇO</div>
              <span className="text-3xl font-black uppercase italic tracking-tighter">PAC</span>
              <div className="mt-auto space-y-1">
                <div className="border-b border-black/20 pb-1">
                  <p className="text-[8px] text-zinc-400 font-bold uppercase">Recebedor</p>
                  <div className="h-4"></div>
                </div>
                <div className="border-b border-black/20 pb-1">
                  <p className="text-[8px] text-zinc-400 font-bold uppercase">Assinatura</p>
                  <div className="h-4"></div>
                </div>
                <div>
                  <p className="text-[8px] text-zinc-400 font-bold uppercase">Documento</p>
                  <div className="h-4"></div>
                </div>
              </div>
            </div>
            {/* Destination Code */}
            <div className="flex-1 p-4 flex flex-col items-center">
              <div className="bg-black text-white text-[10px] font-black uppercase px-2 py-0.5 inline-block mb-2">DESTINO</div>
              <span className="text-5xl font-black italic tracking-tighter">CE</span>
              <p className="text-[10px] font-black uppercase mt-1">FORTALEZA</p>
              <div className="mt-auto bg-white p-1 border border-black w-14 h-14">
                {/* QR Code Placeholder */}
                <div className="w-full h-full border-[3px] border-black flex flex-wrap p-0.5 gap-0.5">
                   {[...Array(9)].map((_, i) => (
                     <div key={i} className={`w-[14px] h-[14px] ${i%2===0 ? 'bg-black' : ''}`}></div>
                   ))}
                </div>
              </div>
            </div>
          </div>

          {/* RECIPIENT AND CONTENT SECTION */}
          <div className="flex border-b border-black min-h-[160px] items-stretch">
            {/* Recipient info */}
            <div className="flex-[3.5] border-r border-black p-4 flex flex-col">
              <div className="bg-black text-white text-[10px] font-black uppercase px-2 py-0.5 inline-block mb-3 self-start">DESTINATÁRIO</div>
              <h2 className="text-lg font-black uppercase tracking-tighter">{order.customers.name}</h2>
              <div className="text-xs font-bold leading-relaxed mt-2 uppercase">
                <p>{order.address_street}, {order.address_number} {order.address_complement && `- ${order.address_complement}`}</p>
                <p>{order.address_neighborhood}</p>
                <p className="text-sm font-black">{order.address_city}</p>
                <p className="text-lg font-black tracking-widest mt-1">CEP: {order.address_cep}</p>
                <p className="mt-2">Tel: {order.customers.phone}</p>
              </div>
            </div>
            
            {/* Logo Central & Content Details */}
            <div className="flex-[3.5] flex border-r border-black">
              <div className="flex-1 p-4 flex flex-col items-center justify-center border-r border-black gap-2">
                 <div className="w-32 h-32 bg-black p-2">
                    <StreetDexLogo size="md" className="brightness-0 invert h-full w-full object-contain" />
                 </div>
                 <div className="flex items-center gap-3 text-[9px] font-black italic uppercase">
                    <span className="flex items-center gap-0.5"><Instagram size={8}/> {instagram}</span>
                 </div>
              </div>
              <div className="flex-1 flex flex-col">
                 <div className="p-3 flex-1 flex flex-col">
                    <div className="text-[9px] font-black uppercase text-center mb-2">DECLARAÇÃO DE CONTEÚDO</div>
                    <div className="flex-1 text-[10px] font-bold">
                       {items.map((item, idx) => (
                         <div key={idx} className="flex justify-between border-b border-black/10 py-1">
                           <span className="uppercase truncate max-w-[80px]">{item.quantity}x {item.product_name}</span>
                           <span className="uppercase">{item.size || "UN"}</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="bg-black text-white p-2">
                    <p className="text-[8px] font-black uppercase text-center text-zinc-400">VALOR DECLARADO</p>
                    <p className="text-lg font-black text-center italic leading-none">{formatPrice(order.total)}</p>
                 </div>
              </div>
            </div>

            {/* PLP/FRETE Status */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 border-b border-black p-3 flex flex-col items-center justify-center">
                 <div className="bg-black text-white text-[8px] font-black uppercase px-2 py-0.5 mb-1">FRETE</div>
                 <span className="text-sm font-black italic tracking-tighter">PAGO</span>
              </div>
              <div className="flex-1 p-3 flex flex-col items-center justify-center text-center">
                 <div className="bg-black text-white text-[8px] font-black uppercase px-2 py-0.5 mb-1">PLP</div>
                 <span className="text-[10px] font-bold">0001234567890</span>
              </div>
            </div>
          </div>

          {/* TRACKING CODES SECTION */}
          <div className="flex h-32 items-stretch">
             {/* Rastreamento */}
             <div className="flex-[1.5] border-r border-black p-4 flex flex-col items-center justify-center">
                <p className="text-[10px] font-black uppercase mb-1">CÓDIGO DE RASTREAMENTO</p>
                <p className="text-2xl font-black italic tracking-widest mb-2">BR 123 456 789 00 1 BR</p>
                {/* Barcode Simulator 1 */}
                <div className="h-12 w-full flex items-center justify-center gap-[1px]">
                   {[...Array(80)].map((_, i) => (
                     <div key={i} className={`h-10 w-[1px] bg-black ${i%5===0 ? 'w-[3px]' : i%8===0 ? 'w-[2px]' : ''}`}></div>
                   ))}
                </div>
             </div>
             {/* Código de Barras Central */}
             <div className="flex-1 p-4 flex flex-col items-center justify-center">
                <div className="bg-black text-white text-[8px] font-black uppercase px-2 py-0.5 mb-2">CÓDIGO DE BARRAS</div>
                {/* Barcode Simulator 2 */}
                <div className="h-16 w-full flex items-center justify-center gap-[1.5px]">
                   {[...Array(50)].map((_, i) => (
                     <div key={i} className={`h-14 w-[1px] bg-black ${i%3===0 ? 'w-[4px]' : i%7===0 ? 'w-[3px]' : ''}`}></div>
                   ))}
                </div>
                <p className="text-[10px] font-bold tracking-[0.3em] mt-1">12345678901234</p>
             </div>
          </div>

          {/* FOOTER BLACK BAR */}
          <div className="bg-black text-white px-6 py-2 flex justify-between items-center text-[10px] font-black italic uppercase">
             <div className="flex items-center gap-1"><Globe size={12}/> {website}</div>
             <div className="flex items-center gap-2">
                <span>★</span>
                <span>{storeName.toUpperCase()} | STREETWEAR</span>
             </div>
             <div>Obrigado pela preferência!</div>
          </div>
        </div>

        {/* Print Styles and Wrapper */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              margin: 0;
              size: auto;
            }
            body * {
              visibility: hidden;
            }
            #label-content, #label-content * {
              visibility: visible;
            }
            #label-content {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%) scale(0.95);
              width: 1000px !important;
              margin: 0 !important;
              border: 1px solid black !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            /* Reset colors for print */
            .bg-black {
              background-color: black !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .text-white {
              color: white !important;
            }
            .border-black {
              border-color: black !important;
            }
          }
        `}} />

        <div className="flex justify-end gap-3 p-6 bg-zinc-900 border-t border-zinc-800 print:hidden relative z-50">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/10">
            Cancelar
          </Button>
          <Button onClick={handlePrint} className="bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase italic tracking-tighter gap-2 px-8">
            <Printer size={18} /> Disparar Impressão
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderLabelPrinter;