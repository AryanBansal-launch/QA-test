const CHUNK_SIZE = 256 * 1024 * 1024; // 256MB per tick
const chunks = [];
let total = 0;

console.log('[oom-simulator] starting memory ramp to trigger OOM kill (target: 4GB limit)...');

const interval = setInterval(() => {
  chunks.push(Buffer.alloc(CHUNK_SIZE, 1));
  total += CHUNK_SIZE;
  console.log(`[oom-simulator] allocated ~${Math.round(total / 1024 / 1024)}MB`);
}, 200);

// Safety net for local runs with no memory limit — don't hang forever
setTimeout(() => {
  clearInterval(interval);
  console.log('[oom-simulator] safety timeout reached without OOM — exiting');
  process.exit(1);
}, 5 * 60 * 1000);
