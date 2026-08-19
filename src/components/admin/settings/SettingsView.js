import { useState } from "react";
import { Upload, Loader2, Volume2, Save } from "lucide-react";
import { useStoreSettings, useUpdateSetting } from "@/hooks/useStoreData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SOUND_PRESETS, playNotificationSound, unlockAudioContext, normalizePresetId } from "@/lib/notification-sounds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ShippingConfigEditor from "./ShippingConfigEditor";
/**
 * Visualização de configurações globais da loja.
 */
const SettingsView = () => {
    const { data: settings, isLoading } = useStoreSettings();
    const updateSetting = useUpdateSetting();
    const { toast } = useToast();
    const [localSettings, setLocalSettings] = useState({});
    const [uploading, setUploading] = useState(null);
    const getValue = (key) => localSettings[key] ?? settings?.[key] ?? "";
    const handleSave = async () => {
        const entries = Object.entries(localSettings);
        if (entries.length === 0)
            return;
        try {
            for (const [key, value] of entries) {
                await updateSetting.mutateAsync({ key, value });
            }
            setLocalSettings({});
            toast({ title: "Sucesso", description: "Configurações salvas!" });
        }
        catch (error) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    };
    const handleUpload = async (e, key) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        try {
            setUploading(key);
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Date.now()}.${fileExt}`;
            const filePath = `logos/${fileName}`;
            const { error: uploadError } = await supabase.storage
                .from('store-assets')
                .upload(filePath, file, { cacheControl: '3600', upsert: true });
            if (uploadError)
                throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(filePath);
            await updateSetting.mutateAsync({ key, value: publicUrl });
            toast({ title: "Sucesso", description: "Logo atualizada!" });
        }
        catch (error) {
            toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
        }
        finally {
            setUploading(null);
        }
    };
    if (isLoading)
        return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24}/></div>;
    return (<div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
      
      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Geral & Branding</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tema Claro */}
            <div className="space-y-3">
              <Label className="text-xs uppercase font-bold text-muted-foreground">Logo Tema Claro</Label>
              <div className="aspect-video rounded-lg border border-border bg-white flex items-center justify-center overflow-hidden relative">
                {getValue("logo_url") ? (<img src={getValue("logo_url")} alt="Claro" className="max-h-[70%] object-contain"/>) : (<Upload size={20} className="text-zinc-300"/>)}
                {uploading === "logo_url" && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="animate-spin text-white"/></div>}
              </div>
              <Button variant="outline" size="sm" className="w-full relative overflow-hidden" disabled={!!uploading}>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleUpload(e, "logo_url")}/>
                {uploading === "logo_url" ? "Enviando..." : "Subir Logo"}
              </Button>
            </div>
            {/* Tema Escuro */}
            <div className="space-y-3">
              <Label className="text-xs uppercase font-bold text-muted-foreground">Logo Tema Escuro</Label>
              <div className="aspect-video rounded-lg border border-border bg-zinc-950 flex items-center justify-center overflow-hidden relative">
                {getValue("logo_url_dark") ? (<img src={getValue("logo_url_dark")} alt="Escuro" className="max-h-[70%] object-contain"/>) : (<Upload size={20} className="text-zinc-700"/>)}
                {uploading === "logo_url_dark" && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="animate-spin text-white"/></div>}
              </div>
              <Button variant="outline" size="sm" className="w-full relative overflow-hidden" disabled={!!uploading}>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleUpload(e, "logo_url_dark")}/>
                {uploading === "logo_url_dark" ? "Enviando..." : "Subir Logo"}
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome da Loja</Label>
                <Input value={getValue("store_name")} onChange={(e) => setLocalSettings({ ...localSettings, store_name: e.target.value })}/>
              </div>
              <div>
                <Label>WhatsApp Principal</Label>
                <Input value={getValue("whatsapp_store")} onChange={(e) => setLocalSettings({ ...localSettings, whatsapp_store: e.target.value })} placeholder="55..."/>
              </div>
            </div>
            <div>
              <Label>Link do Grupo/Comunidade</Label>
              <Input value={getValue("whatsapp_group_url")} onChange={(e) => setLocalSettings({ ...localSettings, whatsapp_group_url: e.target.value })} placeholder="https://chat.whatsapp.com/..."/>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider">Descontos</h3>
            <div className="w-1/2">
              <Label>Desconto PIX/Dinheiro (%)</Label>
              <Input type="number" value={getValue("pix_discount")} onChange={(e) => setLocalSettings({ ...localSettings, pix_discount: e.target.value, cash_discount: e.target.value })}/>
            </div>
          </div>

          <ShippingConfigEditor getValue={getValue} setLocal={(patch) => setLocalSettings({ ...localSettings, ...patch })}/>

          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider">Notificações Sonoras</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Som de Novo Pedido</Label>
                <Select value={normalizePresetId(getValue("notification_sound"))} onValueChange={(v) => setLocalSettings({ ...localSettings, notification_sound: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SOUND_PRESETS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="flex justify-between">Volume <span>{Math.round((parseFloat(getValue("notification_volume")) || 0.8) * 100)}%</span></Label>
                <Slider className="mt-4" min={0} max={1} step={0.05} value={[parseFloat(getValue("notification_volume")) || 0.8]} onValueChange={([v]) => setLocalSettings({ ...localSettings, notification_volume: String(v) })}/>
              </div>
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={() => {
            const preset = normalizePresetId(getValue("notification_sound"));
            const vol = parseFloat(getValue("notification_volume")) || 0.8;
            void unlockAudioContext().then(() => playNotificationSound(preset, vol));
        }}>
              <Volume2 size={16}/> Testar Áudio
            </Button>
          </div>

          <Button onClick={handleSave} disabled={updateSetting.isPending || Object.keys(localSettings).length === 0} className="w-full gap-2" size="lg">
            {updateSetting.isPending && <Loader2 size={16} className="animate-spin"/>}
            <Save size={16}/> Salvar Alterações
          </Button>
        </CardContent>
      </Card>
    </div>);
};
export default SettingsView;
