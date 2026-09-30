import type { NextRequest } from 'next/server';
import { appError, errorResponse, okResponse, readParams } from '@/lib/api';
import service, { type AppSaveParams, type AppSaveRes } from '@/lib/services/apps';

export async function POST(request: NextRequest) {
  const parsed = await readParams<AppSaveParams>(request);
  if (!parsed.ok) return errorResponse(parsed.error);

  const saved = service.save(parsed.value);
  if (!saved) return errorResponse(appError('APP_NOT_FOUND'));

  return okResponse<AppSaveRes>({ app: saved });
}
