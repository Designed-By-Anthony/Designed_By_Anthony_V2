const SIMPLE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeText(input: unknown, maxLength = 160): string {
  if (typeof input !== "string") {
    return "";
  }

  return input.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function normalizeEmail(input: unknown): string | null {
  if (typeof input !== "string") {
    return null;
  }

  const value = input.trim().toLowerCase();
  if (!value || value.length > 320 || /[\r\n]/.test(value)) {
    return null;
  }

  return SIMPLE_EMAIL_REGEX.test(value) ? value : null;
}

export function normalizeHttpUrl(input: unknown): string | null {
  if (typeof input !== "string") {
    return null;
  }

  const raw = input.trim();
  if (!raw || raw.length > 2048 || /[\r\n]/.test(raw)) {
    return null;
  }

  // Reject any explicit non-http(s) scheme (e.g. ftp://, file://, javascript:)
  if (/^[a-z][a-z0-9+\-.]*:\/\//i.test(raw) && !/^https?:\/\//i.test(raw)) {
    return null;
  }

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(candidate);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname) {
      return null;
    }

    // Reject path-traversal hostnames (e.g. "../../etc/passwd" → hostname "..").
    // Leading dots and dashes are also rejected as they are invalid DNS labels.
    if (url.hostname.includes("..") || url.hostname.startsWith(".") || url.hostname.startsWith("-")) {
      return null;
    }

    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
