import type { PluginConfig, PluginFieldType, PluginSettingCondition } from '@/types/plugins';

export function matchesPluginCondition(condition: PluginSettingCondition | undefined, config: PluginConfig): boolean {
  if (!condition) {
    return true;
  }

  if ('and' in condition) {
    return condition.and.every((item) => matchesPluginCondition(item, config));
  }

  if ('or' in condition) {
    return condition.or.some((item) => matchesPluginCondition(item, config));
  }

  return config[condition.key] === condition.value;
}

export function isPluginFieldEmpty(value: PluginFieldType | undefined): boolean {
  if (value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  return Array.isArray(value) && !value.some((item) => typeof item !== 'string' || item.trim() !== '');
}
