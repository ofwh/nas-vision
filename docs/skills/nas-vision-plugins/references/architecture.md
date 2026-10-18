# 目录、模块与配置

## 目录与文件职责

每个插件根目录必需包含 `index.ts` 和 `manifest.json`。其余目录随功能增加，不为了凑齐目录树创建空模块。新插件使用 `pages/` 组织视图；已有 `page/` 或 `page.tsx` 的插件按当前入口解析即可，不因遵循本规范顺带重构无关插件。

```text
components/plugins/<plugin-id>/
├── index.ts              必需：对外统一导出 component、api、manifest
├── manifest.json         必需：独立的 JSON 元数据、窗口选项与配置字段
├── types.ts              按需：本插件的 Params、Res、领域与上游 DTO
├── pages/                按需：视图入口、内部导航及页面组合
│   └── index.tsx         默认视图组件，接收 PluginViewProps.path
├── components/           按需：从页面拆分的展示与交互组件
├── hooks/                按需：查询组合、分页、状态与视口逻辑
├── styles/               按需：本插件的样式文件，如 CSS Modules
├── assets/               按需：本插件使用的图片、图标等静态资源
└── api/                  按需：有业务接口时添加
    ├── index.ts          路径与 HTTP 方法映射、参数转换与响应适配
    ├── service.ts        业务判断、上游数据映射与用例
    └── client.ts         按需：外部 HTTP、连接配置、认证、超时
```

- `pages/` 承载页面组合，通过 `path` 分发内部视图；它不是 Next.js 的 Pages Router，不在这里声明 HTTP route。
- `components/` 放页面复用或值得单独维护的组件；只有一个简单视图时无需提前拆分。
- `hooks/` 放有实际复用或组合价值的插件私有逻辑，简单查询可直接使用框架 hook。
- `styles/` 集中保存插件的独立样式文件，按页面或组件命名，例如 `styles/Gallery.module.css`，由对应组件通过 `import styles from '../styles/Gallery.module.css'` 引用。局部样式优先使用 CSS Modules，避免影响宿主或其他插件；简单样式仍可使用 `className`，没有独立样式文件时不创建空目录。复用本地 UI 组件时通过调用处的 `className` 或插件封装定制，不修改 `components/ui`。
- `assets/` 仅在存在插件私有静态资源时创建。可打包资源通过模块导入；必须直接以 URL 访问的文件使用项目 `public/` 资源约定，不假定插件目录自动提供静态 URL。资源和 manifest 不存真实密钥。
- `api/` 有接口才创建，但 `api` 导出始终存在。纯展示插件可直接在根入口导出 `const api: PluginApi = {}`；需要业务接口时由 `api/index.ts` 调用 service，再按需增加 client。
- 数据库 repository 与 schema 仍使用 `lib/db/repositories`、`lib/db/schema`，不把 SQL 写进插件 service。

公共类型放根目录 `types/` 对应模块，插件局部类型留在自身 `types.ts`。目录名称表达职责，不从另一个业务插件导入 DTO、hook 或 service 来填充模块。

## 入口与注册

每个插件必须以独立的 `manifest.json` 声明元数据与配置，不使用 TypeScript manifest，也不在入口内联配置对象。JSON 中只保存可序列化的声明，不放 React 节点或执行逻辑。

根 `index.ts` 是统一的对外契约，负责导入 JSON 并导出具备 `PluginManifest` 类型的 manifest。宿主注册表只从插件根入口导入，不分别拼接内部文件。有业务 API 的插件入口示例：

```ts
import type { PluginManifest } from '@/types/plugins';
import definition from './manifest.json';

export { default as component } from './pages';
export { default as api } from './api';
export const manifest = definition as PluginManifest;
```

`pages/index.tsx` 和 `api/index.ts` 使用 default 导出；没有接口时由根入口声明空 `PluginApi`。JSON 导入的类型断言不提供运行时验证，仍需按 `PluginManifest` 核对必需字段及枚举值，避免断言掩盖配置错误。调整内部目录时只同步入口，不改变框架的三个导出名称。

在 `components/plugins/index.ts` 中使用命名空间导入，加入已有表：

