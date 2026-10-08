import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import type { JsonObject } from '@/lib/api/json';
import type { Flag } from './types';

export type AppPermission = 'public' | 'signed-in';

export type AppConfig = JsonObject;

export type AppType = 'url';

export type AppOpenMode = 'newtab' | 'iframe' | 'replace';

export const apps = sqliteTable('apps', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').$type<AppType>().notNull().default('url'),
  image: text('image').notNull().default(''),
  scale: integer('scale').notNull().default(100),
  external: text('external').$type<AppOpenMode>().notNull().default('newtab'),
  permission: text('permission').$type<AppPermission>().notNull().default('public'),
  url: text('url'),
  innerUrl: text('inner_url'),
  config: text('config', { mode: 'json' }).$type<AppConfig>().notNull().default({}),
  rank: text('rank').notNull(),
  status: integer('status').$type<Flag>().notNull().default(1),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
