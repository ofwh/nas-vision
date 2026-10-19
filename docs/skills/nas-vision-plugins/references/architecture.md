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
├── styles/           独立样式文件，优先 CSS Modules
├── assets/           私有图片、图标与文件
└── api/              有业务接口时添加
    ├── index.ts      路径与方法映射、参数解析、响应适配
    ├── service.ts    业务判断
    ├── client.ts     外部协议适配
    ├── errors.ts     私有错误码、类型与多语言文案
    └── response.ts   私有错误响应适配
```

除根入口和 manifest 外，其余文件按需创建。新视图使用 `pages/`；它不是 Next.js Pages Router。已有插件无需为统一目录名重构。

- 无业务接口时，根入口导出空的 `PluginApi`，无需创建 `api/` 或 service。
- 独立样式放在 `styles/`，由使用组件导入；简单样式使用 `className`。定制公共 UI 时遵守 AGENTS.md。
- 私有静态资源通过模块导入解析 URL；JSON 中的相对资源路径不会自动解析。动态资源由插件 API 提供。
- 私有 repository 与 schema 留在插件目录；接入数据库前确认服务端导出隔离，见技能入口的核心边界。

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

必需字段：`id`、`name`、`description`、`icon`、`status`、`size: { width, height }`。

可选字段：`previews`、`configs`，以及窗口选项 `mode`、`header`、`transparent`、`resizable`、`top`。具体类型以 `types/plugins.ts` 为准；窗口行为见[弹窗技能](../../nas-vision-modals/SKILL.md)。JSON 只保存可序列化声明，用户可编辑选项放在 `configs`。

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

| POST 地址            | body             | 返回 data              |
| -------------------- | ---------------- | ---------------------- |
| `/api/plugin/config` | `{ id }`         | `{ configs }`          |
| `/api/plugin/query`  | `{ id }`         | `{ manifest, config }` |
| `/api/plugin/update` | `{ id, config }` | `{ manifest, config }` |
| `/api/plugin/list`   | `{}`             | `{ plugins }`          |

配置按插件 ID 保存，同一插件的多个应用条目共享配置。无已保存配置时按 `defaults ?? ''` 初始化；已有配置直接返回，新增字段不会自动补入默认值。service 应处理字段缺失，并将 `PluginConfig` 的联合值收窄后使用。

## API 边界

接口使用现有 `app/api/plugin/[pluginName]/[...slug]/route.ts` 分发，无需为每个插件新增 Next.js route。插件 API 的 handler 契约、错误响应和请求工具见[数据交互](data-interaction.md#服务端)。
