'use client';

import useSWR, { useSWRConfig } from 'swr';
import type { BaseResponse, JsonObject } from '@/lib/api';
import { pluginRequest } from '@/lib/plugins/client';
import type {
  PluginStorageCreateParams,
  PluginStorageDeleteParams,
  PluginStorageDeleteRes,
  PluginStorageQueryParams,
  PluginStorageQueryRes,
  PluginStorageUpdateParams,
  PluginStorageUpdateRes,
} from '@/types/plugins';

export function usePluginStorage(appId: string) {
  const { mutate } = useSWRConfig();
  const basePath = '/api/plugin/storage';
  const queryPath = `${basePath}/query`;

  function useQuery(params: Omit<PluginStorageQueryParams, 'appId'> | null = {}) {
    const { data, error, isLoading } = useSWR<BaseResponse<PluginStorageQueryRes>, Error>(
      params === null ? null : [queryPath, { ...params, appId }],
      ([url, body]: readonly [string, JsonObject]) => pluginRequest<PluginStorageQueryRes>(url, body),
    );

    return { success: data?.code === 0, data: data?.data ?? [], error, isLoading };
  }

  async function refresh(targetAppId: string) {
    await mutate((key: unknown) => {
      if (!Array.isArray(key) || key[0] !== queryPath) {
        return false;
      }

      const params: unknown = key[1];

      return typeof params === 'object' && params !== null && 'appId' in params && params.appId === targetAppId;
    });
  }

  async function update(params: Omit<PluginStorageCreateParams, 'appId'> | PluginStorageUpdateParams) {
    const response = await pluginRequest<PluginStorageUpdateRes>(
      `${basePath}/update`,
      'id' in params ? params : { ...params, appId },
    );

    await refresh(response.data.item.appId);

    return { success: response.code === 0, data: response.data };
  }

  async function remove(params: Omit<PluginStorageDeleteParams, 'appId'> = {}) {
    const response = await pluginRequest<PluginStorageDeleteRes>(`${basePath}/delete`, { ...params, appId });

    await refresh(response.data.appId);

    return { success: response.code === 0, data: response.data };
  }

  return { query: useQuery, update, delete: remove };
}
