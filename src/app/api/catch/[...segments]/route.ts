import type { NextRequest } from "next/server";
import { apiLog } from "@/lib/api-log";

type Params = Promise<{ segments: string[] }>;

export async function GET(req: NextRequest, ctx: { params: Params }) {
  const { segments } = await ctx.params;
  const url = new URL(req.url);
  apiLog("catch/[...segments]", "dynamic catch-all hit", {
    segments,
    search: url.search,
  });

  return Response.json({
    kind: "catch-all",
    segments,
    query: Object.fromEntries(url.searchParams.entries()),
  });
}

export async function POST(req: NextRequest, ctx: { params: Params }) {
  const { segments } = await ctx.params;
  const text = await req.text().catch(() => "");
  apiLog("catch/[...segments]", "POST to catch-all", {
    segments,
    bodyLength: text.length,
  });

  return Response.json({ kind: "catch-all", segments, accepted: true });
}
