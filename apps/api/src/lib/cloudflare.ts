/**
 * SSOT: D1 `clients.email` drives Cloudflare Zero Trust Access group membership.
 * Requires: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN (Access: Groups Edit),
 * CLOUDFLARE_ACCESS_GROUP_ID, and DB binding.
 */

import { clients } from "@dba/shared/db/schema";
import { createD1Client } from "@dba/shared/db/client";

export type CloudflareVaultEnv = {
	DB?: D1Database;
	CLOUDFLARE_ACCOUNT_ID?: string;
	CLOUDFLARE_API_TOKEN?: string;
	CLOUDFLARE_ACCESS_GROUP_ID?: string;
};

/**
 * Replace Access group `include` rules so only D1 client emails remain (OTP targets).
 */
export async function syncCloudflareAccess(env: CloudflareVaultEnv): Promise<void> {
	const accountId = env.CLOUDFLARE_ACCOUNT_ID?.trim();
	const token = env.CLOUDFLARE_API_TOKEN?.trim();
	const groupId = env.CLOUDFLARE_ACCESS_GROUP_ID?.trim();
	const d1 = env.DB;

	if (!accountId || !token || !groupId || !d1) {
		console.warn(
			"[syncCloudflareAccess] Skipping: missing CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCESS_GROUP_ID, or DB.",
		);
		return;
	}

	const db = createD1Client(d1);
	const rows = await db.select({ email: clients.email }).from(clients);
	const seen = new Set<string>();
	const include = [];
	for (const r of rows) {
		const email = r.email.trim().toLowerCase();
		if (!email || seen.has(email)) continue;
		seen.add(email);
		include.push({ email: { email: r.email.trim() } });
	}

	const base = `https://api.cloudflare.com/client/v4/accounts/${accountId}/access/groups/${groupId}`;
	const getRes = await fetch(base, {
		headers: { Authorization: `Bearer ${token}` },
	});
	const getJson = (await getRes.json()) as {
		success?: boolean;
		result?: { name?: string };
		errors?: unknown[];
	};
	if (!getRes.ok || !getJson.result?.name) {
		console.error("[syncCloudflareAccess] Failed to read group:", getJson.errors ?? getRes.status);
		throw new Error("Cloudflare Access group read failed");
	}

	const patchRes = await fetch(base, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: getJson.result.name,
			include,
		}),
	});
	const patchJson = (await patchRes.json()) as { success?: boolean; errors?: unknown[] };
	if (!patchRes.ok || !patchJson.success) {
		console.error("[syncCloudflareAccess] Patch failed:", patchJson.errors ?? patchRes.status);
		throw new Error("Cloudflare Access group update failed");
	}
}
