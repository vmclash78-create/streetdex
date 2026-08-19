import { useState } from "react";
import { Plus, Edit2, Trash2, Save, Loader2 } from "lucide-react";
import { useAdminProducts, useUpsertProduct, useDeleteProduct } from "@/hooks/useStoreData";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/format";
import { getProductStatusColor, getProductStatusLabel, calculateMarkup } from "@/utils/admin-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploadField from "@/components/admin/ImageUploadField";
import MeasurementsEditor from "./MeasurementsEditor";
/**
 * Visualização de gerenciamento de produtos.
 */
const ProductsView = () => {
    const { data: products, isLoading } = useAdminProducts();
    const upsertProduct = useUpsertProduct();
    const deleteProduct = useDeleteProduct();
    const { toast } = useToast();
    const [editingProduct, setEditingProduct] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [localMargin, setLocalMargin] = useState("");
    const [lastChanged, setLastChanged] = useState(null);
    const openNew = () => {
        setEditingProduct({
            name: "",
            price: 0,
            cost: 0,
            img: "",
            sizes: ["P", "M", "G", "GG", "XG"],
            status: "active",
            stock: 0,
            free_shipping: true,
            shipping_cost: 0,
            category: ""
        });
        setLocalMargin("");
        setLastChanged(null);
    };
    const openEdit = (p) => {
        setEditingProduct({ ...p });
        setLastChanged(null);
        const markup = calculateMarkup(Number(p.price), Number(p.cost));
        setLocalMargin(markup || "");
    };
    const handleSave = async () => {
        if (!editingProduct?.name || !editingProduct?.img) {
            toast({ title: "Erro", description: "Preencha os campos obrigatórios (*).", variant: "destructive" });
            return;
        }
        if (editingProduct?.cost === undefined || editingProduct?.cost === null) {
            toast({ title: "Erro", description: "O custo é obrigatório.", variant: "destructive" });
            return;
        }
        if (!editingProduct?.price || editingProduct?.price <= 0) {
            toast({ title: "Erro", description: "Preço deve ser maior que zero.", variant: "destructive" });
            return;
        }
        await upsertProduct.mutateAsync(editingProduct);
        setEditingProduct(null);
    };
    const handleDelete = async (id) => {
        await deleteProduct.mutateAsync(id);
        setDeleteConfirm(null);
    };
    const toggleSelectAll = () => {
        if (selectedProductIds.length === products?.length) {
            setSelectedProductIds([]);
        }
        else {
            setSelectedProductIds(products?.map(p => p.id) || []);
        }
    };
    const toggleSelectProduct = (id) => {
        setSelectedProductIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };
    const handleBulkDelete = async () => {
        if (window.confirm(`Deseja excluir ${selectedProductIds.length} produtos?`)) {
            for (const id of selectedProductIds) {
                await deleteProduct.mutateAsync(id);
            }
            setSelectedProductIds([]);
        }
    };
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
        <div className="flex gap-2">
          {selectedProductIds.length > 0 && (<Button variant="destructive" onClick={handleBulkDelete} className="gap-2">
              <Trash2 size={16}/> Excluir ({selectedProductIds.length})
            </Button>)}
          <Button onClick={openNew} className="gap-2"><Plus size={16}/> Novo Produto</Button>
        </div>
      </div>

      {isLoading ? (<div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24}/></div>) : (<Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox checked={products && products.length > 0 && selectedProductIds.length === products.length} onCheckedChange={toggleSelectAll}/>
                </TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Margem</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((p) => {
                const margin = calculateMarkup(Number(p.price), Number(p.cost));
                return (<TableRow key={p.id} className={selectedProductIds.includes(p.id) ? "bg-primary/5" : ""}>
                    <TableCell>
                      <Checkbox checked={selectedProductIds.includes(p.id)} onCheckedChange={() => toggleSelectProduct(p.id)}/>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={p.img} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0"/>
                        <div>
                          <span className="text-sm text-foreground truncate block max-w-[180px]">{p.name}</span>
                          <span className="text-[0.65rem] text-muted-foreground">{p.category}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatPrice(Number(p.price))}</TableCell>
                    <TableCell className="text-muted-foreground">{Number(p.cost) > 0 ? formatPrice(Number(p.cost)) : "—"}</TableCell>
                    <TableCell>{margin ? <span className="text-green-600 dark:text-green-400 font-semibold">{margin}%</span> : "—"}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${(p.stock ?? 0) <= 5 ? "text-destructive" : "text-foreground"}`}>{p.stock}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getProductStatusColor(p.status)} variant="secondary">
                        {getProductStatusLabel(p.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Edit2 size={15}/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(p.id)}><Trash2 size={15}/></Button>
                      </div>
                    </TableCell>
                  </TableRow>);
            })}
            </TableBody>
          </Table>
        </Card>)}

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Excluir produto?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              {deleteProduct.isPending && <Loader2 size={14} className="animate-spin mr-2"/>} Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/New modal */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct?.id ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          {editingProduct && (<div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Nome do Produto *</Label>
                <Input value={editingProduct.name || ""} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="mt-1"/>
              </div>

              <div>
                <Label className="text-sm font-medium">Tamanhos (separados por vírgula)</Label>
                <Input value={(editingProduct.sizes || []).join(", ")} onChange={(e) => setEditingProduct({ ...editingProduct, sizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="mt-1"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Estoque</Label>
                  <Input type="number" value={editingProduct.stock || 0} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })} className="mt-1"/>
                </div>
                <div>
                  <Label className="text-sm font-medium">Custo *</Label>
                  <Input type="number" step="0.01" value={editingProduct.cost || ""} onChange={(e) => {
                const cost = parseFloat(e.target.value) || 0;
                const updates = { cost };
                setLastChanged("cost");
                if (cost > 0 && localMargin) {
                    const marginPercent = parseFloat(localMargin.replace(",", "."));
                    if (!isNaN(marginPercent))
                        updates.price = parseFloat((cost * (1 + marginPercent / 100)).toFixed(2));
                }
                else if (cost > 0 && editingProduct.price) {
                    const margin = calculateMarkup(editingProduct.price, cost);
                    setLocalMargin(margin || "");
                }
                setEditingProduct({ ...editingProduct, ...updates });
            }} className="mt-1"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Margem (%)</Label>
                  <Input value={localMargin} onChange={(e) => {
                const inputVal = e.target.value;
                setLocalMargin(inputVal);
                const val = inputVal.replace(",", ".");
                if (val === "") {
                    setEditingProduct({ ...editingProduct, price: 0 });
                    return;
                }
                const marginPercent = parseFloat(val);
                if (!isNaN(marginPercent)) {
                    if (lastChanged === "price" && editingProduct.price) {
                        const newCost = editingProduct.price / (1 + marginPercent / 100);
                        setEditingProduct({ ...editingProduct, cost: parseFloat(newCost.toFixed(2)) });
                    }
                    else if (editingProduct.cost) {
                        const newPrice = editingProduct.cost * (1 + marginPercent / 100);
                        setEditingProduct({ ...editingProduct, price: parseFloat(newPrice.toFixed(2)) });
                    }
                }
            }}/>
                </div>
                <div>
                  <Label className="text-sm font-medium">Preço de Venda *</Label>
                  <Input type="number" step="0.01" value={editingProduct.price || ""} onChange={(e) => {
                const newPrice = parseFloat(e.target.value) || 0;
                const updates = { price: newPrice };
                setLastChanged("price");
                if (newPrice > 0 && editingProduct.cost && editingProduct.cost > 0) {
                    const margin = calculateMarkup(newPrice, editingProduct.cost);
                    setLocalMargin(margin || "");
                }
                else if (newPrice > 0 && localMargin) {
                    const marginPercent = parseFloat(localMargin.replace(",", "."));
                    if (!isNaN(marginPercent))
                        updates.cost = parseFloat((newPrice / (1 + marginPercent / 100)).toFixed(2));
                }
                setEditingProduct({ ...editingProduct, ...updates });
            }}/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Categoria</Label>
                  <Input value={editingProduct.category || ""} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} className="mt-1"/>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={editingProduct.status || "active"} onValueChange={(v) => setEditingProduct({ ...editingProduct, status: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="out">Esgotado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ImageUploadField label="Imagem Principal" required value={editingProduct.img || ""} onChange={(url) => setEditingProduct({ ...editingProduct, img: url })} folder="products"/>
              <ImageUploadField label="Imagem 2 (opcional)" value={editingProduct.img2 || ""} onChange={(url) => setEditingProduct({ ...editingProduct, img2: url || null })} folder="products"/>

              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <Textarea value={editingProduct.description || ""} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} className="mt-1 min-h-[100px]"/>
              </div>

              <MeasurementsEditor sizes={editingProduct.sizes || []} value={editingProduct.measurements || []} onChange={(rows) => setEditingProduct({ ...editingProduct, measurements: rows })}/>

              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancelar</Button>
                <Button onClick={handleSave} disabled={upsertProduct.isPending} className="gap-2 px-8">
                  {upsertProduct.isPending && <Loader2 size={14} className="animate-spin"/>}
                  <Save size={14}/> Salvar Produto
                </Button>
              </DialogFooter>
            </div>)}
        </DialogContent>
      </Dialog>
    </div>);
};
export default ProductsView;
