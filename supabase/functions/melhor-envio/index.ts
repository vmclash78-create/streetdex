// Melhor Envio — OAuth + operações de envio.
// Rotas (POST salvo indicado):
//   /auth/status              GET   — retorna se conectado e credenciais mascaradas
//   /auth/save-credentials    POST  — salva client_id, secret, env, redirect_uri
//   /auth/authorize-url       POST  — retorna URL para consentimento
//   /auth/exchange            POST  — troca code por access_token
//   /auth/disconnect          POST  — apaga tokens
//   /auth/save-sender         POST  — salva remetente + dimensões padrão
//   /calculate                POST  — cota preços por CEP destino
//   /generate                 POST  — cria carrinho, checkout e etiqueta para 1 order
//   /print                    POST  — obtém URL do PDF da etiqueta
//   /track                    POST  — rastreia por código
//   /webhook                  POST  — recebe atualizações do Melhor Envio (público)
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type AuthRow = {
  environment: "sandbox" | "production";
  client_id: string | null;
  client_secret: string | null;
  redirect_uri: string | null;
  scopes: string;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: string | null;
  connected_email: string | null;
  from_name: string | null; from_document: string | null; from_phone: string | null;
  from_email: string | null; from_zip: string | null; from_address: string | null;
  from_number: string | null; from_complement: string | null; from_district: string | null;
  from_city: string | null; from_state: string | null;
  default_weight_kg: number; default_length_cm: number;
  default_width_cm: number; default_height_cm: number; default_insurance: number;
};

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const meBaseUrl = (env: string) =>
  env === "production" ? "https://www.melhorenvio.com.br" : "https://sandbox.melhorenvio.com.br";

async function requireAdmin(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "unauthorized" }, 401);
  const supa = createClient(SUPABASE_URL, SUPABASE_ANON, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userErr } = await supa.auth.getUser();
  if (userErr || !userData.user) return json({ error: "unauthorized" }, 401);
  const { data: hasRole } = await supa.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
  if (!hasRole) return json({ error: "forbidden" }, 403);
  return { userId: userData.user.id };
}

async function loadAuth(): Promise<AuthRow> {
  const { data, error } = await admin.from("melhor_envio_auth").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Configuração não inicializada");
  return data as AuthRow;
}

async function saveAuthPatch(patch: Partial<AuthRow>) {
  const { error } = await admin.from("melhor_envio_auth").update(patch).eq("id", 1);
  if (error) throw error;
}

