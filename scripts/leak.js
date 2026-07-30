// scripts/leak.js
// Simulates unbounded memory growth during the build step until the process OOMs.
const memoryHog = [];

let iteration = 0;
while (true) {
  const start = Date.now();

  memoryHog.push(new Array(1000000).fill("💥"));
  const sum = memoryHog.flat().reduce((acc, val) => acc + val.charCodeAt(0), 0);

  const end = Date.now();
  iteration++;

  console.log(
    `[leak] iteration=${iteration} items=${memoryHog.length} memoryMB=${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} durationMs=${end - start} sum=${sum}`
  );
}
