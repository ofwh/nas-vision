import type { NextRequest } from 'next/server';
import { errorResponse, okResponse, readForm } from '@/lib/api';
import service, { type UploadParams, type UploadRes, type UploadType } from '@/lib/services/upload';

export async function POST(request: NextRequest) {
  const form = await readForm(request);
  if (!form.ok) return errorResponse(form.error);

  const params: UploadParams = {
    type: form.value.get('type') as UploadType,
    files: form.value.getAll('files').filter((field): field is File => typeof field !== 'string'),
  };

  const result = await service.upload(params);
  if (!result.ok) return errorResponse(result.error);

  return okResponse<UploadRes>(result.value);
}
