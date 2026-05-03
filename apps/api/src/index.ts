import { Elysia } from "elysia";
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
import { adminRoute } from "./routes/admin";
import { vaultRoute } from "./routes/vault";
import { webhooks } from "./routes/webhooks";

// Export the handler directly for Cloudflare Workers
// env and ctx are passed directly from the Worker fetch handler to Elysia
// so routes can access env.DB dynamically without static initialization.

// Wrangler local dev runs in a restricted worker context where Elysia's AOT
// code generation can trip "Code generation from strings disallowed".
const app = new Elysia({ aot: false })
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
  .use(adminRoute)
  .use(vaultRoute)
  .use(programmaticSeoRoute)
  .use(reportRoute)
  .use(reportEmailRoute)
  .use(reportPdfRoute)
  .use(testEmailsRoute)
  .use(testRateLimitsRoute)
  .use(webhooks);

import {
	runAuditDetonatorJob,
	type AuditQueueMessage,
} from "./services/auditDetonatorPipeline";

async function handlePdfGeneration(message: AuditQueueMessage, env: any) {
	await runAuditDetonatorJob(message, env as Record<string, unknown>);
}

// Export the handler directly for Cloudflare Workers
type WorkerStore = { env?: unknown; ctx?: ExecutionContext };

export default {
	async fetch(request: Request, env: unknown, ctx: ExecutionContext) {
		Object.assign((app as unknown as { store: WorkerStore }).store, {
			env,
			ctx,
		});

		// 1. SLEDGEHAMMER CORS PREFLIGHT
		if (request.method === "OPTIONS") {
			return new Response(null, {
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
					"Access-Control-Allow-Headers": "*",
					"Access-Control-Max-Age": "86400",
				},
			});
		}

		// 2. NORMAL ROUTING (Wrap your existing logic here)
		const response = await app.handle(request);

		// 3. SLEDGEHAMMER CORS APPEND
		const newResponse = new Response(response.body, response);
		newResponse.headers.set("Access-Control-Allow-Origin", "*");
		return newResponse;
	},
	async queue(batch: any, env: any) {
		for (const message of batch.messages) {
			await handlePdfGeneration(message.body, env);
		}
	}
};

// Export the App type for Eden Treaty client generation
export type App = typeof app;
