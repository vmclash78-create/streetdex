import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Link as LinkIcon, Unlink, Save, ExternalLink } from "lucide-react";
import { meApi } from "./api";
import { useToast } from "@/hooks/use-toast";

export function ShippingSettingsView() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ["me-status"],
    queryFn: async () => (await meApi.status()) as any,
  });

  const [creds, setCreds] = useState({ environment: "sandbox", client_id: "", client_secret: "", redirect_uri: "" });
  const [sender, setSender] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!status) return;
    setCreds((c) => ({
      environment: status.environment ?? "sandbox",
      client_id: c.client_id, // keep user-typed value (masked from server)
      client_secret: c.client_secret,
      redirect_uri: status.redirect_uri || `${window.location.origin}/admin?me_callback=1`,
    }));
    setSender({
      from_name: status.sender?.from_name || "",
      from_document: status.sender?.from_document || "",
      from_phone: status.sender?.from_phone || "",
      from_email: status.sender?.from_email || "",
      from_zip: status.sender?.from_zip || "",
      from_address: status.sender?.from_address || "",
      from_number: status.sender?.from_number || "",
      from_complement: status.sender?.from_complement || "",
      from_district: status.sender?.from_district || "",
      from_city: status.sender?.from_city || "",
      from_state: status.sender?.from_state || "",
      default_weight_kg: status.defaults?.weight_kg ?? 0.5,
      default_length_cm: status.defaults?.length_cm ?? 20,
      default_width_cm: status.defaults?.width_cm ?? 15,
      default_height_cm: status.defaults?.height_cm ?? 5,
      default_insurance: status.defaults?.insurance ?? 0,
    });
  }, [status]);

  // OAuth callback handler
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const isCallback = url.searchParams.get("me_callback") === "1";
    if (code && isCallback) {
      (async () => {
        try {
          await meApi.exchange(code);
          toast({ title: "Melhor Envio conectado" });
          url.searchParams.delete("code");
          url.searchParams.delete("state");
          url.searchParams.delete("me_callback");
          window.history.replaceState({}, "", url.toString());
          qc.invalidateQueries({ queryKey: ["me-status"] });
        } catch (e) {
          toast({ title: "Falha na conexão", description: (e as Error).message, variant: "destructive" });
        }
      })();
    }
  }, [qc, toast]);

  const handleSaveCreds = async () => {
    setSaving(true);
    try {
      const patch: any = { environment: creds.environment, redirect_uri: creds.redirect_uri };
      if (creds.client_id) patch.client_id = creds.client_id;
      if (creds.client_secret) patch.client_secret = creds.client_secret;
      await meApi.saveCredentials(patch);
      toast({ title: "Credenciais salvas" });
      setCreds((c) => ({ ...c, client_secret: "" }));
      refetch();
    } catch (e) {
      toast({ title: "Erro ao salvar", description: (e as Error).message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const r = await meApi.authorizeUrl();
      window.location.href = r.url;
    } catch (e) {
      toast({ title: "Erro", description: (e as Error).message, variant: "destructive" });
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await meApi.disconnect();
      toast({ title: "Desconectado" });
      refetch();
    } catch (e) {
      toast({ title: "Erro", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handleSaveSender = async () => {
    setSaving(true);
    try {
      await meApi.saveSender(sender);
      toast({ title: "Remetente salvo" });
      refetch();
    } catch (e) {
      toast({ title: "Erro", description: (e as Error).message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  if (isLoading) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 size={16} className="animate-spin" /> Carregando…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Expedição — Melhor Envio</h1>
        <p className="text-sm text-muted-foreground">Configure sua integração para gerar etiquetas dos Correios/transportadoras direto do painel.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Conexão
            {status?.connected ? (
              <Badge className="bg-green-500/20 text-green-500 border-green-500/40">Conectado {status.connected_email && `· ${status.connected_email}`}</Badge>
            ) : (
              <Badge variant="outline" className="text-yellow-500 border-yellow-500/40">Não conectado</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ambiente</Label>
              <Select value={creds.environment} onValueChange={(v) => setCreds((c) => ({ ...c, environment: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox (testes)</SelectItem>
                  <SelectItem value="production">Produção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Redirect URI (cole no app do Melhor Envio)</Label>
              <Input value={creds.redirect_uri} onChange={(e) => setCreds({ ...creds, redirect_uri: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Client ID {status?.client_id && <span className="text-xs text-muted-foreground ml-2">atual: {status.client_id}</span>}</Label>
              <Input value={creds.client_id} onChange={(e) => setCreds({ ...creds, client_id: e.target.value })} placeholder="Deixe em branco para manter o atual" />
            </div>
            <div className="space-y-2">
              <Label>Client Secret</Label>
              <Input type="password" value={creds.client_secret} onChange={(e) => setCreds({ ...creds, client_secret: e.target.value })} placeholder="Deixe em branco para manter o atual" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSaveCreds} disabled={saving} variant="outline">
              {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
              Salvar credenciais
            </Button>
            {status?.connected ? (
              <Button onClick={handleDisconnect} variant="destructive"><Unlink size={14} className="mr-1" /> Desconectar</Button>
            ) : (
              <Button onClick={handleConnect} disabled={!status?.has_client || connecting}>
                {connecting ? <Loader2 size={14} className="animate-spin mr-1" /> : <LinkIcon size={14} className="mr-1" />}
                Conectar Melhor Envio
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <a href="https://melhorenvio.com.br/painel/gerenciar/tokens" target="_blank" rel="noopener">
                Criar app no Melhor Envio <ExternalLink size={12} className="ml-1" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Remetente & Pacote Padrão</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nome/Razão social" value={sender.from_name} onChange={(v) => setSender({ ...sender, from_name: v })} />
            <Field label="CPF/CNPJ (só números)" value={sender.from_document} onChange={(v) => setSender({ ...sender, from_document: v })} />
            <Field label="Telefone" value={sender.from_phone} onChange={(v) => setSender({ ...sender, from_phone: v })} />
            <Field label="E-mail" value={sender.from_email} onChange={(v) => setSender({ ...sender, from_email: v })} />
            <Field label="CEP" value={sender.from_zip} onChange={(v) => setSender({ ...sender, from_zip: v })} />
            <Field label="Endereço" value={sender.from_address} onChange={(v) => setSender({ ...sender, from_address: v })} />
            <Field label="Número" value={sender.from_number} onChange={(v) => setSender({ ...sender, from_number: v })} />
            <Field label="Complemento" value={sender.from_complement} onChange={(v) => setSender({ ...sender, from_complement: v })} />
            <Field label="Bairro" value={sender.from_district} onChange={(v) => setSender({ ...sender, from_district: v })} />
            <Field label="Cidade" value={sender.from_city} onChange={(v) => setSender({ ...sender, from_city: v })} />
            <Field label="UF" value={sender.from_state} onChange={(v) => setSender({ ...sender, from_state: v.toUpperCase().slice(0, 2) })} />
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Pacote Padrão</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <NumField label="Peso (kg)" step="0.01" value={sender.default_weight_kg} onChange={(v) => setSender({ ...sender, default_weight_kg: v })} />
              <NumField label="Compr. (cm)" value={sender.default_length_cm} onChange={(v) => setSender({ ...sender, default_length_cm: v })} />
              <NumField label="Largura (cm)" value={sender.default_width_cm} onChange={(v) => setSender({ ...sender, default_width_cm: v })} />
              <NumField label="Altura (cm)" value={sender.default_height_cm} onChange={(v) => setSender({ ...sender, default_height_cm: v })} />
              <NumField label="Seguro (R$)" step="0.01" value={sender.default_insurance} onChange={(v) => setSender({ ...sender, default_insurance: v })} />
            </div>
          </div>
          <Button onClick={handleSaveSender} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
            Salvar remetente & pacote
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function NumField({ label, value, onChange, step = "1" }: { label: string; value: number; onChange: (v: number) => void; step?: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <Input type="number" step={step} value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