async function ensureAccessToken(auth: AuthRow): Promise<string> {
  if (!auth.access_token) throw new Error("Não conectado ao Melhor Envio");
  const exp = auth.expires_at ? new Date(auth.expires_at).getTime() : 0;
  if (exp - Date.now() > 60_000) return auth.access_token;
  // Refresh
  if (!auth.refresh_token || !auth.client_id || !auth.client_secret) {
    throw new Error("Token expirado — reconecte no Melhor Envio");
  }
  const resp = await fetch(`${meBaseUrl(auth.environment)}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: auth.refresh_token,
      client_id: auth.client_id,
      client_secret: auth.client_secret,
    }),
  });
  const body = await resp.json();
  if (!resp.ok) throw new Error(`refresh_failed: ${JSON.stringify(body)}`);
  const expires_at = new Date(Date.now() + body.expires_in * 1000).toISOString();
  await saveAuthPatch({
    access_token: body.access_token,
    refresh_token: body.refresh_token ?? auth.refresh_token,
    expires_at,
  });
  return body.access_token;
}

async function meFetch(auth: AuthRow, path: string, init: RequestInit = {}) {
  const token = await ensureAccessToken(auth);
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");
  headers.set("User-Agent", `StreetDex (${auth.from_email || "contato@streetdex.app"})`);
  const resp = await fetch(`${meBaseUrl(auth.environment)}/api/v2${path}`, { ...init, headers });
  const text = await resp.text();
  let body: unknown = text;
  try { body = JSON.parse(text); } catch { /* keep text */ }
  if (!resp.ok) throw new Error(`ME ${resp.status}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
  return body as any;
}

// ─── Handlers ───────────────────────────────────────────────────────────────

async function handleAuthStatus() {
  const a = await loadAuth();
  const mask = (v?: string | null) => (v ? `${v.slice(0, 4)}••••${v.slice(-4)}` : null);
  return json({
    connected: !!a.access_token,
    environment: a.environment,
    has_client: !!a.client_id && !!a.client_secret,
    client_id: mask(a.client_id),
    redirect_uri: a.redirect_uri,
    connected_email: a.connected_email,
    expires_at: a.expires_at,
    scopes: a.scopes,
    sender: {
      from_name: a.from_name, from_document: a.from_document, from_phone: a.from_phone,
      from_email: a.from_email, from_zip: a.from_zip, from_address: a.from_address,
      from_number: a.from_number, from_complement: a.from_complement, from_district: a.from_district,
      from_city: a.from_city, from_state: a.from_state,
    },
    defaults: {
      weight_kg: a.default_weight_kg, length_cm: a.default_length_cm,
      width_cm: a.default_width_cm, height_cm: a.default_height_cm, insurance: a.default_insurance,
    },
  });
}

async function handleSaveCredentials(req: Request) {
  const b = await req.json();
  const patch: Partial<AuthRow> = {};
  if (typeof b.environment === "string") patch.environment = b.environment;
  if (typeof b.client_id === "string") patch.client_id = b.client_id.trim() || null;
  if (typeof b.client_secret === "string") patch.client_secret = b.client_secret.trim() || null;
  if (typeof b.redirect_uri === "string") patch.redirect_uri = b.redirect_uri.trim() || null;
  if (typeof b.scopes === "string" && b.scopes.trim()) patch.scopes = b.scopes.trim();
  await saveAuthPatch(patch);
  return json({ ok: true });
}

async function handleSaveSender(req: Request) {
  const b = await req.json();
  const patch: Partial<AuthRow> = {};
  const fields = [
    "from_name","from_document","from_phone","from_email","from_zip","from_address",
    "from_number","from_complement","from_district","from_city","from_state",
  ] as const;
  for (const f of fields) if (typeof b[f] === "string") (patch as any)[f] = b[f];
  const nums = ["default_weight_kg","default_length_cm","default_width_cm","default_height_cm","default_insurance"] as const;
  for (const f of nums) if (typeof b[f] === "number") (patch as any)[f] = b[f];
  await saveAuthPatch(patch);
  return json({ ok: true });
}

async function handleAuthorizeUrl() {
  const a = await loadAuth();
  if (!a.client_id || !a.redirect_uri) return json({ error: "client_not_configured" }, 400);
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: a.client_id,
    redirect_uri: a.redirect_uri,
    response_type: "code",
    scope: a.scopes,
    state,
  });
  return json({ url: `${meBaseUrl(a.environment)}/oauth/authorize?${params.toString()}`, state });
}

