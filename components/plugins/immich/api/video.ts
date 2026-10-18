import type { PluginApiHandler } from '@/types/plugins';
import type { ImmichVideoParams } from '../types';
import { run } from './response';
import service from './service';

const video: PluginApiHandler = (request, config) =>
  run(async () => {
    const params: ImmichVideoParams = { id: new URL(request.url).searchParams.get('id') ?? '' };
    const response = await service.video(params, config, {
      range: request.headers.get('range'),
      signal: request.signal,
    });
    const headers = new Headers({ 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
    for (const name of ['Content-Type', 'Content-Length', 'Content-Range', 'Accept-Ranges']) {
      const value = response.headers.get(name);
      if (value) headers.set(name, value);
    }
    if (response.status === 416) {
      await response.body?.cancel();
      headers.delete('Content-Length');
      return new Response(null, { status: 416, headers });
    }
    return new Response(response.body, { status: response.status, headers });
  });

export default video;
