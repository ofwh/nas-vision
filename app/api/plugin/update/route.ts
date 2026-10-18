import { appError, okResponse, readParams } from '@/lib/api';
import { errorResponse } from '@/lib/api/server';
import service from '@/lib/services/plugins';
import type { PluginUpdateParams } from '@/types/plugins';

export async function POST(request: Request) {
  const parsed = await readParams<PluginUpdateParams>(request);
  if (!parsed.ok) return errorResponse(parsed.error);
  try {
    const result = await service.update(parsed.value);
    return result.ok ? okResponse(result.value) : errorResponse(result.error);
  } catch {
    return errorResponse(appError('plugin.REQUEST_FAILED'));
  }
}
