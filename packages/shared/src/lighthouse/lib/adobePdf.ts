import { z } from "zod";
import type { AuditData } from "../auditReport";

// ── Adobe PDF Services API Client (Native Fetch) ─────────────────────────

const ADOBE_IMS_TOKEN_URL = "https://ims-na1.adobelogin.com/ims/token/v3";
const ADOBE_PDF_SERVICES_API = "https://pdf-services.adobe.io";

// Zod schema to validate the JSON payload matches Adobe's expected "Tags"
export const AdobePdfPayloadSchema = z.object({
  audit: z.object({
    url: z.string().url(),
    trustScore: z.number().int().min(0).max(100),
    performance: z.number().int().min(0).max(100).nullable(),
    accessibility: z.number().int().min(0).max(100).nullable(),
    bestPractices: z.number().int().min(0).max(100).nullable(),
    seo: z.number().int().min(0).max(100).nullable(),
    conversion: z.number().int().min(0).max(100),
    metrics: z.object({
      fcp: z.string(),
      lcp: z.string(),
      tbt: z.string(),
      cls: z.string(),
    }),
    psiDegradedReason: z.string().nullable(),
    aiInsight: z
      .object({
        executiveSummary: z.string(),
        conversionScore: z.number().int().min(0).max(100),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        prioritizedActions: z.array(
          z.object({
            priority: z.number().int().positive(),
            action: z.string(),
            impact: z.enum(["high", "medium", "low"]),
            effort: z.enum(["high", "medium", "low"]),
          })
        ),
        copywritingAnalysis: z.string(),
      })
      .nullable(),
    diagnostics: z
      .object({
        failedAuditCount: z.number().int().nonnegative(),
        criticalIssue: z.string(),
      })
      .nullable(),
    sitewide: z.any().nullable(),
    backlinks: z.any().nullable(),
    indexCoverage: z.any().nullable(),
    places: z.any().nullable(),
    competitors: z.array(z.any()).nullable(),
  }),
  lead: z.object({
    name: z.string(),
    email: z.string().email(),
    company: z.string(),
    url: z.string().url(),
    location: z.string().nullable(),
  }),
  reportId: z.string(),
  generatedAt: z.string().datetime(),
});

export type AdobePdfPayload = z.infer<typeof AdobePdfPayloadSchema>;

// Map AuditData to Adobe's expected payload structure
export function buildAdobePayload(
  data: AuditData,
  reportId: string,
  leadEmail: string,
  leadName: string,
  company: string,
  location?: string
): AdobePdfPayload {
  return AdobePdfPayloadSchema.parse({
    audit: {
      url: data.url,
      trustScore: data.trustScore,
      performance: data.performance,
      accessibility: data.accessibility,
      bestPractices: data.bestPractices,
      seo: data.seo,
      conversion: data.conversion,
      metrics: data.metrics,
      psiDegradedReason: data.psiDegradedReason ?? null,
      aiInsight: data.aiInsight ?? null,
      diagnostics: data.diagnostics ?? null,
      sitewide: data.sitewide ?? null,
      backlinks: data.backlinks ?? null,
      indexCoverage: data.indexCoverage ?? null,
      places: data.places ?? null,
      competitors: data.competitors ?? [],
    },
    lead: {
      name: leadName,
      email: leadEmail,
      company: company,
      url: data.url,
      location: location ?? null,
    },
    reportId,
    generatedAt: new Date().toISOString(),
  });
}

// ── OAuth2 Client Credentials Flow ─────────────────────────────────────

export async function getAccessToken(
  clientId: string,
  clientSecret: string,
  _orgId: string
): Promise<string> {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append(
    "scope",
    "openid,AdobeID,read_organizations,additional_info.projectedProductContext"
  );

  const res = await fetch(ADOBE_IMS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Adobe IMS token failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

// ── Adobe PDF Services Operations ────────────────────────────────────

export async function createUploadUrl(
  accessToken: string,
  _accountId: string
): Promise<{ uploadUri: string; assetId: string }> {
  const res = await fetch(`${ADOBE_PDF_SERVICES_API}/assets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-api-key": "client_id", // Adobe uses client_id as API key
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Create upload URL failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { uploadUri: string; assetId: string };
  return json;
}

export async function startDocumentGenerationJob(
  accessToken: string,
  _accountId: string,
  assetId: string,
  outputFormat: "pdf" = "pdf"
): Promise<{ jobId: string; pollingUrl: string }> {
  const res = await fetch(`${ADOBE_PDF_SERVICES_API}/operations/document-generation`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-api-key": "client_id",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assetID: assetId,
      outputFormat,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Start job failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { id: string; _links: { self: { href: string } } };
  return { jobId: json.id, pollingUrl: json._links.self.href };
}

export async function pollJobStatus(
  pollingUrl: string,
  accessToken: string
): Promise<{ status: string; resultUrl?: string }> {
  const res = await fetch(pollingUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Poll job failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { status: string; _links?: { result?: { href: string } } };
  return { status: json.status, resultUrl: json._links?.result?.href };
}

export async function downloadResult(resultUrl: string, accessToken: string): Promise<ArrayBuffer> {
  const res = await fetch(resultUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Download result failed (${res.status}): ${body}`);
  }

  return await res.arrayBuffer();
}

// ── Full Workflow ───────────────────────────────────────────────────────

export interface AdobePdfResult {
  pdfBytes: ArrayBuffer;
  jobId: string;
}

export async function generatePdfWithAdobe(
  payload: AdobePdfPayload,
  clientId: string,
  clientSecret: string,
  orgId: string,
  accountId: string
): Promise<AdobePdfResult> {
  const accessToken = await getAccessToken(clientId, clientSecret, orgId);
  const { uploadUri, assetId } = await createUploadUrl(accessToken, accountId);

  // Upload JSON payload to Adobe
  const uploadRes = await fetch(uploadUri, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!uploadRes.ok) {
    const body = await uploadRes.text();
    throw new Error(`Upload payload failed (${uploadRes.status}): ${body}`);
  }

  const { jobId, pollingUrl } = await startDocumentGenerationJob(accessToken, accountId, assetId);

  // Poll until job completes
  let statusRes: Awaited<ReturnType<typeof pollJobStatus>>;
  do {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s poll interval
    statusRes = await pollJobStatus(pollingUrl, accessToken);
  } while (statusRes.status === "in-progress" || statusRes.status === "pending");

  if (statusRes.status !== "done") {
    throw new Error(`Job failed with status: ${statusRes.status}`);
  }

  if (!statusRes.resultUrl) {
    throw new Error("Job completed but no result URL provided");
  }

  const pdfBytes = await downloadResult(statusRes.resultUrl, accessToken);
  return { pdfBytes, jobId };
}
