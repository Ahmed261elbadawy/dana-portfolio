import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sharp ships native per-platform binaries; bundling it (the default for
  // packages used in Server Actions/Route Handlers) breaks at runtime on
  // Vercel. Keeping it external lets Node's normal require() resolve the
  // correct binary from node_modules instead.
  serverExternalPackages: ["sharp"],
  turbopack: {
    root: __dirname,
  },
  images: {
    // The sandboxed local dev preview is CPU/network-constrained, which
    // makes Next's built-in image optimizer time out fetching remote
    // Supabase images. Production deployments (Vercel) don't have this
    // constraint, so optimization stays on there.
    unoptimized: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "knynbdrvoxarxzrsqznu.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Search engines and bots should never index the admin tool.
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
