"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_KEY = "dba_cookie_consent";

const btnBase =
	"inline-flex items-center justify-center rounded-full font-[family-name:var(--font-display)] font-bold text-[0.78rem] tracking-[0.01em] leading-none cursor-pointer transition-[transform,box-shadow,border-color,background,color] duration-[350ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[rgb(var(--brand-accent-rgb)/0.45)] focus-visible:outline-offset-[3px] active:scale-[0.97] py-[0.55rem] px-[1.1rem]";
const btnAccept = `${btnBase} text-[#f8f9fa] border border-[#5b7c99] bg-[#5b7c99] shadow-[0_14px_28px_-16px_rgba(91,124,153,0.55)] hover:-translate-y-px hover:bg-[#4a6278] hover:border-[#4a6278]`;
const btnDecline = `${btnBase} text-[#333333] bg-[#f8f9fa] border border-[rgba(26,42,64,0.15)] hover:-translate-y-px hover:border-[#5b7c99] hover:bg-white hover:text-[#1a2a40]`;

declare global {
	interface Window {
		__dbaGrantAnalyticsConsent?: () => void;
		__dbaRevokeAnalyticsConsent?: () => void;
		__dbaLoadAnalytics?: () => void;
		__dbaOpenCookieConsent?: () => void;
	}
}

function safeGet(): string | null {
	try { return localStorage.getItem(COOKIE_KEY); } catch { return null; }
}
function safeSet(v: string) {
	try { localStorage.setItem(COOKIE_KEY, v); } catch {}
}
function safeDel() {
	try { localStorage.removeItem(COOKIE_KEY); } catch {}
}

export function CookieBanner() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const stored = safeGet();
		if (stored === "accepted") {
			window.__dbaGrantAnalyticsConsent?.();
			window.__dbaLoadAnalytics?.();
		} else if (stored === "rejected") {
			window.__dbaRevokeAnalyticsConsent?.();
		} else {
			window.__dbaRevokeAnalyticsConsent?.();
			setVisible(true);
		}

		window.__dbaOpenCookieConsent = () => {
			safeDel();
			window.__dbaRevokeAnalyticsConsent?.();
			setVisible(true);
		};
	}, []);

	function resolve(choice: "accepted" | "rejected") {
		safeSet(choice);
		if (choice === "accepted") {
			window.__dbaGrantAnalyticsConsent?.();
			window.__dbaLoadAnalytics?.();
		} else {
			window.__dbaRevokeAnalyticsConsent?.();
		}
		setVisible(false);
		window.dispatchEvent(new CustomEvent("dba:cookie-resolved", { detail: { choice } }));
	}

	if (!visible) return null;

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="cookie-title"
			aria-describedby="cookie-desc"
			className="fixed left-0 right-0 bottom-0 z-[9999] px-5 py-4 [padding-bottom:max(1rem,env(safe-area-inset-bottom))] pointer-events-none print:hidden transform-gpu"
		>
			<div className="pointer-events-auto mx-auto max-w-[44rem] rounded-[1.4rem] border border-[rgba(26,42,64,0.12)] bg-[rgba(248,249,250,0.95)] [backdrop-filter:blur(20px)] [-webkit-backdrop-filter:blur(20px)] px-6 py-5 shadow-[0_-16px_48px_-20px_rgba(26,42,64,0.2)] transform-gpu will-change-transform">
				<p id="cookie-title" className="m-0 mb-2 text-base font-bold tracking-[-0.01em] text-[#1a2a40]">
					Cookies and analytics
				</p>
				<p id="cookie-desc" className="m-0 mb-4 text-[0.875rem] leading-[1.6] text-[#333333] [&_a]:text-[#5b7c99] [&_a]:no-underline [&_a]:border-b [&_a]:border-[rgba(26,42,64,0.15)] [&_a]:transition-[border-color,color] [&_a]:duration-200 [&_a:hover]:border-[#5b7c99] [&_a:hover]:text-[#4a6278]">
					We use essential tools to keep forms secure and the site running. If you are OK with it, we also load Google Analytics 4 to see how traffic moves. Read the{" "}
					<Link href="/cookie">Cookie Policy</Link> and{" "}
					<Link href="/privacy">Privacy Policy</Link>.
				</p>
				<div className="flex flex-wrap items-center gap-3">
					<button type="button" className={btnAccept} onClick={() => resolve("accepted")}>
						Accept
					</button>
					<button type="button" className={btnDecline} onClick={() => resolve("rejected")}>
						Decline
					</button>
				</div>
			</div>
		</div>
	);
}
