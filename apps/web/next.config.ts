import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
    after: true,
  },
  images: {
    unoptimized: true, // Cloudflare handles image optimization
  },
};

export default nextConfig;