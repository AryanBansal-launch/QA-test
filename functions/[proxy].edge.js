export default async function handler(request) {
  const url = new URL(request.url);
  // Do NOT change url.hostname — keep click.bansalapp.digital
  // :authority will be click.bansalapp.digital ✅

  return fetch(url.toString(), {
    method: request.method,
    headers: request.headers,
    redirect: 'manual',
    cf: {
      resolveOverride: 'r.eu-north-1.awstrack.me'  // route to AWS IP without changing :authority
    }
  });
}