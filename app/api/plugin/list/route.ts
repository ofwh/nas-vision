import { appError, okResponse, readParams } from '@/lib/api';
import { errorResponse } from '@/lib/api/server';
import service from '@/lib/services/plugins';
import type { PluginListParams } from '@/types/plugins';

export async function POST(request: Request) {
  const parsed = await readParams<PluginListParams>(request);
  if (!parsed.ok) return errorResponse(parsed.error);
  try {
    return okResponse(service.list());
  } catch {
    return errorResponse(appError('plugin.LIST_FAILED'));
  }
}
