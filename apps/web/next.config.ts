import type { NextConfig } from "next";
const monorepoRoot = new URL("../../", `file://${process.cwd()}/`).pathname;

const CSP = [
  "default-src 'self'",
  // Next.js uses inline scripts; third-party analytics/widgets require 'unsafe-inline'.
  // No require-trusted-types-for — too restrictive for GTM/Stripe/Clarity/Crisp on a marketing site.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://www.clarity.ms https://c.clarity.ms https://js.stripe.com https://client.crisp.chat https://service.crisp.chat https://challenges.cloudflare.com https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://client.crisp.chat",
  "font-src 'self' data: https://fonts.gstatic.com https://client.crisp.chat",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://dba-api.anthony-6b4.workers.dev https://api.designedbyanthony.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.clarity.ms https://c.clarity.ms https://api.stripe.com https://client.crisp.chat https://service.crisp.chat wss://relay.crisp.chat https://challenges.cloudflare.com https://tremendous-emu-522.convex.site https://cloudflareinsights.com",
  "frame-src https://www.googletagmanager.com https://challenges.cloudflare.com https://js.stripe.com",
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

export default nextConfig;