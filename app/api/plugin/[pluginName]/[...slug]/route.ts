import { appError } from '@/lib/api';
import { errorResponse } from '@/lib/api/server';
import service from '@/lib/services/plugins';

async function handle(request: Request, context: { params: Promise<{ pluginName: string; slug: string[] }> }) {
  try {
    const { pluginName, slug } = await context.params;
    const result = await service.dispatch(pluginName, slug.join('/'), request);

    return result.ok ? result.value : errorResponse(result.error);
  } catch {
    return errorResponse(appError('plugin.REQUEST_FAILED'));
  }
}

export { handle as GET, handle as POST };
