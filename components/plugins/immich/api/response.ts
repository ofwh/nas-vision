import { getLocale } from 'next-intl/server';
import type { Result } from '@/lib/api';
import { getMessages } from '../i18n';
import { codes, ImmichError } from './errors';

export async function run(action: () => Promise<Response>): Promise<Result<Response>> {
  try {
    return { ok: true, value: await action() };
  } catch (error) {
    const code = error instanceof ImmichError ? error.code : 'REQUEST_FAILED';
    const locale = await getLocale();
    const message = getMessages(locale).errors[code];
    const response = Response.json({
      code: codes[code],
      data: null,
      error: { code: `immich.${code}`, message },
      message,
    });

    return { ok: true, value: response };
  }
}
