import { createD1Client } from "@dba/shared/db/client";
import { clients, projects, vault_messages } from "@dba/shared/db/schema";
import {
  isResendConfigured,
  sendTransactionalEmail,
} from "@dba/shared/lighthouse/lib/transactionalResend";
import { desc, eq, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";

interface CfEnv {
  DB?: D1Database;
  /** Inbound address for Vault Direct Line alerts (defaults to anthony@designedbyanthony.com). */
  VAULT_DIRECT_LINE_INBOX?: string;
}

const MESSAGE_MAX_LEN = 8000;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeVaultMessage(raw: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional sanitization of C0 control characters
  const controlChars = /[\x00-\x08\x0b\x0c\x0e-\x1f]/g;
  return raw.replace(/\r\n/g, "\n").replace(controlChars, "").trim().slice(0, MESSAGE_MAX_LEN);
}

async function resolveVaultClient(db: ReturnType<typeof createD1Client>, accessEmailLower: string) {
  const cRows = await db
    .select()
    .from(clients)
    .where(sql`lower(${clients.email}) = ${accessEmailLower}`)
    .limit(1);
  return cRows[0] ?? null;
}

export const vaultRoute = new Elysia({ prefix: "/api/vault" })
  .get("/project", async ({ request, set, store }) => {
    set.headers["Cache-Control"] = "no-store";

    const raw = request.headers.get("cf-access-authenticated-user-email")?.trim();
    if (!raw) {
      set.status = 401;
      return { error: "Not authenticated with Cloudflare Access." };
    }

    const email = raw.toLowerCase();
    const env = (store as { env?: CfEnv }).env;
    if (!env?.DB) {
      set.status = 503;
      return { error: "Database not available." };
    }

    const db = createD1Client(env.DB as D1Database);

    const client = await resolveVaultClient(db, email);
    if (!client) {
      set.status = 404;
      return { error: "No vault project linked to this identity." };
    }

    const pRows = await db
      .select()
      .from(projects)
      .where(eq(projects.client_id, client.id))
      .orderBy(desc(projects.updated_at))
      .limit(1);

    const project = pRows[0];

    return {
      email: client.email,
      company_name: client.company_name,
      staging_url: project?.staging_url ?? null,
      edge_ranking: project?.edge_ranking ?? null,
      last_audit_json: project?.last_audit_json ?? null,
    };
  })
  .post(
    "/message",
    async ({ request, body, set, store }) => {
      set.headers["Cache-Control"] = "no-store";

      const raw = request.headers.get("cf-access-authenticated-user-email")?.trim();
      if (!raw) {
        set.status = 401;
        return { error: "Not authenticated with Cloudflare Access." };
      }

      const accessEmail = raw.toLowerCase();
      const env = (store as { env?: CfEnv }).env;
      if (!env?.DB) {
        set.status = 503;
        return { error: "Database not available." };
      }

      const messageText = sanitizeVaultMessage(body.message_text);
      if (!messageText) {
        set.status = 400;
        return { error: "Message cannot be empty." };
      }

      const db = createD1Client(env.DB as D1Database);
      const client = await resolveVaultClient(db, accessEmail);
      if (!client) {
        set.status = 404;
        return { error: "No vault project linked to this identity." };
      }

      const clientLabel = client.company_name?.trim() || client.email || "Client";

      const id = crypto.randomUUID();
      await db.insert(vault_messages).values({
        id,
        client_id: client.id,
        message_text: messageText,
        created_at: Date.now(),
      });

      if (!isResendConfigured()) {
        set.status = 500;
        return {
          error: "Message was saved but notifications are not configured. Contact support.",
        };
      }

      const inbox =
        env.VAULT_DIRECT_LINE_INBOX?.trim() ||
        process.env.VAULT_DIRECT_LINE_INBOX?.trim() ||
        "anthony@designedbyanthony.com";

      const summaryLine = `Priority Vault Message from ${clientLabel}: ${messageText}`;
      const subject = summaryLine.length > 180 ? `${summaryLine.slice(0, 177)}…` : summaryLine;

      await sendTransactionalEmail({
        to: inbox,
        subject,
        html: `<p style="font-family:system-ui,sans-serif;line-height:1.5;color:#1a2a40;"><strong>Priority Vault Message</strong></p>
<p style="font-family:system-ui,sans-serif;color:#334155;"><strong>Client:</strong> ${escapeHtml(clientLabel)}<br/><strong>Email:</strong> ${escapeHtml(client.email)}</p>
<p style="font-family:system-ui,sans-serif;white-space:pre-wrap;color:#1e293b;">${escapeHtml(messageText)}</p>`,
        text: `${summaryLine}\n\nClient email: ${client.email}`,
      });

      return { ok: true };
    },
    {
      body: t.Object({
        message_text: t.String({ minLength: 1, maxLength: MESSAGE_MAX_LEN }),
      }),
    }
  );
