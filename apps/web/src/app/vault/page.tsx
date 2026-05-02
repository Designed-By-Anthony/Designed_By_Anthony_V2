import { headers } from "next/headers";
import Link from "next/link";
import { VaultDirectLine } from "@/app/vault/VaultDirectLine";

export const dynamic = "force-dynamic";

type VaultPayload = {
	email?: string;
	company_name?: string | null;
	staging_url?: string | null;
	edge_ranking?: number | null;
	last_audit_json?: string | null;
	error?: string;
};

function parseAuditSnapshot(raw: string | null): Record<string, unknown> | null {
	if (!raw) return null;
	try {
		const v = JSON.parse(raw) as unknown;
		return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null;
	} catch {
		return null;
	}
}

export default async function VaultPage() {
	const h = await headers();
	const accessEmail = h.get("cf-access-authenticated-user-email")?.trim();

	if (!accessEmail) {
		return (
			<main className="min-h-screen bg-[#f8f9fa] px-[var(--container-gutter)] py-16 text-brand-charcoal">
				<div className="mx-auto max-w-xl rounded-2xl border border-[rgba(26,42,64,0.1)] bg-white p-8 shadow-[0_8px_30px_rgb(26,42,64,0.04)]">
					<p className="text-[0.72rem] font-bold uppercase tracking-[0.26em] text-[#5b7c99]">
						Client Vault
					</p>
					<h1 className="mt-3 font-[family-name:var(--font-playfair)] text-2xl font-black text-[#1a2a40]">
						Sign in required
					</h1>
					<p className="mt-4 text-[0.98rem] leading-relaxed text-brand-charcoal/80">
						This dashboard is protected by Cloudflare Access (email OTP). After you
						create an Access application for{" "}
						<code className="rounded bg-[rgba(26,42,64,0.06)] px-1.5 py-0.5 text-[0.85rem]">
							/vault/*
						</code>
						, sign in here to see staging links, Edge Ranking, and the latest lab
						snapshot.
					</p>
				</div>
			</main>
		);
	}

	const apiBase =
		process.env.DBA_API_URL?.trim() ||
		(process.env.NODE_ENV === "production"
			? "https://dba-api.anthony-6b4.workers.dev"
			: "http://localhost:8787");

	let data: VaultPayload | null = null;
	try {
		const res = await fetch(`${apiBase}/api/vault/project`, {
			headers: {
				"Cf-Access-Authenticated-User-Email": accessEmail,
			},
			cache: "no-store",
		});
		data = (await res.json()) as VaultPayload;
		if (!res.ok) {
			data = { ...data, error: data.error || `HTTP ${res.status}` };
		}
	} catch {
		data = { error: "Could not reach the vault API." };
	}

	const snapshot = parseAuditSnapshot(data?.last_audit_json ?? null);

	return (
		<main className="min-h-screen bg-[#f8f9fa] px-[var(--container-gutter)] py-12 text-brand-charcoal">
			<div className="mx-auto max-w-3xl">
				<p className="text-[0.72rem] font-bold uppercase tracking-[0.26em] text-[#5b7c99]">
					Client Vault
				</p>
				<h1 className="mt-2 font-[family-name:var(--font-playfair)] text-[clamp(1.85rem,4vw,2.75rem)] font-black tracking-[-0.04em] text-[#1a2a40]">
					Infrastructure dashboard
				</h1>
				<p className="mt-2 text-sm text-brand-charcoal/65">
					Signed in as {accessEmail}
					{data?.company_name ? ` · ${data.company_name}` : null}
				</p>

				{data?.error ? (
					<div
						className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-900"
						role="alert"
					>
						{data.error}
					</div>
				) : (
					<div className="mt-10 grid gap-6">
						<section className="rounded-2xl border border-[rgba(26,42,64,0.1)] bg-[rgba(255,255,255,0.85)] p-6 shadow-[0_8px_30px_rgb(26,42,64,0.04)] backdrop-blur-md">
							<p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-charcoal/45">
								Edge ranking
							</p>
							<p className="mt-2 font-[family-name:var(--font-playfair)] text-[clamp(3.5rem,12vw,5rem)] font-black tabular-nums leading-none text-[#1a2a40]">
								{data?.edge_ranking != null ? data.edge_ranking : "—"}
							</p>
							<p className="mt-3 max-w-md text-sm leading-relaxed text-brand-charcoal/70">
								Composite signal for performance + crawl health (configure scoring in
								the ledger). Staging and audits stay tied to your workspace here.
							</p>
						</section>

						<section className="rounded-2xl border border-[rgba(26,42,64,0.1)] bg-white p-6 shadow-[0_8px_30px_rgb(26,42,64,0.04)]">
							<p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-charcoal/45">
								Staging
							</p>
							{data?.staging_url ? (
								<Link
									href={data.staging_url}
									target="_blank"
									rel="noopener noreferrer"
									className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#5b7c99] px-5 py-3 text-center text-[0.95rem] font-semibold text-[#f8f9fa] shadow-[0_8px_24px_-14px_rgba(26,42,64,0.35)] transition-colors hover:bg-[#1a2a40]"
								>
									Open staging site
								</Link>
							) : (
								<p className="mt-3 text-sm text-brand-charcoal/60">
									Staging URL not assigned yet — your operator will drop it here.
								</p>
							)}
						</section>

						<section className="rounded-2xl border border-[rgba(26,42,64,0.1)] bg-white p-6 shadow-[0_8px_30px_rgb(26,42,64,0.04)]">
							<p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-charcoal/45">
								Latest metrics snapshot
							</p>
							{snapshot && Object.keys(snapshot).length > 0 ? (
								<pre className="mt-4 max-h-80 overflow-auto rounded-xl bg-[rgba(26,42,64,0.04)] p-4 font-mono text-[0.78rem] leading-relaxed text-brand-charcoal/90">
									{JSON.stringify(snapshot, null, 2)}
								</pre>
							) : (
								<p className="mt-3 text-sm text-brand-charcoal/60">
									No snapshot stored yet. Scheduled audits will land JSON here for a
									read-only technical readout.
								</p>
							)}
						</section>

						<VaultDirectLine />
					</div>
				)}
			</div>
		</main>
	);
}
