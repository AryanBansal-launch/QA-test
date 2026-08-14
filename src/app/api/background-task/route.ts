import { NextResponse } from "next/server";
import { after } from "next/server";
import { apiLog } from "@/lib/api-log";

const BACKGROUND_DURATION_MS = 10 * 60 * 1000;
const DEBUG_LOG_INTERVAL_MS = 30 * 1000;

export async function GET() {
  const requestId = crypto.randomUUID();

  apiLog("background-task", "request received, responding immediately", {
    requestId,
  });

  after(async () => {
    const start = Date.now();
    apiLog("background-task", "background work started", { requestId });

    const debugInterval = setInterval(() => {
      apiLog("background-task", "debug: background work still running", {
        requestId,
        elapsedMs: Date.now() - start,
      });
    }, DEBUG_LOG_INTERVAL_MS);

    await new Promise((resolve) => setTimeout(resolve, BACKGROUND_DURATION_MS));

    clearInterval(debugInterval);

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
