import { db } from "@dba/shared/lighthouse/lib/report-store";
import { isValidReportId } from "@dba/shared/lighthouse/lib/reportId";
import { Elysia, t } from "elysia";

// Mock the Cloudflare Workers environment for non-Worker environments
const env =
  typeof process !== "undefined" && process.env
    ? process.env
    : {
        PDF_GEN_QUEUE: undefined,
        DB: undefined,
      };

const workerBindings = env as unknown as {
  PDF_GEN_QUEUE?: Queue;
  DB?: D1Database;
};

// Simple UUID v4 generator (no external dependency)
function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Producer Route (Enqueue Job) ───────────────────────────────────────

export const reportPdfRoute = new Elysia({ aot: false })
  .post(
    "/api/report/:id/pdf",
    async ({ params, set, body }) => {
      const { id } = params;
      const { clientEmail, leadName, company, location } = body;

      if (!isValidReportId(id)) {
        set.status = 400;
        return { error: "Invalid report ID format" };
      }

      // Verify report exists
      const ref = db.collection("audit_reports").doc(id);
      const snap = await ref.get();
      if (!snap.exists) {
        set.status = 404;
        return { error: "Report not found" };
      }

      const jobId = uuidv4();

      // Enqueue job to Cloudflare Queue
      await workerBindings.PDF_GEN_QUEUE?.send({
        jobId,
        reportId: id,
        clientEmail,
        leadName,
        company,
        location,
      });

      // Return 202 Accepted immediately
      set.status = 202;
      return {
        jobId,
        message: "Polishing your professional report...",
        statusUrl: `/api/pdf/status/${jobId}`,
      };
    },
    {
      body: t.Object({
        clientEmail: t.String({ format: "email" }),
        leadName: t.String(),
        company: t.String(),
        location: t.Optional(t.String()),
      }),
    }
  )
  .get("/api/pdf/status/:jobId", async ({ params }) => {
    const { jobId } = params;
    // Query D1 for job status
    const stmt = workerBindings.DB?.prepare(
      "SELECT status, r2_url FROM pdf_documents WHERE id = ?"
    );
    const result = await stmt?.bind(jobId).first<{ status?: string; r2_url?: string }>();

    if (!result) {
      return { status: "pending", message: "Your report is being generated..." };
    }

    if (result.status === "completed" && result.r2_url) {
      return {
        status: "completed",
        downloadUrl: result.r2_url,
        message: "Your report is ready!",
      };
    }

    return { status: "processing", message: "Still working on your report..." };
  });

// Export handler for Cloudflare Workers
export default {
  fetch: reportPdfRoute.handle,
};
