import https from "node:https";
import type { NextRequest } from "next/server";
import { apiLog } from "@/lib/api-log";

// Must run on Node: the edge runtime can't set TLS SNI independently of the Host header.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TARGET_HOST = "r.eu-north-1.awstrack.me"; // DNS + TLS SNI target
const BRAND_HOST = "click.bansalapp.digital"; // Host header AWS maps the link by

// SES awstrack prefixes: L0/CL0 (click), O0/CO0 (open pixel).
function trackingType(pathname: string): "click" | "open" | null {
  if (/^\/C?L0\//.test(pathname)) return "click";
  if (/^\/C?O0\//.test(pathname)) return "open";
  return null;
}

function requestHost(req: NextRequest): string {
  return (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "")
    .split(",")[0]
    .split(":")[0]
    .trim()
    .toLowerCase();
}

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
  const host = requestHost(req);
  const type = trackingType(url.pathname);

  // Not a branded tracking request → behave like any other unmatched route.
  if (host !== BRAND_HOST || type === null) {
    apiLog("proxy", "gate: skipped (not a branded tracking request)", {
      method: req.method,
      host,
      path: url.pathname,
      reason: host !== BRAND_HOST ? "wrong-host" : "non-tracking-path",
    });
    return new Response("Not Found", { status: 404 });
  }

  apiLog("proxy", "gate: accepted tracking request", {
    method: req.method,
    type, // "click" | "open"
    host,
    path: url.pathname,
  });

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

  const startedAt = Date.now();

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
          const status = proxyRes.statusCode ?? 502;
          const destination = proxyRes.headers["location"] ?? null;
          const elapsedMs = Date.now() - startedAt;

          // click → 3xx + Location; open pixel → 200. Anything else is suspect.
          const verified =
            type === "click"
              ? status >= 300 && status < 400 && destination !== null
              : status === 200;

          apiLog(
            "proxy",
            verified
              ? `tracking OK — ${type} resolved`
              : `tracking FAILED — unexpected ${type} response`,
            {
              type,
              upstream: TARGET_HOST,
              brandHost: BRAND_HOST,
              status,
              destination, // where the click forwards the user
              elapsedMs,
              bytes: respBody.length,
            }
          );

          const headers = new Headers();
          for (const [key, val] of Object.entries(proxyRes.headers)) {
            if (val == null || HOP_BY_HOP.has(key.toLowerCase())) continue;
            headers.set(key, Array.isArray(val) ? val.join(", ") : String(val));
          }

          // redirect: 'manual' equivalent — pass AWS's 30x + Location through untouched.
          resolve(
            new Response(respBody, {
              status,
              headers,
            })
          );
        });
      }
    );

    proxyReq.on("error", (err) => {
      apiLog("proxy", "tracking FAILED — upstream error", {
        type,
        upstream: TARGET_HOST,
        error: err.message,
        elapsedMs: Date.now() - startedAt,
      });
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
