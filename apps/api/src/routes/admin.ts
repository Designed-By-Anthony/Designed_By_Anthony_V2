import { createD1Client } from "@dba/shared/db/client";
import { clients, leads, projects } from "@dba/shared/db/schema";
import {
  isResendConfigured,
  sendTransactionalEmail,
} from "@dba/shared/lighthouse/lib/transactionalResend";
import { eq, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { insertClientRow } from "../db/clients";
import { syncCloudflareAccess } from "../lib/cloudflare";

interface CfEnv {
  DB?: D1Database;
  VAULT_PUBLIC_URL?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCESS_GROUP_ID?: string;
}

function vaultUnlockEmailHtml(vaultUrl: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8f9fa;font-family:Inter,system-ui,sans-serif;color:#1a2a40;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f9fa;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#ffffff;border:1px solid rgba(26,42,64,0.1);border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(26,42,64,0.04);">
        <tr><td style="padding:28px 28px 12px;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#5b7c99;">ANTHONY.</td></tr>
        <tr><td style="padding:8px 28px 8px;font-size:22px;font-weight:700;color:#1a2a40;">Welcome. Your Vault is unlocked.</td></tr>
        <tr><td style="padding:8px 28px 24px;font-size:15px;line-height:1.65;color:#334155;">
          Welcome to ANTHONY. Your infrastructure dashboard is now live.<br/><br/>
          <a href="${vaultUrl}" style="display:inline-block;padding:12px 22px;background:#5b7c99;color:#f8f9fa;text-decoration:none;font-weight:600;border-radius:10px;">Open your Vault</a><br/><br/>
          <span style="font-size:13px;color:#64748b;">Direct link: <a href="${vaultUrl}" style="color:#5b7c99;">${vaultUrl}</a></span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export const adminRoute = new Elysia({ prefix: "/api/admin" }).post(
  "/promote",
  async ({ request, body, set, store }) => {
    set.headers["Cache-Control"] = "no-store";

    const secret = process.env.ADMIN_PROMOTE_SECRET?.trim();
    const auth = request.headers.get("authorization")?.trim() ?? "";
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";

    if (secret) {
      if (bearer !== secret) {
        set.status = 401;
        return { error: "Unauthorized." };
      }
    } else {
      set.status = 503;
      return { error: "Admin promote is not configured." };
    }

    const env = (store as { env?: CfEnv }).env;
    const d1 = env?.DB;
    if (!d1) {
      set.status = 503;
      return { error: "Database not available." };
    }

    const db = createD1Client(d1 as D1Database);

    const leadRows = await db.select().from(leads).where(eq(leads.id, body.lead_id)).limit(1);

    const lead = leadRows[0];
    if (!lead) {
      set.status = 404;
      return { error: "Lead not found." };
    }

    if (lead.status === "Active_Client") {
      return { ok: true, alreadyPromoted: true };
    }

    const emailStored = lead.email.trim().toLowerCase();

    const existing = await db
      .select()
      .from(clients)
      .where(sql`lower(${clients.email}) = ${emailStored}`)
      .limit(1);

    let clientId: string;

    if (existing.length > 0) {
      clientId = existing[0]?.id;
      await db
        .update(clients)
        .set({
          email: emailStored,
          company_name: lead.company_name ?? existing[0]?.company_name,
        })
        .where(eq(clients.id, clientId));
    } else {
      clientId = crypto.randomUUID();
      await insertClientRow(
        db,
        env,
        {
          id: clientId,
          email: emailStored,
          company_name: lead.company_name ?? null,
          created_at: Date.now(),
        },
        undefined,
        { skipDeferredSync: true }
      );
    }

    const projExisting = await db
      .select()
      .from(projects)
      .where(eq(projects.client_id, clientId))
      .limit(1);

    if (projExisting.length === 0) {
      await db.insert(projects).values({
        id: crypto.randomUUID(),
        client_id: clientId,
        staging_url: null,
        edge_ranking: null,
        last_audit_json: null,
        updated_at: Date.now(),
      });
    }

    await db.update(leads).set({ status: "Active_Client" }).where(eq(leads.id, lead.id));

    await syncCloudflareAccess(env);

    const vaultUrl = env?.VAULT_PUBLIC_URL?.trim() || "https://designedbyanthony.com/vault";

    if (!isResendConfigured()) {
      set.status = 500;
      return {
        error: "Vault access synced, but transactional email is not configured.",
      };
    }

    await sendTransactionalEmail({
      to: lead.email,
      subject: "Welcome. Your Vault is unlocked.",
      html: vaultUnlockEmailHtml(vaultUrl),
      text: `Welcome to ANTHONY. Your infrastructure dashboard is now live. Access it here: ${vaultUrl}`,
    });

    return { ok: true };
  },
  {
    body: t.Object({
      lead_id: t.String({ minLength: 1 }),
    }),
  }
);
