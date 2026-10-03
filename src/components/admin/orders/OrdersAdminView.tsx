import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Volume2, Eye, Edit2, Trash2, Loader2, Save, ChevronRight 
} from "lucide-react";
import { 
  useOrders, useOrderItems, useUpdateOrderStatus, useUpdateOrder, useDeleteOrder,
  ORDER_STATUSES, getStatusInfo
} from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";
import { 
  ADMIN_PAYMENT_METHODS as PAYMENT_METHODS, 
  PAYMENT_METHOD_LABELS as PAYMENT_LABELS 
} from "@/constants/payments";
import { type DBOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";

interface OrdersAdminViewProps {
  somLiberado: boolean;
  testarNotificacao: () => void;
}

/**
 * Visualização de gerenciamento de pedidos no Admin.
 */
const OrdersAdminView = ({ somLiberado, testarNotificacao }: OrdersAdminViewProps) => {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<DBOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  
  // Filtros
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");
  
  const { data: orderItems } = useOrderItems(selectedOrderId || undefined);
  const selectedOrder = orders?.find((o) => o.id === selectedOrderId);

  const handleStatusChange = async (orderId: string, status: string) => {
    const order = orders?.find(o => o.id === orderId);
    if (!order) return;

    if (status === "entregue") {
      try {
        const { error } = await supabase.rpc("complete_delivered_order", { p_order_id: orderId });
        if (error) throw error;
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["orders"] }),
          queryClient.invalidateQueries({ queryKey: ["sales"] }),
          queryClient.invalidateQueries({ queryKey: ["all-sale-items"] }),
        ]);
        toast({ title: "Sucesso", description: "Pedido entregue e registrado em Vendas!" });
        return;
      } catch (error: unknown) {
        toast({ title: "Erro ao concluir", description: error instanceof Error ? error.message : "Tente novamente.", variant: "destructive" });
        return;
      }
    }

    try {
      await updateStatus.mutateAsync({ id: orderId, status });
    } catch (error: unknown) {
      toast({ title: "Erro ao atualizar pedido", description: error instanceof Error ? error.message : "Tente novamente.", variant: "destructive" });
    }
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(order => {
      if (order.status === "entregue") return false;
      const orderDate = new Date(order.created_at).toISOString().split("T")[0];
      if (filterDateFrom && orderDate < filterDateFrom) return false;
      if (filterDateTo && orderDate > filterDateTo) return false;
      if (filterPayment && order.payment_method !== filterPayment) return false;
      const total = Number(order.total);
      if (filterMinAmount && total < Number(filterMinAmount)) return false;
      if (filterMaxAmount && total > Number(filterMaxAmount)) return false;
      return true;
    });
  }, [orders, filterDateFrom, filterDateTo, filterPayment, filterMinAmount, filterMaxAmount]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
        <div className="flex items-center gap-3">
          {!somLiberado && <Badge variant="outline" className="animate-pulse border-yellow-500 text-yellow-500">Aguardando áudio</Badge>}
          <Button variant="outline" size="sm" onClick={testarNotificacao} className="gap-2"><Volume2 size={14} /> Testar Alerta</Button>
        </div>
      </div>

      <Card className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 bg-card/50">
        <div className="min-w-0">
          <Label className="text-xs uppercase font-bold text-muted-foreground">Período</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Input type="date" aria-label="De" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="h-9 min-w-0 px-2" />
            <Input type="date" aria-label="Até" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="h-9 min-w-0 px-2" />
          </div>
        </div>
        <div>
          <Label className="text-xs uppercase font-bold text-muted-foreground">Pagamento</Label>
          <Select value={filterPayment || "all"} onValueChange={(v) => setFilterPayment(v === "all" ? "" : v)}>
            <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{PAYMENT_LABELS[m] || m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase font-bold text-muted-foreground">Valor (Min/Max)</Label>
          <div className="flex gap-2 mt-1">
            <Input type="number" placeholder="Min" value={filterMinAmount} onChange={(e) => setFilterMinAmount(e.target.value)} className="h-9" />
            <Input type="number" placeholder="Max" value={filterMaxAmount} onChange={(e) => setFilterMaxAmount(e.target.value)} className="h-9" />
          </div>
        </div>
        <div className="flex items-end">
          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => { setFilterDateFrom(""); setFilterDateTo(""); setFilterPayment(""); setFilterMinAmount(""); setFilterMaxAmount(""); }}>Limpar Filtros</Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : (
        <Card className="overflow-hidden border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-bold">#{order.order_number}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{order.customers?.name}</p>
                      <p className="text-xs text-muted-foreground">{order.customers?.phone}</p>
                    </TableCell>
                    <TableCell className="font-bold">{formatPrice(Number(order.total))}</TableCell>
                    <TableCell>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border-0 outline-none cursor-pointer ${statusInfo.color}`}
                      >
                        {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrderId(order.id)}><Eye size={15} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingOrder({ ...order })}><Edit2 size={15} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setOrderToDelete(order.id)}><Trash2 size={15} /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrderId(null)}>
        <DialogContent className="max-w-md">
          {selectedOrder && (
            <>
              <DialogHeader><DialogTitle>Pedido #{selectedOrder.order_number}</DialogTitle></DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase">Endereço</Label>
                  <p>{selectedOrder.address_street}, {selectedOrder.address_number} - {selectedOrder.address_neighborhood}</p>
                  <p>{selectedOrder.address_city} - CEP: {selectedOrder.address_cep}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase">Itens</Label>
                  {orderItems?.map(item => (
                    <div key={item.id} className="flex justify-between py-1 border-b border-border/50 last:border-0">
                      <span>{item.quantity}x {item.product_name} {item.size && `(${item.size})`}</span>
                      <span className="font-medium">{formatPrice(Number(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-base pt-2">
                  <span>Total</span>
                  <span>{formatPrice(Number(selectedOrder.total))}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Editar Pedido</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={editingOrder?.status} onValueChange={v => setEditingOrder({ ...editingOrder!, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ORDER_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Pagamento</Label>
                <Select value={editingOrder?.payment_method} onValueChange={v => setEditingOrder({ ...editingOrder!, payment_method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{PAYMENT_LABELS[m] || m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Total</Label>
              <Input type="number" step="0.01" value={editingOrder?.total} onChange={e => setEditingOrder({ ...editingOrder!, total: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label>Notas</Label>
              <Input value={editingOrder?.notes || ""} onChange={e => setEditingOrder({ ...editingOrder!, notes: e.target.value })} />
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setEditingOrder(null)}>Cancelar</Button>
              <Button onClick={() => { updateOrder.mutate(editingOrder!); setEditingOrder(null); }}>Salvar</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle>Excluir Pedido?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Esta ação é irreversível.</p>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setOrderToDelete(null)}>Cancelar</Button>
            <Button variant="destructive" className="flex-1" onClick={() => { deleteOrder.mutate(orderToDelete!); setOrderToDelete(null); }}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersAdminView;
