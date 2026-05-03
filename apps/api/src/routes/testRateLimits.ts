import { resetLocalRateLimitBuckets } from "@dba/shared/lighthouse/lib/http";
import { Elysia } from "elysia";

export const testRateLimitsRoute = new Elysia({ aot: false }).delete(
  "/api/test/rate-limits",
  () => {
    resetLocalRateLimitBuckets();
    return { success: true };
  }
);
