import type { AppearanceConfig } from '@/lib/db/schema/appearance';

export const defaultAppearance: AppearanceConfig = {
  language: 'zh-CN',
  theme: 'auto',
  veil: false,
};

export type AppearanceCookies = {
  language?: string;
  theme?: string;
  veil?: string;
};

export function resolveAppearance(values: AppearanceCookies): AppearanceConfig {
  return {
    language: values.language === 'en' || values.language === 'zh-CN' ? values.language : defaultAppearance.language,
    theme:
      values.theme === 'auto' || values.theme === 'light' || values.theme === 'dark'
        ? values.theme
        : defaultAppearance.theme,
    veil: values.veil === 'true' ? true : values.veil === 'false' ? false : defaultAppearance.veil,
  };
}
