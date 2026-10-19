export const codes = {
  NOT_FOUND: 1301000,
  DISABLED: 1301001,
  NAME_REQUIRED: 1301002,
  LIST_FAILED: 1301003,
  INVALID_CONFIG: 1302000,
  CONFIG_READ_FAILED: 1302001,
  CONFIG_SAVE_FAILED: 1302002,
  ENDPOINT_NOT_FOUND: 1303000,
  REQUEST_FAILED: 1303001,
  INVALID_PATH: 1303002,
} as const;

export const messages = {
  'zh-CN': {
    NOT_FOUND: '插件不存在。',
    DISABLED: '插件已停用。',
    NAME_REQUIRED: '请提供插件名称。',
    LIST_FAILED: '无法加载插件列表。',
    INVALID_CONFIG: '插件配置值格式无效。',
    CONFIG_READ_FAILED: '无法加载插件配置。',
    CONFIG_SAVE_FAILED: '无法保存插件配置。',
    ENDPOINT_NOT_FOUND: '插件接口不存在。',
    REQUEST_FAILED: '插件请求失败，请稍后重试。',
    INVALID_PATH: '插件接口路径无效。',
  },
  en: {
    NOT_FOUND: 'Plugin not found.',
    DISABLED: 'Plugin is disabled.',
    NAME_REQUIRED: 'A plugin name is required.',
    LIST_FAILED: 'Unable to load the plugin list.',
    INVALID_CONFIG: 'The plugin configuration values are invalid.',
    CONFIG_READ_FAILED: 'Unable to load the plugin configuration.',
    CONFIG_SAVE_FAILED: 'Unable to save the plugin configuration.',
    ENDPOINT_NOT_FOUND: 'Plugin endpoint not found.',
    REQUEST_FAILED: 'Plugin request failed. Please try again.',
    INVALID_PATH: 'The plugin endpoint path is invalid.',
  },
};
