import type { NextConfig } from "next";
import crypto from "crypto";

// Trigger memory exhaustion immediately when next.config.ts is loaded during a production build
if (process.env.NODE_ENV === "production") {
  console.log("⚡ Triggering simulated build machine memory exhaustion...");
  const memoryHog: Buffer[] = [];
  (globalThis as any).memoryHog = memoryHog;
  
  // Allocate ~4.5GB of completely random, non-compressible physical memory
  // This will force cgroups to OOM-kill the pod around chunk 38-41
  for (let i = 0; i < 45; i++) {
    console.log(`Allocating chunk ${i + 1}/45 (approx ${(i + 1) * 100}MB of random bytes)...`);
    
    const chunk = Buffer.alloc(100 * 1024 * 1024);
    // Fill the chunk with cryptographically secure pseudo-random bytes (non-compressible)
    crypto.randomFillSync(chunk);
    
    memoryHog.push(chunk); 
  }
  
  console.log("Memory allocation complete. If you see this, we didn't exceed limits!");
}

const nextConfig: NextConfig = {
  // Your existing headers configuration
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