async function handleExchange(req: Request) {
  const { code } = await req.json();
  if (!code) return json({ error: "missing_code" }, 400);
  const a = await loadAuth();
  if (!a.client_id || !a.client_secret || !a.redirect_uri) return json({ error: "client_not_configured" }, 400);
  const resp = await fetch(`${meBaseUrl(a.environment)}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: a.client_id,
      client_secret: a.client_secret,
      redirect_uri: a.redirect_uri,
      code,
    }),
  });
  const body = await resp.json();
  if (!resp.ok) return json({ error: "exchange_failed", details: body }, 400);
  const expires_at = new Date(Date.now() + body.expires_in * 1000).toISOString();
  await saveAuthPatch({
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    expires_at,
  });
  // Try fetch user email
  try {
    const me = await meFetch(await loadAuth(), "/me");
    if (me?.email) await saveAuthPatch({ connected_email: me.email });
  } catch { /* ignore */ }
  return json({ ok: true });
}

async function handleDisconnect() {
  await saveAuthPatch({ access_token: null, refresh_token: null, expires_at: null, connected_email: null });
  return json({ ok: true });
}

async function handleCalculate(req: Request) {
  const { to_zip, insurance_value } = await req.json();
  if (!to_zip) return json({ error: "missing_to_zip" }, 400);
  const a = await loadAuth();
  if (!a.from_zip) return json({ error: "sender_zip_missing" }, 400);
  const payload = {
    from: { postal_code: a.from_zip.replace(/\D/g, "") },
    to: { postal_code: String(to_zip).replace(/\D/g, "") },
    package: {
      height: a.default_height_cm, width: a.default_width_cm,
      length: a.default_length_cm, weight: a.default_weight_kg,
    },
    options: { insurance_value: insurance_value ?? a.default_insurance ?? 0, receipt: false, own_hand: false },
  };
  const body = await meFetch(a, "/me/shipment/calculate", { method: "POST", body: JSON.stringify(payload) });
  return json({ services: body });
}

async function handleGenerate(req: Request) {
  const { order_id, service_id, package_override } = await req.json();
  if (!order_id || !service_id) return json({ error: "missing_params" }, 400);
  const a = await loadAuth();

  const { data: order, error: orderErr } = await admin
    .from("orders").select("*, customers(*)").eq("id", order_id).maybeSingle();
  if (orderErr || !order) return json({ error: "order_not_found" }, 404);
  if (!a.from_zip || !a.from_name) return json({ error: "sender_incomplete" }, 400);
  if (!order.address_cep || !order.address_street) return json({ error: "order_address_incomplete" }, 400);

  const pkg = package_override || {
    height: a.default_height_cm, width: a.default_width_cm,
    length: a.default_length_cm, weight: a.default_weight_kg,
  };

  const cartPayload = {
    service: service_id,
    from: {
      name: a.from_name, phone: a.from_phone, email: a.from_email,
      document: a.from_document, address: a.from_address, complement: a.from_complement,
      number: a.from_number, district: a.from_district, city: a.from_city, state_abbr: a.from_state,
      country_id: "BR", postal_code: (a.from_zip || "").replace(/\D/g, ""),
    },
    to: {
      name: order.customers?.name, phone: order.customers?.phone, email: order.customers?.email,
      address: order.address_street, complement: order.address_complement, number: order.address_number,
      district: order.address_neighborhood, city: order.address_city, state_abbr: null,
      country_id: "BR", postal_code: (order.address_cep || "").replace(/\D/g, ""),
    },
    products: [{ name: `Pedido #${order.order_number}`, quantity: 1, unitary_value: Number(order.total) }],
    volumes: [pkg],
    options: {
      insurance_value: Number(order.total),
      receipt: false, own_hand: false, reverse: false, non_commercial: true,
      invoice: { key: null }, platform: "StreetDex",
      tags: [{ tag: `pedido-${order.order_number}`, url: null }],
    },
  };

  // 1. Add to cart
  const cart = await meFetch(a, "/me/cart", { method: "POST", body: JSON.stringify(cartPayload) });
  const meOrderId = cart.id;
  // 2. Checkout (compra)
  const checkout = await meFetch(a, "/me/shipment/checkout", {
    method: "POST", body: JSON.stringify({ orders: [meOrderId] }),
  });
  // 3. Generate (gera etiqueta)
  const generate = await meFetch(a, "/me/shipment/generate", {
    method: "POST", body: JSON.stringify({ orders: [meOrderId] }),
  });
  // 4. Print URL
  const printResp = await meFetch(a, "/me/shipment/print", {
    method: "POST", body: JSON.stringify({ mode: "private", orders: [meOrderId] }),
  });

  const tracking = generate?.[meOrderId]?.tracking || cart.tracking || null;
  const label_url = printResp?.url || null;

  // Save shipment record
  const { error: shipErr } = await admin.from("shipments").insert({
    order_id,
    carrier: "melhor_envio",
    carrier_service: String(service_id),
    carrier_order_id: meOrderId,
    tracking_code: tracking,
    label_url,
    status: "generated",
    shipping_cost: Number(cart.price) || null,
    raw_response: { cart, checkout, generate, print: printResp },
  });
  if (shipErr) console.error("shipment insert failed", shipErr);

  await admin.from("orders").update({ status: "etiqueta_gerada" }).eq("id", order_id);

  return json({ ok: true, tracking_code: tracking, label_url, carrier_order_id: meOrderId });
}

