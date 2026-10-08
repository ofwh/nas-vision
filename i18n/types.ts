import type { MESSAGES } from '@/lib/api/messages';
import type { Locale } from './config';
import type { messages } from './messages';

declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages.en & { api: typeof MESSAGES.en };
  }
}
