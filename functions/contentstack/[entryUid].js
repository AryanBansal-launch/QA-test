/**
 * Contentstack Launch Cloud Function — dynamic route.
 * Path: /contentstack/:entryUid (relative to functions root)
 *
 * Matches Launch conventions: default export `handler`, `req.params` / `req.query` / `req.body`.
 * Note: When this repo is deployed as a full Next.js server app on Launch, framework API routes
 * are preferred and bundled `/functions` may be disabled — keep this for Launch-only/static setups
 * or local `launch:functions` runs per Launch docs.
 */

export default function handler(req, res) {
  const { entryUid } = req.params || {};

  console.log(
    "[Launch CF]",
    JSON.stringify({
      ts: new Date().toISOString(),
      fn: "contentstack/[entryUid]",
      method: req.method,
      params: req.params || {},
      query: req.query || {},
      cookiesKeys: req.cookies ? Object.keys(req.cookies) : [],
    })
  );

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  let bodySnippet = null;
  try {
    if (req.body != null && typeof req.body === "object") {
      bodySnippet = req.body;
    } else if (typeof req.body === "string") {
      bodySnippet = req.body.slice(0, 500);
    }
  } catch (e) {
    console.log(
      "[Launch CF]",
      JSON.stringify({
        ts: new Date().toISOString(),
        fn: "contentstack/[entryUid]",
        message: "req.body access error",
        error: String(e),
      })
    );
    res.status(400).json({ error: "Invalid JSON in request body" });
    return;
  }

  res.status(200).json({
    source: "contentstack-launch-cloud-function",
    entryUid,
    method: req.method,
    query: req.query || {},
    body: bodySnippet,
  });
}
