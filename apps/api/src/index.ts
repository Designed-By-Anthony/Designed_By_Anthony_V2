import { createD1Client } from "@dba/shared/db/client";
import { cors } from "@elysiajs/cors";
import { setReportKV } from "@dba/shared/lighthouse/lib/report-store";
import { Elysia } from "elysia";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { setLedgerDb } from "@dba/shared/lib/d1Leads";
import { isTrustedMarketingBrowserOrigin } from "@dba/shared/lib/marketingBrowserOrigins";
import { auditRoute } from "./routes/audit";
import { auditEmailSummaryRoute } from "./routes/auditEmailSummary";
import { leadEmailRoute } from "./routes/leadEmail";
import { programmaticSeoRoute } from "./routes/programmaticSeo";
import { reportRoute } from "./routes/report";
import { reportEmailRoute } from "./routes/reportEmail";
import { reportPdfRoute } from "./routes/reportPdf";
import { testEmailsRoute } from "./routes/testEmails";
import { testRateLimitsRoute } from "./routes/testRateLimits";
import { leadsRoute } from "./routes/leads";
import { webhooks } from "./routes/webhooks";

// Export the handler directly for Cloudflare Workers
// env and ctx are passed directly from the Worker fetch handler to Elysia
// so routes can access env.DB dynamically without static initialization.

// Wrangler local dev runs in a restricted worker context where Elysia's AOT
// code generation can trip "Code generation from strings disallowed".
const app = new Elysia({ aot: false })
	.use(
		cors({
			origin: (request) => {
				const origin = request.headers.get("origin");
				if (!origin) return false;

				// Allow production domains
				if (origin === "https://designedbyanthony.com" ||
					origin === "https://admin.designedbyanthony.com") {
					return true;
				}

				// Allow localhost for development
				if (origin === "http://localhost:3000" ||
					origin === "http://127.0.0.1:3000" ||
					origin === "http://localhost:3100" ||
					origin === "http://127.0.0.1:3100") {
					return true;
				}

				// Block all other origins
				return false;
			},
			allowedHeaders: ["Content-Type", "Authorization"],
			methods: ["GET", "POST", "DELETE", "OPTIONS"],
		}),
	)
	.get("/", ({ set }) => {
		set.headers["Cache-Control"] = "no-store";
		return { ok: true, service: "dba-api" };
	})
	.get("/health", ({ set }) => {
		set.headers["Cache-Control"] = "no-store";
		return { ok: true, service: "dba-api" };
	})
	.get(
		"/favicon.ico",
		() =>
			new Response(null, {
				status: 204,
				headers: { "Cache-Control": "public, max-age=86400" },
			}),
	)
  .use(auditRoute)
  .use(auditEmailSummaryRoute)
  .use(leadEmailRoute)
  .use(leadsRoute)
  .use(programmaticSeoRoute)
  .use(reportRoute)
  .use(reportEmailRoute)
  .use(reportPdfRoute)
  .use(testEmailsRoute)
  .use(testRateLimitsRoute)
  .use(webhooks);

// Queue message type
type AuditQueueMessage = {
	jobId: string;
	targetUrl: string;
	city?: string;
	industry?: string;
};

import { generateAuditPdf } from "./services/adobe";

// Queue consumer handler
async function handlePdfGeneration(message: AuditQueueMessage, env: any) {
	try {
		console.log(`Processing PDF generation job ${message.jobId} for ${message.targetUrl}`);

		// Get audit data from KV
		const auditDataStr = await env.AUDIT_REPORTS_KV.get(message.jobId);
		if (!auditDataStr) {
			throw new Error(`Audit data not found for job ${message.jobId}`);
		}

		const auditData = JSON.parse(auditDataStr);

		// Update status to processing
		await env.AUDIT_REPORTS_KV.put(message.jobId, JSON.stringify({
			...auditData,
			status: "processing",
			timestamp: Date.now()
		}));

		// Generate PDF using Adobe services
		const { pdfBuffer, fileName } = await generateAuditPdf(
			message.jobId,
			message.jobId, // Using jobId as reportId for now
			message.targetUrl,
			auditData.email,
			auditData.name,
			auditData.company,
			auditData.location,
			env
		);

		// Upload PDF to R2 storage
		const r2Key = `reports/${fileName}`;
		await env.PDF_STORAGE.put(r2Key, pdfBuffer, {
			httpMetadata: { contentType: "application/pdf" },
		});

		// Generate public URL (using R2 dev URL format)
		// Note: In production, this would use the actual R2 public endpoint
		const r2Url = `https://pub-${env.PDF_STORAGE.accountId}.r2.dev/${r2Key}`;

		// Update status to complete with download URL
		await env.AUDIT_REPORTS_KV.put(message.jobId, JSON.stringify({
			...auditData,
			status: "complete",
			pdfUrl: r2Url,
			fileName,
			timestamp: Date.now()
		}));

		console.log(`Completed PDF generation for job ${message.jobId}: ${r2Url}`);

	} catch (error) {
		console.error(`Failed to process job ${message.jobId}:`, error);

		// Update status to error
		await env.AUDIT_REPORTS_KV.put(message.jobId, JSON.stringify({
			...JSON.parse(await env.AUDIT_REPORTS_KV.get(message.jobId) || '{}'),
			status: "error",
			message: error instanceof Error ? error.message : "Unknown error",
			timestamp: Date.now()
		}));

		// Re-throw to allow Cloudflare Queue retries
		throw error;
	}
}

// Export the handler directly for Cloudflare Workers
export default {
  fetch: (request: Request, env: any, ctx: any) => {
    app.store.env = env;
    app.store.ctx = ctx;
    return app.handle(request);
  },
	async queue(batch: any, env: any) {
		for (const message of batch.messages) {
			await handlePdfGeneration(message.body, env);
		}
	}
};

// Export the App type for Eden Treaty client generation
export type App = typeof app;
