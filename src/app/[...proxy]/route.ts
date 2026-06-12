import https from "node:https";
import type { NextRequest } from "next/server";

// Must run on Node — the edge runtime can't set TLS SNI (servername)
// independently of the Host header, which is exactly what this proxy needs.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Where the bytes actually go (DNS + TLS SNI).
const TARGET_HOST = "r.eu-north-1.awstrack.me";
// What AWS sees in the Host header so it maps the branded tracking link.
const BRAND_HOST = "click.bansalapp.digital";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "proxy-authorization",
]);

async function proxy(req: NextRequest): Promise<Response> {
  const url = new URL(req.url);

  const forwardHeaders: Record<string, string> = {};
  for (const [key, val] of req.headers.entries()) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      forwardHeaders[key] = val;
    }
  }
  forwardHeaders["host"] = BRAND_HOST;

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : Buffer.from(await req.arrayBuffer());

  console.log("------- OUTGOING REQUEST -------");
  console.log(`${req.method} https://${TARGET_HOST}${url.pathname}${url.search}`);
  for (const [key, val] of Object.entries(forwardHeaders)) {
    console.log(`  ${key}: ${val}`);
  }
  console.log("--------------------------------");

  return new Promise<Response>((resolve) => {
    const proxyReq = https.request(
      {
        hostname: TARGET_HOST,
        port: 443,
        path: url.pathname + url.search,
        method: req.method,
        servername: TARGET_HOST, // TLS SNI → AWS (the key the edge runtime can't set)
        headers: forwardHeaders,
      },
      (proxyRes) => {
        const chunks: Buffer[] = [];
        proxyRes.on("data", (c) => chunks.push(c));
        proxyRes.on("end", () => {
          const respBody = Buffer.concat(chunks);
          console.log("AWS status:", proxyRes.statusCode);

          const headers = new Headers();
          for (const [key, val] of Object.entries(proxyRes.headers)) {
            if (val == null || HOP_BY_HOP.has(key.toLowerCase())) continue;
            headers.set(key, Array.isArray(val) ? val.join(", ") : String(val));
          }

          // redirect: 'manual' equivalent — pass AWS's 30x + Location through untouched.
          resolve(
            new Response(respBody, {
              status: proxyRes.statusCode ?? 502,
              headers,
            })
          );
        });
      }
    );

    proxyReq.on("error", (err) => {
      console.error("Proxy error:", err.message);
      resolve(new Response("Bad Gateway", { status: 502 }));
    });

    if (body) proxyReq.write(body);
    proxyReq.end();
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as HEAD,
  proxy as OPTIONS,
};
