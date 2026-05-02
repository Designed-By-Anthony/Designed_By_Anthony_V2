import { buildFallbackInsight, generateAiInsight } from "@dba/shared/lighthouse/lib/ai";
import { fireAuditLoggingWebhook } from "@dba/shared/lighthouse/lib/auditLoggingWebhook";
import { resolvePageSpeedLighthouse } from "@dba/shared/lighthouse/lib/auditPsi";
import { buildInternalAuthorityMetrics } from "@dba/shared/lighthouse/lib/authorityEstimate";
import {
	buildReceiptEmail,
	isGmailConfigured,
	sendViaGmail,
} from "@dba/shared/lighthouse/lib/gmail";
import { type HtmlScanResult, scanHtml } from "@dba/shared/lighthouse/lib/htmlScanner";
import { checkLocalRateLimit, getClientAddress } from "@dba/shared/lighthouse/lib/http";
import {
	estimateIndexCoverage,
	type IndexCheckResult,
} from "@dba/shared/lighthouse/lib/indexCheck";
import { type MozMetrics, scanMoz } from "@dba/shared/lighthouse/lib/mozAnalysis";
import {
	type Competitor,
	type PlacesResult,
	scanCompetitors,
	scanPlaces,
} from "@dba/shared/lighthouse/lib/places";
import { db, REPORTS_COLLECTION, Timestamp } from "@dba/shared/lighthouse/lib/report-store";
import { buildPrefix, buildReportId, randomSuffix } from "@dba/shared/lighthouse/lib/reportId";
import { type SitewideScanResult, scanSitewide } from "@dba/shared/lighthouse/lib/sitewideScan";
import {
	isResendConfigured,
	sendTransactionalEmail,
} from "@dba/shared/lighthouse/lib/transactionalResend";
import {
	normalizeEmail,
	normalizeHttpUrl,
	normalizeText,
} from "@dba/shared/lighthouse/lib/validation";
import { Elysia } from "elysia";
import { tryInsertLead } from "@dba/shared/lib/d1Leads";
import { postLeadIngest } from "@dba/shared/lib/leadWebhook";
import {
	resolveEffectiveSecretKey,
	verifyTurnstileToken,
} from "@dba/shared/lib/turnstile";

const AUDIT_RATE_LIMIT = 5;
const AUDIT_RATE_WINDOW_MS = 10 * 60_000;

async function readPageSpeedErrorMessage(
	response: Response,
): Promise<string | undefined> {
	try {
		const data = (await response.json()) as { error?: { message?: string } };
		return typeof data?.error?.message === "string"
			? data.error.message
			: undefined;
	} catch {
		return undefined;
	}
}

async function createReportWithUniqueId(
	prefix: string,
	payload: Record<string, unknown>,
): Promise<string> {
	for (let attempt = 0; attempt < 3; attempt++) {
		const id = `DBA-${prefix}${randomSuffix()}`;
		const ref = db.collection(REPORTS_COLLECTION).doc(id);
		try {
			await ref.create({ ...payload, id });
			return id;
		} catch (err) {
			const code = (err as { code?: number | string })?.code;
			if (code === 6 || code === "already-exists") continue;
			throw err;
		}
	}
	throw new Error("Failed to generate unique report ID after 3 attempts");
}

export const auditRoute = new Elysia({ aot: false }).post(
	"/api/audit",
	async ({ request, set, store }) => {
		set.headers["Cache-Control"] = "no-store";

		// Rate limiting: 3 requests per IP per hour
		const clientIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
		const rateLimitKey = `audit:${clientIp}`;
		const retryAfterSeconds = checkLocalRateLimit(rateLimitKey, 3, 3600000); // 3 requests per hour
		if (retryAfterSeconds) {
			set.status = 429;
			set.headers["Retry-After"] = String(retryAfterSeconds);
			return {
				error: `Too many audit requests. Please wait ${retryAfterSeconds} seconds and try again.`,
			};
		}

		// Parse request body
		let body: Record<string, unknown>;
		try {
			body = await request.json();
		} catch {
			set.status = 400;
			return { error: "Invalid request body." };
		}

		// Validate required fields
		const url = normalizeHttpUrl(body.url);
		const email = normalizeEmail(body.email);
		const name = normalizeText(body.name, 120);
		const company = normalizeText(body.company, 160);
		const location = typeof body.location === "string" ? normalizeText(body.location, 160) : "";

		if (!url || !email || !name || !company) {
			set.status = 400;
			return { error: "Valid URL, name, company, and email are required." };
		}

		// Security check (Turnstile)
		const turnstileSecret = resolveEffectiveSecretKey(process.env.TURNSTILE_SECRET_KEY?.trim());
		if (turnstileSecret) {
			const cfToken = typeof body.cf_turnstile_response === "string" ? body.cf_turnstile_response.trim() : "";
			if (!cfToken) {
				set.status = 403;
				return { error: "Security check required. Please complete the challenge and try again." };
			}
			const verification = await verifyTurnstileToken(cfToken, turnstileSecret);
			if (!verification.success) {
				set.status = 403;
				return { error: "Security check failed. Please refresh the page and try again." };
			}
		}

		// Insert lead record
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

		// Generate unique job ID
		const jobId = crypto.randomUUID();

		// Create minimal audit data for KV storage (to avoid queue payload size limits)
		const auditData = {
			jobId,
			url,
			email,
			name,
			company,
			location,
			timestamp: Date.now(),
			status: "pending",
			targetUrl: url
		};

		try {
			// Store audit data in KV
			const env = (store as { env?: any }).env;
			await env.AUDIT_REPORTS_KV.put(jobId, JSON.stringify(auditData));

			// Send to queue for async processing
			await env.PDF_GEN_QUEUE.send({
				jobId,
				targetUrl: url,
				city: body.city,
				industry: body.industry
			});

			// Immediately return success with job ID
			return {
				success: true,
				jobId
			};
		} catch (error) {
			console.error("Queue processing failed:", error);
			set.status = 500;
			return {
				error: "Failed to process audit request. Please try again.",
				jobId // Still return jobId for potential recovery
			};
		}
	},
);
