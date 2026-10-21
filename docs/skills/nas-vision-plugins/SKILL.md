---
name: nas-vision-plugins
description: 在 NAS Vision 创建、接入或维护插件时，指导模块注册、manifest、配置、内部导航、插件内多语言与 API 数据交互。适用于本项目插件框架，不用于浏览器扩展或 Codex 插件安装。
---

# NAS Vision 插件开发

遵守仓库 [AGENTS.md](../../../AGENTS.md)。以框架源码为准，插件私有实现留在 `components/plugins/<插件>/`，宿主仅通过根入口的 `component`、`api`、`manifest` 接入。

## 按任务读取

| 任务                   | 参考                                                                         | 源码                                                                     |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 创建插件、注册、配置   | [目录与配置](references/architecture.md)                                     | `types/plugins.ts`、`components/plugins/index.ts`                        |
| 导航、请求、上传、缓存 | [数据交互](references/data-interaction.md)                                   | `hooks/usePlugin.ts`、`lib/plugins/client.ts`、`lib/services/plugins.ts` |
| 创建最小展示插件       | [最小插件](references/minimal-plugin.md)                                     | 仅使用模块注册与展示能力                                                 |
| 调整配置表单           | [目录与配置](references/architecture.md#配置)                                | `components/business/AppConfig/AppPluginConfigForm.tsx`                  |
| 样式命名与隔离         | [样式规范](references/architecture.md#样式规范)                              | `components/plugins/<插件>/styles/`                                      |
| 页面与接口文案         | [语言](references/architecture.md#语言)                                      | `components/plugins/<插件>/i18n/`                                        |
| 设计、接入插件窗口     | [窗口与公共组件](#窗口与公共组件)、[弹窗技能](../nas-vision-modals/SKILL.md) | `components/home/AppItem.tsx`、`types/window.ts`                         |

源码路径均相对于仓库根目录。编写 Next.js 路由或页面前，读取当前安装版本的相关指南。

## 核心边界

- `manifest.id`、注册表 key、`usePlugin(name)` 的 name 和应用的 `config.pluginName` 一致。
- 插件按功能拆分模块，复杂模块按职责继续细分，页面入口负责组合与协调。
- 视图使用 `PluginViewProps.path` 与 `page.navigate` 导航；内部导航与 API 路径相互独立。
- 仅在有业务接口时增加 API 和 service；需要外部请求或数据库时再增加 client 或 repository。分层与类型要求遵守 AGENTS.md。
- 页面与接口返回文案集中保存在插件自身 `i18n/` 目录，不加入宿主公共语言文件；语言选择复用宿主 locale。插件信息及配置标签仍保存在 `manifest.json`，不处理 locale。
- 私有资源、样式、DTO 和错误留在插件目录；公共类型仅描述框架能力。错误响应遵守 [API 错误规范](../../api.md)。
- 当前注册表同时被浏览器和服务端导入，`api/` 目录不提供构建隔离。共享导出链不能包含密钥字面量、`server-only` 或 Node 专属依赖；需要服务端专属模块时先分离注册入口。
- 浏览器通过同源插件 API 请求服务端能力。`secret` 仅控制表单遮蔽，不提供加密或配置响应脱敏。

## 窗口与公共组件

- 根据交互需求按需选择 `WindowModal` 的现有模式、参数与组合方式，不预设统一窗口布局。先核对当前公共接口及[弹窗技能](../nas-vision-modals/SKILL.md)，基于已有能力设计实现，不假定存在尚未提供的能力。
- 插件主视图由宿主创建窗口，通过 manifest 声明已有窗口选项；仅在需要独立子窗口时在插件内部使用 `WindowModal`，避免重复包裹主视图。
- 插件功能与样式定制通过现有参数、插槽、上下文及插件内部组件组合完成，不修改 `WindowModal`、`LiquidGlassModal`、窗口控制等公共组件，也不通过全局样式覆盖等方式改变其他调用方的行为。
- 现有能力不足且确需调整公共组件时，先提出方案，说明需求与能力缺口、现有组合方式为何无法满足、拟调整的公共接口与实现、受影响的调用方，以及保持现有默认行为和兼容性的方式。方案不得引入特定插件分支或使其他模块必须迁移；无法保证不影响其他模块时，继续调整方案。
- 公共组件调整方案须经用户明确确认后才能实施；插件开发任务本身不视为确认。确认前不修改公共组件及相关公共类型或宿主适配，仅继续不依赖该调整的插件工作。实施范围限于已确认方案，新增调整须另行确认。`components/ui` 仍遵守仓库禁止修改的约束。

## 接入

1. 按实际功能添加文件，在根入口导出模块并加入静态注册表。
2. 通过现有应用配置流程选择插件并保存；注册本身不会创建应用条目。
3. 按需接入配置、数据请求和内部导航；数据视图处理加载、空态与错误，写操作成功后刷新受影响缓存。
4. 按[窗口与公共组件](#窗口与公共组件)选择窗口方案；主窗口选项由 manifest 声明，宿主统一解释，内部子窗口单独配置。

仅检查任务涉及的行为与文件，不新增测试用例。报告实际执行的检查；类型与格式检查不代表浏览器交互或外部服务已验证。
