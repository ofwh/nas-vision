export const ERROR_CODE = {
  common: {
    INVALID_PARAMS: 1000,
    UNAUTHORIZED: 1001,
    FORBIDDEN: 1002,
    NOT_FOUND: 1003,
    TOO_MANY_REQUESTS: 1004,
    INTERNAL_ERROR: 1005,
    BAD_GATEWAY: 1006,
    REQUEST_FAILED: 1007,
  },
} as const;

type Codes = typeof ERROR_CODE;
export type CommonErrorCode = {
  [Namespace in keyof Codes]: `${Namespace}.${keyof Codes[Namespace] & string}`;
}[keyof Codes];

export const CLIENT_ERROR_CODE = ERROR_CODE.common.REQUEST_FAILED;
