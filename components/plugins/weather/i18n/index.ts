import { createTranslator } from 'next-intl';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import zh from './zh-CN.json';
import en from './en.json';

export const messages = { 'zh-CN': zh, en } satisfies Record<Locale, typeof zh>;

export function getMessages(locale: string) {
  return messages[isLocale(locale) ? locale : defaultLocale];
}

export function getTranslator(locale: Locale) {
  return createTranslator({ locale, messages: getMessages(locale) });
}
