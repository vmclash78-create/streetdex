import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token, environment, endpoint, body } = await req.json();

    if (!token || !endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: token and endpoint' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const baseUrl = environment === 'production' 
      ? 'https://api.superfrete.com' 
      : 'https://sandbox.superfrete.com';
    
    const url = `${baseUrl}${endpoint}`;
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    console.log(`Proxying request to SuperFrete: ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'StreetDex Proxy'
      },
      body: JSON.stringify(body)
    });

    const raw = await response.text();
    let data: any;
    try { data = JSON.parse(raw); } catch { data = { message: raw }; }

    // Always return 200 so the client can read the payload without the
    // SDK throwing a non-2xx FunctionsHttpError (which blanks the screen).
    return new Response(JSON.stringify(
      response.ok ? data : { error: data?.message || data?.error || 'Erro na SuperFrete', superfrete_status: response.status }
    ), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('SuperFrete Proxy Error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
