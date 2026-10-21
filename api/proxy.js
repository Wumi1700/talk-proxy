export const config = { runtime: 'edge' };

export default async function handler(req) {
  const supabaseUrl = 'https://nsoyywbuqpfhhrezdcly.supabase.co';
  const url = new URL(req.url);
  
  // 去掉我们的代理前缀
  let path = url.pathname.replace('/api/proxy', '');
  if (path === '') path = '/';
  
  const targetUrl = supabaseUrl + path + url.search;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const newHeaders = new Headers(req.headers);
  newHeaders.set('Origin', supabaseUrl);
  newHeaders.delete('host');

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: newHeaders,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined
    });

    const newResponse = new Response(response.body, response);
    Object.keys(corsHeaders).forEach(key => {
      newResponse.headers.set(key, corsHeaders[key]);
    });
    
    return newResponse;
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
}
