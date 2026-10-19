# 账户接口适配

`/api/auth/[...all]` 适配 Better Auth：

- 失败转换为 HTTP 200 的统一错误信封，保留响应 cookie；原始第三方错误码仅用于服务端映射。
- 成功保留 SDK 响应结构，兼容会话和双重验证流程。
- `lib/auth-client.ts` 将失败信封适配到 SDK 的失败分支。

错误定义位于 `lib/errors/account.ts`，分配与响应规则遵守 [API 错误规范](api.md)。
