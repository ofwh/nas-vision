export const codes = {
  LOAD_FAILED: 1001000,
  SAVE_FAILED: 1001001,
  INVALID_LANGUAGE: 1001002,
  INVALID_THEME: 1001003,
  INVALID_VEIL: 1001004,
} as const;

export const messages = {
  'zh-CN': {
    LOAD_FAILED: '无法加载外观设置。',
    SAVE_FAILED: '无法保存外观设置。',
    INVALID_LANGUAGE: '不支持所选语言。',
    INVALID_THEME: '不支持所选主题。',
    INVALID_VEIL: '遮罩设置必须为布尔值。',
  },
  en: {
    LOAD_FAILED: 'Unable to load appearance settings.',
    SAVE_FAILED: 'Unable to save appearance settings.',
    INVALID_LANGUAGE: 'The selected language is not supported.',
    INVALID_THEME: 'The selected theme is not supported.',
    INVALID_VEIL: 'The veil setting must be a boolean.',
  },
};
