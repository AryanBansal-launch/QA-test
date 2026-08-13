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

  // `after()` schedules a callback that runs once the response has been
  // sent to the client. The platform is expected to keep the function
  // instance alive (via waitUntil) until this resolves — but on platforms
  // that don't honor that (or that cap total execution, sync + background,
  // at some ceiling), this will get killed before it finishes. That's the
  // thing to actually verify by hitting this route and checking whether
  // "background work finished" ever shows up in the logs.
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
