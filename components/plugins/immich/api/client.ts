import type { ErrorCode } from '@/lib/api';
import type { PluginConfig } from '@/types/plugins';

export class ImmichError extends Error {
  constructor(public readonly code: ErrorCode) {
    super(code);
  }
}

type Connection = { base: string; authMode: 'apiKey' | 'password'; apiKey: string; email: string; password: string };
type Session = { expires: number; token: Promise<string> };
const sessions = new Map<string, Session>();

export function connection(config: PluginConfig): Connection {
  if (typeof config.serverUrl !== 'string' || !config.serverUrl.trim()) throw new ImmichError('common.INVALID_PARAMS');
  let url: URL;
  try {
    url = new URL(config.serverUrl.trim());
  } catch {
    throw new ImmichError('common.INVALID_PARAMS');
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !['', '/', '/api', '/api/'].includes(url.pathname)
  ) {
    throw new ImmichError('common.INVALID_PARAMS');
  }
  const authMode = config.authMode ?? 'apiKey';
  const apiKey = typeof config.apiKey === 'string' ? config.apiKey.trim() : '';
  const email = typeof config.email === 'string' ? config.email.trim() : '';
  const password = typeof config.password === 'string' ? config.password : '';
  if ((authMode !== 'apiKey' && authMode !== 'password') || (authMode === 'apiKey' ? !apiKey : !email || !password)) {
    throw new ImmichError('common.INVALID_PARAMS');
  }
  return { base: `${url.origin}/api`, authMode, apiKey, email, password };
}

type RequestOptions = { range?: string | null; signal?: AbortSignal; stream?: boolean };

async function send(url: string, init: RequestInit, stream = false): Promise<Response> {
  const controller = new AbortController();
  const timer = stream ? setTimeout(() => controller.abort(), 20_000) : undefined;
  const timeout = stream ? controller.signal : AbortSignal.timeout(20_000);
  const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  try {
    return await fetch(url, { ...init, cache: 'no-store', redirect: 'error', signal });
  } catch {
    throw new ImmichError('plugin.REQUEST_FAILED');
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function check(response: Response): void {
  if (!response.ok) throw new ImmichError('plugin.REQUEST_FAILED');
}

async function login(settings: Connection): Promise<string> {
  const response = await send(`${settings.base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: settings.email, password: settings.password }),
  });
  check(response);
  const data: { accessToken: string } = await response.json();
  if (!data.accessToken) throw new ImmichError('plugin.REQUEST_FAILED');
  return data.accessToken;
}

async function token(settings: Connection, key: string): Promise<string> {
  for (const [id, session] of sessions) if (session.expires <= Date.now()) sessions.delete(id);
  const cached = sessions.get(key);
  if (cached) return cached.token;
  if (sessions.size >= 8) sessions.delete(sessions.keys().next().value ?? '');
  const pending = login(settings);
  const session = { expires: Date.now() + 30 * 60_000, token: pending };
  sessions.set(key, session);
  try {
    return await pending;
  } catch (error) {
    if (sessions.get(key) === session) sessions.delete(key);
    throw error;
  }
}

export async function request(
  config: PluginConfig,
  path: string,
  body?: object,
  options: RequestOptions = {},
): Promise<Response> {
  const settings = connection(config);
  const key = JSON.stringify([settings.base, settings.email, settings.password]);
  const execute = async () => {
    const headers = new Headers({ Accept: options.stream ? 'video/*,application/octet-stream' : 'application/json' });
    if (options.stream) headers.set('Accept-Encoding', 'identity');
    if (options.range) headers.set('Range', options.range);
    if (settings.authMode === 'apiKey') headers.set('x-api-key', settings.apiKey);
    else headers.set('Authorization', `Bearer ${await token(settings, key)}`);
    if (body) headers.set('Content-Type', 'application/json');
    return send(
      `${settings.base}${path}`,
      {
        method: body ? 'POST' : 'GET',
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: options.signal,
      },
      options.stream,
    );
  };
  let response = await execute();
  if (response.status === 401 && settings.authMode === 'password') {
    await response.body?.cancel();
    sessions.delete(key);
    response = await execute();
  }
  if (!(options.stream && response.status === 416)) check(response);
  return response;
}

export async function json<T>(config: PluginConfig, path: string, body?: object): Promise<T> {
  return (await request(config, path, body)).json() as Promise<T>;
}
