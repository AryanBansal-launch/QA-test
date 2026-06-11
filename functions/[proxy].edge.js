export default async function handler(request) {
    const u = new URL(request.url);
    // connect to awstrack, but keep Host = click.bansalapp.digital
    return fetch("https://click.t.bansalapp.digital" + u.pathname + u.search, {
      method: request.method,
      headers: request.headers,
      redirect: "manual",
      cf: { resolveOverride: "r.eu-north-1.awstrack.me" }
    });
  }