import { getLocale } from 'next-intl/server';
import type { Result } from '@/lib/api';
import { getMessages } from '../i18n';
import { codes, NavidromeError } from './errors';

export async function run(action: () => Promise<Response>): Promise<Result<Response>> {
  try {
    return { ok: true, value: await action() };
  } catch (error) {
    const code = error instanceof NavidromeError ? error.code : 'REQUEST_FAILED';
    const locale = await getLocale();
    const message = getMessages(locale).errors[code];

    return {
      ok: true,
      value: Response.json({ code: codes[code], data: null, message, error: { code: `navidrome.${code}`, message } }),
    };
  }
}
