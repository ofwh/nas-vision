import { handleApi, errorResponse } from '@/lib/api/server';
import { okResponse, readParams } from '@/lib/api';
import service, { type AppStatusParams, type AppStatusRes } from '@/lib/services/apps';

export async function POST(request: Request) {
  return handleApi(async () => {
    const parsed = await readParams<AppStatusParams>(request);

    if (!parsed.ok) {
      return errorResponse(parsed.error);
    }

    const result = service.updateStatus(parsed.value);

    return result.ok ? okResponse<AppStatusRes>({ app: result.value }) : errorResponse(result.error);
  }, 'apps.STATUS_FAILED');
}
