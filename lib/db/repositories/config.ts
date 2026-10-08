import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { config, type AppearanceConfig } from '@/lib/db/schema';

export function select(): AppearanceConfig | null {
  const row = db.select().from(config).where(eq(config.id, 1)).get();
  return row ? { language: row.language, theme: row.theme, veil: row.veil } : null;
}

export function upsert(values: AppearanceConfig): AppearanceConfig {
  const row = db
    .insert(config)
    .values({ id: 1, ...values })
    .onConflictDoUpdate({ target: config.id, set: values })
    .returning()
    .get();
  return { language: row.language, theme: row.theme, veil: row.veil };
}
