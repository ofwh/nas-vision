import 'server-only';
import plugins from '@/components/plugins';
import { appError, type Result } from '@/lib/api';
import * as repository from '@/lib/db/repositories/plugins';
import type {
  PluginConfigRes,
  PluginConfigParams,
  PluginQueryParams,
  PluginUpdateParams,
  PluginListRes,
  PluginFieldType,
  PluginModule,
  PluginQueryRes,
} from '@/types/plugins';

function get(name: string): Result<PluginModule> {
  if (typeof name !== 'string' || !name) return { ok: false, error: appError('common.INVALID_PARAMS') };
  const plugin = Object.hasOwn(plugins, name) ? plugins[name] : undefined;
  if (!plugin) return { ok: false, error: appError('plugin.NOT_FOUND') };
  if (plugin.manifest.status !== 'on') return { ok: false, error: appError('plugin.DISABLED') };
  return { ok: true, value: plugin };
}
export function list(): PluginListRes {
  return {
    plugins: Object.entries(plugins).map(([id, { manifest }]) => ({
      id,
      name: manifest.name,
      description: manifest.description,
      icon: manifest.icon,
      status: manifest.status,
    })),
  };
}
export async function config(params: PluginConfigParams): Promise<Result<PluginConfigRes>> {
  const plugin = get(params?.id);
  return plugin.ok ? { ok: true, value: { configs: plugin.value.manifest.configs ?? [] } } : plugin;
}
export async function query(params: PluginQueryParams): Promise<Result<PluginQueryRes>> {
  const plugin = get(params?.id);
  if (!plugin.ok) return plugin;
  const { manifest } = plugin.value;
  const saved = repository.select(manifest.id);
  const values =
    saved ?? Object.fromEntries((manifest.configs ?? []).map((field) => [field.key, field.defaults ?? '']));
  return { ok: true, value: { manifest, config: values } };
}
function isFieldValue(value: unknown): value is PluginFieldType {
  if (typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  return (
    Array.isArray(value) &&
    (value.every((item: unknown) => typeof item === 'string') ||
      value.every((item: unknown) => typeof item === 'boolean') ||
      value.every((item: unknown) => typeof item === 'number' && Number.isFinite(item)))
  );
}
export async function update(params: PluginUpdateParams): Promise<Result<PluginQueryRes>> {
  const plugin = get(params?.id);
  if (!plugin.ok) return plugin;
  const values = params.config;
  if (!values || typeof values !== 'object' || Array.isArray(values) || !Object.values(values).every(isFieldValue)) {
    return { ok: false, error: appError('common.INVALID_PARAMS') };
  }
  return {
    ok: true,
    value: { manifest: plugin.value.manifest, config: repository.upsert(values, plugin.value.manifest) },
  };
}
export async function dispatch(name: string, path: string, request: Request): Promise<Result<Response>> {
  const plugin = get(name);
  if (!plugin.ok) return plugin;
  const endpoint = Object.hasOwn(plugin.value.api, path) ? plugin.value.api[path] : undefined;
  const handler = request.method === 'GET' ? endpoint?.GET : request.method === 'POST' ? endpoint?.POST : undefined;
  if (!handler) return { ok: false, error: appError('plugin.ENDPOINT_NOT_FOUND') };
  const settings = await query({ id: name });
  if (!settings.ok) return settings;
  return handler(request, settings.value.config);
}
const service = { list, config, query, update, dispatch };
export default service;
