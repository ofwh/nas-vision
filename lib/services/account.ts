import { auth } from '@/lib/auth';
import type { Result } from '@/lib/api';
import { authError } from '@/lib/api/auth-error';

export async function handle(request: Request): Promise<Result<Response> & { headers?: Headers }> {
  const path = new URL(request.url).pathname.replace(/^\/api\/auth/, '');
  try {
    const response = await auth.handler(request);
    if (response.status < 400) return { ok: true, value: response };
    let code: string | undefined;
    try {
      const body: unknown = await response.json();
      if (body && typeof body === 'object' && 'code' in body && typeof body.code === 'string') code = body.code;
    } catch {
      code = undefined;
    }
    return { ok: false, error: authError({ code }, path, response.status), headers: response.headers };
  } catch {
    return { ok: false, error: authError({}, path) };
  }
}

const service = { handle };
export default service;
