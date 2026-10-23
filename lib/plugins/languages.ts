import { defaultLocale, isLocale } from '@/i18n/config';
import type { PluginLanguages, PluginSettingOption } from '@/types/plugins';

export function pluginText(key: string, languages: PluginLanguages | undefined, locale: string): string {
  const currentLocale = isLocale(locale) ? locale : defaultLocale;

  return languages?.[currentLocale]?.[key] ?? key;
}

export function localizePluginInfo<T extends { name: string; description: string; languages?: PluginLanguages }>(
  info: T,
  locale: string,
): T {
  return {
    ...info,
    name: pluginText(info.name, info.languages, locale),
    description: pluginText(info.description, info.languages, locale),
  };
}

export function localizePluginConfigs(
  configs: PluginSettingOption[],
  languages: PluginLanguages | undefined,
  locale: string,
): PluginSettingOption[] {
  return configs.map((field) => ({
    ...field,
    label: pluginText(field.label, languages, locale),
    options: field.options?.map((option) => ({
      ...option,
      label: pluginText(option.label, languages, locale),
      description: pluginText(option.description, languages, locale),
    })),
  }));
}
