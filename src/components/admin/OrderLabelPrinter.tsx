import React from "react";
import { DBOrder, DBOrderItem, DBCustomer } from "@/hooks/useOrders";
import { formatPrice } from "@/lib/format";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
      <DialogContent className="max-w-2xl bg-card border-border print:p-0 print:border-0 print:shadow-none print:bg-white print:text-black">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center gap-2">
            <Printer size={18} /> Imprimir Etiqueta de Envio
          </DialogTitle>
        </DialogHeader>

        <div id="label-content" className="p-4 space-y-8 bg-white text-black font-sans border border-zinc-200 rounded-md print:border-0 print:rounded-none">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-black pb-4">
            <div>
              <h1 className="text-2xl font-black uppercase italic">{storeName}</h1>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mt-1">Streetwear & Culture</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold uppercase tracking-tighter">Pedido #{order.order_number}</p>
              <p className="text-[10px] text-zinc-500">{new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>

          {/* Recipient info */}
          <div className="space-y-4">
            <div className="bg-zinc-100 p-3 rounded print:bg-zinc-50">
              <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Destinatário</p>
              <h2 className="text-lg font-bold uppercase">{order.customers.name}</h2>
              <p className="text-sm font-medium mt-1">
                {order.address_street}, {order.address_number}
                {order.address_complement && ` - ${order.address_complement}`}
              </p>
              <p className="text-sm font-medium">
                {order.address_neighborhood}
              </p>
              <p className="text-sm font-medium uppercase">
                {order.address_city} - CEP: {order.address_cep}
              </p>
              <p className="text-xs font-bold mt-2">TEL: {order.customers.phone}</p>
            </div>

            {/* Content info */}
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2 border-b border-zinc-200 pb-1">Conteúdo do Pacote</p>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-[10px] uppercase text-zinc-400">
                    <th className="py-2">Item</th>
                    <th className="py-2 text-center w-12">Qtd</th>
                    <th className="py-2 text-right w-24">Tam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 pr-4 font-medium">{item.product_name}</td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right font-bold">{item.size || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer / QR / Barcode placeholders */}
          <div className="flex justify-between items-end pt-4 border-t-2 border-black">
            <div className="text-[10px] uppercase font-bold space-y-1">
              <p>Envio: Padrão Nacional</p>
              <p>Valor Total: {formatPrice(order.total)}</p>
            </div>
            <div className="text-right">
              <div className="h-10 w-48 bg-black mb-1 flex items-center justify-center">
                 <div className="flex gap-[2px] h-full items-center px-2">
                    {[...Array(40)].map((_, i) => (
                      <div key={i} className={`h-8 w-[1px] bg-white ${i % 3 === 0 ? 'w-[2px]' : ''}`} />
                    ))}
                 </div>
              </div>
              <p className="text-[8px] tracking-[0.3em] font-mono">ORD-{order.id.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #label-content, #label-content * {
              visibility: visible;
            }
            #label-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 40px;
              border: 0;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
        `}} />

        <div className="flex justify-end gap-2 mt-4 print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer size={16} /> Imprimir Agora
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderLabelPrinter;
