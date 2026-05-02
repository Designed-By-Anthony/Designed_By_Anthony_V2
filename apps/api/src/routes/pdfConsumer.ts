import { Elysia, t } from "elysia";
import { generatePdfWithAdobe, buildAdobePayload, type AdobePdfResult } from "@dba/shared/lighthouse/lib/adobePdf";
import { db } from "@dba/shared/lighthouse/lib/report-store";
import type { AuditData } from "../../../../packages/shared/src/lighthouse/auditReport";

// Mock the Cloudflare Workers environment for non-Worker environments
const env = typeof process !== "undefined" && process.env ? process.env : {
  ADOBE_CLIENT_SECRET: undefined,
  PDF_STORAGE: undefined,
  DB: undefined,
};

const workerBindings = env as unknown as {
  ADOBE_CLIENT_SECRET?: string;
  PDF_STORAGE?: R2Bucket;
  DB?: D1Database;
};

// ── Queue Message Type ───────────────────────────────────────────────

export type PdfGenerationJob = {
  jobId: string;
  reportId: string;
  clientEmail: string;
  leadName: string;
  company: string;
  location?: string;
};

// ── Consumer Worker (Processes Queue Messages) ────────────────────────

export const pdfConsumer = new Elysia({ aot: true })
  .post(
    "/api/internal/pdf/job",
    async ({ body, set }) => {
      const { jobId, reportId, clientEmail, leadName, company, location } = body as PdfGenerationJob;

      try {
        // Fetch audit data from KV/D1
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

        // Validate and build Adobe payload
        const payload = buildAdobePayload(auditData, reportId, clientEmail, leadName, company, location);

        // Call Adobe PDF Services
        const adobeRes = await generatePdfWithAdobe(
          payload,
          "8cde742b02ba424091893885ade16bac", // clientId
          workerBindings.ADOBE_CLIENT_SECRET as string, // from secret
          "7B73821369F60A5E0A495FC0@AdobeOrg", // orgId
          "7B73821369F60A5E0A495FC0@AdobeOrg", // accountId (same as orgId for now)
        );

        // Upload PDF to R2
        const r2Key = `reports/${reportId}.pdf`;
        await workerBindings.PDF_STORAGE?.put(r2Key, adobeRes.pdfBytes, {
          httpMetadata: { contentType: "application/pdf" },
        });

        // Generate public URL (accountId is not on the binding; use bucket name from wrangler.json)
        const r2Url = `https://pub-<ACCOUNT_ID>.r2.dev/${r2Key}`; // TODO: Replace <ACCOUNT_ID> with actual R2 account ID

        // Save metadata to D1
        await workerBindings.DB?.prepare(
          "INSERT INTO pdf_documents (id, report_id, r2_url, client_email, created_at) VALUES (?, ?, ?, ?, ?)",
        )
          .bind(jobId, reportId, r2Url, clientEmail, Date.now())
          .run();

        return { status: "completed", jobId, r2Url };
      } catch (err) {
        console.error(`PDF job ${jobId} failed:`, err);
        set.status = 500;
        return { status: "failed", jobId, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
    {
      body: t.Object({
        jobId: t.String(),
        reportId: t.String(),
        clientEmail: t.String(),
        leadName: t.String(),
        company: t.String(),
        location: t.Optional(t.String()),
      }),
    },
  );

// Export handler for Cloudflare Workers
export default {
  fetch: pdfConsumer.handle,
};