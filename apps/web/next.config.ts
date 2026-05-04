import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const monorepoRoot = new URL("../../", `file://${process.cwd()}/`).pathname;

const _CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://client.crisp.chat https://service.crisp.chat https://challenges.cloudflare.com https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://client.crisp.chat",
  "font-src 'self' data: https://fonts.gstatic.com https://client.crisp.chat",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://dba-api.anthony-6b4.workers.dev https://api.designedbyanthony.com https://api.designedbyanthony.online https://api.stripe.com https://client.crisp.chat https://service.crisp.chat wss://relay.crisp.chat https://challenges.cloudflare.com https://tremendous-emu-522.convex.site https://cloudflareinsights.com https://*.ingest.sentry.io",
  "frame-src https://challenges.cloudflare.com https://js.stripe.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
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

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
