CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`company_name` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clients_email_unique` ON `clients` (`email`);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL REFERENCES clients(`id`),
	`staging_url` text,
	`edge_ranking` integer,
	`last_audit_json` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `projects_client_id_idx` ON `projects` (`client_id`);
