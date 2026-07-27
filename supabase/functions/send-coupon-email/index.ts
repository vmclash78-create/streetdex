import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email provider not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email, name } = await req.json();
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Read active coupon from store settings using service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { data: settings } = await supabase
      .from('store_settings')
      .select('coupon_code, pix_discount, store_name')
      .maybeSingle();

    const couponCode = settings?.coupon_code?.trim();
    const storeName = settings?.store_name || 'Street Dex';
    const discount = settings?.pix_discount || '5';

    if (!couponCode) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no_active_coupon' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const greeting = name ? `Olá, ${String(name).split(' ')[0]}!` : 'Olá!';
    const html = `
<!doctype html><html><body style="margin:0;padding:0;background:#141414;font-family:Arial,sans-serif;color:#fff">
  <table role="presentation" width="100%" style="background:#141414;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="560" style="max-width:560px;background:#1c1c1c;border:1px solid #340b79;border-radius:12px;overflow:hidden">
        <tr><td style="padding:32px;text-align:center;background:linear-gradient(135deg,#340b79,#141414)">
          <h1 style="margin:0;font-size:28px;letter-spacing:2px;text-transform:uppercase;color:#fff">${storeName}</h1>
        </td></tr>
        <tr><td style="padding:32px;color:#fff">
          <p style="font-size:16px;margin:0 0 16px">${greeting}</p>
          <p style="font-size:16px;line-height:1.5;margin:0 0 24px">Aqui está seu cupom exclusivo para usar na sua próxima compra:</p>
          <div style="text-align:center;padding:24px;background:#340b79;border-radius:8px;margin:0 0 24px">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#bda7ff">Seu cupom</p>
            <p style="margin:0;font-size:32px;font-weight:bold;letter-spacing:4px;color:#fff">${couponCode}</p>
            <p style="margin:12px 0 0;font-size:14px;color:#e0d5ff">${discount}% OFF no PIX/Dinheiro</p>
          </div>
          <p style="font-size:14px;line-height:1.5;color:#aaa;margin:0">Insira o código no checkout para aplicar o desconto. Válido enquanto durar a promoção.</p>
        </td></tr>
        <tr><td style="padding:16px;text-align:center;background:#0f0f0f;color:#666;font-size:12px">
          © ${new Date().getFullYear()} ${storeName}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    const resp = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: `${storeName} <onboarding@resend.dev>`,
        to: [email],
        subject: `🎁 Seu cupom ${couponCode} - ${discount}% OFF`,
        html,
      }),
    });

    const body = await resp.text();
    if (!resp.ok) {
      console.error(`Resend failed [${resp.status}]:`, body);
      return new Response(JSON.stringify({ error: 'Send failed', status: resp.status, details: body }), {
        status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('send-coupon-email error:', e);
    return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
