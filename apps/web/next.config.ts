import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Powered-By",
            value: "Next.js, Cloudflare OpenNext, Elysia.js, D1 Database",
          },
          {
            key: "X-Built-By",
            value: "Designed By Anthony V2 Framework",
          },
        ],
      },
    ];
  },
  images: {
    unoptimized: true, // Cloudflare handles image optimization
  },
  typescript: {
    // Type-check separately via `bun run typecheck`. Build pipeline emits artifacts
    // even when type errors exist — keeps deploys unblocked while type-debt is paid down.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;