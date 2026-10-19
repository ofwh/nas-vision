import { handleApi } from '@/lib/api/server';
import { okResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import service, { type AppListRes } from '@/lib/services/apps';

export async function POST(request: Request) {
  return handleApi(async () => {
    const session = await auth.api.getSession({ headers: request.headers });

    return okResponse<AppListRes>({ apps: service.list(!!session) });
  }, 'apps.LIST_FAILED');
}
