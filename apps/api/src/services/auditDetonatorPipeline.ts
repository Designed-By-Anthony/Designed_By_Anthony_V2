import { generatePsiArchitecturalSummary } from "@dba/shared/lighthouse/lib/ai";
import { lighthousePayloadToAuditData } from "@dba/shared/lighthouse/lib/auditDetonatorHelpers";
import type { LighthouseAuditEntry } from "@dba/shared/lighthouse/lib/auditPsi";
import {
	PSI_PARTIAL_REASON,
	resolvePageSpeedLighthouse,
} from "@dba/shared/lighthouse/lib/auditPsi";
import { buildAuditPdf } from "@dba/shared/lighthouse/lib/auditReportPdf";
import {
	isResendConfigured,
	sendTransactionalEmail,
} from "@dba/shared/lighthouse/lib/transactionalResend";

export type AuditQueueMessage = {
	jobId: string;
	targetUrl: string;
	email: string;
	name: string;
	company: string;
	location?: string;
};

const WORKER_SECRET_KEYS = [
	"GEMINI_API_KEY",
	"GOOGLE_API_KEY",
	"GOOGLE_PAGESPEED_API_KEY",
	"RESEND_API_KEY",
	"RESEND_FROM_EMAIL",
	"GEMINI_MODEL",
	"GEMINI_DETONATOR_MODEL",
] as const;

export function applyWorkerSecrets(env: Record<string, unknown>): void {
	for (const k of WORKER_SECRET_KEYS) {
		const v = env[k];
		if (typeof v === "string" && v.trim()) {
			process.env[k] = v;
		}
	}
}

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

function pickAuditsSample(
	audits: Record<string, LighthouseAuditEntry> | undefined,
): Record<string, LighthouseAuditEntry> {
	if (!audits) return {};
	const ids = [
		"largest-contentful-paint",
		"first-contentful-paint",
		"cumulative-layout-shift",
		"total-blocking-time",
		"interactive",
		"speed-index",
		"total-byte-weight",
		"render-blocking-resources",
	];
	const out: Record<string, LighthouseAuditEntry> = {};
	for (const id of ids) {
		if (audits[id]) out[id] = audits[id]!;
	}
	return out;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	let binary = "";
	const bytes = new Uint8Array(buffer);
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]!);
	}
	return btoa(binary);
}

function emptyLighthouse(finalUrl: string) {
	return {
		categories: {
			performance: { score: null as number | null },
			accessibility: { score: null as number | null },
			"best-practices": { score: null as number | null },
			seo: { score: null as number | null },
		},
		audits: {} as Record<string, LighthouseAuditEntry>,
		finalUrl,
	};
}

function blueprintEmailHtml(name: string): string {
	const safe = name.trim() || "there";
	return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8f9fa;font-family:Inter,system-ui,sans-serif;color:#1a2a40;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f9fa;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#ffffff;border:1px solid rgba(26,42,64,0.1);border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(26,42,64,0.04);">
        <tr><td style="padding:28px 28px 12px;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#5b7c99;">ANTHONY.</td></tr>
        <tr><td style="padding:8px 28px 8px;font-size:22px;font-weight:700;color:#1a2a40;">Your architectural blueprint is attached</td></tr>
        <tr><td style="padding:8px 28px 24px;font-size:15px;line-height:1.6;color:#334155;">
          Hi ${safe},<br/><br/>
          Our edge pipeline finished analyzing your public URL. The PDF attached is a printer-friendly executive snapshot of lab vitals and an architectural read — built for decision-makers, not slide decks.<br/><br/>
          If you want this turned into a remediation roadmap, reply to this thread and we’ll line up next steps.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/**
 * Async “Lighthouse Detonator”: PSI → Gemini summary → jsPDF → Resend with attachment.
 */
export async function runAuditDetonatorJob(
	message: AuditQueueMessage,
	env: Record<string, unknown>,
): Promise<void> {
	applyWorkerSecrets(env);

	const kv = env.AUDIT_REPORTS_KV as KVNamespace | undefined;
	if (!kv) throw new Error("AUDIT_REPORTS_KV binding missing");

	const priorRaw = await kv.get(message.jobId);
	if (!priorRaw) throw new Error(`Missing KV job ${message.jobId}`);

	await kv.put(
		message.jobId,
		JSON.stringify({
			...JSON.parse(priorRaw),
			status: "processing",
			timestamp: Date.now(),
		}),
	);

	const psiKey =
		(typeof env.GOOGLE_PAGESPEED_API_KEY === "string"
			? env.GOOGLE_PAGESPEED_API_KEY
			: undefined
		)?.trim() || undefined;

	const resolved = await resolvePageSpeedLighthouse(
		message.targetUrl,
		psiKey,
		readPageSpeedErrorMessage,
	);

	let lighthouse;
	let psiDegradedReason: string | null;

	if (!resolved.ok) {
		if (
			resolved.status === 429 ||
			resolved.status === 503 ||
			(resolved.retryAfter != null && resolved.retryAfter !== "")
		) {
			throw new Error(resolved.error);
		}
		lighthouse = emptyLighthouse(message.targetUrl);
		psiDegradedReason = resolved.error || PSI_PARTIAL_REASON;
	} else {
		lighthouse = resolved.outcome.lighthouse;
		psiDegradedReason = resolved.outcome.psiDegradedReason;
	}

	const psiForGemini = JSON.stringify({
		finalUrl: lighthouse.finalUrl,
		categories: lighthouse.categories,
		audits: pickAuditsSample(lighthouse.audits),
	});

	const summary = await generatePsiArchitecturalSummary(psiForGemini);
	const auditData = lighthousePayloadToAuditData(
		message.targetUrl,
		lighthouse,
		psiDegradedReason,
		summary,
	);

	const blob = buildAuditPdf(auditData, message.jobId);
	const ab = await blob.arrayBuffer();
	const b64 = arrayBufferToBase64(ab);

	const domainSlug = message.targetUrl
		.replace(/^https?:\/\//, "")
		.replace(/\//g, "-")
		.replace(/\./g, "-");
	const fileName = `${domainSlug}-architectural-blueprint-${Math.floor(Date.now() / 1000)}.pdf`;

	if (!isResendConfigured()) {
		console.warn("[detonator] RESEND_API_KEY missing — PDF built but not emailed");
		await kv.put(
			message.jobId,
			JSON.stringify({
				...JSON.parse(priorRaw),
				status: "complete_no_email",
				pdfFileName: fileName,
				timestamp: Date.now(),
			}),
		);
		return;
	}

	await sendTransactionalEmail({
		to: message.email,
		subject: "Your ANTHONY. Architectural Blueprint",
		html: blueprintEmailHtml(message.name),
		text: `Hi ${message.name.trim() || "there"},\n\nYour architectural blueprint PDF is attached.\n\n— ANTHONY.`,
		attachments: [
			{
				filename: fileName,
				contentBase64: b64,
				contentType: "application/pdf",
			},
		],
	});

	await kv.put(
		message.jobId,
		JSON.stringify({
			...JSON.parse(priorRaw),
			status: "emailed",
			pdfFileName: fileName,
			timestamp: Date.now(),
		}),
	);
}
