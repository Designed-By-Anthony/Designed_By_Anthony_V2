import { checkLocalRateLimit } from "@dba/shared/lighthouse/lib/http";
import {
	normalizeEmail,
	normalizeHttpUrl,
	normalizeText,
} from "@dba/shared/lighthouse/lib/validation";
import { tryInsertLead } from "@dba/shared/lib/d1Leads";
import {
	resolveEffectiveSecretKey,
	verifyTurnstileToken,
} from "@dba/shared/lib/turnstile";
import { Elysia } from "elysia";

interface CfEnv {
	DB?: D1Database;
	AUDIT_REPORTS_KV?: KVNamespace;
	PDF_GEN_QUEUE?: Queue;
}

export const auditRoute = new Elysia({ aot: false }).post(
	"/api/audit",
	async ({ body: rawBody, request, set, store }) => {
		set.headers["Cache-Control"] = "no-store";

		const clientIp =
			request.headers.get("cf-connecting-ip") ||
			request.headers.get("x-forwarded-for") ||
			"unknown";
		const rateLimitKey = `audit:${clientIp}`;
		const retryAfterSeconds = checkLocalRateLimit(rateLimitKey, 5, 600_000);
		if (retryAfterSeconds) {
			set.status = 429;
			set.headers["Retry-After"] = String(retryAfterSeconds);
			return {
				error: `Too many audit requests. Please wait ${retryAfterSeconds} seconds and try again.`,
			};
		}

		if (!rawBody || typeof rawBody !== "object") {
			set.status = 400;
			return { error: "Invalid request body." };
		}
		const body = rawBody as Record<string, unknown>;

		const url = normalizeHttpUrl(body.url);
		const email = normalizeEmail(body.email);
		const name = normalizeText(body.name, 120);
		const company = normalizeText(body.company, 160);
		const location =
			typeof body.location === "string"
				? normalizeText(body.location, 160)
				: "";

		if (!url || !email || !name || !company) {
			set.status = 400;
			return { error: "Valid URL, name, company, and email are required." };
		}

		const turnstileSecret = resolveEffectiveSecretKey(
			process.env.TURNSTILE_SECRET_KEY?.trim(),
		);
		if (turnstileSecret) {
			const cfToken =
				typeof body.cf_turnstile_response === "string"
					? body.cf_turnstile_response.trim()
					: "";
			if (!cfToken) {
				set.status = 403;
				return {
					error:
						"Security check required. Please complete the challenge and try again.",
				};
			}
			const verification = await verifyTurnstileToken(cfToken, turnstileSecret);
			if (!verification.success) {
				set.status = 403;
				return {
					error:
						"Security check failed. Please refresh the page and try again.",
				};
			}
		}

		await tryInsertLead({
			id: crypto.randomUUID(),
			email,
			company_name: company,
			source: "Audit_Form",
			status: "New",
			turnstile_passed: turnstileSecret ? 1 : null,
			metadata: JSON.stringify({ name, url, location }),
			created_at: Date.now(),
		});

		const env = (store as { env?: CfEnv }).env;
		const jobId = crypto.randomUUID();

		const auditData = {
			jobId,
			url,
			email,
			name,
			company,
			location,
			timestamp: Date.now(),
			status: "queued",
			targetUrl: url,
		};

		try {
			if (!env?.AUDIT_REPORTS_KV || !env.PDF_GEN_QUEUE) {
				console.error("[audit] Missing KV or PDF_GEN_QUEUE binding");
				set.status = 500;
				return { error: "Audit pipeline is not configured." };
			}

			await env.AUDIT_REPORTS_KV.put(jobId, JSON.stringify(auditData));

			await env.PDF_GEN_QUEUE.send({
				jobId,
				targetUrl: url,
				email,
				name,
				company,
				location,
			});

			return { ok: true, jobId };
		} catch (error) {
			console.error("[audit] Queue enqueue failed:", error);
			set.status = 500;
			return { error: "Failed to queue audit. Please try again." };
		}
	},
);