```ts
import * as textTools from './text-tools';

// 在已有 plugins 对象中添加，而非替换其他条目：
// 'text-tools': textTools
```

注册表是静态注册，不存在仅凭插件目录名自动发现的机制。`status: 'off'` 会被模块加载和业务分发拒绝。

## manifest 的职责

必需元数据包括 `id`、`name`、`description`、`icon`、`status`、`size: { width, height }`。可选窗口参数为 `mode`、`header`、`transparent`、`resizable`、`top`；模式取值以 `types/window.ts` 为准。`previews` 与 `configs` 可省略。

窗口参数用于宿主插件弹窗；业务连接和用户可编辑选项属于 `configs`。不要把可编辑 API Key 或服务地址做成顶层窗口字段。

`AppPluginDialog` 透传窗口参数，`WindowModal` 默认 `controls` 并解释 `header=false`。内部二级弹窗不会自动继承主弹窗的选项。

## 配置表单 schema

每个 `PluginSettingOption` 包含：

| 字段           | 作用                                                              |
| -------------- | ----------------------------------------------------------------- |
| `key`、`label` | 配置键与显示名称                                                  |
| `type`         | 当前为 `input`、`switch`、`combobox`                              |
| `value`        | 字段值类型的样本；不是数据库中已保存的当前值                      |
| `defaults`     | 没有已保存配置时使用的默认值，建议显式声明                        |
| `secret`       | input 使用密码展示和显隐切换                                      |
| `options`      | combobox 的 `label`、`value`、`description` 选项                  |
| `multiple`     | 多选，值应为同一原始类型的数组                                    |
| `conditions`   | 单条件 `{ key, value }` 或递归 `{ and: [...] }` / `{ or: [...] }` |

值类型仅包括 `string`、`number`、`boolean` 和各自的同类型数组，不包括任意嵌套对象、混合数组或 null。

```json
{
  "label": "启用大写输出",
  "key": "uppercase",
  "type": "switch",
  "value": false,
  "defaults": false
}
```

条件显示由配置表单完成；隐藏字段的值不会因此自动清除，service 仍需按所选业务模式解释配置。当前单条件比较是严格相等，不是数组包含或深度匹配。

### 配置保存与作用范围

- `POST /api/plugin/config`，body `{ id }`：取得字段定义。
- `POST /api/plugin/query`，body `{ id }`：取得 `{ manifest, config }`。
- `POST /api/plugin/update`，body `{ id, config }`：保存配置并返回同一结构。
- `POST /api/plugin/list`，body `{}`：获取插件列表。

配置按插件 ID 保存，不按 AppItem ID 保存。多个应用条目选择同一插件时共享配置，不要误称为每个应用各自独立配置。

没有已保存配置时，框架按 `defaults ?? ''` 初始化；已有配置当前直接返回，新增字段不会自动合并默认值。service 应为可缺失的字段提供业务默认值，或在确有需求时实现配置迁移。

`PluginConfig` 是字段类型的联合记录。不要直接把 `config.serverUrl` 当作 string 或把 `config.limit` 当作 number；在 service / 外部 client 中收窄确定类型。

## 模块边界

`api/index.ts` 是业务调用适配层，不是独立的 Next.js route。插件的所有 endpoint 由现有 catch-all route 分发，一般无需新建 `app/api/plugin/<id>/...` 路由文件。

`PluginApi` 按路径和 HTTP 方法声明，例如 `{ 'api/list': { POST: handler } }`。handler 接收 `(request, config)` 并返回 `Result<Response>`；原始 Request 的 body、query、headers 和取消信号由插件 API 按需使用。业务 JSON 请求使用 `readParams<Params>`，成功使用 `okResponse`。上传用 `readForm`；媒体流等能力可在插件 `api/` 内拆独立模块处理响应头、状态和流。通用 route 不解析特定协议，也不为某种能力设置专属分发分支。service 处理业务规则，client 只处理外部协议，repository 只处理数据库读写。无需数据库时不增加 repository。

共享注册表当前也被浏览器使用。把函数放在 `api/` 目录不等于实现了编译层面的服务端隔离；不要把私钥字面量或 Node/server-only 依赖放进其共享导出链。
