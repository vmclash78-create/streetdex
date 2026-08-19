import { useState, useMemo } from "react";
import { Plus, Trash2, Calendar, CreditCard, DollarSign, ShoppingBag, Loader2 } from "lucide-react";
import { useAdminProducts, useSales, useCreateSale, useDeleteSale } from "@/hooks/useStoreData";
import { formatPrice, formatDate } from "@/lib/format";
import { ADMIN_PAYMENT_METHODS as PAYMENT_METHODS, PAYMENT_METHOD_LABELS as PAYMENT_LABELS } from "@/constants/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
/**
 * Visualização de gerenciamento de vendas manuais.
 */
const SalesView = () => {
    const { data: products } = useAdminProducts();
    const { data: sales, isLoading } = useSales();
    const createSale = useCreateSale();
    const deleteSale = useDeleteSale();
    const [showForm, setShowForm] = useState(false);
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0]);
    const [customerName, setCustomerName] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("pix");
    const [discount, setDiscount] = useState(0);
    const [cartLines, setCartLines] = useState([
        { productId: "", quantity: 1, size: "" }
    ]);
    // Filtros
    const [filterDateFrom, setFilterDateFrom] = useState("");
    const [filterDateTo, setFilterDateTo] = useState("");
    const [filterPayment, setFilterPayment] = useState("all");
    const [filterMinAmount, setFilterMinAmount] = useState("");
    const [filterMaxAmount, setFilterMaxAmount] = useState("");
    const filteredSales = useMemo(() => {
        if (!sales)
            return [];
        return sales.filter(s => {
            const dateMatch = (!filterDateFrom || s.sale_date >= filterDateFrom) &&
                (!filterDateTo || s.sale_date <= filterDateTo);
            const paymentMatch = filterPayment === "all" || s.payment_method === filterPayment;
            const amount = Number(s.total);
            const minMatch = !filterMinAmount || amount >= Number(filterMinAmount);
            const maxMatch = !filterMaxAmount || amount <= Number(filterMaxAmount);
            return dateMatch && paymentMatch && minMatch && maxMatch;
        });
    }, [sales, filterDateFrom, filterDateTo, filterPayment, filterMinAmount, filterMaxAmount]);
    const activeProducts = products?.filter((p) => p.status === "active") || [];
    const addLine = () => setCartLines([...cartLines, { productId: "", quantity: 1, size: "" }]);
    const removeLine = (i) => setCartLines(cartLines.filter((_, idx) => idx !== i));
    const updateLine = (i, data) => setCartLines(cartLines.map((l, idx) => idx === i ? { ...l, ...data } : l));
    const subtotal = cartLines.reduce((s, l) => {
        const p = products?.find((pr) => pr.id === l.productId);
        return s + (p ? Number(p.price) * l.quantity : 0);
    }, 0);
    const total = Math.max(0, subtotal - discount);
    const handleSubmit = async () => {
        const items = cartLines.filter((l) => l.productId).map((l) => {
            const p = products?.find((pr) => pr.id === l.productId);
            return {
                product_id: l.productId,
                product_name: p.name,
                unit_price: Number(p.price),
                unit_cost: Number(p.cost) || 0,
                quantity: l.quantity,
                size: l.size || null
            };
        });
        if (items.length === 0)
            return;
        await createSale.mutateAsync({
            sale: { sale_date: saleDate, customer_name: customerName || null, payment_method: paymentMethod, discount, total, notes: null, order_number: null },
            items
        });
        setShowForm(false);
        setCartLines([{ productId: "", quantity: 1, size: "" }]);
        setCustomerName("");
        setDiscount(0);
    };
    return (<div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Vendas Manuais</h1>
        <Button onClick={() => setShowForm(true)} className="gap-2"><Plus size={16}/> Nova Venda</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4 p-4 bg-card rounded-lg border border-border">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-2"><Calendar size={12} className="text-primary"/> De</Label>
          <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)}/>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-2"><Calendar size={12} className="text-primary"/> Até</Label>
          <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)}/>
        </div>
        <div className="col-span-2 md:col-span-1 space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-2"><CreditCard size={12} className="text-primary"/> Pagamento</Label>
          <Select value={filterPayment} onValueChange={setFilterPayment}>
            <SelectTrigger><SelectValue placeholder="Todos"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {PAYMENT_METHODS.map((m) => (<SelectItem key={m} value={m}>{PAYMENT_LABELS[m] || m}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-2"><DollarSign size={12} className="text-primary"/> Mín.</Label>
          <Input type="number" value={filterMinAmount} onChange={(e) => setFilterMinAmount(e.target.value)} placeholder="0,00"/>
        </div>
        <div className="space-y-1.5 flex flex-col justify-end">
          <Button variant="outline" size="sm" onClick={() => {
            setFilterDateFrom("");
            setFilterDateTo("");
            setFilterPayment("all");
            setFilterMinAmount("");
            setFilterMaxAmount("");
        }}>Limpar Filtros</Button>
        </div>
      </div>

      {isLoading ? (<div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24}/></div>) : filteredSales.length > 0 ? (<Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((s) => (<TableRow key={s.id}>
                  <TableCell>{formatDate(s.sale_date)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{s.customer_name || "—"}</span>
                      {s.order_number && <span className="text-[10px] text-muted-foreground">Pedido #{s.order_number}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{PAYMENT_LABELS[s.payment_method] || s.payment_method}</Badge>
                  </TableCell>
                  <TableCell className="font-bold">{formatPrice(Number(s.total))}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteSale.mutate(s.id)}>
                      <Trash2 size={15}/>
                    </Button>
                  </TableCell>
                </TableRow>))}
            </TableBody>
          </Table>
        </Card>) : (<div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <ShoppingBag size={36} className="opacity-20"/>
          <p>Nenhuma venda encontrada</p>
        </div>)}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Registrar Venda</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label>Data</Label>
                <Input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)}/>
              </div>
              <div>
                <Label>Cliente</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Opcional"/>
              </div>
              <div>
                <Label>Pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{PAYMENT_LABELS[m]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase font-bold tracking-wider">Itens</Label>
                <Button variant="link" size="sm" onClick={addLine} className="gap-1"><Plus size={12}/> Adicionar</Button>
              </div>
              {cartLines.map((line, i) => {
            const product = products?.find((p) => p.id === line.productId);
            return (<div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select value={line.productId} onValueChange={(v) => updateLine(i, { productId: v })}>
                        <SelectTrigger><SelectValue placeholder="Produto"/></SelectTrigger>
                        <SelectContent>
                          {activeProducts.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({formatPrice(Number(p.price))})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-16">
                      <Input type="number" value={line.quantity} onChange={(e) => updateLine(i, { quantity: parseInt(e.target.value) || 1 })}/>
                    </div>
                    <div className="w-20">
                      <Select value={line.size} onValueChange={(v) => updateLine(i, { size: v })}>
                        <SelectTrigger><SelectValue placeholder="Tam."/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">—</SelectItem>
                          {(product?.sizes || []).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeLine(i)}><Trash2 size={14}/></Button>
                  </div>);
        })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-sm">
                <p className="text-muted-foreground">Subtotal: {formatPrice(subtotal)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Label className="text-xs">Desconto (R$):</Label>
                  <Input type="number" value={discount || ""} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="w-20 h-7 text-xs"/>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Final</p>
                <p className="text-xl font-bold text-primary">{formatPrice(total)}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createSale.isPending} className="px-8">
                {createSale.isPending && <Loader2 size={14} className="animate-spin mr-2"/>} Finalizar Venda
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>);
};
export default SalesView;
