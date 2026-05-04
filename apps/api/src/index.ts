import * as Sentry from "@sentry/cloudflare";
import { Elysia } from "elysia";
import { adminRoute } from "./routes/admin";
import { auditRoute } from "./routes/audit";
import { auditEmailSummaryRoute } from "./routes/auditEmailSummary";
import { authRoute } from "./routes/auth";
import { checkoutRoute } from "./routes/checkout";
import { leadEmailRoute } from "./routes/leadEmail";
import { leadsRoute } from "./routes/leads";
import { meRoute } from "./routes/me";
import { pagespeedAuditRoute } from "./routes/pagespeedAudit";
import { programmaticSeoRoute } from "./routes/programmaticSeo";
import { reportRoute } from "./routes/report";
import { reportEmailRoute } from "./routes/reportEmail";
import { reportPdfRoute } from "./routes/reportPdf";
import { testEmailsRoute } from "./routes/testEmails";
import { testRateLimitsRoute } from "./routes/testRateLimits";
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
      })
  )
  .use(auditRoute)
  .use(auditEmailSummaryRoute)
  .use(leadEmailRoute)
  .use(leadsRoute)
  .use(authRoute)
  .use(meRoute)
  .use(adminRoute)
  .use(vaultRoute)
  .use(programmaticSeoRoute)
  .use(reportRoute)
  .use(reportEmailRoute)
  .use(reportPdfRoute)
  .use(testEmailsRoute)
  .use(testRateLimitsRoute)
  .use(webhooks)
  .use(checkoutRoute)
  .use(pagespeedAuditRoute);

import { type AuditQueueMessage, runAuditDetonatorJob } from "./services/auditDetonatorPipeline";

async function handlePdfGeneration(message: AuditQueueMessage, env: Record<string, unknown>) {
  await runAuditDetonatorJob(message, env);
}

// Export the handler directly for Cloudflare Workers
type WorkerStore = { env?: unknown; ctx?: ExecutionContext };

export default Sentry.withSentry(
  (_env: Env) => ({
    dsn: "https://f20594968b62b35635063d10b42dc8ba@o4511331024371712.ingest.us.sentry.io/4511331026927616",
    tracesSampleRate: 1.0,
    enableLogs: true,
    sendDefaultPii: true,
  }),
  {
    async fetch(request, env, ctx) {
      Object.assign((app as unknown as { store: WorkerStore }).store, {
        env,
        ctx,
      });

      // 1. CORS PREFLIGHT (WILDCARD ENFORCED)
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
          },
        });
      }

      // 2. NORMAL ROUTING
      const response = await app.handle(request);

      // 3. CORS HEADERS ON ACTUAL RESPONSES
      const newResponse = new Response(response.body, response);
      newResponse.headers.set("Access-Control-Allow-Origin", "*");
      newResponse.headers.set("Access-Control-Allow-Methods", "*");
      newResponse.headers.set("Access-Control-Allow-Headers", "*");
      return newResponse;
    },
    async queue(batch, env, _ctx) {
      for (const message of batch.messages) {
        await handlePdfGeneration(message.body as AuditQueueMessage, env);
      }
    },
  } satisfies ExportedHandler<Env>
);

// Export the App type for Eden Treaty client generation
export type App = typeof app;
