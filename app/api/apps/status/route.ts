import type { NextRequest } from 'next/server';
import { appError, errorResponse, okResponse, readParams } from '@/lib/api';
import service, { type AppStatusParams, type AppStatusRes } from '@/lib/services/apps';

export async function POST(request: NextRequest) {
  const parsed = await readParams<AppStatusParams>(request);
  if (!parsed.ok) return errorResponse(parsed.error);

  const { id, status } = parsed.value;
  const updated = service.updateStatus(id, status);
  if (!updated) return errorResponse(appError('APP_NOT_FOUND'));

  return okResponse<AppStatusRes>({ app: updated });
}
