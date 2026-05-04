import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const leadSourceEnum = ["Audit_Form", "Contact_Form"] as const;
export type LeadSource = (typeof leadSourceEnum)[number];

export const leadStatusEnum = [
  "New",
  "Contacted",
  "Provisioning",
  "Closed",
  /** Promoted to Client Vault — mirrored in `clients` table */
  "Active_Client",
] as const;
export type LeadStatus = (typeof leadStatusEnum)[number];

export const auditStatusEnum = ["New", "Reviewed", "Published"] as const;
export type AuditStatus = (typeof auditStatusEnum)[number];

export const seoMetadataStatusEnum = ["Draft", "Published"] as const;
export type SeoMetadataStatus = (typeof seoMetadataStatusEnum)[number];

export const leads = sqliteTable(
  "leads",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    company_name: text("company_name"),
    source: text("source", { enum: leadSourceEnum }).notNull(),
    status: text("status", { enum: leadStatusEnum }).notNull().default("New"),
    turnstile_passed: integer("turnstile_passed"),
    metadata: text("metadata"),
    created_at: integer("created_at")
      .notNull()
      .$defaultFn(() => Date.now()),
  },
  (t) => [
    uniqueIndex("leads_email_unique").on(t.email),
    index("leads_status_idx").on(t.status),
    index("leads_source_idx").on(t.source),
    index("leads_created_at_idx").on(t.created_at),
  ]
);

export const transactions = sqliteTable(
  "transactions",
  {
    stripe_session_id: text("stripe_session_id").primaryKey(),
    customer_email: text("customer_email"),
    amount_total: integer("amount_total"),
    plan_name: text("plan_name"),
    status: text("status"),
    lead_id: text("lead_id").references(() => leads.id),
    created_at: integer("created_at")
      .notNull()
      .$defaultFn(() => Date.now()),
  },
  (t) => [
    index("transactions_email_idx").on(t.customer_email),
    index("transactions_created_at_idx").on(t.created_at),
  ]
);

export const audits = sqliteTable("audits", {
  id: text("id").primaryKey(),
  lead_id: text("lead_id").notNull(),
  content: text("content").notNull(),
  status: text("status", { enum: auditStatusEnum }).notNull().default("New"),
  created_at: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});

export const seo_metadata = sqliteTable("seo_metadata", {
  id: text("id").primaryKey(),
  page_url: text("page_url").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  keywords: text("keywords"),
  status: text("status", { enum: seoMetadataStatusEnum }).notNull().default("Draft"),
  created_at: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});

/** SSOT for Cloudflare Access group membership */
export const clients = sqliteTable(
  "clients",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    company_name: text("company_name"),
    created_at: integer("created_at")
      .notNull()
      .$defaultFn(() => Date.now()),
  },
  (t) => [uniqueIndex("clients_email_unique").on(t.email)]
);

export const toolPlanEnum = ["free", "paid", "client", "admin"] as const;
export type ToolPlan = (typeof toolPlanEnum)[number];

/** Shared auth record for cross-domain tool access. */
export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    clerk_id: text("clerk_id"),
    email: text("email").notNull(),
    plan: text("plan", { enum: toolPlanEnum }).notNull().default("free"),
    stripe_customer_id: text("stripe_customer_id"),
    created_at: integer("created_at")
      .notNull()
      .$defaultFn(() => Date.now()),
    updated_at: integer("updated_at")
      .notNull()
      .$defaultFn(() => Date.now()),
  },
  (t) => [
    uniqueIndex("users_clerk_id_unique").on(t.clerk_id),
    uniqueIndex("users_email_unique").on(t.email),
    index("users_plan_idx").on(t.plan),
  ]
);

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    client_id: text("client_id")
      .notNull()
      .references(() => clients.id),
    staging_url: text("staging_url"),
    edge_ranking: integer("edge_ranking"),
    last_audit_json: text("last_audit_json"),
    updated_at: integer("updated_at")
      .notNull()
      .$defaultFn(() => Date.now()),
  },
  (t) => [index("projects_client_id_idx").on(t.client_id)]
);

export const purchaseStatusEnum = ["active", "cancelled", "expired"] as const;
export type PurchaseStatus = (typeof purchaseStatusEnum)[number];

/** Tracks which tool products a user has purchased via Stripe. */
export const purchases = sqliteTable(
  "purchases",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id),
    product_slug: text("product_slug").notNull(),
    tier: text("tier").notNull(),
    stripe_session_id: text("stripe_session_id"),
    status: text("status", { enum: purchaseStatusEnum }).notNull().default("active"),
    created_at: integer("created_at")
      .notNull()
      .$defaultFn(() => Date.now()),
    expires_at: integer("expires_at"),
  },
  (t) => [
    index("purchases_user_id_idx").on(t.user_id),
    index("purchases_product_slug_idx").on(t.product_slug),
    index("purchases_status_idx").on(t.status),
    uniqueIndex("purchases_stripe_session_id_unique").on(t.stripe_session_id),
  ]
);

/** Client → operator notes from the Vault “Direct Line” */
export const vault_messages = sqliteTable(
  "vault_messages",
  {
    id: text("id").primaryKey(),
    client_id: text("client_id")
      .notNull()
      .references(() => clients.id),
    message_text: text("message_text").notNull(),
    created_at: integer("created_at")
      .notNull()
      .$defaultFn(() => Date.now()),
  },
  (t) => [index("vault_messages_client_id_idx").on(t.client_id)]
);

// Type exports for schema tables
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type VaultMessage = typeof vault_messages.$inferSelect;
export type NewVaultMessage = typeof vault_messages.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;

// Relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
  lead: one(leads, {
    fields: [transactions.lead_id],
    references: [leads.id],
  }),
}));

export const leadsRelations = relations(leads, ({ many }) => ({
  transactions: many(transactions),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
  vault_messages: many(vault_messages),
}));

export const usersRelations = relations(users, ({ many }) => ({
  purchases: many(purchases),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.user_id],
    references: [users.id],
  }),
}));

export const vaultMessagesRelations = relations(vault_messages, ({ one }) => ({
  client: one(clients, {
    fields: [vault_messages.client_id],
    references: [clients.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  client: one(clients, {
    fields: [projects.client_id],
    references: [clients.id],
  }),
}));
