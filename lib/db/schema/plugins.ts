import { sql } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { PluginConfig, PluginManifest, PluginSettingOption } from '@/types/plugins';
import type { JsonObject } from '@/lib/api/json';
import { apps } from './apps';

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

export const pluginStorage = sqliteTable(
  'plugin_storage',
  {
    appId: text('app_id')
      .notNull()
      .references(() => apps.id, { onDelete: 'cascade' }),
    id: text('id').notNull(),
    key: text('key'),
    data: text('data', { mode: 'json' }).$type<JsonObject>().notNull().default({}),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.appId, table.id] })],
);
