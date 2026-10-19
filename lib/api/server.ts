import 'server-only';
import { getLocale } from 'next-intl/server';
import { defaultLocale, isLocale } from '@/i18n/config';
import { appError, errorResponse as response, type AppError, type ErrorCode } from './index';

export async function errorResponse(error: AppError): Promise<Response> {
  const locale = await getLocale();
  return response(error, isLocale(locale) ? locale : defaultLocale);
}

export async function handleApi(action: () => Response | Promise<Response>, fallback: ErrorCode): Promise<Response> {
  try {
    return await action();
  } catch {
    return errorResponse(appError(fallback));
  }
}
