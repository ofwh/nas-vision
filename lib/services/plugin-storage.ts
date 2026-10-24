import 'server-only';
import { appError, type JsonObject, type JsonValue, type Result } from '@/lib/api';
import * as appRepository from '@/lib/db/repositories/apps';
import * as repository from '@/lib/db/repositories/plugin-storage';
import pluginService from '@/lib/services/plugins';
import type {
  PluginStorageCreateParams,
  PluginStorageDeleteParams,
  PluginStorageDeleteRes,
  PluginStorageItem,
  PluginStorageQueryParams,
  PluginStorageUpdateParams,
} from '@/types/plugins';

function isId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isJson(value: unknown): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return true;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.every(isJson);
  }

  return isObject(value);
}

function isObject(value: unknown): value is JsonObject {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype &&
    Object.values(value).every(isJson)
  );
}

async function validateApp(appId: string): Promise<Result<string>> {
  if (!isId(appId)) {
    return { ok: false, error: appError('plugin.STORAGE_INVALID_PARAMS') };
  }

  const app = appRepository.selectById(appId);

  if (!app) {
    return { ok: false, error: appError('apps.APP_NOT_FOUND') };
  }

  if (app.type !== 'plugin') {
    return { ok: false, error: appError('plugin.STORAGE_APP_REQUIRED') };
  }

  const plugin = await pluginService.config({
    id: typeof app.config.pluginName === 'string' ? app.config.pluginName : '',
  });

  if (!plugin.ok) {
    return plugin;
  }

  return { ok: true, value: appId };
}

export async function query(params: PluginStorageQueryParams): Promise<Result<PluginStorageItem[]>> {
  if (
    !isObject(params) ||
    (params.id !== undefined && !isId(params.id)) ||
    (params.ids !== undefined && (!Array.isArray(params.ids) || !params.ids.every(isId))) ||
    (params.key !== undefined && typeof params.key !== 'string')
  ) {
    return { ok: false, error: appError('plugin.STORAGE_INVALID_PARAMS') };
  }

  const app = await validateApp(params.appId);

  return app.ok ? { ok: true, value: repository.selectAll(app.value, params) } : app;
}

export async function update(
  params: PluginStorageCreateParams | PluginStorageUpdateParams,
): Promise<Result<PluginStorageItem>> {
  if (
    !params ||
    !isObject(params.data) ||
    ('id' in params && !isId(params.id)) ||
    (params.key !== undefined && params.key !== null && typeof params.key !== 'string')
  ) {
    return { ok: false, error: appError('plugin.STORAGE_INVALID_PARAMS') };
  }

  let appId: string;

  if ('id' in params) {
    const items = repository.selectById(params.id);
    const existing = items[0];

    if (!existing) {
      return { ok: false, error: appError('plugin.STORAGE_NOT_FOUND') };
    }

    if (items.length > 1) {
      return { ok: false, error: appError('plugin.STORAGE_ID_AMBIGUOUS') };
    }

    appId = existing.appId;
  } else {
    appId = params.appId;
  }

  const app = await validateApp(appId);

  if (!app.ok) {
    return app;
  }

  const values = {
    appId: app.value,
    id: 'id' in params ? params.id : crypto.randomUUID(),
    key: params.key ?? null,
    data: params.data,
  };
  const item = 'id' in params ? repository.update(values) : repository.insert(values);

  return item ? { ok: true, value: item } : { ok: false, error: appError('plugin.STORAGE_NOT_FOUND') };
}

export async function remove(params: PluginStorageDeleteParams): Promise<Result<PluginStorageDeleteRes>> {
  if (!isObject(params) || (params.id !== undefined && !isId(params.id))) {
    return { ok: false, error: appError('plugin.STORAGE_INVALID_PARAMS') };
  }

  const app = await validateApp(params.appId);

  if (!app.ok) {
    return app;
  }

  const removed = repository.remove(app.value, params.id);

  if (params.id !== undefined && !removed) {
    return { ok: false, error: appError('plugin.STORAGE_NOT_FOUND') };
  }

  return { ok: true, value: { appId: app.value, id: params.id } };
}

const service = { query, update, remove };

export default service;
