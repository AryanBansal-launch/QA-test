import type { NextConfig } from "next";

// Trigger memory exhaustion immediately when next.config.ts is loaded during a production build
if (process.env.NODE_ENV === "production") {
  console.log("⚡ Triggering simulated build machine memory exhaustion...");
  const memoryHog: Buffer[] = [];
  
  // Attach it to the global object so JavaScript never Garbage Collects it
  (globalThis as any).memoryHog = memoryHog;
  
  // Allocate ~8GB of memory in 100MB chunks to guarantee exceeding the 4GB Pod limit
  for (let i = 0; i < 80; i++) {
    console.log(`Allocating chunk ${i + 1}/80 (approx ${(i + 1) * 100}MB)...`);
    
    // Allocate raw memory buffer
    memoryHog.push(Buffer.alloc(100 * 1024 * 1024)); 
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
