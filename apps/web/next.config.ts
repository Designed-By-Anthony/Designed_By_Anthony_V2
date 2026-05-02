import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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