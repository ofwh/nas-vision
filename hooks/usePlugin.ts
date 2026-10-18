'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';
import { appError, errorMessage, type BaseResponse, type JsonObject } from '@/lib/api';
import plugins from '@/components/plugins';
import { pluginPath, pluginRequest } from '@/lib/plugins/client';
import type { PluginConfig, PluginModule, PluginQueryRes } from '@/lib/plugins/types';

type PluginPage = {
  isOpen: boolean;
  path: string;
  open: (path?: string) => void;
  navigate: (path: string) => void;
  close: () => void;
};
export const PluginPageContext = createContext<PluginPage | null>(null);

function usePluginRequest<T>(path: string | null, params: JsonObject) {
  const { data, error, isLoading } = useSWR<BaseResponse<T>, Error>(
    path ? [path, params] : null,
    ([url, body]: readonly [string, JsonObject]) => pluginRequest<T>(url, body),
  );
  return { success: data?.code === 0, data: data?.data, error, isLoading };
}
export function usePluginFetch<T>(name: string, path: string | null, params: JsonObject = {}) {
  return usePluginRequest<T>(name && path ? pluginPath(name, path) : null, params);
}
export function usePluginUpload<T>(name: string, path: string, formData?: FormData) {
  const [progress, setProgress] = useState(0);
  const { data, error, isMutating, trigger } = useSWRMutation<BaseResponse<T>, Error, string, FormData>(
    pluginPath(name, path),
    (url, { arg }) => {
      setProgress(0);
      return pluginRequest<T>(url, arg, setProgress);
    },
  );
  useEffect(() => {
    if (formData) void trigger(formData).catch(() => undefined);
  }, [formData, trigger]);
  return { success: data?.code === 0, progress, data: data?.data, error, isLoading: isMutating };
}
export function usePlugin(name: string) {
  const { mutate } = useSWRConfig();
  const parentPage = useContext(PluginPageContext);
  const [isOpen, setOpen] = useState(false);
  const [path, setPath] = useState('/');
  const page = parentPage ?? {
    isOpen,
    path,
    open: (target = '/') => {
      setPath(target);
      setOpen(true);
    },
    navigate: setPath,
    close: () => setOpen(false),
  };
  const app = useSWR<Pick<PluginModule, 'component' | 'manifest'>, Error>(
    name && page.isOpen ? ['plugin-module', name] : null,
    async ([, pluginName]: readonly [string, string]) => {
      const plugin = Object.hasOwn(plugins, pluginName) ? plugins[pluginName] : undefined;
      if (!plugin) throw new Error(errorMessage(appError('plugin.NOT_FOUND')));
      const { component, manifest } = plugin;
      if (manifest.status !== 'on') throw new Error(errorMessage(appError('plugin.DISABLED')));
      return { component, manifest };
    },
  );
  function useFetch<T>(path: string | null, params: JsonObject = {}) {
    return usePluginFetch<T>(name, path, params);
  }
  function useUpload<T>(path: string, formData?: FormData) {
    return usePluginUpload<T>(name, path, formData);
  }
  function useQuery() {
    return usePluginRequest<PluginQueryRes>(name ? '/api/plugin/query' : null, { id: name });
  }
  async function update(values: PluginConfig) {
    const response = await pluginRequest<PluginQueryRes>('/api/plugin/update', { id: name, config: values });
    await mutate(['/api/plugin/query', { id: name }], response, { revalidate: false });
    return { success: response.code === 0, data: response.data };
  }
  return {
    page,
    config: { query: useQuery, update },
    api: { fetch: useFetch, upload: useUpload },
    app: {
      ...app.data,
      manifest: app.data?.manifest ?? plugins[name]?.manifest,
      error: app.error,
      isLoading: app.isLoading,
    },
  };
}
