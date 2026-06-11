export default async function handler(request) {
  const url = new URL(request.url);
  const originalHost = url.hostname; // click.t.bansalapp.digital

  // ---- Incoming request ----
  console.log('[proxy] ▶ incoming', {
    method: request.method,
    url: request.url,
    originalHost,
    path: url.pathname,
    search: url.search,
  });
  console.log('[proxy] ▶ incoming headers', Object.fromEntries(request.headers));

  // Route to AWS endpoint
  url.hostname = 'r.eu-north-1.awstrack.me';

  const headers = new Headers(request.headers);
  // CRITICAL: Preserve original host so HMAC validates correctly
  // headers.set('Host', originalHost);

  const target = url.toString();
  console.log('[proxy] ▶ forwarding to', target);
  console.log('[proxy] ▶ outgoing headers', Object.fromEntries(headers));

  try {
    const response = await fetch(target, {
      method: request.method,
      headers: headers,
      redirect: 'manual',
    });

    // ---- Upstream response ----
    console.log('[proxy] ◀ response', {
      status: response.status,
      statusText: response.statusText,
      location: response.headers.get('location'),
    });
    console.log('[proxy] ◀ response headers', Object.fromEntries(response.headers));

    return response;
  } catch (err) {
    console.error('[proxy] ✖ fetch failed', { target, message: err?.message, stack: err?.stack });
    throw err;
  }
}
