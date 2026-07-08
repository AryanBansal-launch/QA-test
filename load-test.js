const URL = "https://qa-test-dnd.devcontentstackapps.com/api/serverlog";
const TOTAL = 100;
const CONCURRENCY = 10;

async function sendRequest(id) {
  const start = Date.now();
  try {
    const res = await fetch(URL);
    return { id, status: res.status, ms: Date.now() - start, ok: true };
  } catch (err) {
    return { id, status: null, ms: Date.now() - start, ok: false, error: err.message };
  }
}

async function runBatch(ids) {
  return Promise.all(ids.map(sendRequest));
}

(async () => {
  console.log(`Sending ${TOTAL} requests to ${URL} (concurrency: ${CONCURRENCY})\n`);

  const results = [];
  for (let i = 0; i < TOTAL; i += CONCURRENCY) {
    const batch = Array.from({ length: Math.min(CONCURRENCY, TOTAL - i) }, (_, j) => i + j + 1);
    const batchResults = await runBatch(batch);
    batchResults.forEach(r => {
      const tag = r.ok ? `${r.status}` : `ERR`;
      console.log(`  [${String(r.id).padStart(3)}] ${tag}  ${r.ms}ms${r.error ? "  " + r.error : ""}`);
    });
    results.push(...batchResults);
  }

  const succeeded = results.filter(r => r.ok && r.status >= 200 && r.status < 300);
  const failed = results.filter(r => !r.ok || r.status >= 400);
  const times = results.filter(r => r.ok).map(r => r.ms).sort((a, b) => a - b);
  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const p95 = times.length ? times[Math.floor(times.length * 0.95)] : 0;

  console.log(`
--- Summary ---
Total:     ${TOTAL}
Succeeded: ${succeeded.length}
Failed:    ${failed.length}
Avg:       ${avg}ms
p95:       ${p95}ms
Min:       ${times[0] ?? "-"}ms
Max:       ${times[times.length - 1] ?? "-"}ms
`);
})();
