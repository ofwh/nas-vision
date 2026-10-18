---
name: nas-vision-plugins
description: 在 NAS Vision 创建、接入或维护业务插件时，指导插件目录、模块注册、manifest 配置、usePlugin 钩子、API 分层和数据交互。用于本项目插件框架，不适用于浏览器扩展或 Codex 插件安装。
---

# NAS Vision 插件开发

以当前插件框架为契约实现独立插件。示例插件无需依赖其他业务插件，也不复制其接口、认证方式、数据模型或目录算法。

## 先读框架，再选择实现范围

仓库路径以项目根目录为基准：

- `types/plugins.ts`：模块、配置字段、按 HTTP 方法声明的 endpoint 和请求响应类型。
- `components/plugins/index.ts`：静态插件注册表。
- `hooks/usePlugin.ts`、`lib/plugins/client.ts`：导航上下文、查询、上传、请求信封与缓存。
- `app/api/plugin/[pluginName]/[...slug]/route.ts`、`lib/services/plugins.ts`：统一入口、分发和配置注入。
- 修改配置表单行为时再读 `components/business/AppConfig/AppPluginConfigForm.tsx`。
- 修改宿主窗口时再读 `components/home/AppItem.tsx`、`types/window.ts` 和对应窗口组件。

先核对 `AGENTS.md`，需要编写 Next.js 路由或页面时读取当前安装版本的相关指南。框架实现与本文不一致时，以源码为准，不能默默新增一个并不存在的 hook 参数或路由约定。

按任务加载参考：

- 创建目录、注册插件、声明配置：读 [目录、模块与配置](references/architecture.md)。
- 使用 `usePlugin`、请求、上传、变更与缓存：读 [数据交互](references/data-interaction.md)。
- 需要完整最小链路时：读 [独立插件示例](references/minimal-plugin.md)。它只依赖框架，不依赖外部服务或其他插件。

## 核心实现约定

- 每个插件保留根入口 `index.ts` 与独立的 `manifest.json` 文件，由入口统一导出 `component`、`api`、`manifest`。`pages/`、`api/`、`assets/`、`components/`、`hooks/`、`styles/` 按实际职责添加；没有业务 API 时在入口导出空的 `PluginApi`，无需创建空 `api/`。
- 插件独立样式文件集中放在自身 `styles/`，由使用它们的页面或组件导入；局部样式优先使用 CSS Modules，简单样式可继续通过 `className` 表达。目录与导入约定见[目录、模块与配置](references/architecture.md)。
- `manifest.id`、注册表 key、`usePlugin` 的 name、应用的 `config.pluginName` 保持一致。
- 插件页面通过 `PluginViewProps.path` 与 `usePlugin(name).page` 导航。插件内部路径不是 Next.js 路由，也不是 API 路径。
- UI 负责展示和用户事件；`api/index.ts` 按 HTTP 方法注册 handler，插件 API 解析请求、转强类型并适配 `Result<Response>`；业务判断放 service；需要数据库时才增加 repository。外部 HTTP 适配放可选的 `api/client.ts`。
- service 既导出命名方法，也 default 导出方法集合。插件共享类型放 `types/plugins.ts`，仅本插件使用的 DTO 放插件自身 `types.ts`。
- 通用 route 仅转交原始 Request 并返回插件响应；分发 service 只检查注册、启用状态、路径和方法并注入配置。插件 handler 返回 `Result<Response>`：业务 POST 在插件 API 用 `readParams` / `readForm` 解析并用 `okResponse` 拼统一信封，失败返回框架错误。GET 媒体等特殊能力的参数、响应头、状态与流处理按需封装在插件自身 API，不向通用 route 添加协议实现。
- API 边界做强类型转换不等于运行时验证。对分页、ID、范围、配置值等的业务检查放 service，不在页面或接口层重复逐字段检查。
- 浏览器请求同源插件 API，不直接携带服务端密钥连接外部服务。配置由服务端 JSON 分发注入；`secret` 只是表单遮蔽提示，不代表加密或响应脱敏。
- 当前注册表被客户端 hook 与服务端共同导入。不要在共享导出链直接引入 `server-only`、Node 专属依赖或数据库模块，使客户端构建失败。需要这类依赖时，先实现明确的客户端/服务端注册分离，不照搬现有共享入口来承载它们。

## 实现与接入顺序

1. 确定插件 ID、必要配置、领域 DTO 和接口，不预先创建空目录或用不到的模块。
2. 编写 `manifest.json`，在 `pages/` 组织所需视图，由根 `index.ts` 统一导出并注册到 `components/plugins/index.ts`。
3. 有数据需求时实现 `api/index.ts -> service`；按需增加外部 client 或 repository。
4. 用现成 hooks 接入数据，处理加载、空数据、失败、重试；写操作处理完成后定向刷新受影响缓存。
5. 在现有应用配置流程中选择插件并保存配置。插件注册不等于已经创建应用条目，也不要直接插库绕过应用 service。
6. 宿主窗口只读取并透传 manifest 的窗口选项；不要按插件 ID 硬编码头部、模式或默认参数。子弹窗在自己的调用处单独配置。

## 按需求补充，而非照搬

大列表才引入分页或虚拟化；懒加载预览才增加可见性观察；外部服务才增加连接、超时和认证适配；需要持久化业务数据才增加表与 repository。媒体、相册、地图、目录树和缓存时长均不是插件通用要求。

新增外部服务适配时先依据该服务的官方契约确认接口和权限，不将某个现成插件的路径、认证缓存或目录约束视为通用规范。

## 验证与交付

遵守仓库不新增测试用例的约定，执行与修改相关的格式、ESLint 和 TypeScript 检查。需要可视化检查时确认：插件可被选择并打开、配置能保存、业务调用成功和失败都可展示、内部导航与关闭作用于正确窗口。上传、分页、透明或缩放仅在任务涉及时检查。

说明已接入的配置与 API、执行过的检查，以及是否完成真实浏览器或外部服务验证。不要将接口类型正确视为外部服务已连通。
