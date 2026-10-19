export const codes = {
  SERVER_URL_INVALID: 1601000,
  AUTH_CONFIG_INVALID: 1601001,
  DIRECTORY_MODE_INVALID: 1601002,
  INVALID_LIST: 1602000,
  DIRECTORY_FORBIDDEN: 1602001,
  INVALID_PREVIEW: 1602002,
  INVALID_ID: 1602003,
  IMAGE_UNAVAILABLE: 1603000,
  INVALID_SIZE: 1604000,
  INVALID_IMAGE_RESPONSE: 1604001,
  INVALID_RANGE: 1605000,
  INVALID_VIDEO_RESPONSE: 1605001,
  UNREACHABLE: 1606000,
  AUTH_FAILED: 1606001,
  RESOURCE_NOT_FOUND: 1606002,
  REQUEST_FAILED: 1606003,
  INVALID_RESPONSE: 1606004,
} as const;

export type ImmichErrorCode = keyof typeof codes;

export class ImmichError extends Error {
  constructor(public readonly code: ImmichErrorCode) {
    super(code);
  }
}

export const messages = {
  'zh-CN': {
    SERVER_URL_INVALID: 'Immich 服务地址无效。',
    AUTH_CONFIG_INVALID: 'Immich 认证方式或凭据配置无效。',
    DIRECTORY_MODE_INVALID: 'Immich 目录模式无效。',
    INVALID_LIST: '媒体列表的分页、目录或模式参数无效。',
    DIRECTORY_FORBIDDEN: '目录路径无效或不在配置的根目录内。',
    INVALID_PREVIEW: '目录预览参数无效。',
    INVALID_ID: '媒体或相册 ID 无效。',
    IMAGE_UNAVAILABLE: '照片不存在、已删除或不是图片。',
    INVALID_SIZE: '缩略图尺寸无效。',
    INVALID_IMAGE_RESPONSE: 'Immich 返回的缩略图格式无效。',
    INVALID_RANGE: '视频 Range 参数无效。',
    INVALID_VIDEO_RESPONSE: 'Immich 返回的视频格式无效。',
    UNREACHABLE: '无法连接 Immich 服务。',
    AUTH_FAILED: 'Immich 认证失败，请检查凭据。',
    RESOURCE_NOT_FOUND: 'Immich 资源不存在。',
    REQUEST_FAILED: 'Immich 请求失败，请稍后重试。',
    INVALID_RESPONSE: 'Immich 返回的数据无效。',
  },
  en: {
    SERVER_URL_INVALID: 'The Immich server URL is invalid.',
    AUTH_CONFIG_INVALID: 'The Immich authentication method or credentials are invalid.',
    DIRECTORY_MODE_INVALID: 'The Immich directory mode is invalid.',
    INVALID_LIST: 'The media list pagination, directory, or mode is invalid.',
    DIRECTORY_FORBIDDEN: 'The directory path is invalid or outside the configured root.',
    INVALID_PREVIEW: 'The directory preview parameters are invalid.',
    INVALID_ID: 'The media or album ID is invalid.',
    IMAGE_UNAVAILABLE: 'The photo is missing, deleted, or not an image.',
    INVALID_SIZE: 'The thumbnail size is invalid.',
    INVALID_IMAGE_RESPONSE: 'Immich returned an invalid thumbnail format.',
    INVALID_RANGE: 'The video Range header is invalid.',
    INVALID_VIDEO_RESPONSE: 'Immich returned an invalid video format.',
    UNREACHABLE: 'Unable to connect to Immich.',
    AUTH_FAILED: 'Immich authentication failed. Check your credentials.',
    RESOURCE_NOT_FOUND: 'The Immich resource was not found.',
    REQUEST_FAILED: 'The Immich request failed. Please try again.',
    INVALID_RESPONSE: 'Immich returned invalid data.',
  },
};
