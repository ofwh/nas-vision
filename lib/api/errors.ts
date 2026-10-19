import { BUSINESS_ERROR_CODE, type BusinessErrorCode } from '@/lib/errors';
import { ERROR_CODE as COMMON_ERROR_CODE, type CommonErrorCode } from './codes';

export const ERROR_CODE = { ...COMMON_ERROR_CODE, ...BUSINESS_ERROR_CODE } as const;

export type ErrorCode = CommonErrorCode | BusinessErrorCode;

export function businessCode(code: ErrorCode): number {
  for (const [namespace, codes] of Object.entries(ERROR_CODE)) {
    for (const [key, value] of Object.entries(codes)) {
      if (`${namespace}.${key}` === code) {
        return value;
      }
    }
  }

  return COMMON_ERROR_CODE.common.REQUEST_FAILED;
}
