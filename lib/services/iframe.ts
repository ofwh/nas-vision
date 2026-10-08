import isLocalhost from 'is-localhost-ip';
import { appError, type Result } from '@/lib/api';

export type IframeCheckParams = {
  referer: string;
  url: string;
};

export type IframeCheckRes = {
  deny: string | null;
};

const TIMEOUT = 3000;

export async function check({ referer, url }: IframeCheckParams, signedIn: boolean): Promise<Result<IframeCheckRes>> {
  const target = toHttpUrl(url);
  if (!target) return { ok: false, error: appError('iframe.IFRAME_URL_INVALID') };

  // 访客查内网直接放行：浏览器自己就在内网里，轮不到服务端去探
  if (!signedIn && (await isIntranet(target))) {
    return { ok: true, value: { deny: null } };
  }

  const targetHeaders = await fetchHeaders(target, toHttpUrl(referer)?.href);
  if (!targetHeaders) return { ok: false, error: appError('iframe.IFRAME_UNREACHABLE') };

  return { ok: true, value: { deny: detectDeny(targetHeaders) } };
}

async function isIntranet(target: URL): Promise<boolean> {
  try {
    return await isLocalhost(target.hostname);
  } catch {
    return false;
  }
}

async function fetchHeaders(target: URL, referer?: string): Promise<Headers | null> {
  try {
    const response = await fetch(target, {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT),
      headers: referer ? { referer } : undefined,
    });

    void response.body?.cancel();
    return response.headers;
  } catch {
    return null;
  }
}

function toHttpUrl(value: string): URL | null {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed : null;
  } catch {
    return null;
  }
}

function detectDeny(headers: Headers): string | null {
  const xFrameOptions = headers.get('x-frame-options')?.trim();

  if (xFrameOptions && /^(deny|sameorigin)$/i.test(xFrameOptions)) return `X-Frame-Options: ${xFrameOptions}`;

  const sources = frameAncestors(headers.get('content-security-policy'));
  if (!sources || sources.includes('*')) return null;

  return `Content-Security-Policy: frame-ancestors ${sources.join(' ')}`;
}

function frameAncestors(policy: string | null): string[] | null {
  if (!policy) return null;

  for (const directive of policy.split(';')) {
    const [name, ...values] = directive.trim().split(/\s+/);
    if (name?.toLowerCase() === 'frame-ancestors') {
      return values.length ? values.map((value) => value.toLowerCase()) : null;
    }
  }

  return null;
}

const iframeService = { check };

export default iframeService;
