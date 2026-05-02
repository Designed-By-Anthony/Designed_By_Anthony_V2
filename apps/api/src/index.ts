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

/** Origins allowed to call the API from browsers (CORS). */
const CORS_ALLOWED_ORIGINS = new Set([
	"https://designedbyanthony.com",
	"https://admin.designedbyanthony.com",
	"http://localhost:3000",
	"http://127.0.0.1:3000",
	"http://localhost:3100",
	"http://127.0.0.1:3100",
]);

const CORS_ALLOW_METHODS = "GET, POST, PUT, DELETE, OPTIONS";
const CORS_ALLOW_HEADERS =
	"Content-Type, Authorization, Cf-Access-Authenticated-User-Email";

function isAllowedCorsOrigin(origin: string | null): origin is string {
	return Boolean(origin && CORS_ALLOWED_ORIGINS.has(origin));
}

function corsHeadersForOrigin(origin: string): Record<string, string> {
	return {
		"Access-Control-Allow-Origin": origin,
		"Access-Control-Allow-Methods": CORS_ALLOW_METHODS,
		"Access-Control-Allow-Headers": CORS_ALLOW_HEADERS,
		"Access-Control-Max-Age": "86400",
		Vary: "Origin",
	};
}

function withCors(request: Request, response: Response): Response {
	const origin = request.headers.get("Origin");
	if (!isAllowedCorsOrigin(origin)) {
		return response;
	}
	const headers = new Headers(response.headers);
	for (const [k, v] of Object.entries(corsHeadersForOrigin(origin))) {
		headers.set(k, v);
	}
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

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
		(app as unknown as { store: WorkerStore }).store = { env, ctx };

		if (request.method === "OPTIONS") {
			const origin = request.headers.get("Origin");
			if (isAllowedCorsOrigin(origin)) {
				return new Response(null, {
					status: 200,
					headers: corsHeadersForOrigin(origin),
				});
			}
			return new Response(null, { status: 403 });
		}

		const response = await app.handle(request);
		return withCors(request, response);
	},
	async queue(batch: any, env: any) {
		for (const message of batch.messages) {
			await handlePdfGeneration(message.body, env);
		}
	}
};

// Export the App type for Eden Treaty client generation
export type App = typeof app;
