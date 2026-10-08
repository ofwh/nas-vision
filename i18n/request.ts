import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { MESSAGES } from '@/lib/api/messages';
import configService from '@/lib/services/config';
import { messages } from './messages';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const { language: locale } = configService.list({
    language: cookieStore.get('language')?.value,
    theme: cookieStore.get('theme')?.value,
    veil: cookieStore.get('veil')?.value,
  });
  return { locale, messages: { ...messages[locale], api: MESSAGES[locale] } };
});
