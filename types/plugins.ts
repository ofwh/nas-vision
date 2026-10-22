import type { ComponentType } from 'react';
import type { HeaderMode, WindowModalHeader } from '@/types/window';
import type { JsonObject, Result } from '@/lib/api';

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
  required?: boolean;
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
  transparent?: boolean;
  fit?: boolean;
  resizable?: boolean;
  top?: boolean;
  closeOnOverlay?: boolean;
  header?: WindowModalHeader;
  mode?: HeaderMode;
  previews?: string[];
  configs?: PluginSettingOption[];
}
export type PluginViewProps = { path: string };
export type PluginApiHandler = (request: Request, config: PluginConfig) => Result<Response> | Promise<Result<Response>>;
export type PluginApi = Record<string, Partial<Record<'GET' | 'POST', PluginApiHandler>>>;
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
