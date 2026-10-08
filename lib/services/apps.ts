import { appError, type Result } from '@/lib/api';
import * as appRepository from '@/lib/db/repositories/apps';
import type { AppConfig, AppOpenMode, AppPermission, AppType, Flag } from '@/lib/db/schema';

/** 可写字段；id / rank / status 由服务端管。 */
export type AppBaseItem = {
  name: string;
  type: AppType;
  image: string;
  scale: number;
  external: AppOpenMode;
  permission: AppPermission;
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

/** 将应用移到 beforeId 前；null 表示全量列表末尾。 */
export type AppMoveParams = {
  id: string;
  beforeId: string | null;
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
  app: AppItem;
};

export function list(signedIn: boolean): AppItem[] {
  return appRepository.selectAll().filter((app) => signedIn || app.permission !== 'signed-in');
}

/** 排在末尾；status 走库里的默认值。 */
export function create(input: AppBaseItem): AppItem {
  return appRepository.insertAtEnd({
    ...input,
    id: crypto.randomUUID(),
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

/** 删除不改变其余应用的相对顺序。 */
export function remove(id: string): boolean {
  return appRepository.deleteById(id);
}

/** 服务端基于当前全量列表定位，事务内生成唯一且长度有界的排序键。 */
export function move(input: AppMoveParams): Result<AppItem> {
  if (
    !input ||
    typeof input.id !== 'string' ||
    !input.id ||
    !(input.beforeId === null || (typeof input.beforeId === 'string' && input.beforeId))
  ) {
    return { ok: false, error: appError('common.INVALID_PARAMS') };
  }
  return appRepository.moveBefore(input.id, input.beforeId);
}

const appService = { list, create, update, save, updateStatus, remove, move };

export default appService;
