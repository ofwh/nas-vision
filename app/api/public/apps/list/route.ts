import { okResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import service, { type AppListRes } from '@/lib/services/apps';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return okResponse<AppListRes>({ apps: service.list(!!session) });
}
