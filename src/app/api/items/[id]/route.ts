import type { NextRequest } from "next/server";
import { apiLog } from "@/lib/api-log";

type Params = Promise<{ id: string }>;

export async function GET(_req: NextRequest, ctx: { params: Params }) {
  const { id } = await ctx.params;
  apiLog("items/[id]", "GET item", { id });

  return Response.json({ resource: "item", id, method: "GET" });
}

export async function PATCH(req: NextRequest, ctx: { params: Params }) {
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  apiLog("items/[id]", "PATCH item", { id, bodyPreview: typeof body });

  return Response.json({ resource: "item", id, method: "PATCH", received: body });
}
