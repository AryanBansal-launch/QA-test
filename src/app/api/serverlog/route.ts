import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  console.log("[serverlog] GET request received");
  return NextResponse.json({ message: "ok" });
}

export async function POST(_request: NextRequest) {
  console.log("[serverlog] POST request received");
  return NextResponse.json({ message: "ok" });
}
