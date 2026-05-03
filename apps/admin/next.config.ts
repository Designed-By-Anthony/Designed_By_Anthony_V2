import type { NextConfig } from "next";
const monorepoRoot = new URL("../../", `file://${process.cwd()}/`).pathname;

const nextConfig: NextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
  outputFileTracingRoot: monorepoRoot,
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
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
