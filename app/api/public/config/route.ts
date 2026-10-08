import type { NextRequest } from 'next/server';
import { errorResponse } from '@/lib/api/server';
import { appError, okResponse } from '@/lib/api';
import service, { type ConfigRes } from '@/lib/services/config';

export async function POST(request: NextRequest) {
  try {
    return okResponse<ConfigRes>({
      config: service.list({
        language: request.cookies.get('language')?.value,
        theme: request.cookies.get('theme')?.value,
        veil: request.cookies.get('veil')?.value,
      }),
    });
  } catch {
    return errorResponse(appError('config.CONFIG_FAILED'));
  }
}
