export const codes = {
  FILES_REQUIRED: 1501000,
  WRITE_FAILED: 1501001,
  INVALID_URL: 1502000,
  DELETE_FAILED: 1502001,
} as const;

export const messages = {
  'zh-CN': {
    FILES_REQUIRED: '请选择要上传的文件。',
    WRITE_FAILED: '文件保存失败。',
    INVALID_URL: '只能删除本服务上传目录内的文件。',
    DELETE_FAILED: '文件删除失败。',
  },
  en: {
    FILES_REQUIRED: 'Select files to upload.',
    WRITE_FAILED: 'Unable to save the uploaded files.',
    INVALID_URL: "Only files in this service's upload directory can be deleted.",
    DELETE_FAILED: 'Unable to delete the file.',
  },
};
