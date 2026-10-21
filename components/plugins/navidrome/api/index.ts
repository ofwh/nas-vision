import { okResponse, readParams } from '@/lib/api';
import type { PluginApi, PluginApiHandler, PluginConfig } from '@/types/plugins';
import { run } from './response';
import service from './service';

function post<P, T>(action: (params: P, config: PluginConfig) => Promise<T>): PluginApiHandler {
  return async (request, config) => {
    const params = await readParams<P>(request);

    if (!params.ok) {
      return params;
    }

    return run(async () => okResponse(await action(params.value, config)));
  };
}

function media(kind: 'cover' | 'stream'): PluginApiHandler {
  return (request, config) =>
    run(async () => {
      const id = new URL(request.url).searchParams.get('id') ?? '';
      const response = await service.media({ id }, config, kind, {
        range: request.headers.get('range'),
        signal: request.signal,
      });
      const headers = new Headers({ 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });

      for (const name of ['Content-Type', 'Content-Length', 'Content-Range', 'Accept-Ranges']) {
        const value = response.headers.get(name);

        if (value) {
          headers.set(name, value);
        }
      }
      if (response.status === 416) {
        await response.body?.cancel();
        headers.delete('Content-Length');
      }

      return new Response(response.status === 416 ? null : response.body, { status: response.status, headers });
    });
}

export default {
  'api/list': { POST: post(service.list) },
  'api/star': { POST: post(service.star) },
  'api/playlist/save': { POST: post(service.save) },
  'api/playlist/remove': { POST: post(service.remove) },
  'api/cover': { GET: media('cover') },
  'api/stream': { GET: media('stream') },
} satisfies PluginApi;
