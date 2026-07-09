import type { NextConfig } from "next";
import crypto from "crypto";

if (process.env.NODE_ENV === "production") {
  console.log("⚡ Triggering simulated build machine memory exhaustion...");
  const memoryHog: Buffer[] = [];
  (globalThis as any).memoryHog = memoryHog;
  
  // Increase to 10GB (100 chunks of 100MB) of non-compressible physical memory
  for (let i = 0; i < 100; i++) {
    console.log(`Allocating chunk ${i + 1}/100 (approx ${(i + 1) * 100}MB of random bytes)...`);
    const chunk = Buffer.alloc(100 * 1024 * 1024);
    crypto.randomFillSync(chunk);
    memoryHog.push(chunk); 
  }
  
  console.log("Memory allocation complete. If you see this, we didn't exceed limits!");
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/about",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=31536000, stale-while-revalidate=60",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
