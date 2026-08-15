import React from "react";
import { DBOrder, DBOrderItem, DBCustomer } from "@/hooks/useOrders";
import { formatPrice } from "@/lib/format";
import { Printer } from "lucide-react";
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#141414] border-zinc-800 print:p-0 print:border-0 print:shadow-none print:bg-white print:text-black overflow-hidden">
        <DialogHeader className="print:hidden px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-white font-black uppercase italic tracking-tighter">
            <Printer size={18} className="text-primary" /> Imprimir Etiqueta de Envio
          </DialogTitle>
        </DialogHeader>

        <div id="label-content" className="m-6 p-8 bg-white text-black font-sans border-4 border-black relative print:m-0 print:border-4">
          {/* Estética Streetwear: Minimalista e Profissional */}
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-black p-2 rounded-sm print:bg-black">
                <StreetDexLogo size="md" className="brightness-0 invert print:brightness-0 print:invert" />
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{storeName}</h1>
                <p className="text-[10px] text-black uppercase tracking-[0.3em] font-black mt-1">LOGISTICS / AUTHENTIC SHIPPING</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-black text-white px-3 py-1 mb-1 inline-block">
                <p className="text-lg font-black uppercase tracking-tighter">ORDEM #{order.order_number}</p>
              </div>
              <p className="text-[10px] font-bold uppercase">{new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recipient info */}
            <div className="space-y-4">
              <div className="border-2 border-black p-4 relative">
                <div className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-black uppercase tracking-widest border-2 border-black">
                  Destinatário
                </div>
                <h2 className="text-xl font-black uppercase italic mt-2">{order.customers.name}</h2>
                <div className="space-y-1 mt-3 font-bold text-sm">
                  <p className="uppercase leading-tight">
                    {order.address_street}, {order.address_number}
                    {order.address_complement && <span className="block text-zinc-500">{order.address_complement}</span>}
                  </p>
                  <p className="uppercase">{order.address_neighborhood}</p>
                  <p className="uppercase text-lg">
                    {order.address_city} - {order.address_cep}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-200">
                  <p className="text-xs font-black">CONTATO: {order.customers.phone}</p>
                </div>
              </div>

              {/* Barcode Simulator */}
              <div className="pt-4">
                <div className="h-16 w-full bg-black mb-2 flex items-center justify-center overflow-hidden">
                   <div className="flex gap-[2px] h-full items-center px-4">
                      {[...Array(60)].map((_, i) => (
                        <div key={i} className={`h-12 w-[1px] bg-white ${i % 4 === 0 ? 'w-[3px]' : i % 7 === 0 ? 'w-[2px]' : ''}`} />
                      ))}
                   </div>
                </div>
                <p className="text-[9px] text-center tracking-[0.5em] font-mono font-bold uppercase">ORD-{order.id.substring(0, 12).toUpperCase()}</p>
              </div>
            </div>

            {/* Content info */}
            <div className="border-2 border-black p-4 relative flex flex-col">
              <div className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-black uppercase tracking-widest border-2 border-black">
                Manifesto de Conteúdo
              </div>
              <div className="flex-1 overflow-hidden mt-2">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-black text-[10px] uppercase font-black">
                      <th className="py-2">Item / Drop</th>
                      <th className="py-2 text-center w-12">Qtd</th>
                      <th className="py-2 text-right w-16">Tam</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold">
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-zinc-100 italic">
                        <td className="py-3 pr-2 uppercase leading-tight truncate max-w-[120px]">{item.product_name}</td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right uppercase">{item.size || "OS"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 pt-4 border-t-4 border-black flex justify-between items-end">
                <div className="text-[10px] uppercase font-black space-y-0.5">
                  <p>Modalidade: Express Ground</p>
                  <p>Peso Est: 0.850kg</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-zinc-400">Total Declaro</p>
                  <p className="text-xl font-black italic leading-none">{formatPrice(order.total)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="mt-8 flex justify-between items-center opacity-20 print:hidden">
            <div className="h-px bg-black flex-1 mr-4"></div>
            <p className="text-[8px] font-black uppercase tracking-[1em]">Street Dex Logistics System</p>
            <div className="h-px bg-black flex-1 ml-4"></div>
          </div>
        </div>

        {/* Print Styles */}
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
              transform: translate(-50%, -50%);
              width: 90%;
              max-width: 800px;
              margin: 0;
              padding: 40px;
              border: 4px solid black !important;
              box-shadow: none !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            .brightness-0.invert {
              filter: brightness(0) invert(1) !important;
              -webkit-filter: brightness(0) invert(1) !important;
            }
            .bg-black {
              background-color: black !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .text-white {
              color: white !important;
            }
          }
        `}} />

        <div className="flex justify-end gap-3 p-6 bg-zinc-900 border-t border-zinc-800 print:hidden">
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
