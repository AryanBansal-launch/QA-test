console.log('Starting memory exhaustion test...');
const chunks = [];
let totalMB = 0;

setInterval(() => {
  chunks.push(Buffer.alloc(100 * 1024 * 1024, 1)); // 100MB, filled so pages are actually committed
  totalMB += 100;
  console.log(`Allocated ~${totalMB}MB`);
}, 100);
