"use client";

import type { Lead } from "@dba/shared/db/schema";
import { formatLeadDashboardDate } from "@dba/shared/lib/createdAt";
import { RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const rowBorder = "border-b border-[rgba(26,42,64,0.1)]";
const thBase =
  "font-[family-name:var(--font-playfair)] py-3 px-4 text-left text-[0.72rem] font-bold uppercase tracking-[0.06em] text-brand-indigo";
const tdBase =
  "py-3 px-4 align-middle font-[family-name:var(--font-inter)] text-[0.875rem] font-normal text-brand-charcoal";

function LeadStatusBadge({ status }: { status: string }) {
  const vaultActive = status === "Active_Client";
  return (
    <span
      className={
        vaultActive
          ? "inline-flex rounded-full bg-emerald-600/95 px-3 py-1 text-xs font-semibold text-white"
          : "inline-flex rounded-full bg-[rgb(91_124_153/0.28)] px-3 py-1 text-xs font-medium text-white"
      }
    >
      {vaultActive ? "Vault Active" : status}
    </span>
  );
}

function DeleteLeadButton({ leadId }: { leadId: string }) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_DBA_API_URL?.trim() ||
        (process.env.NODE_ENV === "production"
          ? "https://dba-api.anthony-6b4.workers.dev"
          : "http://localhost:8787");
      const response = await fetch(`${apiBaseUrl}/leads/${leadId}`, {
        method: "DELETE",
      });
      if (response.ok) window.location.reload();
      else alert("Failed to delete lead");
    } catch {
      alert("Error deleting lead");
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-red-600/90 transition-colors hover:text-red-700"
      title="Delete lead"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function UnlockVaultCell({
  lead,
  promoteLead,
}: {
  lead: Lead;
  promoteLead: (id: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (lead.status === "Active_Client") {
    return <span className="text-[0.8rem] text-brand-charcoal/35">—</span>;
  }

  const company = lead.company_name?.trim() || "this company";

  const onConfirm = async () => {
    setBusy(true);
    const out = await promoteLead(lead.id);
    setBusy(false);
    setOpen(false);
    if (out.ok) window.location.reload();
    else alert(out.error || "Promote failed");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[#5b7c99] px-3 py-1.5 text-[0.8rem] font-semibold text-[#f8f9fa] shadow-[0_6px_18px_-12px_rgba(26,42,64,0.45)] transition-colors hover:bg-[#1a2a40] disabled:opacity-60"
      >
        Unlock Vault
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,42,64,0.35)] p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vault-promote-title"
        >
          <div className="max-w-md rounded-2xl border border-[rgba(26,42,64,0.12)] bg-[#f8f9fa] p-6 shadow-[0_24px_60px_-40px_rgba(26,42,64,0.35)]">
            <h2
              id="vault-promote-title"
              className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#1a2a40]"
            >
              Promote to active client?
            </h2>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-brand-charcoal/85">
              Are you sure you want to promote{" "}
              <span className="font-semibold text-brand-indigo">{company}</span> to an active
              client? This will grant them Zero Trust access and email them a login link.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                className="rounded-lg border border-[rgba(26,42,64,0.15)] bg-white px-4 py-2 text-sm font-medium text-brand-charcoal hover:border-brand-accent/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void onConfirm()}
                disabled={busy}
                className="rounded-lg bg-[#5b7c99] px-4 py-2 text-sm font-semibold text-[#f8f9fa] hover:bg-[#1a2a40] disabled:opacity-60"
              >
                {busy ? "Working…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function LeadPipelineTable({
  leads,
  error,
  promoteLead,
}: {
  leads: Lead[];
  error: string | null;
  promoteLead: (id: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-brand-indigo">
          315 Pipeline
        </h2>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg border border-[rgba(26,42,64,0.12)] bg-white px-3 py-1.5 text-sm font-medium text-brand-charcoal shadow-[0_1px_2px_rgba(26,42,64,0.04)] transition-colors hover:border-brand-accent/40 hover:text-brand-indigo"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-[rgba(26,42,64,0.1)] bg-[#f8f9fa] shadow-[0_8px_28px_-18px_rgba(26,42,64,0.18)]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className={rowBorder}>
              <th className={thBase}>ID</th>
              <th className={thBase}>Email</th>
              <th className={thBase}>Company</th>
              <th className={thBase}>Status</th>
              <th className={thBase}>Created</th>
              <th className={thBase}>Vault</th>
              <th className={thBase}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} className={`${tdBase} py-8 text-center text-brand-charcoal/50`}>
                  {error ? "Failed to load leads" : "No leads found"}
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className={rowBorder}>
                  <td className={`${tdBase} font-mono text-xs text-brand-charcoal/80`}>
                    <Link
                      href={`/dashboard/leads/${lead.id}`}
                      className="text-brand-indigo underline-offset-2 hover:underline"
                    >
                      {lead.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className={tdBase}>
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-brand-indigo underline-offset-2 hover:underline"
                    >
                      {lead.email}
                    </a>
                  </td>
                  <td className={tdBase}>{lead.company_name ?? "—"}</td>
                  <td className={tdBase}>
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className={`${tdBase} tabular-nums text-brand-charcoal/85`}>
                    {formatLeadDashboardDate(lead.created_at)}
                  </td>
                  <td className={tdBase}>
                    <UnlockVaultCell lead={lead} promoteLead={promoteLead} />
                  </td>
                  <td className={tdBase}>
                    <DeleteLeadButton leadId={lead.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
