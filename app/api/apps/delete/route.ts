import type { NextRequest } from 'next/server';
import { appError, errorResponse, okResponse, readParams } from '@/lib/api';
import service, { type AppDeleteParams, type AppDeleteRes } from '@/lib/services/apps';

export async function POST(request: NextRequest) {
  const parsed = await readParams<AppDeleteParams>(request);
  if (!parsed.ok) return errorResponse(parsed.error);

  const { id } = parsed.value;
  if (!service.remove(id)) return errorResponse(appError('APP_NOT_FOUND'));

  return okResponse<AppDeleteRes>({ id });
}
