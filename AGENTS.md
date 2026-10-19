# AGENTS.md

本文件规定在本仓库中工作的编码代理应遵守的规则。

## 接口

### 方法与路径

- 业务接口统一使用 POST，不使用 RESTful 规范。
- 不需要鉴权的接口统一放在 `/api/public` 下；需要按登录状态返回不同数据时，接口内部获取 session，业务处理交给 service。
- 路径里不带 `[id]` 这类参数，参数统一放 body。
- 新增和更新合并成一个接口，靠 body 里可选的 `id` 区分：带 `id` 是更新，不带是新增。

### 请求

- 请求体类型命名 `<模块>XxxParams`。
- 请求体在接口层直接转成强类型（`readParams`），不做逐字段校验 —— 要校验就加到对应的 service 里。

### 响应、错误与鉴权

- 业务响应使用 `BaseResponse<T>`，HTTP 状态为 200，`code: 0` 表示成功；失败时 `data: null`，`message` 与 `error.message` 相同。请求解析失败也返回此信封。
- 错误由 service 判断，API 构造响应。公共错误、业务错误的归属与编号规则见 [API 错误规范](docs/api.md)。
- 鉴权统一由 `proxy.ts` 处理，接口不重复校验登录。

## 分层

调用链 `api -> services -> repositories -> db`，按需复杂度实现；**api 和 services 两层必须有**。

- **api** —— 请求体转强类型、调 service、拼 `BaseResponse`。不写业务判断，不直接碰 db / repositories。
- **services** —— 负责业务规则与参数校验。不写 SQL，读写交给 repository。
- **repositories** —— 只跟库打交道，不做业务判断，只被 services 调用。
- **db** —— drizzle 实例与 schema。

service 的约定：

- 方法名用简洁动词：list / create / update / save / updateStatus / remove / sort。
- 既导出单个方法，也通过 default 导出全量方法，调用方写 `service.xxx(...)`。

## 插件资源

- 插件私有图片、文件、模块、样式、类型、错误码及接口全部在 `components/plugins/<插件>/` 内保存、引用和按需导出，不放入公共目录或公共聚合导出。
- 宿主仅通过插件根入口的 `component`、`api`、`manifest` 接入。插件内部 API 自行处理具体业务错误，宿主只转交已构造的响应。

## UI 组件

- 使用 UI 组件时，优先使用本地已有的组件；本地没有对应组件时，通过 `pnpm dlx shadcn@latest add <name>` 安装并使用。
- 不修改 `components/ui` 目录下的组件，保持为 shadcn 安装的原始文件。
- 样式定制通过调用处的 `className`、全局样式或 `components/ui` 目录外的封装实现。

## 类型

- 使用明确类型；存在多个确定形态时使用联合类型。
- 禁止 `any`；无法确定类型时才使用 `unknown`，使用前先收窄。

## 注释

- 极度精简：只在关键业务转折与关键参数处写，其余一律不写。
- 显而易见、复述代码的注释不写；不保留过程痕迹。

## 文档

- 仅保留设计、实现说明与开发规范，不维护任务过程、完成记录或变更流水。
- 错误码等可从源码查询的定义不在文档重复列举；文档只说明分配、归属与接入规则。

## 测试

- 不添加测试用例。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
