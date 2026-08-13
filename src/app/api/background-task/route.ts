import { NextResponse } from "next/server";
import { after } from "next/server";
import { apiLog } from "@/lib/api-log";

// Simulated background work duration (5 minutes).
const BACKGROUND_DURATION_MS = 5 * 60 * 1000;

export async function GET() {
  const requestId = crypto.randomUUID();

  apiLog("background-task", "request received, responding immediately", {
    requestId,
  });

  after(async () => {
    const start = Date.now();
    apiLog("background-task", "background work started", { requestId });

    await new Promise((resolve) => setTimeout(resolve, BACKGROUND_DURATION_MS));

    apiLog("background-task", "background work finished", {
      requestId,
      durationMs: Date.now() - start,
    });
  });

  return NextResponse.json(
    {
      message: "accepted, processing in background",
      requestId,
      expectedBackgroundDurationMs: BACKGROUND_DURATION_MS,
    },
    { status: 202 }
  );
}
