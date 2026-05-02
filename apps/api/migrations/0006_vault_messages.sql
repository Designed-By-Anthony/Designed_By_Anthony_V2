CREATE TABLE `vault_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL REFERENCES clients(`id`),
	`message_text` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `vault_messages_client_id_idx` ON `vault_messages` (`client_id`);
