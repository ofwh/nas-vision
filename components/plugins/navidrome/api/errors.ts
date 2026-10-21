export const codes = {
  CONFIG_INVALID: 5101000,
  PARAMS_INVALID: 5102000,
  AUTH_FAILED: 5103000,
  UNREACHABLE: 5103001,
  REQUEST_FAILED: 5103002,
  INVALID_RESPONSE: 5103003,
  PLAYLIST_NAME_INVALID: 5104000,
  PLAYLIST_DESCRIPTION_INVALID: 5104001,
  PLAYLIST_VISIBILITY_INVALID: 5104002,
} as const;

export class NavidromeError extends Error {
  constructor(public readonly code: keyof typeof codes) {
    super(code);
  }
}
