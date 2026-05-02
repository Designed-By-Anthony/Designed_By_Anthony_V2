export const dynamic = "force-dynamic";

import { Logo } from "@/components/Logo";

interface Lead {
  id: string;
  email: string;
  company_name: string | null;
  source: string;
  status: string;
  created_at: number;
}

export default async function AdminLedgerPage() {
	let leadRows: Lead[] = [];
	let txRows: any[] = [];

	try {
		// Fetch leads from API
		const apiBaseUrl = process.env.NODE_ENV === 'production'
			? 'https://dba-api.anthony-6b4.workers.dev'
			: 'http://localhost:8787';

		const response = await fetch(`${apiBaseUrl}/leads`, {
			headers: {
				'Cache-Control': 'no-store'
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch leads: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		leadRows = data.leads || [];
	} catch (error) {
		console.error("Error fetching leads from API:", error);
		leadRows = [];
	}

	// Note: Transactions fetching would be added here if there's a transactions endpoint
	// For now, keeping txRows empty as there's no transactions API endpoint visible
	txRows = [];

	return (
		<main className="mx-auto max-w-7xl px-6 py-12">
			<div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<span className="inline-flex min-w-0" role="img" aria-label="ANTHONY. | Digital Infrastructure Architect">
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
				<div className="text-bubble is-bordered mt-4 overflow-x-auto">
					<table className="w-full border-collapse text-left text-sm font-[family-name:var(--font-inter)] text-brand-charcoal">
						<thead>
							<tr className="border-b border-brand-border">
								<th className="font-[family-name:var(--font-playfair)] py-2 pr-4 font-semibold text-brand-indigo">
									Email
								</th>
								<th className="font-[family-name:var(--font-playfair)] py-2 pr-4 font-semibold text-brand-indigo">
									Company
								</th>
								<th className="font-[family-name:var(--font-playfair)] py-2 pr-4 font-semibold text-brand-indigo">
									Source
								</th>
								<th className="font-[family-name:var(--font-playfair)] py-2 pr-4 font-semibold text-brand-indigo">
									Status
								</th>
								<th className="font-[family-name:var(--font-playfair)] py-2 pr-4 font-semibold text-brand-indigo">
									Created
								</th>
							</tr>
						</thead>
        <tbody>
          {leadRows.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-brand-charcoal/50">
                No leads found in pipeline.
              </td>
            </tr>
          ) : (
								leadRows.map((row) => (
									<tr key={row.id} className="border-b border-brand-border/60">
										<td className="py-2 pr-4">{row.email}</td>
										<td className="py-2 pr-4">{row.company_name ?? "—"}</td>
										<td className="py-2 pr-4">{row.source}</td>
										<td className="py-2 pr-4">{row.status}</td>
										<td className="py-2 pr-4 tabular-nums">
											{row.created_at != null
												? new Date(row.created_at).toISOString()
												: "—"}
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
				<div className="text-bubble is-bordered mt-4 overflow-x-auto">
					<table className="w-full border-collapse text-left text-sm font-[family-name:var(--font-inter)] text-brand-charcoal">
						<thead>
							<tr className="border-b border-brand-border">
								<th className="font-[family-name:var(--font-playfair)] py-2 pr-4 font-semibold text-brand-indigo">
									Session
								</th>
								<th className="font-[family-name:var(--font-playfair)] py-2 pr-4 font-semibold text-brand-indigo">
									Customer
								</th>
								<th className="font-[family-name:var(--font-playfair)] py-2 pr-4 font-semibold text-brand-indigo">
									Amount (¢)
								</th>
								<th className="font-[family-name:var(--font-playfair)] py-2 pr-4 font-semibold text-brand-indigo">
									Plan
								</th>
								<th className="font-[family-name:var(--font-playfair)] py-2 pr-4 font-semibold text-brand-indigo">
									Status
								</th>
								<th className="font-[family-name:var(--font-playfair)] py-2 pr-4 font-semibold text-brand-indigo">
									Created
								</th>
							</tr>
						</thead>
						<tbody>
							{txRows.length === 0 ? (
								<tr>
									<td colSpan={6} className="py-6 text-brand-charcoal/50">
										No transactions yet.
									</td>
								</tr>
							) : (
								txRows.map((row) => (
									<tr
										key={row.stripe_session_id}
										className="border-b border-brand-border/60"
									>
										<td className="max-w-[14rem] truncate py-2 pr-4 font-mono text-xs">
											{row.stripe_session_id}
										</td>
										<td className="py-2 pr-4">{row.customer_email ?? "—"}</td>
										<td className="py-2 pr-4 tabular-nums">
											{row.amount_total ?? "—"}
										</td>
										<td className="py-2 pr-4">{row.plan_name ?? "—"}</td>
										<td className="py-2 pr-4">{row.status ?? "—"}</td>
										<td className="py-2 pr-4 tabular-nums">
											{row.created_at != null
												? new Date(row.created_at).toISOString()
												: "—"}
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
