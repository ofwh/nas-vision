import { errorResponse } from '@/lib/api/server';
import service from '@/lib/services/account';

async function handle(request: Request): Promise<Response> {
  const result = await service.handle(request);
  if (result.ok) return result.value;
  const response = await errorResponse(result.error);
  const headers = new Headers(result.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  headers.set('Content-Type', 'application/json');
  headers.set('Cache-Control', 'no-store');
  return new Response(response.body, { headers });
}

export { handle as GET, handle as POST };
