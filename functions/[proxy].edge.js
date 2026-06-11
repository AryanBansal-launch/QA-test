export default async function handler(request) {
    const url = new URL(request.url);
  
    // Keep URL hostname as click.bansalapp.digital
    // so :authority header = click.bansalapp.digital (equivalent to Node's headers.host)
    // cf.resolveOverride routes to AWS IP
    // (equivalent to Node's hostname: 'r.eu-north-1.awstrack.me' + servername for TLS SNI)
  
    const HOP_BY_HOP = new Set([
      'connection', 'keep-alive', 'transfer-encoding',
      'te', 'trailer', 'upgrade', 'proxy-authorization',
      'cf-connecting-ip', 'cf-ipcountry', 'cf-ray', 'cf-visitor',
      'x-launch-deploymentuid', 'x-launch-organization-uid',
      'x-request-origin', 'x-real-ip', 'x-forwarded-for',
      'visitor-ip-city', 'visitor-ip-country', 'visitor-ip-region'
    ]);
  
    const forwardHeaders = new Headers();
    for (const [key, val] of request.headers.entries()) {
      if (!HOP_BY_HOP.has(key.toLowerCase())) {
        forwardHeaders.set(key, val);
      }
    }
  
    console.log('------- OUTGOING REQUEST -------');
    console.log(`${request.method} ${url.toString()}`);
    forwardHeaders.forEach((val, key) => console.log(`  ${key}: ${val}`));
    console.log('--------------------------------');
  
    const res = await fetch(url.toString(), {
      method: request.method,
      headers: forwardHeaders,
      redirect: 'manual',
      cf: {
        resolveOverride: 'r.eu-north-1.awstrack.me'  // DNS + TLS SNI → AWS
                                                       // :authority stays click.bansalapp.digital
      }
    });
  
    console.log('AWS status:', res.status);
  
    return res;
  }