import https from "node:https";
import type { NextRequest } from "next/server";

// Node runtime required — edge runtime can't set TLS SNI separately from Host header
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TARGET_HOST = "r.eu-north-1.awstrack.me"; // actual AWS server (TLS + TCP)
const BRAND_HOST = "click.s.bansalapp.digital";    // our domain (sent as Host header)

// These headers must not be forwarded — they are only valid for a single hop
const HOP_BY_HOP = new Set([
  "connection", "keep-alive", "transfer-encoding",
  "te", "trailer", "upgrade", "proxy-authorization",
]);

// SES uses L0/CL0 for click tracking, O0/CO0 for open pixel tracking
function trackingType(pathname: string): "click" | "open" | null {
  if (/^\/C?L0\//.test(pathname)) return "click";
  if (/^\/C?O0\//.test(pathname)) return "open";
  return null;
}

async function proxy(req: NextRequest): Promise<Response> {
  const url = new URL(req.url);
  const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "")
    .split(",")[0].split(":")[0].trim().toLowerCase();
  const type = trackingType(url.pathname);

  // Only handle requests from our branded domain with a valid SES tracking path
  if (host !== BRAND_HOST || type === null) {
    return new Response("Not Found", { status: 404 });
  }

  // Strip hop-by-hop headers, then set Host to our branded domain
  const forwardHeaders: Record<string, string> = {};
  for (const [key, val] of req.headers.entries()) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) forwardHeaders[key] = val;
  }
  forwardHeaders["host"] = BRAND_HOST;

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : Buffer.from(await req.arrayBuffer());

  return new Promise<Response>((resolve) => {
    const proxyReq = https.request(
      {
        hostname: TARGET_HOST,  // connect to AWS
        port: 443,
        path: url.pathname + url.search,
        method: req.method,
        servername: TARGET_HOST, // TLS SNI → AWS hostname (different from Host header intentionally)
        headers: forwardHeaders,
      },
      (proxyRes) => {
        const chunks: Buffer[] = [];
        proxyRes.on("data", (c) => chunks.push(c));
        proxyRes.on("end", () => {
          // Pass AWS's response back unchanged (redirect for clicks, pixel for opens)
          const headers = new Headers();
          for (const [key, val] of Object.entries(proxyRes.headers)) {
            if (val == null || HOP_BY_HOP.has(key.toLowerCase())) continue;
            headers.set(key, Array.isArray(val) ? val.join(", ") : String(val));
          }
          // Prevent browsers and CDNs from caching tracking responses
          headers.set("cache-control", "no-store, no-cache");
          resolve(new Response(Buffer.concat(chunks), {
            status: proxyRes.statusCode ?? 502,
            headers,
          }));
        });
      }
    );

    proxyReq.on("error", () => resolve(new Response("Bad Gateway", { status: 502 })));
    if (body) proxyReq.write(body);
    proxyReq.end();
  });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE, proxy as HEAD, proxy as OPTIONS };
