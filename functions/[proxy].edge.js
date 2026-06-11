export default function handler(request) {
  const url = new URL(request.url);
  const originalHost = url.hostname; // click.bansalapp.digital

  // Route to AWS endpoint
  url.hostname = 'r.eu-north-1.awstrack.me';

  const headers = new Headers(request.headers);
  // CRITICAL: Preserve original host so HMAC validates correctly
  headers.set('Host', originalHost);

  return fetch(url.toString(), {
    method: request.method,
    headers: headers,
    redirect: 'manual',
  });
}