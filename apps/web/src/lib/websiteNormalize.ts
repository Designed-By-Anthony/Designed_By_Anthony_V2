/** Normalize a bare domain or partial URL for API `format: "uri"` validation. */
export function normalizeWebsiteForApi(raw: string, emptyFallback = "https://designedbyanthony.com"): string {
	const t = raw.trim();
	if (!t) return emptyFallback;
	if (/^https?:\/\//i.test(t)) return t;
	return `https://${t}`;
}
