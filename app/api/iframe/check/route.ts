import type { NextRequest } from 'next/server';
import { errorResponse, okResponse, readParams } from '@/lib/api';
import service, { type IframeCheckParams, type IframeCheckRes } from '@/lib/services/iframe';

export async function POST(request: NextRequest) {
  const parsed = await readParams<IframeCheckParams>(request);
  if (!parsed.ok) return errorResponse(parsed.error);

  const checked = await service.check(parsed.value, request.headers);
  if (!checked.ok) return errorResponse(checked.error);

  return okResponse<IframeCheckRes>(checked.value);
}
