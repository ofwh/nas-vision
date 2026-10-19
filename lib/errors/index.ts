import * as plugin from '@/lib/plugins/errors';
import * as config from './config';
import * as account from './account';
import * as apps from './apps';
import * as iframe from './iframe';
import * as upload from './upload';

export const BUSINESS_ERROR_CODE = {
  config: config.codes,
  account: account.codes,
  apps: apps.codes,
  plugin: plugin.codes,
  iframe: iframe.codes,
  upload: upload.codes,
} as const;

type Codes = typeof BUSINESS_ERROR_CODE;
export type BusinessErrorCode = {
  [Namespace in keyof Codes]: `${Namespace}.${keyof Codes[Namespace] & string}`;
}[keyof Codes];

export const BUSINESS_MESSAGES = {
  'zh-CN': {
    config: config.messages['zh-CN'],
    account: account.messages['zh-CN'],
    apps: apps.messages['zh-CN'],
    plugin: plugin.messages['zh-CN'],
    iframe: iframe.messages['zh-CN'],
    upload: upload.messages['zh-CN'],
  },
  en: {
    config: config.messages['en'],
    account: account.messages['en'],
    apps: apps.messages['en'],
    plugin: plugin.messages['en'],
    iframe: iframe.messages['en'],
    upload: upload.messages['en'],
  },
};
