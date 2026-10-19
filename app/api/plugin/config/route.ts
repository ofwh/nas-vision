import { appError, okResponse, readParams } from '@/lib/api';
import { errorResponse } from '@/lib/api/server';
import service from '@/lib/services/plugins';
import type { PluginConfigParams } from '@/types/plugins';

export async function POST(request: Request) {
  const parsed = await readParams<PluginConfigParams>(request);
  if (!parsed.ok) return errorResponse(parsed.error);
  try {
    const result = await service.config(parsed.value);
    return result.ok ? okResponse(result.value) : errorResponse(result.error);
  } catch {
    return errorResponse(appError('plugin.CONFIG_READ_FAILED'));
  }
}
