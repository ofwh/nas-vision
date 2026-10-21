import type { PluginConfig } from '@/types/plugins';
import type { SubsonicResponse } from '../types';
import { NavidromeError } from './errors';

type RequestOptions = { range?: string | null; signal?: AbortSignal; media?: boolean };

export async function request(
  config: PluginConfig,
  method: string,
  params: Record<string, string> = {},
  options: RequestOptions = {},
): Promise<Response> {
  let base: URL;

  try {
    base = new URL(typeof config.serverUrl === 'string' ? config.serverUrl.trim() : '');
  } catch {
    throw new NavidromeError('CONFIG_INVALID');
  }
  if (
    !['http:', 'https:'].includes(base.protocol) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    typeof config.username !== 'string' ||
    !config.username.trim() ||
    typeof config.password !== 'string' ||
    !config.password
  ) {
    throw new NavidromeError('CONFIG_INVALID');
  }

  const password = Array.from(new TextEncoder().encode(config.password), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  const body = new URLSearchParams({
    u: config.username.trim(),
    p: `enc:${password}`,
    v: '1.16.1',
    c: 'NASVision',
    f: 'json',
    ...params,
  });
  const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded', 'Accept-Encoding': 'identity' });

  if (options.range) {
    headers.set('Range', options.range);
  }

  const controller = new AbortController();
  const timer = options.media ? setTimeout(() => controller.abort(), 20_000) : undefined;
  const timeout = options.media ? controller.signal : AbortSignal.timeout(20_000);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
  let response: Response;

  try {
    response = await fetch(`${base.href.replace(/\/$/, '')}/rest/${method}.view`, {
      method: 'POST',
      body,
      headers,
      signal,
      cache: 'no-store',
      redirect: 'error',
    });
  } catch {
    throw new NavidromeError('UNREACHABLE');
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
  if (response.status === 401 || response.status === 403) {
    await response.body?.cancel();

    throw new NavidromeError('AUTH_FAILED');
  }

  if (!response.ok && !(options.media && response.status === 416)) {
    await response.body?.cancel();

    throw new NavidromeError('REQUEST_FAILED');
  }

  return response;
}

export async function json(
  config: PluginConfig,
  method: string,
  params: Record<string, string> = {},
): Promise<SubsonicResponse> {
  const response = await request(config, method, params);
  let data: SubsonicResponse | undefined;

  try {
    const body = (await response.json()) as { 'subsonic-response'?: SubsonicResponse };

    data = body?.['subsonic-response'];
  } catch {
    throw new NavidromeError('INVALID_RESPONSE');
  }
  if (!data || !['ok', 'failed'].includes(data.status)) {
    throw new NavidromeError('INVALID_RESPONSE');
  }

  if (data.status === 'failed') {
    throw new NavidromeError([40, 41, 50].includes(data.error?.code ?? 0) ? 'AUTH_FAILED' : 'REQUEST_FAILED');
  }

  return data;
}
