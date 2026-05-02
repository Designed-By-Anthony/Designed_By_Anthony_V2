import { edenTreaty } from "@elysiajs/eden";
import type { App } from "@dba/api";

export const api = edenTreaty<App>("https://dba-api.anthony-6b4.workers.dev");
