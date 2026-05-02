"use client";

import { motion } from "framer-motion";

const services = [
	{
		title: "Custom Web Design",
		description:
			"Premium landing pages and service funnels built for trust, conversion, and local search visibility.",
	},
	{
		title: "Website Rescue",
		description:
			"Fast, secure recoveries for outdated sites that are losing traffic, leads, and search presence.",
	},
	{
		title: "Local SEO",
		description:
			"Local search optimization and schema signals tuned for city-level customers and service-area intent.",
	},
	{
		title: "Performance Optimization",
		description:
			"Edge-native loading, caching, and Core Web Vitals tuning so your site feels premium on every device.",
	},
];

export function SovereignServicesCarousel() {
	return (
		<section className="section-shell section-shell--wash mt-8 lg:mt-12" aria-labelledby="services-carousel-heading">
			<div className="section-container">
				<div className="section-header max-w-[58rem]">
					<p className="section-eyebrow">Empire services</p>
					<h2 id="services-carousel-heading" className="section-title max-w-[24rem]">
						Services built to keep your local business visible, fast, and ready to convert.
					</h2>
					<p className="mt-3 max-w-2xl text-[0.99rem] leading-7 text-slate-300">
						Swipe through the core offerings that power infrastructure-ready marketing sites and help service businesses win more calls.
					</p>
				</div>
				<div className="mt-8 overflow-x-auto pb-4">
					<div className="flex gap-5 min-w-[88%] lg:min-w-full px-1">
						{services.map((service, index) => (
							<motion.article
								key={service.title}
								whileHover={{ y: -4, scale: 1.01 }}
								whileTap={{ scale: 0.995 }}
								transition={{ duration: 0.35, ease: "easeOut" }}
								className="min-w-[19rem] flex-shrink-0 rounded-[2rem] border border-white/10 bg-[rgba(8,12,18,0.96)] p-6 shadow-[0_28px_64px_-26px_rgba(0,0,0,0.7)] backdrop-blur-[18px]"
							>
								<div className="flex items-center justify-between gap-4">
									<span className="text-[0.72rem] uppercase tracking-[0.26em] text-[rgb(var(--accent-bronze-rgb))]">
										0{index + 1}
									</span>
									<span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.68rem] uppercase tracking-[0.14em] text-slate-200">
										Premium
									</span>
								</div>
								<h3 className="mt-5 text-xl font-semibold text-brand-charcoal">
									{service.title}
								</h3>
								<p className="mt-3 text-sm leading-7 text-slate-300">
									{service.description}
								</p>
							</motion.article>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
