type SharedToolPlan = "free" | "paid" | "client" | "admin";

type SharedUserRow = {
	id: string;
	plan: SharedToolPlan;
	stripe_customer_id: string | null;
};

const PLAN_WEIGHT: Record<SharedToolPlan, number> = {
	free: 0,
	paid: 1,
	client: 2,
	admin: 3,
};

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

function maxPlan(current: SharedToolPlan, next: SharedToolPlan): SharedToolPlan {
	return PLAN_WEIGHT[current] >= PLAN_WEIGHT[next] ? current : next;
}

export async function upsertSharedUser(
	db: D1Database,
	input: {
		email: string;
		plan: SharedToolPlan;
		clerkId?: string | null;
		stripeCustomerId?: string | null;
	},
): Promise<void> {
	const email = normalizeEmail(input.email);
	const existing = await db
		.prepare("SELECT id, plan, stripe_customer_id FROM users WHERE lower(email) = ? LIMIT 1")
		.bind(email)
		.first<SharedUserRow>();

	if (!existing) {
		await db
			.prepare(
				"INSERT INTO users (id, clerk_id, email, plan, stripe_customer_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
			)
			.bind(
				crypto.randomUUID(),
				input.clerkId ?? null,
				email,
				input.plan,
				input.stripeCustomerId ?? null,
				Date.now(),
				Date.now(),
			)
			.run();
		return;
	}

	const nextPlan = maxPlan(existing.plan, input.plan);
	await db
		.prepare(
			"UPDATE users SET clerk_id = COALESCE(?, clerk_id), plan = ?, stripe_customer_id = COALESCE(?, stripe_customer_id), updated_at = ? WHERE id = ?",
		)
		.bind(
			input.clerkId ?? null,
			nextPlan,
			input.stripeCustomerId ?? null,
			Date.now(),
			existing.id,
		)
		.run();
}