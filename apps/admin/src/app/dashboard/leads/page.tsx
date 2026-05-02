export const dynamic = "force-dynamic";

import { LeadPipelineTable } from "@/components/dashboard/LeadPipelineTable";
import { api } from "@/lib/api";
import { promoteLeadToVault } from "@/app/dashboard/leads/actions";
import { type Lead } from "@dba/shared/db/schema";

export default async function LeadsDashboardPage() {
	let leads: Lead[] = [];
	let error: string | null = null;

	try {
		const { data } = await api.leads.get();
		if (data && data.leads) {
			leads = data.leads;
		}
	} catch (err) {
		console.error("Failed to fetch leads:", err);
		error = "Failed to fetch leads. Please try again.";
	}

	const totalLeads = leads.length;
	const newLeads = leads.filter((lead) => lead.status === "New").length;
	const contactedLeads = leads.filter((lead) => lead.status === "Contacted").length;
	const qualifiedLeads = leads.filter((lead) => lead.status === "Provisioning").length;
	const conversionRate =
		totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

	const revenueProjection = "$15,000";

	return (
		<main className="mx-auto max-w-7xl px-6 py-12">
			<div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-brand-indigo">
					Lead Management
				</h1>
			</div>

			<div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
				<div className="rounded-xl border border-[rgba(26,42,64,0.1)] bg-[#f8f9fa] p-6 shadow-[0_6px_24px_-16px_rgba(26,42,64,0.15)]">
					<h3 className="mb-2 text-sm font-medium text-brand-charcoal/60">
						Total Leads
					</h3>
					<p className="text-3xl font-bold text-brand-indigo">{totalLeads}</p>
				</div>
				<div className="rounded-xl border border-[rgba(26,42,64,0.1)] bg-[#f8f9fa] p-6 shadow-[0_6px_24px_-16px_rgba(26,42,64,0.15)]">
					<h3 className="mb-2 text-sm font-medium text-brand-charcoal/60">
						Conversion Rate
					</h3>
					<p className="text-3xl font-bold text-brand-indigo">{conversionRate}%</p>
					<p className="mt-1 text-xs text-brand-charcoal/45">
						New {newLeads} · Contacted {contactedLeads} · Provisioning {qualifiedLeads}
					</p>
				</div>
				<div className="rounded-xl border border-[rgba(26,42,64,0.1)] bg-[#f8f9fa] p-6 shadow-[0_6px_24px_-16px_rgba(26,42,64,0.15)]">
					<h3 className="mb-2 text-sm font-medium text-brand-charcoal/60">
						Revenue Projection
					</h3>
					<p className="text-3xl font-bold text-brand-indigo">{revenueProjection}</p>
				</div>
			</div>

			<LeadPipelineTable
				leads={leads}
				error={error}
				promoteLead={promoteLeadToVault}
			/>
		</main>
	);
}
