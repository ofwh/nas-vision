import type { Locale } from '@/i18n/config';
import { appError, errorMessage, type AppError, type ErrorCode } from '@/lib/api';

const authErrors: Record<string, ErrorCode> = {
  INVALID_PASSWORD: 'account.INVALID_PASSWORD',
  PASSWORD_TOO_SHORT: 'account.PASSWORD_TOO_SHORT',
  PASSWORD_TOO_LONG: 'account.PASSWORD_TOO_LONG',
  INVALID_CODE: 'account.INVALID_CODE',
  INVALID_BACKUP_CODE: 'account.INVALID_CODE',
  INVALID_TWO_FACTOR_COOKIE: 'account.TWO_FACTOR_EXPIRED',
  ACCOUNT_TEMPORARILY_LOCKED: 'account.ACCOUNT_LOCKED',
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: 'account.ACCOUNT_LOCKED',
  TOTP_ALREADY_ENABLED: 'account.TWO_FACTOR_ALREADY_ENABLED',
  TOTP_NOT_ENABLED: 'account.TWO_FACTOR_NOT_ENABLED',
  TWO_FACTOR_NOT_ENABLED: 'account.TWO_FACTOR_NOT_ENABLED',
  OTP_NOT_ENABLED: 'account.TWO_FACTOR_NOT_ENABLED',
  BACKUP_CODES_NOT_ENABLED: 'account.TWO_FACTOR_NOT_ENABLED',
  TOTP_NOT_CONFIGURED: 'account.TWO_FACTOR_NOT_CONFIGURED',
  OTP_NOT_CONFIGURED: 'account.TWO_FACTOR_NOT_CONFIGURED',
  OTP_HAS_EXPIRED: 'account.TWO_FACTOR_CODE_EXPIRED',
  INVALID_USERNAME_OR_PASSWORD: 'account.INVALID_CREDENTIALS',
  INVALID_EMAIL_OR_PASSWORD: 'account.INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'account.EMAIL_NOT_VERIFIED',
  INVALID_EMAIL: 'account.INVALID_EMAIL',
  USER_ALREADY_EXISTS: 'account.EMAIL_TAKEN',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'account.EMAIL_TAKEN',
  USERNAME_IS_ALREADY_TAKEN: 'account.USERNAME_TAKEN',
  USERNAME_TOO_SHORT: 'account.USERNAME_TOO_SHORT',
  USERNAME_TOO_LONG: 'account.USERNAME_TOO_LONG',
  INVALID_USERNAME: 'account.INVALID_USERNAME',
  INVALID_DISPLAY_USERNAME: 'account.INVALID_USERNAME',
  USERNAME_IS_IMMUTABLE: 'account.USERNAME_IMMUTABLE',
  FAILED_TO_CREATE_USER: 'account.SIGN_UP_FAILED',
  FAILED_TO_UPDATE_USER: 'account.PROFILE_UPDATE_FAILED',
  EMAIL_CAN_NOT_BE_UPDATED: 'account.EMAIL_CHANGE_DISABLED',
  CHANGE_EMAIL_DISABLED: 'account.EMAIL_CHANGE_DISABLED',
  USER_NOT_FOUND: 'account.USER_NOT_FOUND',
  INVALID_USER: 'account.USER_NOT_FOUND',
  SESSION_EXPIRED: 'account.SESSION_EXPIRED',
  SESSION_NOT_FRESH: 'account.SESSION_EXPIRED',
  FAILED_TO_CREATE_SESSION: 'account.SESSION_CREATE_FAILED',
  FAILED_TO_GET_SESSION: 'account.SESSION_READ_FAILED',
  VALIDATION_ERROR: 'account.REQUEST_INVALID',
  MISSING_FIELD: 'account.REQUEST_INVALID',
  BODY_MUST_BE_AN_OBJECT: 'account.REQUEST_INVALID',
  FIELD_NOT_ALLOWED: 'account.REQUEST_INVALID',
  INVALID_ORIGIN: 'account.REQUEST_FORBIDDEN',
  MISSING_OR_NULL_ORIGIN: 'account.REQUEST_FORBIDDEN',
  CROSS_SITE_NAVIGATION_LOGIN_BLOCKED: 'account.REQUEST_FORBIDDEN',
};

export function authError(error: { code?: string }, path = '', status?: number): AppError {
  const code = error.code ?? '';
  const mapped = authErrors[code] ?? Object.values(authErrors).find((value) => value === code);

  if (mapped) {
    return appError(mapped);
  }

  if (status === 401) {
    return appError('account.SESSION_EXPIRED');
  }

  if (status === 403) {
    return appError('account.REQUEST_FORBIDDEN');
  }

  if (status === 404) {
    return appError('account.ENDPOINT_NOT_FOUND');
  }

  if (status === 429) {
    return appError('account.ACCOUNT_LOCKED');
  }

  if (path.startsWith('/sign-up/')) {
    return appError('account.SIGN_UP_FAILED');
  }

  if (path.startsWith('/sign-in/')) {
    return appError('account.SIGN_IN_FAILED');
  }

  if (path.startsWith('/two-factor/')) {
    return appError('account.TWO_FACTOR_FAILED');
  }

  if (path === '/change-password') {
    return appError('account.PASSWORD_CHANGE_FAILED');
  }

  if (path === '/update-user') {
    return appError('account.PROFILE_UPDATE_FAILED');
  }

  if (path === '/sign-out') {
    return appError('account.SIGN_OUT_FAILED');
  }

  if (path === '/get-session') {
    return appError('account.SESSION_READ_FAILED');
  }

  return appError('account.SECURITY_FAILED');
}

export function authErrorMessage(error: { code?: string; message?: string }, locale: Locale): string {
  if (error.code?.startsWith('account.')) {
    return error.message ?? errorMessage(authError(error), locale);
  }

  return errorMessage(authError(error), locale);
}
