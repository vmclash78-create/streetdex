import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Printer, Truck, Package as PackageIcon, RefreshCw } from "lucide-react";
import { useShipmentByOrder, useShippingQuote, useGenerateShipment } from "./useShipment";
import { meApi } from "./api";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/format";

type Props = { orderId: string; toZip?: string | null; orderTotal?: number };

export function ShipmentActions({ orderId, toZip, orderTotal }: Props) {
  const { toast } = useToast();
  const { data: shipment, isLoading, refetch } = useShipmentByOrder(orderId);
  const { data: quotes, isLoading: quoting, refetch: refetchQuote } = useShippingQuote(toZip || undefined, orderTotal);
  const gen = useGenerateShipment();
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!selectedService) return;
    try {
      const r = await gen.mutateAsync({ order_id: orderId, service_id: selectedService });
      toast({ title: "Etiqueta gerada", description: r.tracking_code ? `Rastreio: ${r.tracking_code}` : "Compra realizada" });
    } catch (e) {
      toast({ title: "Falha ao gerar etiqueta", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handlePrint = async () => {
    if (!shipment?.carrier_order_id) return;
    try {
      const r = await meApi.print(shipment.carrier_order_id);
      if (r.url) window.open(r.url, "_blank", "noopener");
      else toast({ title: "PDF indisponível", variant: "destructive" });
    } catch (e) {
      toast({ title: "Falha ao imprimir", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handleTrack = async () => {
    if (!shipment?.carrier_order_id) return;
    try {
      const r = await meApi.track(shipment.carrier_order_id);
      console.log("tracking", r);
      toast({ title: "Rastreio atualizado", description: "Veja o console para detalhes completos" });
      refetch();
    } catch (e) {
      toast({ title: "Falha ao rastrear", description: (e as Error).message, variant: "destructive" });
    }
  };

  if (isLoading) return <Loader2 size={16} className="animate-spin text-primary" />;

  return (
    <div className="border-t border-border pt-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Expedição (Melhor Envio)</p>
        {shipment && <Badge variant="outline" className="text-[10px]">{shipment.status}</Badge>}
      </div>

      {shipment ? (
        <div className="space-y-2 text-sm">
          {shipment.tracking_code && (
            <p><span className="text-muted-foreground">Rastreio:</span> <span className="font-mono">{shipment.tracking_code}</span></p>
          )}
          {shipment.shipping_cost != null && (
            <p><span className="text-muted-foreground">Custo:</span> {formatPrice(Number(shipment.shipping_cost))}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} disabled={!shipment.carrier_order_id}>
              <Printer size={14} className="mr-1" /> Imprimir Etiqueta
            </Button>
            <Button size="sm" variant="outline" onClick={handleTrack} disabled={!shipment.carrier_order_id}>
              <Truck size={14} className="mr-1" /> Rastrear
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {!toZip ? (
            <p className="text-xs text-muted-foreground">CEP do pedido ausente.</p>
          ) : quoting ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 size={12} className="animate-spin" /> Cotando fretes…</div>
          ) : quotes && quotes.length > 0 ? (
            <>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {quotes.filter((q: any) => !q.error).map((q: any) => (
                  <label key={q.id} className={`flex items-center gap-2 text-xs p-2 rounded border cursor-pointer ${selectedService === q.id ? "border-primary bg-primary/5" : "border-border"}`}>
                    <input type="radio" name="me-svc" value={q.id} checked={selectedService === q.id} onChange={() => setSelectedService(q.id)} />
                    <span className="flex-1">
                      <strong>{q.company?.name} — {q.name}</strong>
                      <span className="block text-muted-foreground">
                        {q.price ? formatPrice(Number(q.price)) : "—"} • {q.delivery_time || "?"} dias
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleGenerate} disabled={!selectedService || gen.isPending}>
                  {gen.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <PackageIcon size={14} className="mr-1" />}
                  Gerar Etiqueta
                </Button>
                <Button size="sm" variant="ghost" onClick={() => refetchQuote()}>
                  <RefreshCw size={14} />
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Nenhuma cotação. Verifique a conexão em Configurações → Expedição.</p>
              <Button size="sm" variant="outline" onClick={() => refetchQuote()}><RefreshCw size={14} className="mr-1" /> Tentar novamente</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
