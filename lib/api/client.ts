import { CLIENT_ERROR_CODE, SUCCESS_CODE, type BaseResponse, type JsonObject } from '@/lib/api';
import { errorMessage } from '@/lib/api';
import { defaultLocale, isLocale } from '@/i18n/config';

/** 客户端拿到的统一结果：跟服务端信封同构，另外把成败摊平成 success。 */
export type FetchResponse<T> = {
  code: number;
  /** code === SUCCESS_CODE */
  success: boolean;
  message: string;
  data?: T;
  error?: Error;
};

/** 客户端调自家接口：HTTP 恒 200，成败只看 code；连不上服务端时给 CLIENT_ERROR_CODE。 */
export function fetchApi<T>(path: string, params: JsonObject): Promise<FetchResponse<T>> {
  return send<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

/** 传文件的走这条：请求体是 multipart，响应还是同一套信封。 */
export function fetchUpload<T>(path: string, form: FormData): Promise<FetchResponse<T>> {
  return send<T>(path, { method: 'POST', body: form });
}

async function send<T>(path: string, init: RequestInit): Promise<FetchResponse<T>> {
  try {
    const response = await fetch(path, init);

    const { code, data, message } = (await response.json()) as BaseResponse<T>;

    return {
      success: code === SUCCESS_CODE,
      code,
      message,
      data,
    };
  } catch (cause) {
    // 断网、响应不是 JSON（404/500 的 HTML）都落这；原文留 error 里，message 只给一句能看的
    const language = typeof document === 'undefined' ? defaultLocale : document.documentElement.lang;
    const message = errorMessage({ code: 'common.REQUEST_FAILED' }, isLocale(language) ? language : defaultLocale);
    const error = cause instanceof Error ? cause : new Error(message);

    return { code: CLIENT_ERROR_CODE, success: false, message, error };
  }
}
