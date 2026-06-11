export default async function handler(request) {
  const url = new URL(request.url);
  const originalHost = url.hostname;
  url.hostname = 'r.eu-north-1.awstrack.me';

  const headers = new Headers(request.headers);
  headers.set('Host', originalHost);

  // Log every outgoing header
  const headersObj = {};
  headers.forEach((value, key) => { headersObj[key] = value; });
  console.log('Outgoing URL:', url.toString());
  console.log('Outgoing headers:', JSON.stringify(headersObj));
  console.log('Host header value:', headers.get('Host'));

  const res = await fetch(url.toString(), {
    method: request.method,
    headers,
    redirect: 'manual',
  });

  console.log('Response status from AWS:', res.status);
  return res;
}