interface Env { ALLOWED_ORIGINS: string; UPSTREAM_API_ORIGIN: string; GATEWAY_SHARED_SECRET: string }
const moolreCallbackIps = new Set(['192.241.135.134', '2604:a880:400:d1:0:3:4cf0:c001', '174.138.44.22', '2604:a880:400:d0::1a77:400']);
const corsHeaders = (origin: string, env: Env): Record<string, string> => {
  const allowed = new Set(env.ALLOWED_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean));
  return allowed.has(origin) ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-KOBO-Refresh', 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS', Vary: 'Origin' } : {};
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: Object.keys(cors).length ? 204 : 403, headers: cors });
    const sourceIp = request.headers.get('CF-Connecting-IP') || '';
    const inputUrl = new URL(request.url);
    if (inputUrl.pathname === '/api/health') return Response.json({ status: 'ok', edge: 'cloudflare' }, { headers: cors });
    if (inputUrl.pathname === '/api/v1/payments/webhooks/moolre' && !moolreCallbackIps.has(sourceIp)) return Response.json({ error: 'Callback source is not allowed' }, { status: 403 });
    const upstreamPath = inputUrl.pathname.replace(/^\/api\/?/, '/');
    const upstreamUrl = `${env.UPSTREAM_API_ORIGIN.replace(/\/$/, '')}${upstreamPath}${inputUrl.search}`;
    const headers = new Headers(request.headers);
    headers.delete('host'); headers.delete('cf-connecting-ip');
    headers.set('X-KOBO-Gateway', env.GATEWAY_SHARED_SECRET); headers.set('X-KOBO-Client-IP', sourceIp);
    const upstream = await fetch(upstreamUrl, { method: request.method, headers, body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body, redirect: 'manual' });
    const responseHeaders = new Headers(upstream.headers);
    Object.entries(cors).forEach(([key, value]) => responseHeaders.set(key, value));
    responseHeaders.set('X-Content-Type-Options', 'nosniff'); responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  },
};
