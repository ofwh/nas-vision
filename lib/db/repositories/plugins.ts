import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { plugins } from '@/lib/db/schema';
import type { PluginConfig, PluginManifest } from '@/types/plugins';

export function select(id: string): PluginConfig | null {
  return db.select().from(plugins).where(eq(plugins.id, id)).get()?.config ?? null;
}

export function upsert(config: PluginConfig, manifest: PluginManifest): PluginConfig {
  const values = {
    name: manifest.name,
    description: manifest.description,
    icon: manifest.icon,
    status: manifest.status,
    previews: manifest.previews ?? [],
    configs: manifest.configs ?? [],
    config,
  };

  return db
    .insert(plugins)
    .values({ id: manifest.id, ...values })
    .onConflictDoUpdate({ target: plugins.id, set: values })
    .returning()
    .get().config;
}
