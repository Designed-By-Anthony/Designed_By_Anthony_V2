-- Replace single-column unique on stripe_session_id with composite unique
-- on (stripe_session_id, product_slug) to support multi-tool checkouts.
DROP INDEX IF EXISTS `purchases_stripe_session_id_unique`;
--> statement-breakpoint
CREATE UNIQUE INDEX `purchases_session_slug_unique` ON `purchases` (`stripe_session_id`, `product_slug`);
