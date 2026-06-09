import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/wf/:path*",
        destination: "https://r.eu-north-1.awstrack.me/wf/:path*",
      },
    ];
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