/**
 * Observer pattern: any mutation schedules `syncCloudflareAccess` via waitUntil when provided.
 * For promote flows that must await sync before email, pass `skipDeferredSync: true` and call
 * `syncCloudflareAccess` yourself.
 */

import type { D1Client, NewClient } from "@dba/shared/db/client";
import { clients } from "@dba/shared/db/schema";
import { eq } from "drizzle-orm";
import type { CloudflareVaultEnv } from "../lib/cloudflare";
import { syncCloudflareAccess } from "../lib/cloudflare";

export type ClientMutationOptions = {
	skipDeferredSync?: boolean;
};

function scheduleSync(env: CloudflareVaultEnv, ctx?: ExecutionContext) {
	const p = syncCloudflareAccess(env).catch((e) =>
		console.error("[clients] syncCloudflareAccess failed:", e),
	);
	if (ctx?.waitUntil) ctx.waitUntil(p);
	else void p;
}

export async function insertClientRow(
	db: D1Client,
	env: CloudflareVaultEnv,
	row: NewClient,
	ctx: ExecutionContext | undefined,
	options?: ClientMutationOptions,
): Promise<void> {
	await db.insert(clients).values(row);
	if (!options?.skipDeferredSync) scheduleSync(env, ctx);
}

export async function deleteClientById(
	db: D1Client,
	env: CloudflareVaultEnv,
	id: string,
	ctx: ExecutionContext | undefined,
	options?: ClientMutationOptions,
): Promise<void> {
	await db.delete(clients).where(eq(clients.id, id));
	if (!options?.skipDeferredSync) scheduleSync(env, ctx);
}

export async function deleteClientByEmail(
	db: D1Client,
	env: CloudflareVaultEnv,
	email: string,
	ctx: ExecutionContext | undefined,
	options?: ClientMutationOptions,
): Promise<void> {
	await db.delete(clients).where(eq(clients.email, email));
	if (!options?.skipDeferredSync) scheduleSync(env, ctx);
}
