import type { NextRequest } from 'next/server';
import { errorResponse } from '@/lib/api/server';
import { okResponse, readParams } from '@/lib/api';
import service, { type UploadRemoveParams, type UploadRemoveRes } from '@/lib/services/upload';

export async function POST(request: NextRequest) {
  const parsed = await readParams<UploadRemoveParams>(request);
  if (!parsed.ok) return errorResponse(parsed.error);

  const result = await service.remove(parsed.value);
  if (!result.ok) return errorResponse(result.error);

  return okResponse<UploadRemoveRes>(result.value);
}
