import { NextRequest, NextResponse } from "next/server";

async function handle(request: NextRequest) {
  const count = Number(request.nextUrl.searchParams.get("count") ?? 1);

  console.log("=== START ===");

  for (let i = 1; i <= count; i++) {
    console.log(
      JSON.stringify({
        sequence: i,
        timestamp: Date.now(),
        route: "/serverlog",
        requestId: request.headers.get("x-request-id") ?? "local",
        message: `Generated log ${i}`,
        level: "INFO",
      }),
    );
  }

  console.log("=== END ===");

  return NextResponse.json({ generated: count }, { status: 200 });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}