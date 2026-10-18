import { appError, okResponse, readForm, readParams } from '@/lib/api';
import { errorResponse } from '@/lib/api/server';
import service from '@/lib/services/plugins';
import type { PluginRequestParams } from '@/lib/plugins/types';

export async function POST(request: Request, context: { params: Promise<{ pluginName: string; slug: string[] }> }) {
  try {
    const { pluginName, slug } = await context.params;
    const path = slug.join('/');
    const parsed = request.headers.get('content-type')?.startsWith('multipart/form-data')
      ? await readForm(request)
      : await readParams<PluginRequestParams>(request);
    if (!parsed.ok) return errorResponse(parsed.error);
    const result = await service.dispatch(pluginName, path, parsed.value);
    return result.ok ? okResponse(result.value) : errorResponse(result.error);
  } catch {
    return errorResponse(appError('plugin.REQUEST_FAILED'));
  }
}
