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
  console.log("my env:", process.env.REQUEST_TIMEOUT);

  // Mirror the App Router route (src/app/api/streaming/route.ts): same headers,
  // same initial delay, same 700ms cadence.
  res.status(200);
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
    res.write(chunk);
    // Nudge the platform to flush this chunk now rather than buffer to the end.
    if (typeof res.flush === "function") res.flush();
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  res.end();
}
