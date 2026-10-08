import { createTranslator } from 'next-intl';
import { defaultLocale, type Locale } from '@/i18n/config';
import en from './messages/en.json';
import zhCN from './messages/zh-CN.json';
import type { ErrorCode } from './codes';

export const MESSAGES = { 'zh-CN': zhCN, en };

export function formatMessage(
  code: ErrorCode,
  params?: Record<string, string | number>,
  locale: Locale = defaultLocale,
): string {
  const translate = createTranslator({ locale, messages: MESSAGES[locale] });
  return translate(code, params);
}
