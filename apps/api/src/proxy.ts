/**
 * proxy.ts — Clean Elysia fetch-based reverse proxy
 * Zero Node.js deps. 100% Web Standard APIs (Request, Response, fetch).
 * Compatible with Cloudflare Workers Native runtime.
 */

import { Elysia } from "elysia";

export interface ProxyOptions {
  /** Target origin, e.g. "https://api.example.com" */
  target: string;
  /** Optional path prefix to strip before forwarding */
  stripPrefix?: string;
}

/**
 * Creates an Elysia plugin that proxies all requests under `prefix` to `target`.
 *
 * Example:
 *   app.use(createProxy({ target: "https://upstream.example.com", stripPrefix: "/proxy" }))
 */
export function createProxy({ target, stripPrefix = "" }: ProxyOptions) {
  return new Elysia({ name: "edge-proxy" }).all(`${stripPrefix}/*`, async ({ request }) => {
    const url = new URL(request.url);
    const targetUrl = new URL(url.pathname.replace(stripPrefix, "") + url.search, target);

    // Forward the original request — clone headers, strip host
    const forwardHeaders = new Headers(request.headers);
    forwardHeaders.set("host", targetUrl.hostname);
    forwardHeaders.delete("cf-connecting-ip");
    forwardHeaders.delete("cf-ray");

    const upstream = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: forwardHeaders,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "follow",
    });

    // Stream the upstream response back — preserve status, headers
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: upstream.headers,
    });
  });
}
