import { defaultLocale, type Locale } from '@/i18n/config';
import type { ErrorCode } from './codes';
import { businessCode } from './codes';
import { formatMessage } from './messages';

export type { ErrorCode } from './codes';
export { CLIENT_ERROR_CODE, ERROR_CODE } from './codes';
export { MESSAGES } from './messages';
export type { JsonObject, JsonValue } from './json';

export const SUCCESS_CODE = 0;

export type AppError = {
  code: ErrorCode;
  params?: Record<string, string | number>;
};

export type Result<T> = { ok: true; value: T } | { ok: false; error: AppError };

export type ResponseError = { code: ErrorCode; message: string };

/** HTTP 恒为 200，成败只看 code；失败时 data 为 null。 */
export type BaseResponse<T> = {
  code: number;
  data: T;
  error?: ResponseError;
  message: string;
};

export function appError(code: ErrorCode, params?: AppError['params']): AppError {
  return { code, params };
}

export function errorMessage(error: AppError, locale: Locale = defaultLocale): string {
  return formatMessage(error.code, error.params, locale);
}

export function okResponse<T>(data: T, message = 'OK'): Response {
  return Response.json({ code: SUCCESS_CODE, data, message } satisfies BaseResponse<T>);
}

export function errorResponse(error: AppError, locale: Locale = defaultLocale): Response {
  const message = errorMessage(error, locale);

  return Response.json({
    code: businessCode(error.code),
    data: null,
    error: { code: error.code, message },
    message,
  } satisfies BaseResponse<null>);
}

/** 唯一允许断言请求体的地方；JSON 解不出来必须回错误码，抛出去会变成 500。 */
export async function readParams<T>(request: Request): Promise<Result<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    // 注释不能删：eslint no-empty 会报空 catch。
    return { ok: false, error: appError('common.INVALID_PARAMS') };
  }

  return { ok: true, value: body as T };
}

/** 同 readParams，换成 multipart 表单；表单本身坏了也不能抛成 500。 */
export async function readForm(request: Request): Promise<Result<FormData>> {
  try {
    return { ok: true, value: await request.formData() };
  } catch {
    return { ok: false, error: appError('common.INVALID_PARAMS') };
  }
}
