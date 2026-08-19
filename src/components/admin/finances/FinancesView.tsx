import { useState, useMemo } from "react";
import { 
  ArrowUpRight, ArrowDownRight, Box, TrendingUp, Download, Plus, Trash2, Loader2 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  useSales, useAllSaleItems, useExpenses, useCreateExpense, useDeleteExpense 
} from "@/hooks/useStoreData";
import { formatPrice, formatDate } from "@/lib/format";
import { 
  ADMIN_PAYMENT_METHODS as PAYMENT_METHODS, 
  PAYMENT_METHOD_LABELS as PAYMENT_LABELS 
} from "@/constants/payments";
import { EXPENSE_CATEGORIES } from "@/constants/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";

/**
 * Visualização de gestão financeira, receitas e despesas.
 */
const FinancesView = () => {
  const { data: sales } = useSales();
  const { data: saleItems } = useAllSaleItems();
  const { data: expenses } = useExpenses();
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();
  
  const [tab, setTab] = useState("overview");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expName, setExpName] = useState("");
  const [expAmount, setExpAmount] = useState(0);
  const [expCategory, setExpCategory] = useState("Outros");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterPayment, setFilterPayment] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const totalRevenue = sales?.reduce((s, sale) => s + Number(sale.total), 0) || 0;
  const supplierExpenses = expenses?.filter(e => e.category === "Fornecedores").reduce((s, e) => s + Number(e.amount), 0) || 0;
  const totalCost = (saleItems?.reduce((s, item) => s + Number(item.unit_cost) * item.quantity, 0) || 0) + supplierExpenses;
  const totalExp = (expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0) - supplierExpenses;
  const netProfit = totalRevenue - totalCost - totalExp;

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    let result = [...sales];
    if (filterPayment) result = result.filter((s) => s.payment_method === filterPayment);
    if (filterDateFrom) result = result.filter((s) => s.sale_date >= filterDateFrom);
    if (filterDateTo) result = result.filter((s) => s.sale_date <= filterDateTo);
    return result;
  }, [sales, filterPayment, filterDateFrom, filterDateTo]);

  const monthlyChart = useMemo(() => {
    if (!sales || !expenses) return [];
    const months: Record<string, { receita: number; despesa: number }> = {};
    sales.forEach((s) => { 
      const key = s.sale_date.substring(0, 7); 
      if (!months[key]) months[key] = { receita: 0, despesa: 0 }; 
      months[key].receita += Number(s.total); 
    });
    expenses.forEach((e) => { 
      const key = e.expense_date.substring(0, 7); 
      if (!months[key]) months[key] = { receita: 0, despesa: 0 }; 
      if (e.category !== "Fornecedores") months[key].despesa += Number(e.amount); 
    });
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
      .map(([month, data]) => ({ 
        month: new Date(month + "-15").toLocaleDateString("pt-BR", { month: "short" }), ...data 
      }));
  }, [sales, expenses]);

  const handleAddExpense = async () => {
    if (!expName || expAmount <= 0) return;
    await createExpense.mutateAsync({ name: expName, amount: expAmount, category: expCategory, expense_date: expDate, notes: null });
    setShowExpenseForm(false);
    setExpName(""); setExpAmount(0);
  };

  const exportCSV = () => {
    if (!sales) return;
    const headers = "Data,Cliente,Pagamento,Total\n";
    const rows = filteredSales.map((s) => `${s.sale_date},${s.customer_name || ""},${s.payment_method},${Number(s.total).toFixed(2)}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `relatorio-vendas-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Finanças</h1>
        <Button variant="outline" onClick={exportCSV} className="gap-2"><Download size={14} /> Exportar CSV</Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Resumo</TabsTrigger>
          <TabsTrigger value="revenue">Receitas</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <ArrowUpRight size={20} className="text-green-500 mb-2" />
                <p className="text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
                <p className="text-xs text-muted-foreground uppercase">Faturamento</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <ArrowDownRight size={20} className="text-destructive mb-2" />
                <p className="text-2xl font-bold text-foreground">{formatPrice(totalExp)}</p>
                <p className="text-xs text-muted-foreground uppercase">Gastos Fixos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <Box size={20} className="text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-foreground">{formatPrice(totalCost)}</p>
                <p className="text-xs text-muted-foreground uppercase">Custo Prod. (CPV)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <TrendingUp size={20} className={netProfit >= 0 ? "text-green-500" : "text-destructive"} />
                <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>{formatPrice(netProfit)}</p>
                <p className="text-xs text-muted-foreground uppercase">Lucro Líquido</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Receitas vs Despesas</h3>
              {monthlyChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                      formatter={(value: number, name: string) => [formatPrice(value), name === "receita" ? "Receita" : "Despesa"]} />
                    <Bar dataKey="receita" fill="hsl(145, 63%, 42%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="despesa" fill="hsl(0, 72%, 50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">Sem dados</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div>
              <Label className="text-xs">De</Label>
              <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Até</Label>
              <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="h-9" />
            </div>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{formatDate(s.sale_date)}</TableCell>
                    <TableCell>{s.customer_name || "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{PAYMENT_LABELS[s.payment_method] || s.payment_method}</Badge></TableCell>
                    <TableCell className="font-bold text-right">{formatPrice(Number(s.total))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowExpenseForm(true)} size="sm" className="gap-2"><Plus size={16} /> Nova Despesa</Button>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses?.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{formatDate(e.expense_date)}</TableCell>
                    <TableCell>{e.name}</TableCell>
                    <TableCell><Badge variant="outline">{e.category}</Badge></TableCell>
                    <TableCell className="font-bold text-destructive">{formatPrice(Number(e.amount))}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteExpense.mutate(e.id)}>
                        <Trash2 size={15} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Nova Despesa</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Nome *</Label>
                  <Input value={expName} onChange={(e) => setExpName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Valor *</Label>
                    <Input type="number" step="0.01" value={expAmount || ""} onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label>Data</Label>
                    <Input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={expCategory} onValueChange={setExpCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowExpenseForm(false)}>Cancelar</Button>
                  <Button onClick={handleAddExpense} disabled={createExpense.isPending}>
                    {createExpense.isPending && <Loader2 size={14} className="animate-spin mr-2" />} Salvar
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancesView;
