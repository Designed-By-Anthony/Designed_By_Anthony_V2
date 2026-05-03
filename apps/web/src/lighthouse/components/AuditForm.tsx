"use client";

import { initCursorGlow } from "@lh/lib/cursorGlow";
import { Turnstile } from "@marsidev/react-turnstile";
import type React from "react";
import { useEffect, useState } from "react";
import { btnPrimaryAudit } from "@/design-system/buttons";
import { buildPublicApiUrl } from "@/lib/publicApi";

export function AuditForm() {
	const [url, setUrl] = useState("");
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [company, setCompany] = useState("");
	const [location, setLocation] = useState("");

	const [status, setStatus] = useState<
		"idle" | "submitting" | "queued" | "error"
	>("idle");
	const [errorMsg, setErrorMsg] = useState("");
	const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

	useEffect(() => {
		if (status === "idle") {
			const cleanup = initCursorGlow(".glass-card");
			return cleanup;
		}
	}, [status]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!url || status === "submitting") return;

		let finalUrl = url;
		if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
			finalUrl = `https://${finalUrl}`;
		}

		setStatus("submitting");
		setErrorMsg("");

		try {
			const res = await fetch(buildPublicApiUrl("/api/audit"), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					url: finalUrl,
					email,
					name,
					company,
					location,
					cf_turnstile_response: turnstileToken ?? "",
				}),
			});

			let data: {
				error?: string;
				ok?: boolean;
				jobId?: string;
			} | null = null;
			try {
				data = await res.json();
			} catch {
				data = null;
			}

			if (!res.ok) {
				throw new Error(data?.error || "Something went wrong.");
			}

			if (!data?.ok && !data?.jobId) {
				throw new Error("We couldn't queue your audit. Please try again.");
			}

			setStatus("queued");
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Failed to queue audit.";
			setErrorMsg(message);
			setStatus("error");
			setTurnstileToken(null);
		}
	};

	const isQueued = status === "queued";

	const inputClass =
		"w-full rounded-[0.65rem] border border-[rgb(var(--accent-bronze-rgb)/0.32)] bg-white px-[0.95rem] py-[0.7rem] text-[0.95rem] text-brand-charcoal [caret-color:rgb(var(--accent-bronze-rgb)/0.95)] font-[inherit] transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-brand-charcoal/[0.42] focus:outline-none focus:border-[rgb(var(--accent-bronze-rgb)/0.7)] focus:bg-white focus:shadow-[0_0_0_3px_rgb(var(--accent-bronze-rgb)/0.18)]";

	const labelClass =
		"mb-1.5 block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-cream)]";

	const turnstileSiteKey = "0x4AAAAAAC-uJDM-azoxzB3k";
	const isSubmitDisabled =
		status === "submitting" || (!!turnstileSiteKey && !turnstileToken);

	return (
		<div className="relative isolate w-full" id="run-audit">
			<div
				className={
					isQueued
						? "block rounded-[1.25rem] border border-[rgba(26,42,64,0.1)] bg-[rgba(255,255,255,0.92)] p-6 shadow-[0_8px_30px_rgb(26,42,64,0.06)] md:p-8"
						: "hidden"
				}
				role="status"
				aria-live="polite"
			>
				<p className="text-[0.65rem] font-bold uppercase tracking-[0.26em] text-brand-accent">
					Blueprint requested
				</p>
				<h2 className="mt-3 font-[family-name:var(--font-display)] text-[1.5rem] font-bold tracking-tight text-brand-charcoal sm:text-[1.75rem]">
					Our edge servers are on it
				</h2>
				<p className="mt-4 max-w-xl text-[15px] leading-[1.75] text-brand-charcoal/75">
					Blueprint requested. Our edge servers are analyzing your infrastructure. Your
					architectural report will be in your inbox in 2–3 minutes.
				</p>
				<button
					type="button"
					onClick={() => {
						setStatus("idle");
						setUrl("");
						setTurnstileToken(null);
					}}
					className="mt-8 rounded-xl border border-[rgba(26,42,64,0.15)] bg-white px-5 py-3 text-[0.9rem] font-semibold text-brand-indigo transition-colors hover:border-brand-accent/40"
				>
					Audit another URL
				</button>
			</div>

			<form
				onSubmit={handleSubmit}
				className={isQueued ? "hidden" : "flex flex-col gap-6"}
				aria-hidden={isQueued}
			>
				<div className="relative pb-6 mb-2 border-b border-[rgba(26,42,64,0.1)]">
					<span
						className="pointer-events-none absolute left-0 -bottom-px h-px w-[4.5rem] bg-linear-to-r from-[rgb(var(--brand-accent-rgb)/0.85)] to-transparent"
						aria-hidden
					/>
					<p className="inline-block text-[0.65rem] font-bold tracking-[0.26em] uppercase text-brand-accent mb-2">
						Free · Private · No Account Needed
					</p>
					<h2 className="font-[family-name:var(--font-display)] text-[1.6rem] font-bold tracking-tight text-brand-charcoal sm:text-[1.85rem]">
						Get Your Free Report
					</h2>
					<p className="mt-3 max-w-xl text-[14px] leading-[1.7] text-brand-charcoal/60">
						Submit your URL — we queue a full lab pass and email a branded architectural
						blueprint. No waiting on this screen.
					</p>
				</div>

				<div className="relative">
					<label htmlFor="url" className={labelClass}>
						Website to scan
					</label>
					<input
						id="url"
						name="url"
						type="text"
						inputMode="url"
						required
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="https://yoursite.com"
						autoComplete="url"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck={false}
						className="w-full rounded-[0.65rem] border border-[rgba(26,42,64,0.12)] bg-white px-[0.95rem] py-[0.95rem] font-mono text-[15px] text-brand-charcoal [caret-color:rgb(var(--brand-accent-rgb)/0.95)] shadow-[0_8px_26px_-18px_rgba(26,42,64,0.06)] placeholder:font-normal placeholder:text-brand-charcoal/[0.42] transition-[border-color,box-shadow,background-color] duration-200 focus:outline-none focus:border-[rgb(var(--brand-accent-rgb)/0.65)] focus:bg-white focus:shadow-[0_0_0_3px_rgb(var(--brand-accent-rgb)/0.2)]"
					/>
				</div>

				<fieldset className="border-0 m-0 p-0">
					<legend className="block w-full text-[0.65rem] font-bold tracking-[0.2em] uppercase text-brand-charcoal/55 mb-2.5 pb-2 border-b border-dashed border-[rgba(26,42,64,0.12)]">
						Where to send the report
					</legend>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label htmlFor="name" className={labelClass}>
								Your name
							</label>
							<input
								id="name"
								name="name"
								type="text"
								required
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Jane Smith"
								autoComplete="name"
								className={inputClass}
							/>
						</div>
						<div>
							<label htmlFor="company" className={labelClass}>
								Company
							</label>
							<input
								id="company"
								name="company"
								type="text"
								required
								value={company}
								onChange={(e) => setCompany(e.target.value)}
								placeholder="Your business name"
								autoComplete="organization"
								className={inputClass}
							/>
						</div>
						<div>
							<label htmlFor="email" className={labelClass}>
								Email for your report
							</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@company.com"
								autoComplete="email"
								className={inputClass}
							/>
						</div>
						<div>
							<label htmlFor="location" className={labelClass}>
								City &amp; state
							</label>
							<input
								id="location"
								name="location"
								type="text"
								required
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								placeholder="e.g. Syracuse, NY"
								autoComplete="address-level2"
								className={inputClass}
							/>
						</div>
					</div>
				</fieldset>

				{status === "error" && (
					<div
						className="rounded-xl border border-rose-500/35 bg-rose-950/35 px-4 py-3 text-sm text-rose-100/95"
						role="alert"
						aria-live="polite"
					>
						{errorMsg}
					</div>
				)}

				{turnstileSiteKey && (
					<div className="flex flex-col items-center gap-2 py-4">
						<Turnstile
							siteKey={turnstileSiteKey}
							onSuccess={(token) => setTurnstileToken(token)}
							onExpire={() => setTurnstileToken(null)}
							onError={() => setTurnstileToken(null)}
							options={{ theme: "light", size: "flexible" }}
						/>
						<p className="text-[0.7rem] font-bold uppercase tracking-widest text-brand-charcoal/30">
							Security check required to proceed
						</p>
					</div>
				)}

				<div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
					<button
						type="submit"
						disabled={isSubmitDisabled}
						aria-disabled={isSubmitDisabled}
						className={`${btnPrimaryAudit} w-full sm:w-auto sm:min-w-[260px]`}
					>
						<span className="relative inline-flex items-center justify-center gap-2">
							{status === "submitting" ? "Queueing audit…" : "Run free audit"}
							{status !== "submitting" && (
								<span
									className="transition-transform duration-300 group-hover:translate-x-0.5"
									aria-hidden
								>
									→
								</span>
							)}
						</span>
					</button>

					<div className="text-center sm:text-right">
						<p className="font-mono text-[11px] tracking-tight text-brand-charcoal/45">
							Async pipeline · PDF to inbox · Branded blueprint
						</p>
					</div>
				</div>
			</form>
		</div>
	);
}
