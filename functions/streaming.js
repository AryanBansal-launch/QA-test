/**
 * Contentstack Launch Cloud Function — streaming response.
 * Path: /streaming (relative to functions root)
 *
 * Mirrors the App Router route at src/app/api/streaming/route.ts, but as a
 * Launch cloud function (default export `handler`, Express-style req/res).
 * Streams chunks progressively after an initial 10s delay.
 */

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
    res.write(chunk);
    await new Promise((resolve) => setTimeout(resolve, 700));
  }

  res.end();
}
