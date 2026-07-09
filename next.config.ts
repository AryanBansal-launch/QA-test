import type { NextConfig } from "next";

if (process.env.NODE_ENV === "production") {
  console.log("⚡ Triggering simulated build machine memory exhaustion...");
  const memoryHog: Buffer[] = [];
  (globalThis as any).memoryHog = memoryHog;

  for (let i = 0; i < 80; i++) {
    console.log(`Allocating chunk ${i + 1}/80 (approx ${(i + 1) * 100}MB)...`);

    // Fill with 0xFF to force the kernel to allocate real physical pages
    // (Buffer.alloc with zero uses copy-on-write zero pages that consume no real RAM)
    memoryHog.push(Buffer.alloc(100 * 1024 * 1024, 0xFF));
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
