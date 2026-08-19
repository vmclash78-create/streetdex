import { useState } from "react";
import { Plus, Edit2, Trash2, Save, Loader2, Image as ImageIcon } from "lucide-react";
import { useAdminBanners, useUpsertBanner, useDeleteBanner, useAdminProducts } from "@/hooks/useStoreData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploadField from "@/components/admin/ImageUploadField";
/**
 * Visualização de gerenciamento de banners do carrossel.
 */
const BannersView = () => {
    const { data: banners, isLoading } = useAdminBanners();
    const upsertBanner = useUpsertBanner();
    const deleteBanner = useDeleteBanner();
    const { data: products } = useAdminProducts();
    const [editing, setEditing] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [useProduct, setUseProduct] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState("");
    const openNew = () => {
        setEditing({ img: "", cta: "Ver mais", active: true, sort_order: (banners?.length || 0) + 1 });
        setUseProduct(false);
        setSelectedProductId("");
    };
    const handleSelectProduct = (productId) => {
        setSelectedProductId(productId);
        const product = products?.find((p) => p.id === productId);
        if (product)
            setEditing((prev) => prev ? { ...prev, img: product.img } : prev);
    };
    const handleSave = async () => {
        if (!editing?.img)
            return;
        await upsertBanner.mutateAsync(editing);
        setEditing(null);
    };
    const handleDelete = async (id) => {
        await deleteBanner.mutateAsync(id);
        setDeleteConfirm(null);
    };
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Banners do Carrossel</h1>
        <Button onClick={openNew} className="gap-2"><Plus size={16}/> Novo Banner</Button>
      </div>

      {isLoading ? (<div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24}/></div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners?.map((banner) => (<Card key={banner.id} className="overflow-hidden group">
              <div className="aspect-video relative overflow-hidden">
                <img src={banner.img} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105"/>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge variant={banner.active ? "default" : "secondary"}>
                    {banner.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider"> CTA: {banner.cta}</span>
                  <span className="text-xs text-muted-foreground">Ordem: {banner.sort_order}</span>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(banner)}><Edit2 size={15}/></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(banner.id)}><Trash2 size={15}/></Button>
                </div>
              </CardContent>
            </Card>))}
          {(!banners || banners.length === 0) && (<div className="col-span-full py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
              <ImageIcon size={40} className="opacity-20"/>
              <p>Nenhum banner cadastrado</p>
            </div>)}
        </div>)}

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Excluir banner?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              {deleteBanner.isPending && <Loader2 size={14} className="animate-spin mr-2"/>} Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/New modal */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar Banner" : "Novo Banner"}</DialogTitle>
          </DialogHeader>
          {editing && (<div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox id="useProduct" checked={useProduct} onCheckedChange={(c) => setUseProduct(!!c)}/>
                <Label htmlFor="useProduct" className="text-sm cursor-pointer">Usar imagem de um produto</Label>
              </div>

              {useProduct ? (<div>
                  <Label className="text-sm font-medium">Selecionar Produto</Label>
                  <Select value={selectedProductId} onValueChange={handleSelectProduct}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Escolha um produto"/></SelectTrigger>
                    <SelectContent>
                      {products?.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>) : (<ImageUploadField label="Imagem do Banner" value={editing.img || ""} onChange={(url) => setEditing({ ...editing, img: url })} folder="banners"/>)}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Texto do Botão (CTA)</Label>
                  <Input value={editing.cta || ""} onChange={(e) => setEditing({ ...editing, cta: e.target.value })} className="mt-1"/>
                </div>
                <div>
                  <Label className="text-sm font-medium">Ordem</Label>
                  <Input type="number" value={editing.sort_order || 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} className="mt-1"/>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="activeBanner" checked={editing.active !== false} onCheckedChange={(c) => setEditing({ ...editing, active: !!c })}/>
                <Label htmlFor="activeBanner" className="text-sm cursor-pointer">Banner Ativo</Label>
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                <Button onClick={handleSave} disabled={upsertBanner.isPending} className="gap-2">
                  {upsertBanner.isPending && <Loader2 size={14} className="animate-spin"/>}
                  <Save size={14}/> Salvar Banner
                </Button>
              </DialogFooter>
            </div>)}
        </DialogContent>
      </Dialog>
    </div>);
};
export default BannersView;
