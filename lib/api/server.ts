import 'server-only';
import { getLocale } from 'next-intl/server';
import { defaultLocale, isLocale } from '@/i18n/config';
import { errorResponse as response, type AppError } from './index';

export async function errorResponse(error: AppError): Promise<Response> {
  const locale = await getLocale();
  return response(error, isLocale(locale) ? locale : defaultLocale);
}
