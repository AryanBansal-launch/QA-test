import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    nodeMiddleware: true, // allow middleware to run on the Node.js runtime (undici / node:dns)
  },
  async headers() {
    return [
      {
        source: "/about",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=31536000, stale-while-revalidate=60"
          }
        ],
      },
    ];
  },
};

export default nextConfig;