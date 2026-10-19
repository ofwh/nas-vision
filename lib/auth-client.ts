import { createAuthClient } from 'better-auth/react';
import { twoFactorClient, usernameClient } from 'better-auth/client/plugins';

const authFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  if (!response.headers.get('Content-Type')?.includes('application/json')) return response;
  const body: unknown = await response.clone().json();
  if (
    !body ||
    typeof body !== 'object' ||
    !('code' in body) ||
    typeof body.code !== 'number' ||
    body.code === 0 ||
    !('error' in body) ||
    !body.error ||
    typeof body.error !== 'object' ||
    !('code' in body.error) ||
    typeof body.error.code !== 'string' ||
    !('message' in body.error) ||
    typeof body.error.message !== 'string'
  )
    return response;
  const code = body.error.code;
  const status =
    code === 'account.SESSION_EXPIRED' || code === 'account.TWO_FACTOR_EXPIRED'
      ? 401
      : code === 'account.ACCOUNT_LOCKED'
        ? 429
        : 400;
  return Response.json({ code, message: body.error.message }, { status });
};

export const authClient = createAuthClient({
  plugins: [usernameClient(), twoFactorClient()],
  fetchOptions: { customFetchImpl: authFetch },
});

export const { useSession } = authClient;
