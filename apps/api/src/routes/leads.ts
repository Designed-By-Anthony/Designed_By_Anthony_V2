import { createD1Client } from "@dba/shared/db/client";
import { leads as leadsTable } from "@dba/shared/db/schema";
import { normalizeCreatedAtMs } from "@dba/shared/lib/createdAt";
import { desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";

interface CfEnv {
  // D1Database is a Cloudflare Workers global; use unknown for TS compat outside worker context
  DB?: unknown;
}

import { checkLocalRateLimit } from "@dba/shared/lighthouse/lib/http";

export const leadsRoute = new Elysia({ prefix: "/leads" })
  .get("", async ({ set, store }) => {
    const env = (store as { env?: CfEnv }).env;
    set.headers["Cache-Control"] = "no-store";

    try {
      const d1 = env?.DB;

      if (!d1) {
        return {
          error: "Database not available",
          leads: [],
        };
      }

      const db = createD1Client(d1 as D1Database);
      const allLeads = await db.select().from(leadsTable).orderBy(desc(leadsTable.created_at));

      return {
        leads: allLeads.map((row) => ({
          ...row,
          created_at: normalizeCreatedAtMs(row.created_at) ?? row.created_at,
        })),
      };
    } catch (_error) {
      return {
        error: "Failed to fetch leads",
        leads: [],
      };
    }
  })
  .delete(
    "/:id",
    async ({ params, set, store }) => {
      const env = (store as { env?: CfEnv }).env;
      set.headers["Cache-Control"] = "no-store";

      try {
        const d1 = env?.DB;

        if (!d1) {
          return {
            error: "Database not available",
            success: false,
          };
        }

        const db = createD1Client(d1 as D1Database);
        const result = await db.delete(leadsTable).where(eq(leadsTable.id, params.id)).returning();

        return {
          success: result.length > 0,
          deletedId: params.id,
       .post(
    "",
    // biome-ignore lint/suspicious/noExplicitAny: Elysia handler context inferred at runtime
    async ({ body, set, store, request }: any) => {
      const ctx = store.ctx;
      const env = (store as { env?: CfEnv }).env;
      set.headers["Cache-Control"] = "no-store";

      // Rate limiting: 5 requests per IP per hour for leads
      const clientIp =
        request.headers.get("cf-connecting-ip") ||
        request.headers.get("x-forwarded-for") ||
        "unknown";
      const rateLimitKey = `leads:${clientIp}`;
      const retryAfterSeconds = checkLocalRateLimit(rateLimitKey, 5, 3600000); // 5 requests per hour
      if (retryAfterSeconds) {
        set.status = 429;
        set.headers["Retry-After"] = String(retryAfterSeconds);
        return {
          error: `Too many lead submissions. Please wait ${retryAfterSeconds} seconds and try again.`,
          success: false,
        };
      }

      try {
        const d1 = env?.DB;

        if (!d1) {
          return {
            error: "Database not available",
            success: false,
          };
        }

        const db = createD1Client(d1 as D1Database);

        // 1. SEPARATE CORE FIELDS FROM CUSTOM FIELDS
        // Everything not explicitly named gets swept into 'customFields'
        const { email, company, website, sourceId, lang, ...customFields } = body;

        // Ensure website field has https:// prepended if missing
        let finalWebsite = website;
        if (finalWebsite && !finalWebsite.startsWith("http")) {
          finalWebsite = `https://${finalWebsite}`;
        }

        // 2. THE JSON PACKER
        // Combine 'lang' and any unknown custom fields into one object
        const metadataObj = { ...customFields };
        if (lang) metadataObj.lang = lang;
        
        // Stringify if we actually caught anything, otherwise null
        const metadata = Object.keys(metadataObj).length > 0 ? JSON.stringify(metadataObj) : null;

        // First: Execute the D1 insertion via Drizzle
        const result = await db
          .insert(leadsTable)
          .values({
            id: crypto.randomUUID(),
            email: email || "No Email Provided",         // Fallback prevents SQL NOT NULL crashes
            company_name: company || "Unknown Name",     // Fallback prevents SQL NOT NULL crashes
            source: sourceId || "Contact_Form",
            status: "New" as const,
            metadata: metadata,                          // <--- THE LIMITLESS JSON BUCKET
            created_at: Date.now(),
          })
          .returning();

        // Second: Pass the Slack webhook fetch call into background execution
        if (process.env.SLACK_WEBHOOK_URL) {
          const slackPayload = {
            text: `New lead created: ${email || 'Unknown'} from ${company || 'Unknown'}${lang ? ` [${lang}]` : ""}`,
            lead: {
              email: email || "N/A",
              company: company || "N/A",
              website: finalWebsite || "N/A",
              source: sourceId || "Contact_Form",
              ...metadataObj // Send all the custom fields to your Slack notification too!
            },
          };

          ctx.waitUntil(
            fetch(process.env.SLACK_WEBHOOK_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(slackPayload),
            }).catch((_error) => {})
          );
        }

        // Third: Return success immediately after DB insert
        return {
          success: result.length > 0,
          lead: result[0],
        };
      } catch (_error) {
        return {
          error: "Failed to create lead",
          success: false,
        };
      }
    },
    {
      // 3. THE LOOSE BOUNCER
      body: t.Object({
        email: t.Optional(t.String()),
        company: t.Optional(t.String()),
        website: t.Optional(t.String()),
        sourceId: t.Optional(t.String()),
        lang: t.Optional(t.String()),
      }, { additionalProperties: true }) // <--- THIS ENABLES THE MULTI-TENANT CATCH-ALL
    }
  );