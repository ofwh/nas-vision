CREATE TABLE `plugins` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`icon` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'on' NOT NULL,
	`previews` text DEFAULT '[]' NOT NULL,
	`configs` text DEFAULT '[]' NOT NULL,
	`config` text NOT NULL
);
