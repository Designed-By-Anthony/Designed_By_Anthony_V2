"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.designedbyanthony.com";
const TOOLS_DOMAIN = "https://designedbyanthony.online";

type Purchase = {
  id: string;
  product_slug: string;
  tier: string;
  status: string;
  created_at: number;
};

type MeResponse = {
  ok: boolean;
  user: { id: string; email: string; plan: string; created_at: number };
  purchases: Purchase[];
};

const PRODUCT_META: Record<string, { name: string; icon: string; appPath: string }> = {
  sitescan: {
    name: "SiteScan — Website Health Reports",
    icon: "\u{1F50D}",
    appPath: "/tools/lighthouse-scanner",
  },
  reviewpilot: {
    name: "ReviewPilot — AI Review Response",
    icon: "\u2B50",
    appPath: "/tools/seo-audit",
  },
  clienthub: {
    name: "ClientHub — Client Portal",
    icon: "\u{1F465}",
    appPath: "/tools/lead-form-builder",
  },
  localrank: {
    name: "LocalRank — Local SEO Dashboard",
    icon: "\u{1F4CD}",
    appPath: "/tools/site-speed-monitor",
  },
  testiflow: {
    name: "TestiFlow — Testimonial Collector",
    icon: "\u{1F4AC}",
    appPath: "/tools/cold-outreach",
  },
  contentmill: {
    name: "ContentMill — AI Social Content",
    icon: "\u270F\uFE0F",
    appPath: "/tools/service-area-map",
  },
};

export function DashboardClient() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const token = await getToken();
        if (!token || cancelled) return;
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = (await res.json()) as MeResponse;
        if (!cancelled) setData(json);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  return (
    <main className="min-h-dvh bg-[#f8f9fa]">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5b7c99] mb-2">
            Account
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.03em] text-[#1a2a40]">
            Your Dashboard
          </h1>
          {user && (
            <p className="mt-2 text-sm text-[#5d6e80]">{user.primaryEmailAddress?.emailAddress}</p>
          )}
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#5d6e80]">Loading your tools...</p>
          </div>
        ) : (
          <>
            {/* Purchased tools */}
            <section className="mb-12">
              <h2 className="mb-4 text-lg font-semibold text-[#1a2a40]">Your Tools</h2>
              {data?.purchases && data.purchases.filter((p) => p.status === "active").length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {data.purchases
                    .filter((p) => p.status === "active")
                    .map((p) => {
                      const meta = PRODUCT_META[p.product_slug];
                      return (
                        <a
                          key={p.id}
                          href={`${TOOLS_DOMAIN}${meta?.appPath ?? ""}`}
                          className="flex items-start gap-4 rounded-xl border border-[rgba(26,42,64,0.1)] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <span className="text-2xl" aria-hidden="true">
                            {meta?.icon ?? "\u{1F4E6}"}
                          </span>
                          <div>
                            <p className="font-semibold text-[#1a2a40]">
                              {meta?.name ?? p.product_slug}
                            </p>
                            <p className="text-xs text-[#5d6e80] capitalize">{p.tier} plan</p>
                          </div>
                        </a>
                      );
                    })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[rgba(26,42,64,0.15)] bg-white p-8 text-center">
                  <p className="mb-3 text-sm text-[#5d6e80]">You don&apos;t have any tools yet.</p>
                  <Link
                    href="/tools"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#5b7c99] bg-[#5b7c99] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4a6278]"
                  >
                    Browse tools &rarr;
                  </Link>
                </div>
              )}
            </section>

            {/* Account info */}
            <section className="mb-12">
              <h2 className="mb-4 text-lg font-semibold text-[#1a2a40]">Account</h2>
              <div className="rounded-xl border border-[rgba(26,42,64,0.1)] bg-white p-5">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[#5d6e80]">Plan</dt>
                    <dd className="font-medium capitalize text-[#1a2a40]">
                      {data?.user?.plan ?? "free"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#5d6e80]">Member since</dt>
                    <dd className="font-medium text-[#1a2a40]">
                      {data?.user?.created_at
                        ? new Date(data.user.created_at).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })
                        : "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            {/* Quick links */}
            <section>
              <h2 className="mb-4 text-lg font-semibold text-[#1a2a40]">Quick Links</h2>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/tools"
                  className="rounded-full border border-[rgba(26,42,64,0.15)] bg-white px-5 py-2 text-sm font-medium text-[#1a2a40] transition-colors hover:border-[#5b7c99]"
                >
                  Add more tools
                </Link>
                <a
                  href={TOOLS_DOMAIN}
                  className="rounded-full border border-[rgba(26,42,64,0.15)] bg-white px-5 py-2 text-sm font-medium text-[#1a2a40] transition-colors hover:border-[#5b7c99]"
                >
                  Go to Tools portal
                </a>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
