export const dynamic = "force-dynamic";

import { formatLeadDashboardDate } from "@dba/shared/lib/createdAt";
import { Logo } from "@/components/Logo";

interface Lead {
  id: string;
  email: string;
  company_name: string | null;
  source: string;
  status: string;
  created_at: number;
}

interface Transaction {
  stripe_session_id: string;
  customer_email: string | null;
  amount_total: number | null;
  plan_name: string | null;
  status: string | null;
  created_at: number;
}

export default async function AdminLedgerPage() {
  let leadRows: Lead[] = [];
  let txRows: Transaction[] = [];

  try {
    // Fetch leads from API
    const apiBaseUrl =
      process.env.NODE_ENV === "production"
        ? "https://dba-api.anthony-6b4.workers.dev"
        : "http://localhost:8787";

    const response = await fetch(`${apiBaseUrl}/leads`, {
      headers: {
        "Cache-Control": "no-store",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch leads: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    leadRows = data.leads || [];
  } catch (_error) {
    leadRows = [];
  }

  // Note: Transactions fetching would be added here if there's a transactions endpoint
  // For now, keeping txRows empty as there's no transactions API endpoint visible
  txRows = [];

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <span
          className="inline-flex min-w-0"
          role="img"
          aria-label="ANTHONY. | Digital Infrastructure Architect"
        >
          <Logo variant="dialog" />
        </span>
        <p className="font-[family-name:var(--font-inter)] text-sm text-brand-charcoal/65 md:text-right md:max-w-xs">
          The Vault · Pipeline ledger
        </p>
      </div>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-brand-indigo">
          315 Pipeline
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-[rgba(26,42,64,0.1)] bg-[#f8f9fa] shadow-[0_8px_28px_-18px_rgba(26,42,64,0.18)]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[rgba(26,42,64,0.1)]">
                <th className="font-[family-name:var(--font-playfair)] px-4 py-3 text-left text-[0.72rem] font-bold uppercase tracking-[0.06em] text-brand-indigo">
                  Email
                </th>
                <th className="font-[family-name:var(--font-playfair)] px-4 py-3 text-left text-[0.72rem] font-bold uppercase tracking-[0.06em] text-brand-indigo">
                  Company
                </th>
                <th className="font-[family-name:var(--font-playfair)] px-4 py-3 text-left text-[0.72rem] font-bold uppercase tracking-[0.06em] text-brand-indigo">
                  Source
                </th>
                <th className="font-[family-name:var(--font-playfair)] px-4 py-3 text-left text-[0.72rem] font-bold uppercase tracking-[0.06em] text-brand-indigo">
                  Status
                </th>
                <th className="font-[family-name:var(--font-playfair)] px-4 py-3 text-left text-[0.72rem] font-bold uppercase tracking-[0.06em] text-brand-indigo">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {leadRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center font-[family-name:var(--font-inter)] text-sm text-brand-charcoal/50"
                  >
                    No leads found in pipeline.
                  </td>
                </tr>
              ) : (
                leadRows.map((row) => (
                  <tr key={row.id} className="border-b border-[rgba(26,42,64,0.1)]">
                    <td className="px-4 py-3 align-middle font-[family-name:var(--font-inter)] text-[0.875rem] font-normal">
                      <a
                        href={`mailto:${row.email}`}
                        className="text-brand-indigo underline-offset-2 hover:underline"
                      >
                        {row.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 align-middle font-[family-name:var(--font-inter)] text-[0.875rem] font-normal text-brand-charcoal">
                      {row.company_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 align-middle font-[family-name:var(--font-inter)] text-[0.875rem] font-normal text-brand-charcoal">
                      {row.source}
                    </td>
                    <td className="px-4 py-3 align-middle font-[family-name:var(--font-inter)] text-[0.875rem] font-normal">
                      <span className="inline-flex rounded-full bg-[rgb(91_124_153/0.28)] px-3 py-1 text-xs font-medium text-white">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle font-[family-name:var(--font-inter)] text-[0.875rem] font-normal tabular-nums text-brand-charcoal/85">
                      {formatLeadDashboardDate(row.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-brand-indigo">
          Revenue Ledger
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-[rgba(26,42,64,0.1)] bg-[#f8f9fa] shadow-[0_8px_28px_-18px_rgba(26,42,64,0.18)]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[rgba(26,42,64,0.1)]">
                <th className="font-[family-name:var(--font-playfair)] px-4 py-3 text-left text-[0.72rem] font-bold uppercase tracking-[0.06em] text-brand-indigo">
                  Session
                </th>
                <th className="font-[family-name:var(--font-playfair)] px-4 py-3 text-left text-[0.72rem] font-bold uppercase tracking-[0.06em] text-brand-indigo">
                  Customer
                </th>
                <th className="font-[family-name:var(--font-playfair)] px-4 py-3 text-left text-[0.72rem] font-bold uppercase tracking-[0.06em] text-brand-indigo">
                  Amount (¢)
                </th>
                <th className="font-[family-name:var(--font-playfair)] px-4 py-3 text-left text-[0.72rem] font-bold uppercase tracking-[0.06em] text-brand-indigo">
                  Plan
                </th>
                <th className="font-[family-name:var(--font-playfair)] px-4 py-3 text-left text-[0.72rem] font-bold uppercase tracking-[0.06em] text-brand-indigo">
                  Status
                </th>
                <th className="font-[family-name:var(--font-playfair)] px-4 py-3 text-left text-[0.72rem] font-bold uppercase tracking-[0.06em] text-brand-indigo">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {txRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center font-[family-name:var(--font-inter)] text-sm text-brand-charcoal/50"
                  >
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                txRows.map((row) => (
                  <tr key={row.stripe_session_id} className="border-b border-[rgba(26,42,64,0.1)]">
                    <td className="max-w-[14rem] truncate px-4 py-3 font-mono text-xs text-brand-charcoal/80">
                      {row.stripe_session_id}
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-inter)] text-[0.875rem] font-normal">
                      {row.customer_email ? (
                        <a
                          href={`mailto:${row.customer_email}`}
                          className="text-brand-indigo underline-offset-2 hover:underline"
                        >
                          {row.customer_email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-inter)] text-[0.875rem] font-normal tabular-nums text-brand-charcoal">
                      {row.amount_total ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-inter)] text-[0.875rem] font-normal text-brand-charcoal">
                      {row.plan_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-inter)] text-[0.875rem] font-normal">
                      <span className="inline-flex rounded-full bg-[rgb(91_124_153/0.28)] px-3 py-1 text-xs font-medium text-white">
                        {row.status ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-inter)] text-[0.875rem] font-normal tabular-nums text-brand-charcoal/85">
                      {formatLeadDashboardDate(row.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
