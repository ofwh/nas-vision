import { appError, okResponse, readParams } from '@/lib/api';
import { errorResponse } from '@/lib/api/server';
import service from '@/lib/services/plugins';
import type { PluginQueryParams } from '@/types/plugins';

export async function POST(request: Request) {
  const parsed = await readParams<PluginQueryParams>(request);

  if (!parsed.ok) {
    return errorResponse(parsed.error);
  }

  try {
    const result = await service.query(parsed.value);

    return result.ok ? okResponse(result.value) : errorResponse(result.error);
  } catch {
    return errorResponse(appError('plugin.CONFIG_READ_FAILED'));
  }
}
