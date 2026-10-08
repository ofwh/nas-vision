import type { NextRequest } from 'next/server';
import { errorResponse } from '@/lib/api/server';
import { okResponse, readParams } from '@/lib/api';
import { auth } from '@/lib/auth';
import service, { type IframeCheckParams, type IframeCheckRes } from '@/lib/services/iframe';

export async function POST(request: NextRequest) {
  const parsed = await readParams<IframeCheckParams>(request);
  if (!parsed.ok) return errorResponse(parsed.error);

  const session = await auth.api.getSession({ headers: request.headers });
  const checked = await service.check(parsed.value, !!session);
  if (!checked.ok) return errorResponse(checked.error);

  return okResponse<IframeCheckRes>(checked.value);
}
