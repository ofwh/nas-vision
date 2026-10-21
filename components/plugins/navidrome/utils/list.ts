import { pluginPath, pluginRequest } from '@/lib/plugins/client';
import type { NavidromeListParams, NavidromeListRes } from '../types';

export async function fetchList(params: NavidromeListParams): Promise<NavidromeListRes> {
  return (await pluginRequest<NavidromeListRes>(pluginPath('navidrome', '/api/list'), { ...params })).data;
}
