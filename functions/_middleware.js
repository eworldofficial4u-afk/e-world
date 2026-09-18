import { json, requireSameOrigin } from './_lib/auth.js';
import { boundedBody, rateLimit } from './_lib/security.js';
const STAFF_PATHS = new Set(["/staff-panel", "/staff-panel.html", "/admin.html"]);

export async function onRequest(context) {
  const pathname = new URL(context.request.url).pathname;
  let response;
  try {
    let request = context.request;
    if (pathname.startsWith('/api/') && !['GET','HEAD','OPTIONS'].includes(request.method)) {
      if (!['POST','PATCH','DELETE'].includes(request.method)) return json({ error: 'Method not allowed' }, 405);
      if (pathname !== '/api/bot/stats' && !requireSameOrigin(request, context.env)) return json({ error: 'Origin not allowed' }, 403);
      const max = pathname === '/api/auth/password-login' || pathname === '/api/bot/stats' ? 4096 : 20000;
      const body = await boundedBody(request, max);
      if (body) {
        if ((request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase() !== 'application/json') return json({ error: 'JSON required' }, 415);
        let parsed;
        try { parsed = JSON.parse(body); } catch { return json({ error: 'Invalid JSON' }, 400); }
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return json({ error: 'JSON object required' }, 400);
      }
      const policy = {
        '/api/auth/password-login': [5,900],
        '/api/contact': [5,900],
        '/api/tournament/registrations': [5,3600]
      }[pathname];
      if (policy) {
        const limit = await rateLimit(request, context.env, pathname, ...policy);
        if (!limit.allowed) return json({ error: 'Too many requests. Please try again later.' }, 429, { 'retry-after': String(limit.retryAfter) });
        if (context.waitUntil) context.waitUntil(context.env.DB.prepare('DELETE FROM security_rate_limits WHERE expires_at < ?').bind(Math.floor(Date.now()/1000)-86400).run());
      }
      request = new Request(request, { body: body || null });
    }
    response = await context.next(request);
  } catch (error) {
    // Do not expose database errors, stack traces or infrastructure details to visitors.
    return json({ error: error.status === 413 ? 'Request too large' : 'Service temporarily unavailable' }, error.status === 413 ? 413 : 503);
  }

  if (pathname.startsWith('/api/')) {
    const apiResponse = new Response(response.body, response);
    apiResponse.headers.set('X-Content-Type-Options', 'nosniff');
    apiResponse.headers.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    apiResponse.headers.set('X-Frame-Options', 'DENY');
    if (pathname.startsWith('/api/admin/') || pathname.startsWith('/api/auth/')) apiResponse.headers.set('Cache-Control', 'private, no-store');
    return apiResponse;
  }

  if (!STAFF_PATHS.has(pathname)) {
    return response;
  }

  const secured = new Response(response.body, response);
  secured.headers.set("Cache-Control", "no-store");
  secured.headers.set("Content-Security-Policy", staffContentSecurityPolicy(pathname));
  secured.headers.set("X-Frame-Options", "DENY");
  secured.headers.set("X-Content-Type-Options", "nosniff");
  secured.headers.set("Referrer-Policy", "no-referrer");
  secured.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );
  secured.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

  return secured;
}

function staffContentSecurityPolicy(pathname) {
  if (pathname === "/admin.html") {
    return "default-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'";
  }

  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}
