# 目录与配置

## 文件职责

```text
components/plugins/<plugin-id>/
├── index.ts          必需：导出 component、api、manifest
├── manifest.json     必需：元数据、窗口选项与配置声明
├── pages/            视图入口与内部导航
├── types.ts          私有 Params、Res 与领域类型
├── components/       展示与交互组件
├── hooks/            可复用的状态与请求组合
├── styles/           按需存放独立样式文件，优先使用 Tailwind 样式
├── assets/           私有图片、图标与文件
├── i18n/             语言资源与插件内翻译入口
└── api/              有业务接口时添加
    ├── index.ts      路径与方法映射、参数解析、响应适配
    ├── service.ts    业务判断
    ├── client.ts     外部协议适配
    ├── errors.ts     私有错误码与类型
    └── response.ts   私有错误响应适配
```

除根入口和 manifest 外，其余文件按需创建。新视图使用 `pages/`；它不是 Next.js Pages Router。已有插件无需为统一目录名重构。

- 无业务接口时，根入口导出空的 `PluginApi`，无需创建 `api/` 或 service。
- 优先通过 `className` 使用 Tailwind 样式；需要独立样式文件时放在 `styles/`，由使用组件导入。命名与作用域遵守[样式规范](#样式规范)，定制公共 UI 时遵守 AGENTS.md。
- 私有静态资源通过模块导入解析 URL；JSON 中的相对资源路径不会自动解析。动态资源由插件 API 提供。
- 按应用保存的 JSON 业务数据优先复用[应用数据存储](data-interaction.md#应用数据存储)。需要专用表或查询能力时，再增加插件私有 repository 与 schema，并确认服务端导出隔离，见技能入口的核心边界。

## 样式规范

- 优先通过 `className` 使用现有 Tailwind 工具类，不重新定义工具类或修改宿主全局样式。
- 自定义全局类名以 `nv-plugin-<plugin-id>` 为命名空间：根节点使用该名称，内部元素使用 `nv-plugin-<plugin-id>__<element>`；`<plugin-id>` 与 `manifest.id` 一致，`<element>` 使用小写短横线命名。CSS Modules 的局部类名无需插件前缀，`:global()` 中的自定义类名仍须遵守全局命名规则。
- 独立样式的每个选择器分支必须包含本插件的命名空间类或 CSS Modules 局部类。标签、属性、状态及第三方组件选择器须限定在该作用域内；不以 `html`、`body`、`:root` 为样式目标，不覆盖宿主或其他插件的样式规则。
- 自定义 CSS 变量使用 `--nv-plugin-<plugin-id>-<name>`，仅在插件所属元素上声明；全局动画名称使用 `nv-plugin-<plugin-id>-<name>`，`<name>` 使用小写短横线命名。CSS Modules 中由构建工具隔离的局部动画名称无需插件前缀。
- 通过 Portal 挂载的内容遵守相同的命名与作用域规则；私有 CSS 变量在对应内容作用域内提供，不通过修改宿主挂载节点的类名、变量或样式实现隔离。

## 入口与注册

根入口导入独立的 `manifest.json`，不使用内联或 TypeScript manifest。有业务 API 时：

```ts
import type { PluginManifest } from '@/types/plugins';
import definition from './manifest.json';

export { default as component } from './pages';
export { default as api } from './api';
export const manifest = definition as PluginManifest;
```

`pages/index.tsx`、`api/index.ts` 使用 default 导出。JSON 类型断言不会执行验证，需核对必需字段和枚举值。私有图标可在入口静态导入后将 `manifest.icon` 替换为资源 URL。

宿主 `components/plugins/index.ts` 使用命名空间导入插件根入口，并在现有 `plugins` 对象中添加同名条目；保留其他注册项。框架不会扫描目录自动注册。`status: 'off'` 会阻止模块加载及业务分发。

## manifest

字段及必填约束以 [PluginManifest](../../../../types/plugins.ts) 为准；窗口行为见[弹窗技能](../../nas-vision-modals/SKILL.md)。JSON 只保存可序列化声明，用户可编辑选项放在 `configs`，文案规则见[语言](#语言)。

## 配置

`configs` 中每项遵循 `PluginSettingOption`：

| 字段           | 含义                                                         |
| -------------- | ------------------------------------------------------------ |
| `key`、`label` | 配置键与显示名称                                             |
| `type`         | `input`、`switch` 或 `combobox`                              |
| `value`        | 字段值类型的样本，不是已保存值                               |
| `defaults`     | 无已保存配置时的默认值                                       |
| `secret`       | input 使用密码展示与显隐切换                                 |
| `options`      | combobox 选项：`label`、`value`、`description`               |
| `multiple`     | 多选，值为同一原始类型的数组                                 |
| `conditions`   | `{ key, value }` 或递归的 `{ and: [...] }` / `{ or: [...] }` |

值仅支持 `string`、`number`、`boolean` 及各自的同类型数组。条件以严格相等比较；隐藏字段不会自动清空。

配置接口的请求参数与返回结构以 [types/plugins.ts](../../../../types/plugins.ts) 中对应的 Params、Res 类型为准。

配置按插件 ID 保存，同一插件的多个应用条目共享配置。无已保存配置时按 `defaults ?? ''` 初始化；已有配置直接返回，新增字段不会自动补入默认值。service 应处理字段缺失，并将 `PluginConfig` 的联合值收窄后使用。

## 语言

语言集合复用 `i18n/config.ts`。

### manifest 文案

插件名称、描述、配置标签及选项文案集中保存在 `manifest.languages[locale]`。各语言使用一致的扁平键，统一以 `plugin.` 为前缀，对应字段填写完整键。

### 页面与接口文案

页面文案、无障碍标签、空态、交互提示及接口返回文案集中保存在插件自身 `i18n/{locale}.json`，通过插件内 `i18n/index.ts` 提供读取或翻译入口，不在组件、service、错误定义文件中混写语言文本，也不加入宿主 `i18n/messages` 或公共 API 文案。

- 不同语言的键保持一致并用类型约束；动态文案使用命名参数，需要计数时使用 ICU 复数格式。
- 客户端翻译可用 `createTranslator` 并显式传入插件资源，不依赖宿主全局消息注册；服务端错误响应读取同目录的 `errors` 文案，错误码与类型仍留在 `api/errors.ts`。业务数据中的名称等保留原值，缺失名称由展示层提供本地化回退。
- 按语言变化的请求缓存应包含 locale，避免切换语言后复用上一语言的页面文案或错误提示。持续交互状态优先保存错误标识，在渲染时翻译，避免语言切换重置业务状态。

## API 边界

插件私有业务接口使用现有 `app/api/plugin/[pluginName]/[...slug]/route.ts` 分发，无需为每个插件新增 Next.js route。插件 API 的 handler 契约、错误响应和请求工具见[数据交互](data-interaction.md#服务端)。

框架提供的[应用数据存储](data-interaction.md#应用数据存储)通过宿主接口访问，无需在插件的 `PluginApi` 中注册。
