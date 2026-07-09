import type { NextConfig } from "next";

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

  // Added logic to trigger simulated memory exhaustion during production build
  webpack: (config, { dev }) => {
    if (!dev) {
      console.log("⚡ Triggering simulated build machine memory exhaustion...");
      const memoryHog: Buffer[] = [];
      
      // Allocate ~4.5GB of memory in 100MB chunks to exceed the 4GB Pod limit
      for (let i = 0; i < 45; i++) {
        console.log(`Allocating chunk ${i + 1}/45 (approx ${(i + 1) * 100}MB)...`);
        
        // Allocate raw memory buffer and keep the reference to prevent garbage collection
        memoryHog.push(Buffer.alloc(100 * 1024 * 1024)); 
      }
      
      console.log("Memory allocation complete. If you see this, we didn't exceed limits!");
    }
    return config;
  },
};

export default nextConfig;
