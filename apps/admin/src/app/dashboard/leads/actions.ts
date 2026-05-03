"use server";

export async function promoteLeadToVault(leadId: string): Promise<{ ok: boolean; error?: string }> {
  const apiBase =
    process.env.DBA_API_URL?.trim() ||
    (process.env.NODE_ENV === "production"
      ? "https://dba-api.anthony-6b4.workers.dev"
      : "http://localhost:8787");
  const secret = process.env.ADMIN_PROMOTE_SECRET?.trim();
  if (!secret) {
    return {
      ok: false,
      error:
        "ADMIN_PROMOTE_SECRET is not set on the admin app (server env). Add it to `.env.local`.",
    };
  }

  try {
    const res = await fetch(`${apiBase}/api/admin/promote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ lead_id: leadId }),
      cache: "no-store",
    });

    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
    };

    if (!res.ok) {
      return {
        ok: false,
        error: typeof data.error === "string" ? data.error : `Request failed (${res.status})`,
      };
    }

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}
