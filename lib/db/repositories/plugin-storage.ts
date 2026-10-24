import { and, asc, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { pluginStorage } from '@/lib/db/schema';
import type {
  PluginStorageCreateParams,
  PluginStorageItem,
  PluginStorageQueryParams,
  PluginStorageUpdateParams,
} from '@/types/plugins';

function toItem(row: typeof pluginStorage.$inferSelect): PluginStorageItem {
  return { ...row, createdAt: row.createdAt.getTime(), updatedAt: row.updatedAt.getTime() };
}

export function selectAll(appId: string, params: PluginStorageQueryParams): PluginStorageItem[] {
  return db
    .select()
    .from(pluginStorage)
    .where(
      and(
        eq(pluginStorage.appId, appId),
        params.id === undefined ? undefined : eq(pluginStorage.id, params.id),
        params.ids === undefined ? undefined : inArray(pluginStorage.id, params.ids),
        params.key === undefined ? undefined : eq(pluginStorage.key, params.key),
      ),
    )
    .orderBy(asc(pluginStorage.createdAt), asc(pluginStorage.id))
    .all()
    .map(toItem);
}

export function insert(values: PluginStorageCreateParams & { appId: string; id: string }): PluginStorageItem {
  return toItem(db.insert(pluginStorage).values(values).returning().get());
}

export function selectById(id: string): PluginStorageItem[] {
  return db.select().from(pluginStorage).where(eq(pluginStorage.id, id)).limit(2).all().map(toItem);
}

export function update(values: PluginStorageUpdateParams & { appId: string }): PluginStorageItem | null {
  const row = db
    .update(pluginStorage)
    .set({ data: values.data, key: values.key ?? null })
    .where(and(eq(pluginStorage.appId, values.appId), eq(pluginStorage.id, values.id)))
    .returning()
    .get();

  return row ? toItem(row) : null;
}

export function remove(appId: string, id?: string): boolean {
  return (
    db
      .delete(pluginStorage)
      .where(and(eq(pluginStorage.appId, appId), id === undefined ? undefined : eq(pluginStorage.id, id)))
      .run().changes > 0
  );
}
