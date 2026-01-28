CREATE TABLE `article` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`giselle_task_id` text NOT NULL,
	`title` text,
	`body_markdown` text,
	`cover_image_url` text,
	`input_json` text NOT NULL,
	`error_message` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_article_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `article_userId_idx` ON `article` (`user_id`);