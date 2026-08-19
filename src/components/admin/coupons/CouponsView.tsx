import { useState, useMemo } from "react";
import { 
  Plus, Edit2, Trash2, Loader2 
} from "lucide-react";
import { 
  useCoupons, useUpsertCoupon, useDeleteCoupon 
} from "@/hooks/useStoreData";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/format";
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

type DBCoupon = {
  id: string;
  code: string;
  discount_value: number;
  discount_type: 'percentage' | 'fixed';
  min_purchase_amount?: number;
  status: 'active' | 'inactive';
  expires_at: string | null;
  max_uses: number | null;
  used_count: number;
};

/**
 * Visualização de cupons de desconto.
 */
const CouponsView = () => {
  const { data: coupons, isLoading } = useCoupons();
  const upsertCoupon = useUpsertCoupon();
  const deleteCoupon = useDeleteCoupon();
  const [editingCoupon, setEditingCoupon] = useState<Partial<DBCoupon> | null>(null);
  const { toast } = useToast();

  const openNew = () => {
    setEditingCoupon({
      code: "",
      discount_value: 0,
      discount_type: "percentage",
      min_purchase_amount: 0,
      status: "active",
      expires_at: null,
      max_uses: null
    });
  };

  const handleSave = async () => {
    if (!editingCoupon?.code) {
      toast({ title: "Erro", description: "O código é obrigatório.", variant: "destructive" });
      return;
    }
    await upsertCoupon.mutateAsync(editingCoupon);
    setEditingCoupon(null);
    toast({ title: "Sucesso", description: "Cupom salvo!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Cupons</h1>
        <Button onClick={openNew} className="gap-2"><Plus size={16} /> Novo Cupom</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Expiração</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons?.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-bold tracking-wider">{c.code}</TableCell>
                  <TableCell>
                    {c.discount_type === "percentage" ? `${c.discount_value}%` : formatPrice(c.discount_value)}
                  </TableCell>
                  <TableCell>{c.min_purchase_amount ? formatPrice(c.min_purchase_amount) : "—"}</TableCell>
                  <TableCell>{c.expires_at ? new Date(c.expires_at).toLocaleDateString("pt-BR") : "Nunca"}</TableCell>
                  <TableCell>{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "active" ? "secondary" : "destructive"} className="capitalize">
                      {c.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditingCoupon(c)}><Edit2 size={16} /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCoupon.mutate(c.id)}><Trash2 size={16} /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!editingCoupon} onOpenChange={() => setEditingCoupon(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCoupon?.id ? "Editar Cupom" : "Novo Cupom"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código</Label>
                <Input value={editingCoupon?.code} onChange={(e) => setEditingCoupon({ ...editingCoupon!, code: e.target.value.toUpperCase() })} placeholder="EX: TRINTAOFF" />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={editingCoupon?.discount_type} onValueChange={(v: any) => setEditingCoupon({ ...editingCoupon!, discount_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor do Desconto</Label>
                <Input type="number" value={editingCoupon?.discount_value ?? ""} onChange={(e) => setEditingCoupon({ ...editingCoupon!, discount_value: Number(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Compra Mínima (R$)</Label>
                <Input type="number" value={editingCoupon?.min_purchase_amount ?? ""} onChange={(e) => setEditingCoupon({ ...editingCoupon!, min_purchase_amount: Number(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiração</Label>
                <Input type="date" value={editingCoupon?.expires_at ? editingCoupon.expires_at.split("T")[0] : ""} onChange={(e) => setEditingCoupon({ ...editingCoupon!, expires_at: e.target.value ? e.target.value + "T23:59:59Z" : null })} />
              </div>
              <div className="space-y-2">
                <Label>Limite de Usos</Label>
                <Input type="number" value={editingCoupon?.max_uses || ""} onChange={(e) => setEditingCoupon({ ...editingCoupon!, max_uses: e.target.value ? Number(e.target.value) : null })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editingCoupon?.status} onValueChange={(v: any) => setEditingCoupon({ ...editingCoupon!, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCoupon(null)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar Cupom</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponsView;
