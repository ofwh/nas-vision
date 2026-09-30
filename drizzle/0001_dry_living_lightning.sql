CREATE TABLE `apps` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`image` text DEFAULT '' NOT NULL,
	`scale` integer DEFAULT 100 NOT NULL,
	`url` text,
	`inner_url` text,
	`config` text DEFAULT '{}' NOT NULL,
	`rank` text NOT NULL,
	`status` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
