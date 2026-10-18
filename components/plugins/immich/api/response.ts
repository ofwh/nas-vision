import { appError, type Result } from '@/lib/api';
import { ImmichError } from './client';

export async function run(action: () => Promise<Response>): Promise<Result<Response>> {
  try {
    return { ok: true, value: await action() };
  } catch (error) {
    return { ok: false, error: appError(error instanceof ImmichError ? error.code : 'plugin.REQUEST_FAILED') };
  }
}
