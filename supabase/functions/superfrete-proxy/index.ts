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
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('SuperFrete Proxy Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
