export type ErrorCode =
  | 'APP_NOT_FOUND'
  /** 移动时给的邻居 id 库里没有。params: { id } */
  | 'APP_ID_UNKNOWN'
  | 'INVALID_PARAMS'
  | 'UNAUTHORIZED'
  /** 内嵌检查的地址不是 http(s) 绝对地址。 */
  | 'IFRAME_URL_INVALID'
  /** 服务端取不到内嵌目标，判定不了。 */
  | 'IFRAME_UNREACHABLE';

/** 请求没到服务端（断网、响应解析失败），客户端自造的码。 */
export const CLIENT_ERROR_CODE = -1;

export const ERROR_CODE: Record<ErrorCode, number> = {
  APP_NOT_FOUND: 404,
  APP_ID_UNKNOWN: 400,
  INVALID_PARAMS: 400,
  UNAUTHORIZED: 401,
  IFRAME_URL_INVALID: 400,
  IFRAME_UNREACHABLE: 502,
};
