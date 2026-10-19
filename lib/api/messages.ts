import { createTranslator } from 'next-intl';
import { defaultLocale, type Locale } from '@/i18n/config';
import { BUSINESS_MESSAGES } from '@/lib/errors';
import en from './messages/en.json';
import zhCN from './messages/zh-CN.json';
import type { ErrorCode } from './errors';

export const MESSAGES = {
  'zh-CN': { ...zhCN, ...BUSINESS_MESSAGES['zh-CN'] },
  en: { ...en, ...BUSINESS_MESSAGES.en },
};

export function formatMessage(
  code: ErrorCode,
  params?: Record<string, string | number>,
  locale: Locale = defaultLocale,
): string {
  const translate = createTranslator({ locale, messages: MESSAGES[locale] });
  return translate(code, params);
}
