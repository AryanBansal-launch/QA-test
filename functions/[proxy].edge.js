export default function handler(request) {
  const url = new URL(request.url);

  // Handle click tracking routes
  if (url.pathname.startsWith('/CL0/') || url.pathname.startsWith('/CI0/')) {
    const originalHost = url.hostname;
    url.hostname = 'r.eu-north-1.awstrack.me';

    const headers = new Headers(request.headers);
    headers.set('Host', originalHost);

    return fetch(url.toString(), {
      method: request.method,
      headers,
      redirect: 'manual',
    });
  }

  // Fall through to existing inject-robots-tag logic
  // ...existing code...
}