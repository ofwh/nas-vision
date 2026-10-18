import { okResponse, readParams, type JsonValue } from '@/lib/api';
import type { PluginApi, PluginApiHandler, PluginConfig } from '@/types/plugins';
import { run } from './response';
import service from './service';
import video from './video';

function post<Params, Res extends JsonValue>(
  action: (params: Params, config: PluginConfig) => Promise<Res>,
): PluginApiHandler {
  return async (request, config) => {
    const parsed = await readParams<Params>(request);
    if (!parsed.ok) return parsed;
    return run(async () => okResponse(await action(parsed.value, config)));
  };
}

const api = {
  'api/video': { GET: video },
  'api/list': { POST: post(service.list) },
  'api/detail': { POST: post(service.detail) },
  'api/preview': { POST: post(service.preview) },
  'api/thumbnail': { POST: post(service.thumbnail) },
} satisfies PluginApi;

export default api;
