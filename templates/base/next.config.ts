import type { NextConfig } from "next";
const imageOrigin =
  process.env.NEXT_PUBLIC_MEDIA_ORIGIN || process.env.NEXT_PUBLIC_SUPABASE_URL;
const config: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    deviceSizes: [480, 768, 1024, 1600],
    imageSizes: [32, 64, 128, 256, 384],
    remotePatterns: imageOrigin
      ? [
          new URL(
            process.env.NEXT_PUBLIC_MEDIA_ORIGIN
              ? "/**"
              : "/storage/v1/object/public/**",
            imageOrigin,
          ),
        ]
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
      ...["/dashboard/:path*", "/api/workspace/:path*"].map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      })),
    ];
  },
};
export default config;
