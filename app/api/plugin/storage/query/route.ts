import { handleApi, errorResponse } from '@/lib/api/server';
import { okResponse, readParams } from '@/lib/api';
import service from '@/lib/services/plugin-storage';
import type { PluginStorageQueryParams, PluginStorageQueryRes } from '@/types/plugins';

export async function POST(request: Request) {
  return handleApi(async () => {
    const parsed = await readParams<PluginStorageQueryParams>(request);

    if (!parsed.ok) {
      return errorResponse(parsed.error);
    }

    const result = await service.query(parsed.value);

    return result.ok ? okResponse<PluginStorageQueryRes>(result.value) : errorResponse(result.error);
  }, 'plugin.STORAGE_READ_FAILED');
}
