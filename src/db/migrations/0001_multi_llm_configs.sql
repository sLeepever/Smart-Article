DROP INDEX IF EXISTS `llm_configs_user_id_unique`;--> statement-breakpoint
ALTER TABLE `llm_configs` ADD COLUMN `name` text NOT NULL DEFAULT '默认配置';--> statement-breakpoint
ALTER TABLE `llm_configs` ADD COLUMN `is_default` integer NOT NULL DEFAULT false;--> statement-breakpoint
CREATE INDEX `llm_configs_user_id_idx` ON `llm_configs` (`user_id`);--> statement-breakpoint
UPDATE `llm_configs` SET `is_default` = true WHERE `id` IN (SELECT `id` FROM `llm_configs` GROUP BY `user_id`);
