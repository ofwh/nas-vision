import type { ErrorCode } from './codes';

/** 文案里的 `{xxx}` 按 params 替换。 */
export const MESSAGES: Record<ErrorCode, string> = {
  APP_NOT_FOUND: 'App not found.',
  APP_ID_UNKNOWN: 'No app found with id "{id}".',
  INVALID_PARAMS: 'Request body is not valid.',
  UNAUTHORIZED: 'Authentication required.',
  IFRAME_URL_INVALID: 'Target url must be an absolute http(s) address.',
  IFRAME_UNREACHABLE: 'Target url cannot be reached from the server.',
};

export function formatMessage(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    key in params ? String(params[key]) : placeholder,
  );
}
