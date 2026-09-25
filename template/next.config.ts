import type { NextConfig } from "next";

const storageOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL;
const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 86400,
    deviceSizes: [480, 960, 1600],
    imageSizes: [32, 64, 128, 256, 384],
    remotePatterns: storageOrigin
      ? [new URL("/storage/v1/object/public/**", storageOrigin)]
      : [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/media/immutable/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
