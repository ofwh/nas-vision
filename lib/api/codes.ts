export const ERROR_CODE = {
  common: {
    INVALID_PARAMS: 400,
    UNAUTHORIZED: 401,
    REQUEST_FAILED: -1,
  },
  config: {
    CONFIG_FAILED: 500,
  },
  account: {
    COPY_FAILED: 400,
    INVALID_PASSWORD: 400,
    CURRENT_PASSWORD_REQUIRED: 400,
    NEW_PASSWORD_REQUIRED: 400,
    CONFIRM_PASSWORD_REQUIRED: 400,
    PASSWORD_TOO_SHORT: 400,
    PASSWORD_TOO_LONG: 400,
    PASSWORD_MISMATCH: 400,
    PASSWORD_UNCHANGED: 400,
    INVALID_CODE: 400,
    TWO_FACTOR_EXPIRED: 401,
    ACCOUNT_LOCKED: 429,
    TWO_FACTOR_ALREADY_ENABLED: 400,
    SECURITY_FAILED: 500,
  },
  apps: {
    APP_NOT_FOUND: 404,
    APP_ID_UNKNOWN: 400,
  },
  iframe: {
    IFRAME_URL_INVALID: 400,
    IFRAME_UNREACHABLE: 502,
  },
} as const;

type Codes = typeof ERROR_CODE;
export type ErrorCode = {
  [Namespace in keyof Codes]: `${Namespace}.${keyof Codes[Namespace] & string}`;
}[keyof Codes];

export const CLIENT_ERROR_CODE = ERROR_CODE.common.REQUEST_FAILED;

export function businessCode(code: ErrorCode): number {
  for (const [namespace, codes] of Object.entries(ERROR_CODE)) {
    for (const [key, value] of Object.entries(codes)) {
      if (`${namespace}.${key}` === code) return value;
    }
  }
  return ERROR_CODE.common.REQUEST_FAILED;
}
