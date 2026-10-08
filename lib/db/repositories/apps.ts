import { asc, desc, eq } from 'drizzle-orm';
import { generateNKeysBetween } from 'fractional-indexing';
import { appError, type Result } from '@/lib/api';
import { moveBefore as orderBefore } from '@/lib/app-order';
import { rankAfter } from '@/lib/sort-key';
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
    permission: row.permission,
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

export function selectLastRank(): string | null {
  return db.select({ rank: apps.rank }).from(apps).orderBy(desc(apps.rank), desc(apps.id)).limit(1).get()?.rank ?? null;
}

/** 末尾定位和插入使用同一写事务，避免并发新增获得相同排序键。 */
export function insertAtEnd(values: AppBaseItem & { id: string }): AppItem {
  return db.transaction(
    () => {
      const rank = rankAfter(selectLastRank());
      return toItem(
        db
          .insert(apps)
          .values({ ...values, rank })
          .returning()
          .get(),
      );
    },
    { behavior: 'immediate' },
  );
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

/** 读取、定位、重排在同一事务内，添加/删除/其他移动不会插入中间。 */
export function moveBefore(id: string, beforeId: string | null): Result<AppItem> {
  return db.transaction(
    () => {
      const current = selectAll();
      if (!current.some((app) => app.id === id)) return { ok: false, error: appError('apps.APP_NOT_FOUND') };
      if (beforeId !== null && !current.some((app) => app.id === beforeId)) {
        return { ok: false, error: appError('apps.APP_ID_UNKNOWN', { id: beforeId }) };
      }
      const ordered = orderBefore(current, id, beforeId);
      const ranks = generateNKeysBetween(null, null, ordered.length);
      let moved: AppItem | null = null;
      ordered.forEach((app, index) => {
        const updated = app.rank === ranks[index] ? app : updateRankById(app.id, ranks[index]);
        if (app.id === id) moved = updated;
      });
      return { ok: true, value: moved! };
    },
    { behavior: 'immediate' },
  );
}
