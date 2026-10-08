import type { Locale } from '../config';
import enAccount from './en/account.json';
import enAppearance from './en/appearance.json';
import enApps from './en/apps.json';
import enCommon from './en/common.json';
import enHome from './en/home.json';
import enLanguage from './en/language.json';
import enMetadata from './en/metadata.json';
import enSettings from './en/settings.json';
import enSidebar from './en/sidebar.json';
import zhAccount from './zh-CN/account.json';
import zhAppearance from './zh-CN/appearance.json';
import zhApps from './zh-CN/apps.json';
import zhCommon from './zh-CN/common.json';
import zhHome from './zh-CN/home.json';
import zhLanguage from './zh-CN/language.json';
import zhMetadata from './zh-CN/metadata.json';
import zhSettings from './zh-CN/settings.json';
import zhSidebar from './zh-CN/sidebar.json';
const en = {
  account: enAccount,
  appearance: enAppearance,
  apps: enApps,
  common: enCommon,
  home: enHome,
  language: enLanguage,
  metadata: enMetadata,
  settings: enSettings,
  sidebar: enSidebar,
};
const zh = {
  account: zhAccount,
  appearance: zhAppearance,
  apps: zhApps,
  common: zhCommon,
  home: zhHome,
  language: zhLanguage,
  metadata: zhMetadata,
  settings: zhSettings,
  sidebar: zhSidebar,
};
export const messages = { en, 'zh-CN': zh } satisfies Record<Locale, typeof zh>;
