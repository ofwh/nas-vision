import { handleApi, errorResponse } from '@/lib/api/server';
import { okResponse, readParams } from '@/lib/api';
import service from '@/lib/services/plugin-storage';
import type { PluginStorageDeleteParams, PluginStorageDeleteRes } from '@/types/plugins';

export async function POST(request: Request) {
  return handleApi(async () => {
    const parsed = await readParams<PluginStorageDeleteParams>(request);

    if (!parsed.ok) {
      return errorResponse(parsed.error);
    }

    const result = await service.remove(parsed.value);

    return result.ok ? okResponse<PluginStorageDeleteRes>(result.value) : errorResponse(result.error);
  }, 'plugin.STORAGE_DELETE_FAILED');
}
