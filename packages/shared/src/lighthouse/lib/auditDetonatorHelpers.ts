import type { AuditAiInsight, AuditData } from "../auditReport";
import type { LighthouseAuditEntry, LighthousePayload } from "./auditPsi";

function categoryScore(block?: { score?: number | null }): number | null {
  if (block?.score == null || Number.isNaN(block.score)) return null;
  return Math.round(Math.min(1, Math.max(0, block.score)) * 100);
}

function auditMetric(audits: Record<string, LighthouseAuditEntry> | undefined, id: string): string {
  const a = audits?.[id];
  if (a?.displayValue) return String(a.displayValue);
  return "—";
}

function pickCriticalIssue(audits: Record<string, LighthouseAuditEntry> | undefined): string {
  if (!audits) return "";
  const perfIds = [
    "largest-contentful-paint",
    "first-contentful-paint",
    "cumulative-layout-shift",
    "total-blocking-time",
    "speed-index",
    "interactive",
  ];
  for (const id of perfIds) {
    const a = audits[id];
    if (a && typeof a.score === "number" && a.score < 0.9 && a.title) {
      return a.title;
    }
  }
  return "";
}

function countWeakAudits(audits: Record<string, LighthouseAuditEntry> | undefined): number {
  if (!audits) return 0;
  let n = 0;
  for (const a of Object.values(audits)) {
    if (a.scoreDisplayMode === "numeric" && typeof a.score === "number" && a.score < 0.9) {
      n++;
    }
  }
  return n;
}

/**
 * Minimal `AuditData` from PSI lab JSON + short Gemini summary (for jsPDF blueprint).
 */
export function lighthousePayloadToAuditData(
  url: string,
  lighthouse: LighthousePayload,
  psiDegradedReason: string | null,
  summaryPlainText: string
): AuditData {
  const c = lighthouse.categories;
  const performance = categoryScore(c?.performance);
  const accessibility = categoryScore(c?.accessibility);
  const bestPractices = categoryScore(c?.["best-practices"]);
  const seo = categoryScore(c?.seo);
  const scores = [performance, accessibility, bestPractices, seo].filter(
    (x): x is number => x != null
  );
  const trustScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 50;

  const audits = lighthouse.audits;
  const failedAuditCount = countWeakAudits(audits);
  const criticalIssue =
    pickCriticalIssue(audits) ||
    (failedAuditCount > 0
      ? `${failedAuditCount} lab checks scored below target`
      : "Review detailed Lighthouse audits for residual risk.");

  const aiInsight: AuditAiInsight = {
    executiveSummary: summaryPlainText,
    conversionScore: trustScore,
    strengths: [],
    weaknesses: [],
    prioritizedActions: [],
    copywritingAnalysis: "",
  };

  return {
    url: lighthouse.finalUrl || url,
    trustScore,
    performance,
    accessibility,
    bestPractices: bestPractices,
    seo,
    conversion: trustScore,
    metrics: {
      fcp: auditMetric(audits, "first-contentful-paint"),
      lcp: auditMetric(audits, "largest-contentful-paint"),
      tbt: auditMetric(audits, "total-blocking-time"),
      cls: auditMetric(audits, "cumulative-layout-shift"),
    },
    psiDegradedReason,
    aiInsight,
    diagnostics: {
      failedAuditCount,
      criticalIssue,
    },
  };
}
