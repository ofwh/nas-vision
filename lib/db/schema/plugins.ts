import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { PluginConfig, PluginManifest, PluginSettingOption } from '@/lib/plugins/types';

export const plugins = sqliteTable('plugins', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  icon: text('icon').notNull().default(''),
  status: text('status').$type<PluginManifest['status']>().notNull().default('on'),
  previews: text('previews', { mode: 'json' }).$type<string[]>().notNull().default([]),
  configs: text('configs', { mode: 'json' }).$type<PluginSettingOption[]>().notNull().default([]),
  config: text('config', { mode: 'json' }).$type<PluginConfig>().notNull(),
});
