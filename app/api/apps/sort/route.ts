import type { NextRequest } from 'next/server';
import { errorResponse } from '@/lib/api/server';
import { okResponse, readParams } from '@/lib/api';
import service, { type AppMoveParams, type AppMoveRes } from '@/lib/services/apps';

export async function POST(request: NextRequest) {
  const parsed = await readParams<AppMoveParams>(request);
  if (!parsed.ok) return errorResponse(parsed.error);

  const result = service.move(parsed.value);
  if (!result.ok) return errorResponse(result.error);

  return okResponse<AppMoveRes>({ app: result.value });
}
