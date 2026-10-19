import { handleApi, errorResponse } from '@/lib/api/server';
import { okResponse, readParams } from '@/lib/api';
import service, { type AppSaveParams, type AppSaveRes } from '@/lib/services/apps';

export async function POST(request: Request) {
  return handleApi(async () => {
    const parsed = await readParams<AppSaveParams>(request);
    if (!parsed.ok) return errorResponse(parsed.error);
    const result = service.save(parsed.value);
    return result.ok ? okResponse<AppSaveRes>({ app: result.value }) : errorResponse(result.error);
  }, 'apps.SAVE_FAILED');
}
