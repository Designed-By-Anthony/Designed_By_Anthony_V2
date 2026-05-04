interface Env {
  DB: D1Database;
  AUDIT_REPORTS_KV: KVNamespace;
  PDF_STORAGE: R2Bucket;
  PDF_GEN_QUEUE: Queue;
  CF_PAGES_BRANCH: string;
  /** Google PageSpeed Insights API key (set via `wrangler secret put`) */
  GOOGLE_PAGESPEED_API_KEY?: string;
  [key: string]: unknown;
}
