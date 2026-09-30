import { CLIENT_ERROR_CODE, SUCCESS_CODE, type BaseResponse, type JsonObject } from '@/lib/api';

const REQUEST_FAILED = 'Request failed.';

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
export async function fetchApi<T>(path: string, params: JsonObject): Promise<FetchResponse<T>> {
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const { code, data, message } = (await response.json()) as BaseResponse<T>;

    return {
      success: code === SUCCESS_CODE,
      code,
      message,
      data,
    };
  } catch (cause) {
    // 断网、响应不是 JSON（404/500 的 HTML）都落这；原文留 error 里，message 只给一句能看的
    const error = cause instanceof Error ? cause : new Error(REQUEST_FAILED);

    return { code: CLIENT_ERROR_CODE, success: false, message: REQUEST_FAILED, error };
  }
}
