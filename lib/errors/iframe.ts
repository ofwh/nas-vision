export const codes = {
  IFRAME_URL_INVALID: 1401000,
  IFRAME_UNREACHABLE: 1401001,
  CHECK_FAILED: 1401002,
} as const;

export const messages = {
  'zh-CN': {
    IFRAME_URL_INVALID: '目标地址必须是完整的 HTTP 或 HTTPS 地址。',
    IFRAME_UNREACHABLE: '服务器无法访问目标地址。',
    CHECK_FAILED: '嵌入检查失败，请重试。',
  },
  en: {
    IFRAME_URL_INVALID: 'Target url must be an absolute http(s) address.',
    IFRAME_UNREACHABLE: 'Target url cannot be reached from the server.',
    CHECK_FAILED: 'Unable to check embedding. Please try again.',
  },
};
