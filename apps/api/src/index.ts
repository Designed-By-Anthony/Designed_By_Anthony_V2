import { cors } from "@elysiajs/cors";
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
  fetch: (request: Request, env: unknown, ctx: ExecutionContext) => {
    (app as unknown as { store: WorkerStore }).store = { env, ctx };
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
