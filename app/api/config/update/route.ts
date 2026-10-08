import { errorResponse } from '@/lib/api/server';
import { appError, okResponse, readParams } from '@/lib/api';
import service, { type ConfigRes, type ConfigSaveParams } from '@/lib/services/config';

export async function POST(request: Request) {
  const parsed = await readParams<ConfigSaveParams>(request);
  if (!parsed.ok) return errorResponse(parsed.error);
  try {
    const result = service.save(parsed.value);
    return result.ok ? okResponse<ConfigRes>({ config: result.value }) : errorResponse(result.error);
  } catch {
    return errorResponse(appError('config.CONFIG_FAILED'));
  }
}