async function handlePrint(req: Request) {
  const { carrier_order_id } = await req.json();
  if (!carrier_order_id) return json({ error: "missing_id" }, 400);
  const a = await loadAuth();
  const printResp = await meFetch(a, "/me/shipment/print", {
    method: "POST", body: JSON.stringify({ mode: "private", orders: [carrier_order_id] }),
  });
  const label_url = printResp?.url || null;
  if (label_url) {
    await admin.from("shipments").update({ label_url }).eq("carrier_order_id", carrier_order_id);
  }
  return json({ url: label_url });
}

async function handleTrack(req: Request) {
  const { carrier_order_id } = await req.json();
  if (!carrier_order_id) return json({ error: "missing_id" }, 400);
  const a = await loadAuth();
  const tr = await meFetch(a, "/me/shipment/tracking", {
    method: "POST", body: JSON.stringify({ orders: [carrier_order_id] }),
  });
  return json({ tracking: tr });
}

async function handleWebhook(req: Request) {
  // Público — Melhor Envio envia notificações de status.
  const body = await req.json().catch(() => ({}));
  console.log("me webhook payload", JSON.stringify(body).slice(0, 500));

  const event = body?.event as string | undefined;
  const tracking = body?.data?.tracking || body?.tracking;
  const meOrderId = body?.data?.id || body?.id;

  const patch: Record<string, unknown> = { raw_response: body };
  if (event?.includes("posted") || event?.includes("generated_tag")) { patch.status = "posted"; patch.posted_at = new Date().toISOString(); }
  else if (event?.includes("delivered")) { patch.status = "delivered"; patch.delivered_at = new Date().toISOString(); }
  else if (event?.includes("in_transit") || event?.includes("tracking")) patch.status = "in_transit";
  else if (event?.includes("cancel")) patch.status = "cancelled";

  const filter = meOrderId
    ? { col: "carrier_order_id", val: meOrderId }
    : tracking ? { col: "tracking_code", val: tracking } : null;
  if (!filter) return json({ ok: true, ignored: true });

  const { data: ship } = await admin.from("shipments").select("order_id").eq(filter.col, filter.val).maybeSingle();
  if (ship?.order_id) {
    await admin.from("shipments").update(patch).eq(filter.col, filter.val);
    const statusMap: Record<string, string> = {
      posted: "postado", in_transit: "em_transito", delivered: "entregue", cancelled: "cancelado",
    };
    if (patch.status && statusMap[patch.status as string]) {
      await admin.from("orders").update({ status: statusMap[patch.status as string] }).eq("id", ship.order_id);
    }
  }
  return json({ ok: true });
}

// ─── Router ─────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  const path = url.pathname.replace(/^.*\/melhor-envio/, "") || "/";

  try {
    // Public
    if (path === "/webhook" && req.method === "POST") return await handleWebhook(req);

    // Admin-only
    const authCheck = await requireAdmin(req);
    if (authCheck instanceof Response) return authCheck;

    if (path === "/auth/status") return await handleAuthStatus();
    if (path === "/auth/save-credentials" && req.method === "POST") return await handleSaveCredentials(req);
    if (path === "/auth/save-sender" && req.method === "POST") return await handleSaveSender(req);
    if (path === "/auth/authorize-url" && req.method === "POST") return await handleAuthorizeUrl();
    if (path === "/auth/exchange" && req.method === "POST") return await handleExchange(req);
    if (path === "/auth/disconnect" && req.method === "POST") return await handleDisconnect();
    if (path === "/calculate" && req.method === "POST") return await handleCalculate(req);
    if (path === "/generate" && req.method === "POST") return await handleGenerate(req);
    if (path === "/print" && req.method === "POST") return await handlePrint(req);
    if (path === "/track" && req.method === "POST") return await handleTrack(req);

    return json({ error: "not_found", path }, 404);
  } catch (e) {
    console.error("melhor-envio error", e);
    return json({ error: (e as Error).message || "internal_error" }, 500);
  }
});
