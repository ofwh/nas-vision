import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export type ConfigLanguage = 'zh-CN' | 'en';
export type ConfigTheme = 'auto' | 'light' | 'dark';
export type AppearanceConfig = { language: ConfigLanguage; theme: ConfigTheme; veil: boolean };

export const appearance = sqliteTable('appearance', {
  id: integer('id').primaryKey().default(1),
  language: text('language').$type<ConfigLanguage>().notNull().default('zh-CN'),
  theme: text('theme').$type<ConfigTheme>().notNull().default('auto'),
  veil: integer('veil', { mode: 'boolean' }).notNull().default(false),
});
