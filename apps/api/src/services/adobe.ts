import { buildAdobePayload, generatePdfWithAdobe } from "@dba/shared/lighthouse/lib/adobePdf";
import { db } from "@dba/shared/lighthouse/lib/report-store";
import type { AuditData } from "../../../../packages/shared/src/lighthouse/auditReport";

/**
 * Generate PDF using Adobe PDF Services REST API
 */
export async function generateAuditPdf(
  _jobId: string,
  reportId: string,
  targetUrl: string,
  clientEmail: string,
  leadName: string,
  company: string,
  location: string | undefined,
  // biome-ignore lint/suspicious/noExplicitAny: Cloudflare Workers env binding
  env: any
): Promise<{ pdfBuffer: ArrayBuffer; fileName: string }> {
  // Fetch audit data from Firestore
  const ref = db.collection("audit_reports").doc(reportId);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new Error(`Report ${reportId} not found`);
  }

  const raw = snap.data();
  if (!raw) {
    throw new Error(`Report ${reportId} has no data`);
  }

  const auditData = raw as unknown as AuditData;

  // Build Adobe payload
  const payload = buildAdobePayload(auditData, reportId, clientEmail, leadName, company, location);

  // Generate PDF using Adobe services
  const adobeResult = await generatePdfWithAdobe(
    payload,
    env.ADOBE_CLIENT_ID,
    env.ADOBE_CLIENT_SECRET,
    "7B73821369F60A5E0A495FC0@AdobeOrg", // orgId
    "7B73821369F60A5E0A495FC0@AdobeOrg" // accountId
  );

  // Create SEO-friendly file name
  const domainSlug = targetUrl
    .replace(/^https?:\/\//, "")
    .replace(/\//g, "-")
    .replace(/\./g, "-");
  const timestamp = Math.floor(Date.now() / 1000);
  const fileName = `${domainSlug}-performance-audit-${timestamp}.pdf`;

  return {
    pdfBuffer: adobeResult.pdfBytes,
    fileName,
  };
}
