const delay = parseInt(process.env.REQUEST_TIMEOUT ?? "10000", 10);

export default async function handler(req, res) {
  console.log(
    "[Launch CF]",
    JSON.stringify({
      ts: new Date().toISOString(),
      fn: "streaming",
      method: req.method,
      delay,
    })
  );

  // Mirror the App Router route (src/app/api/streaming/route.ts): same headers,
  // same TextEncoder byte chunks, same initial delay, same 700ms cadence.
  const encoder = new TextEncoder();

  res.status(200);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");

  await new Promise((resolve) => setTimeout(resolve, delay));

  const chunks = [
    "Starting process...\n",
    "Step 1: Connecting to database...\n",
    "Step 2: Fetching records...\n",
    "Step 3: Processing data...\n",
    "Step 4: Generating report...\n",
    "Done!\n",
  ];

  for (const chunk of chunks) {
    // ReadableStream's controller.enqueue() has no res equivalent;
    // write the encoded bytes instead.
    res.write(encoder.encode(chunk));
    // Nudge the platform to flush this chunk now rather than buffer to the end.
    if (typeof res.flush === "function") res.flush();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }

  res.end();
}
