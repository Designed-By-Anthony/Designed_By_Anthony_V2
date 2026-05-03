export const DEFAULT_PUBLIC_API_BASE_URL = "https://dba-api.anthony-6b4.workers.dev";
const LOCAL_PUBLIC_API_BASE_URL = "http://localhost:8787";

export function getPublicApiBaseUrl(): string {
  const configuredBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  if (configuredBase) return configuredBase;
  if (process.env.NODE_ENV !== "production") return LOCAL_PUBLIC_API_BASE_URL;
  return DEFAULT_PUBLIC_API_BASE_URL;
}

export function buildPublicApiUrl(path: `/${string}`): string {
  return `${getPublicApiBaseUrl()}${path}`;
}
