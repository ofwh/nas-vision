import ky from 'ky';
import { appError, errorMessage, type BaseResponse, type JsonObject } from '@/lib/api';

export function pluginPath(name: string, path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (!/^[a-zA-Z0-9_-]+$/.test(name) || !segments.length || segments.some((part) => !/^[a-zA-Z0-9_-]+$/.test(part))) {
    throw new Error(errorMessage(appError('plugin.INVALID_PATH')));
  }
  return `/api/plugin/${encodeURIComponent(name)}/${segments.map(encodeURIComponent).join('/')}`;
}
export async function pluginRequest<T>(
  url: string,
  params: JsonObject | FormData,
  onProgress?: (progress: number) => void,
): Promise<BaseResponse<T>> {
  const response = await ky
    .post(url, {
      ...(params instanceof FormData
        ? {
            body: params,
            ...(onProgress ? { onUploadProgress: (progress) => onProgress(Math.round(progress.percent * 100)) } : {}),
          }
        : { json: params }),
      retry: 0,
    })
    .json<BaseResponse<T>>();
  if (response.code !== 0) throw new Error(response.error?.message ?? response.message);
  return response;
}
