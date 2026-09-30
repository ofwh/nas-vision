import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { apps, type Flag } from '@/lib/db/schema';
// 只引类型：编译后 import 会被擦掉，和 services 之间不构成运行时循环依赖。
import type { AppBaseItem, AppItem } from '@/lib/services/apps';

function toItem(row: typeof apps.$inferSelect): AppItem {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    image: row.image,
    scale: row.scale,
    external: row.external,
    url: row.url ?? '',
    innerUrl: row.innerUrl ?? '',
    config: row.config,
    rank: row.rank,
    status: row.status,
  };
}

/** rank 相同时用 id 兜底：键取的是邻居中点，撞了也不能让顺序随机。 */
export function selectAll(): AppItem[] {
  return db.select().from(apps).orderBy(asc(apps.rank), asc(apps.id)).all().map(toItem);
}

export function selectById(id: string): AppItem | null {
  const row = db.select().from(apps).where(eq(apps.id, id)).get();
  return row ? toItem(row) : null;
}

export function selectRankById(id: string): string | null {
  return db.select({ rank: apps.rank }).from(apps).where(eq(apps.id, id)).get()?.rank ?? null;
}

export function selectLastRank(): string | null {
  return db.select({ rank: apps.rank }).from(apps).orderBy(desc(apps.rank), desc(apps.id)).limit(1).get()?.rank ?? null;
}

export function insertOne(values: AppBaseItem & { id: string; rank: string }): AppItem {
  return toItem(db.insert(apps).values(values).returning().get());
}

export function updateById(id: string, values: AppBaseItem): AppItem | null {
  const row = db.update(apps).set(values).where(eq(apps.id, id)).returning().get();
  return row ? toItem(row) : null;
}

export function updateStatusById(id: string, status: Flag): AppItem | null {
  const row = db.update(apps).set({ status }).where(eq(apps.id, id)).returning().get();
  return row ? toItem(row) : null;
}

export function updateRankById(id: string, rank: string): AppItem | null {
  const row = db.update(apps).set({ rank }).where(eq(apps.id, id)).returning().get();
  return row ? toItem(row) : null;
}

export function deleteById(id: string): boolean {
  return db.delete(apps).where(eq(apps.id, id)).run().changes > 0;
}
