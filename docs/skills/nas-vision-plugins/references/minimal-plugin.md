# 独立最小插件：text-tools

这个示例通过配置控制文本是否转大写，覆盖注册、配置注入、DTO、service、API 和页面查询。它是纯计算插件，无需 client、repository、数据库迁移或第三方服务。

## types.ts

```ts
export type TextToolsNormalizeParams = { text: string };
export type TextToolsNormalizeRes = { text: string };
```

## api/service.ts

```ts
import { appError, type Result } from '@/lib/api';
import type { PluginConfig } from '@/types/plugins';
import type { TextToolsNormalizeParams, TextToolsNormalizeRes } from '../types';

export function normalize(params: TextToolsNormalizeParams, config: PluginConfig): Result<TextToolsNormalizeRes> {
  if (typeof params.text !== 'string') {
    return { ok: false, error: appError('common.INVALID_PARAMS') };
  }
  const text = params.text.trim();
  return { ok: true, value: { text: config.uppercase === true ? text.toUpperCase() : text } };
}

export default { normalize };
```

## api/index.ts

```ts
import { okResponse, readParams } from '@/lib/api';
import type { PluginApi } from '@/types/plugins';
import type { TextToolsNormalizeParams } from '../types';
import service from './service';

const api = {
  'api/normalize': {
    POST: async (request, config) => {
      const parsed = await readParams<TextToolsNormalizeParams>(request);
      if (!parsed.ok) return parsed;
      const result = service.normalize(parsed.value, config);
      return result.ok ? { ok: true, value: okResponse(result.value) } : result;
    },
  },
} satisfies PluginApi;

export default api;
```

API 层解析为 Params、调用 service 并用 okResponse 构造成功信封，service 验证业务输入并返回 Result；通用壳转交请求与响应，分发 service 注入配置并统一适配失败信封。实际接外部服务时再在 API 层适配未预期异常。

## pages/index.tsx

```tsx
'use client';

import { usePlugin } from '@/hooks/usePlugin';
import type { PluginViewProps } from '@/types/plugins';
import type { TextToolsNormalizeRes } from '../types';

export default function TextTools({ path }: PluginViewProps) {
  const plugin = usePlugin('text-tools');
  const { data, error, isLoading } = plugin.api.fetch<TextToolsNormalizeRes>('/api/normalize', { text: ' Hello ' });
  return (
    <section aria-label="文本工具" className="min-w-0 p-4 text-white">
      <p>当前路径：{path}</p>
      {isLoading ? <p role="status">正在处理…</p> : null}
      {error ? <p role="alert">{error.message}</p> : null}
      {data ? <p>{data.text}</p> : null}
    </section>
  );
}
```

这里的 normalize 是无副作用的读取计算，适合查询 hook。真实的保存、删除不要照此放入自动查询。

## manifest.json

```json
{
  "id": "text-tools",
  "name": "文本工具",
  "description": "按配置规范化文本。",
  "icon": "/static/icons/Toolkit.png",
  "status": "on",
  "size": { "width": 720, "height": 480 },
  "configs": [{ "label": "转为大写", "key": "uppercase", "type": "switch", "value": false, "defaults": false }]
}
```

## index.ts

```ts
import type { PluginManifest } from '@/types/plugins';
import definition from './manifest.json';

export { default as component } from './pages';
export { default as api } from './api';
export const manifest = definition as PluginManifest;
```

此示例使用必需的 `manifest.json`，由根入口导入并与页面、接口统一对外导出。没有私有静态资源、额外组件或组合 hook，样式也仅通过 `className` 表达，所以不创建 `assets/`、`components/`、`hooks/`、`styles/` 空目录。需要独立样式文件时再添加 `styles/`，组织方式见[目录、模块与配置](architecture.md)。随后在注册表加入 `'text-tools': textTools`，通过现有应用表单创建使用此插件的应用条目。未提供 mode 时沿用 WindowModal 的默认模式，未提供配置时 uppercase 默认为 false。
