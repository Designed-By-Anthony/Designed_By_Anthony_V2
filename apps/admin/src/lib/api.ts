import type { App } from "@dba/api";
import { edenTreaty } from "@elysiajs/eden";

export const api = edenTreaty<App>("https://dba-api.anthony-6b4.workers.dev");
