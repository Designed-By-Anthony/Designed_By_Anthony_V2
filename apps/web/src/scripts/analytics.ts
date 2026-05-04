/**
 * Analytics helpers — edge-loaded analytics (Zaraz / GTM via Workers)
 * replaced the inline GA4 bootstrap. These exports remain as no-ops
 * so existing call-sites (audit-forms, site.ts, etc.) compile without changes.
 */

export type AnalyticsEventProperties = Record<string, string | number | boolean | null | undefined>;

export const GA_MEASUREMENT_ID = "";

export function appendAsyncScript(_id: string, _src: string): void {}

export function pushAnalyticsEvent(_event: string, _payload: AnalyticsEventProperties = {}): void {}

export function initDeferredThirdPartyLoader(): void {}

export function requestGaClientId(): Promise<string | null> {
  return Promise.resolve(null);
}
