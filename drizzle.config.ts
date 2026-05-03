import type { Config } from "drizzle-kit";

export default {
  schema: "./packages/shared/src/db/schema.ts",
  out: "./apps/api/migrations",
  dialect: "sqlite",
  driver: "d1-http",
} satisfies Config;
