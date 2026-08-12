import type { NextRequest } from "next/server";

const encoder = new TextEncoder();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const noCacheStreamingHeaders = {
  "Content-Type": "text/plain; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const speed = searchParams.get("speed");
  const longRunning = searchParams.get("long-running");

  if (longRunning === "true") {
    return handleLongRunning();
  }

  return handleWordStream(speed);
}

// Streams a heartbeat chunk every 50ms for up to 20 minutes, useful for testing
// proxy/timeout/idle-connection behavior. Stops early if the client disconnects.
function handleLongRunning() {
  let aborted = false;

  const stream = new ReadableStream({
    async start(controller) {
      const totalDurationMs = 20 * 60 * 1000;
      const chunkIntervalMs = 50;
      const startedAt = Date.now();
      let chunkIndex = 0;

      while (!aborted) {
        const elapsedMs = Date.now() - startedAt;
        if (elapsedMs >= totalDurationMs) break;

        controller.enqueue(encoder.encode(`chunk=${chunkIndex} elapsed_ms=${elapsedMs}\n`));
        chunkIndex++;

        await sleep(chunkIntervalMs);
      }

      if (!aborted) {
        controller.enqueue(
          encoder.encode(`done total_chunks=${chunkIndex} elapsed_ms=${Date.now() - startedAt}\n`)
        );
        controller.close();
      }
    },
    cancel() {
      // Called when the client disconnects; the start() loop checks this on its next tick.
      aborted = true;
    },
  });

  return new Response(stream, { headers: noCacheStreamingHeaders });
}

// Streams sample text word-by-word (or in chunks) at a configurable speed.
async function handleWordStream(speed: string | null) {
  // Set speed delays in milliseconds based on cloud provider
  const cloudProvider = process.env.CLOUD_PROVIDER || "aws";

  // Platform-specific fast streaming thresholds
  const fastThresholds: Record<string, number> = {
    azure: 75, // Azure Functions minimum threshold
    gcp: 100, // GCP Cloud Functions minimum threshold
    aws: 50, // AWS Lambda works with faster streaming
  };

  const fastSpeed = fastThresholds[cloudProvider.toLowerCase()] ?? 50; // Default to AWS

  const speeds: Record<string, number> = {
    slow: 300,
    medium: 150,
    fast: fastSpeed,
    delay: 150,
  };

  // Sample text with dynamic fast speed description
  const text = `Welcome to the streaming API demo! This is a test of word-by-word streaming functionality.
You can control the speed using the speed parameter. The slow option adds a 300ms delay between each word.
The medium speed uses 150ms delays for a balanced streaming experience. The fast option streams at ${fastSpeed}ms intervals with 3-word chunks (optimized for ${cloudProvider.toUpperCase()} platform buffering).
This allows you to see how different streaming speeds and chunking strategies affect the user experience.
Thank you for testing the streaming API endpoint!`;

  // Check if valid speed parameter is provided
  const isValidSpeed = !!speed && Object.prototype.hasOwnProperty.call(speeds, speed);

  if (!isValidSpeed) {
    // Return buffered response when no valid speed parameter is given
    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        ...corsHeaders,
      },
    });
  }

  const delay = speeds[speed as string];

  if (speed === "delay") {
    await sleep(20000);
  }

  // Split text into words
  const words = text.split(" ");

  // Use larger chunks for fast mode to overcome platform buffering
  // Fast mode sends 3 words per chunk to cross cloud platform minimum buffering thresholds
  // Slow/medium modes send 1 word per chunk for granular streaming
  const wordsPerChunk = speed === "fast" ? 3 : 1;

  const stream = new ReadableStream({
    async start(controller) {
      // Stream words/chunks with specified delay
      for (let i = 0; i < words.length; i += wordsPerChunk) {
        const chunk = words.slice(i, i + wordsPerChunk).join(" ");
        controller.enqueue(encoder.encode(chunk));

        // Add space after chunk (except for the last chunk)
        const isLastChunk = i + wordsPerChunk >= words.length;
        if (!isLastChunk) {
          controller.enqueue(encoder.encode(" "));
          await sleep(delay);
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { ...noCacheStreamingHeaders, ...corsHeaders },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
