# 最小展示插件

最小插件只需展示页面、`manifest.json` 和根入口。示例 ID 为 `minimal-plugin`，不依赖其他插件或外部服务。

```text
components/plugins/minimal-plugin/
├── index.ts
├── manifest.json
└── pages/
    └── index.tsx
```

## manifest.json

```json
{
  "id": "minimal-plugin",
  "name": "最小插件",
  "description": "展示插件页面。",
  "icon": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%23334155'/%3E%3Ccircle cx='32' cy='32' r='12' fill='white'/%3E%3C/svg%3E",
  "status": "on",
  "size": { "width": 480, "height": 320 }
}
```

图标以内联 SVG data URL 保存在插件 manifest 中，无需额外资源文件。窗口选项省略时使用宿主默认行为。

## pages/index.tsx

```tsx
import type { PluginViewProps } from '@/types/plugins';

export default function MinimalPlugin({ path }: PluginViewProps) {
  return (
    <section className="p-4 text-white" aria-label="最小插件">
      <p>插件已加载</p>
      <p>当前路径：{path}</p>
    </section>
  );
}
```

页面由宿主窗口渲染，无需自行创建弹窗或 Next.js 路由。

## index.ts

```ts
import type { PluginApi, PluginManifest } from '@/types/plugins';
import definition from './manifest.json';

export { default as component } from './pages';
export const api: PluginApi = {};
export const manifest = definition as PluginManifest;
```

保留框架要求的三个导出；没有业务接口时 `api` 为空，不创建 API、service 或错误定义文件。

## 注册与打开

在 `components/plugins/index.ts` 添加根入口导入：

```ts
import * as minimalPlugin from './minimal-plugin';
```

在现有 `plugins` 对象中添加 `'minimal-plugin': minimalPlugin`，保留其他注册项。随后通过应用配置表单新建插件类型的应用，选择“最小插件”并保存。打开该应用后应显示“插件已加载”，初始路径为 `/`。

注册表 key、`manifest.id` 与应用的 `config.pluginName` 均为 `minimal-plugin`。需要配置或业务接口时，再参考[目录与配置](architecture.md)及[数据交互](data-interaction.md)。
