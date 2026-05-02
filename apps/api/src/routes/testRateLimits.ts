import { Elysia } from "elysia";
import { resetLocalRateLimitBuckets } from "@dba/shared/lighthouse/lib/http";

export const testRateLimitsRoute = new Elysia({ aot: false })
	.delete("/api/test/rate-limits", () => {
		resetLocalRateLimitBuckets();
		return { success: true };
	});
