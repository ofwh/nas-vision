import type { ComponentType } from 'react';
import type { JsonObject, JsonValue, Result } from '@/lib/api';

export type PluginFieldType = string | number | boolean | string[] | number[] | boolean[];
export type PluginFieldOption = { label: string; value: PluginFieldType; description: string };
export type PluginFormType = 'input' | 'switch' | 'combobox';
export type PluginSettingConditionItem = {
  key: string;
  value: PluginFieldType;
};
export type PluginSettingCondition =
  PluginSettingConditionItem | { and: PluginSettingCondition[] } | { or: PluginSettingCondition[] };
export type PluginSettingOption = {
  label: string;
  key: string;
  type: PluginFormType;
  value: PluginFieldType;
  secret?: boolean;
  defaults?: PluginFieldType;
  multiple?: boolean;
  options?: PluginFieldOption[];
  conditions?: PluginSettingCondition;
};
export type PluginConfig = Record<string, PluginFieldType>;
export interface PluginManifest {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'on' | 'off';
  size: { width: number; height: number };
  previews?: string[];
  configs?: PluginSettingOption[];
}
export type PluginViewProps = { path: string };
export type PluginJsonEndpoint = {
  type: 'json';
  handle: (params: JsonObject, config: PluginConfig) => Result<JsonValue> | Promise<Result<JsonValue>>;
};
export type PluginUploadEndpoint = {
  type: 'upload';
  handle: (params: FormData) => Result<JsonValue> | Promise<Result<JsonValue>>;
};
export type PluginApi = Record<string, PluginJsonEndpoint | PluginUploadEndpoint>;
export type PluginModule = { component: ComponentType<PluginViewProps>; api: PluginApi; manifest: PluginManifest };
export type PluginQueryRes = { manifest: PluginManifest; config: PluginConfig };
export type PluginConfigRes = { configs: PluginSettingOption[] };
export type PluginRequestParams = JsonObject;
export type PluginQueryParams = { id: string };
export type PluginConfigParams = { id: string };
export type PluginUpdateParams = { id: string; config: PluginConfig };
export type PluginListParams = Record<string, never>;
export type PluginListItem = Pick<PluginManifest, 'name' | 'description' | 'icon' | 'status'> & { id: string };
export type PluginListRes = { plugins: PluginListItem[] };
