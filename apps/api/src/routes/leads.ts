import { Elysia, t } from "elysia";
import { leads as leadsTable } from "@dba/shared/db/schema";
import { createD1Client } from "@dba/shared/db/client";
import { normalizeCreatedAtMs } from "@dba/shared/lib/createdAt";
import { desc, eq } from "drizzle-orm";
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

      const db = createD1Client(d1 as any);
      const allLeads = await db
        .select()
        .from(leadsTable)
        .orderBy(desc(leadsTable.created_at));

      return {
        leads: allLeads.map((row) => ({
          ...row,
          created_at: normalizeCreatedAtMs(row.created_at) ?? row.created_at,
        })),
      };
    } catch (error) {
      console.error("Error fetching leads:", error);
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

        const db = createD1Client(d1 as any);
        const result = await db
          .delete(leadsTable)
          .where(eq(leadsTable.id, params.id))
          .returning();

        return {
          success: result.length > 0,
          deletedId: params.id,
        };
      } catch (error) {
        console.error("Error deleting lead:", error);
        return {
          error: "Failed to delete lead",
          success: false,
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .post(
    "",
    async ({ body, set, store, request }: any) => {
      const ctx = store.ctx;
      const env = (store as { env?: CfEnv }).env;
      set.headers["Cache-Control"] = "no-store";

      // Rate limiting: 5 requests per IP per hour for leads
      const clientIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
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

        const db = createD1Client(d1 as any);

        // Ensure website field has https:// prepended if missing
        let website = body.website;
        if (website && !website.startsWith("https://")) {
          website = `https://${website}`;
        }

        // First: Execute the D1 insertion
        const result = await db
          .insert(leadsTable)
          .values({
            id: crypto.randomUUID(),
            email: body.email,
            company_name: body.company,
            source: "Contact_Form" as const,
            status: "New" as const,
            created_at: Date.now(),
          })
          .returning();

        // Second: Pass the Slack webhook fetch call into background execution
        if (process.env.SLACK_WEBHOOK_URL) {
          const slackPayload = {
            text: `New lead created: ${body.email} from ${body.company}`,
            lead: {
              email: body.email,
              company: body.company,
              website: website,
              source: body.sourceId || "Contact_Form"
            }
          };

          ctx.waitUntil(
            fetch(process.env.SLACK_WEBHOOK_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(slackPayload),
            }).catch(error => {
              console.error("Slack webhook failed in background:", error);
            })
          );
        }

        // Third: Return success immediately after DB insert
        return {
          success: result.length > 0,
          lead: result[0],
        };
      } catch (error) {
        console.error("Error creating lead:", error);
        return {
          error: "Failed to create lead",
          success: false,
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        company: t.String(),
        website: t.String({ format: "uri" }),
        sourceId: t.Optional(t.String()),
      }),
    },
  );
