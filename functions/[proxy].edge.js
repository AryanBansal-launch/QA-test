export default async function handler(request) {
  const url = new URL(request.url);
  // Do NOT change url.hostname — keep click.bansalapp.digital
  // :authority will be click.bansalapp.digital ✅

  // ---- Phase 1: incoming request ----
  console.log('[proxy] ▶ incoming request', {
    method: request.method,
    url: request.url,
    authority: url.hostname,
    path: url.pathname,
    search: url.search,
    headers: Object.fromEntries(request.headers),
  });

  // ---- Phase 2: outgoing fetch ----
  const target = url.toString();
  console.log('[proxy] ▶ forwarding', {
    target,
    method: request.method,
    resolveOverride: 'r.eu-north-1.awstrack.me',
    redirect: 'manual',
  });

  try {
    const response = await fetch(target, {
      method: request.method,
      headers: request.headers,
      redirect: 'manual',
      cf: {
        resolveOverride: 'r.eu-north-1.awstrack.me'  // route to AWS IP without changing :authority
      }
    });

    // ---- Phase 3: upstream response ----
    console.log('[proxy] ◀ response', {
      status: response.status,
      statusText: response.statusText,
      location: response.headers.get('location'),
      headers: Object.fromEntries(response.headers),
    });

    return response;
  } catch (err) {
    // ---- Phase 4: failure ----
    console.error('[proxy] ✖ fetch failed', {
      target,
      message: err?.message,
      stack: err?.stack,
    });
    throw err;
  }
}
