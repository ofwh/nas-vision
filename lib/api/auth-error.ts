import type { Locale } from '@/i18n/config';
import { errorMessage, type ErrorCode } from '@/lib/api';

const authErrors: Record<string, ErrorCode> = {
  INVALID_PASSWORD: 'account.INVALID_PASSWORD',
  PASSWORD_TOO_SHORT: 'account.PASSWORD_TOO_SHORT',
  PASSWORD_TOO_LONG: 'account.PASSWORD_TOO_LONG',
  INVALID_CODE: 'account.INVALID_CODE',
  INVALID_TWO_FACTOR_COOKIE: 'account.TWO_FACTOR_EXPIRED',
  ACCOUNT_TEMPORARILY_LOCKED: 'account.ACCOUNT_LOCKED',
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: 'account.ACCOUNT_LOCKED',
  TOTP_ALREADY_ENABLED: 'account.TWO_FACTOR_ALREADY_ENABLED',
};

export function authErrorMessage(error: { code?: string }, locale: Locale): string {
  return errorMessage({ code: authErrors[error.code ?? ''] ?? 'account.SECURITY_FAILED' }, locale);
}
