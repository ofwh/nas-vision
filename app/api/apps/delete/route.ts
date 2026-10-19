import { handleApi, errorResponse } from '@/lib/api/server';
import { okResponse, readParams } from '@/lib/api';
import service, { type AppDeleteParams, type AppDeleteRes } from '@/lib/services/apps';

export async function POST(request: Request) {
  return handleApi(async () => {
    const parsed = await readParams<AppDeleteParams>(request);

    if (!parsed.ok) {
      return errorResponse(parsed.error);
    }

    const result = service.remove(parsed.value);

    return result.ok ? okResponse<AppDeleteRes>(result.value) : errorResponse(result.error);
  }, 'apps.DELETE_FAILED');
}
