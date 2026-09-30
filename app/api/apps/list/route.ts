import { okResponse } from '@/lib/api';
import service, { type AppListRes } from '@/lib/services/apps';

export async function POST() {
  return okResponse<AppListRes>({ apps: service.list() });
}
