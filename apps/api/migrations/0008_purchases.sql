CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL REFERENCES `users`(`id`),
	`product_slug` text NOT NULL,
	`tier` text NOT NULL,
	`stripe_session_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer
);
--> statement-breakpoint
CREATE INDEX `purchases_user_id_idx` ON `purchases` (`user_id`);
--> statement-breakpoint
CREATE INDEX `purchases_product_slug_idx` ON `purchases` (`product_slug`);
--> statement-breakpoint
CREATE INDEX `purchases_status_idx` ON `purchases` (`status`);
