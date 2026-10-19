import { appError, type Result } from '@/lib/api';
import * as repository from '@/lib/db/repositories/config';
import type { AppearanceConfig } from '@/lib/db/schema';
import { resolveAppearance, type AppearanceCookies } from '@/lib/appearance';

export type ConfigSaveParams = AppearanceConfig;
export type ConfigRes = { config: AppearanceConfig };

export function list(cookies: AppearanceCookies = {}): AppearanceConfig {
  return { ...resolveAppearance(cookies), ...repository.select() };
}

export function save(input: ConfigSaveParams): Result<AppearanceConfig> {
  if (!input || !['zh-CN', 'en'].includes(input.language)) {
    return { ok: false, error: appError('config.INVALID_LANGUAGE') };
  }

  if (!['auto', 'light', 'dark'].includes(input.theme)) {
    return { ok: false, error: appError('config.INVALID_THEME') };
  }

  if (typeof input.veil !== 'boolean') {
    return { ok: false, error: appError('config.INVALID_VEIL') };
  }

  return {
    ok: true,
    value: repository.upsert({
      language: input.language,
      theme: input.theme,
      veil: input.veil,
    }),
  };
}

const configService = { list, save };

export default configService;
