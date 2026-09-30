import { appError, type Result } from '@/lib/api';
import * as appRepository from '@/lib/db/repositories/apps';
import type { AppConfig, AppType, Flag } from '@/lib/db/schema';
import { rankAfter, rankBetween } from '@/lib/sort-key';

/** 可写字段；id / rank / status 由服务端管。 */
export type AppBaseItem = {
  name: string;
  type: AppType;
  image: string;
  scale: number;
  external: Flag;
  url: string;
  innerUrl: string;
  config: AppConfig;
};

export type AppItem = AppBaseItem & {
  id: string;
  rank: string;
  status: Flag;
};

/** 带 id 是更新，不带是新增。 */
export type AppSaveParams = AppBaseItem & {
  id?: string;
};

export type AppStatusParams = {
  id: string;
  status: Flag;
};

export type AppDeleteParams = {
  id: string;
};

/** null 表示那一侧没有邻居（表头 / 表尾）。 */
export type AppMoveParams = {
  id: string;
  prevId: string | null;
  nextId: string | null;
};

export type AppListRes = {
  apps: AppItem[];
};

export type AppSaveRes = {
  app: AppItem;
};

export type AppDeleteRes = {
  id: string;
};

export type AppStatusRes = {
  app: AppItem;
};

export type AppMoveRes = {
  apps: AppItem[];
};

/** 缩放百分数，倍率是 0.01 - 2.0。 */
export const SCALE_MIN = 1;
export const SCALE_MAX = 200;

export function list(): AppItem[] {
  return appRepository.selectAll();
}

/** 排在末尾；status 走库里的默认值。 */
export function create(input: AppBaseItem): AppItem {
  return appRepository.insertOne({
    ...input,
    id: crypto.randomUUID(),
    rank: rankAfter(appRepository.selectLastRank()),
  });
}

/** 全量覆盖，不是部分更新。 */
export function update(id: string, input: AppBaseItem): AppItem | null {
  return appRepository.updateById(id, input);
}

/** 带 id 走更新、不带走新增；库里没这条返回 null。 */
export function save(input: AppSaveParams): AppItem | null {
  const { id, ...fields } = input;
  return id ? update(id, fields) : create(fields);
}

export function updateStatus(id: string, status: Flag): AppItem | null {
  return appRepository.updateStatusById(id, status);
}

/** 排序键之间有间隙，后面的不用补位。 */
export function remove(id: string): boolean {
  return appRepository.deleteById(id);
}

/** 只写被挪的这一条、别的行不动；并发算出同一个键只会让先后随意，(rank, id) 兜底。 */
export function move({ id, prevId, nextId }: AppMoveParams): Result<AppItem> {
  const prevRank = prevId ? appRepository.selectRankById(prevId) : null;
  if (prevId && !prevRank) return { ok: false, error: appError('APP_ID_UNKNOWN', { id: prevId }) };

  const nextRank = nextId ? appRepository.selectRankById(nextId) : null;
  if (nextId && !nextRank) return { ok: false, error: appError('APP_ID_UNKNOWN', { id: nextId }) };

  const moved = appRepository.updateRankById(id, rankBetween(prevRank, nextRank));
  if (!moved) return { ok: false, error: appError('APP_NOT_FOUND') };

  return { ok: true, value: moved };
}

const appService = { list, create, update, save, updateStatus, remove, move };

export default appService;
