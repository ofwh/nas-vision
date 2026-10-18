# 数据交互

## 三种路径分清楚

以虚构插件 `text-tools` 为例：

| 用途              | 示例                                   | 所属层                                    |
| ----------------- | -------------------------------------- | ----------------------------------------- |
| 插件内部导航      | `/history`                             | `PluginViewProps.path` 与 `page.navigate` |
| endpoint 相对路径 | `/api/normalize`                       | hook / pluginPath 的输入                  |
| endpoint 注册 key | `api/normalize`                        | `PluginApi` 对象键                        |
| 实际 POST 地址    | `/api/plugin/text-tools/api/normalize` | 同源请求入口                              |

`pluginPath(name, path)` 处理地址构造，各段只接受字母、数字、下划线和连字符。不要把业务 ID、搜索串或 query string 拼进 endpoint；放进 JSON body。内部导航路径可携带编码后的业务片段，由页面解析，不能直接拿去作为 API endpoint。

## usePlugin(name)

```ts
const plugin = usePlugin('text-tools');
```

| 成员                                    | 作用                                                         |
| --------------------------------------- | ------------------------------------------------------------ |
| `plugin.page`                           | `isOpen`、`path`、`open(path?)`、`navigate(path)`、`close()` |
| `plugin.app`                            | `component`、`manifest`、模块加载的 `error` / `isLoading`    |
| `plugin.config.query()`                 | 获取配置的查询 hook                                          |
| `plugin.config.update(values)`          | 保存配置的异步动作                                           |
| `plugin.api.fetch<T>(path, params?)`    | 绑定插件 name 的查询 hook                                    |
| `plugin.api.upload<T>(path, formData?)` | 绑定插件 name 的上传 hook                                    |

`page.open()` 默认进入 `/`。插件内部存在 `PluginPageContext` 时，`page` 使用宿主上下文，关闭和导航作用于同一个插件主窗口，而不是创建新窗口。不要以为在内部再次 `usePlugin` 就会获得独立弹窗状态。

模块查询只在 `page.isOpen` 时启用，`app` 的错误与业务 API 错误不同，不能用 `app.isLoading` 代表列表请求状态。

名称为 `fetch`、`upload`、`query` 的成员实际仍调用 React hooks，应像 hooks 一样在组件或自定义 hook 顶层无条件调用。不要在点击回调、循环或条件分支中调用它们；条件查询用 `null` 路径。

也可直接使用独立导出：

```ts
const result = usePluginFetch<TextToolsNormalizeRes>('text-tools', enabled ? '/api/normalize' : null, { text });
```

## 查询结果与信封

查询 hook 返回 `{ success, data, error, isLoading }`，其中 `data` 已经是业务响应，不再访问 `data.data`。SWR key 为 `[完整URL, params]`；业务请求失败会由 `pluginRequest` 抛出 Error，落到 hook 的 `error`。

底层 `pluginRequest<T>(url, params, onProgress?)` 接收完整同源 URL，返回 `BaseResponse<T>`，这里才通过 `response.data` 取业务响应。它没有 `fetchApi` 的展平 `success` 字段；失败直接 reject，不能期待拿到一个 `{ success: false }`。

```ts
const response = await pluginRequest<TextToolsNormalizeRes>(pluginPath('text-tools', '/api/normalize'), { text });
const value = response.data;
```

展示加载、空态和错误时使用各自数据请求的状态；不要把 `undefined`、空数组与请求失败混为一谈。当前查询 hook 未暴露 `mutate` / `isValidating`，需要刷新时用 `useSWRConfig` 针对实际 key 刷新，或在私有 hook 中组合 SWR，而非调用不存在的成员。

## 写操作与缓存

带副作用的创建、修改、删除由事件触发，不放进自动重验证的查询 hook。使用 `pluginRequest` 或 `useSWRMutation`，捕获错误并恢复按钮 pending 状态。请求 body 与领域 Params 类型保持一致。

保存配置时 `plugin.config.update(values)` 返回 `{ success, data }`，失败可能 reject。它更新 `['/api/plugin/query', { id: name }]` 对应的配置缓存，并清理该插件 endpoint 的请求缓存，供后续请求重新读取。分页 hook 仍需显式配置打开时重新验证，不能依赖其内部聚合缓存自动失效。

业务写操作成功后刷新受影响的列表 / 详情 key。多页列表可以在私有 hook 中使用 `useSWRInfinite`，key 包含页码、筛选条件和内部导航目录；切换条件时避免复用前一个查询的分页状态。按业务 ID 去重只在确有跨页重叠时需要。

## 上传

`usePluginUpload<T>(name, path, formData?)` 返回 `success`、`progress`、`data`、`error`、`isLoading`。进度是 0–100。当前实现当 `formData` 改变时自动调用上传，不返回可手动调用的 `trigger`。

- 选择文件或点击提交时将新的 FormData 存入 state，再传给 hook；不要每次 render 都新建 FormData 导致重复上传。
- hook 的 `data` 也是业务响应，而非信封。
- 需要显式触发或更精细的 pending 控制时，可在事件中 `await pluginRequest<T>(pluginPath(name, path), formData, setProgress)`。
- 上传 endpoint 在插件 API 声明 POST handler，并用 `readForm` 解析原始 Request；handler 与其他接口一样接收服务端注入的 config，不从浏览器提交服务端密钥。

## 服务端调用链

```text
页面 / hook
  -> pluginRequest + pluginPath
  -> POST /api/plugin/[pluginName]/[...slug]
  -> lib/services/plugins.dispatch
  -> plugin.api[path][request.method](request, config)
  -> 插件 service
  -> 可选外部 client / 数据库 repository
```

通用 route 是请求与响应的接口壳；dispatch 只检查注册、启用状态、路径与方法，并注入当前配置。请求解析、响应构造以及按需增加的媒体等能力放在插件自身 API 模块。

插件 endpoint 声明为 `{ 'api/normalize': { POST: handler } }`，handler 接收 `(request, config)` 并返回 `Result<Response>`。业务 POST 用 `readParams<Params>` 或 `readForm` 解析，解析失败直接返回错误 Result；成功用 `{ ok: true, value: okResponse(data) }`，失败用 `{ ok: false, error: appError(code) }`。通用壳统一翻译失败信封与兜底异常，业务错误规则仍在 service。复用 `lib/api` 错误定义，不暴露上游凭据或原始异常栈。

需要 GET 媒体流时，在插件内声明 GET handler 并按需拆到 `api/` 独立模块；query、Range、取消信号、响应头和流式 Response 均由该插件处理。通用层不定义媒体专属 DTO 或分发方法。

业务接口统一 POST、body 传参、HTTP 200 的 BaseResponse；业务新增/更新通过 body 的可选 id 区分。外部服务自己的 HTTP 方法由官方协议决定，不受本项目业务 POST 约定限制。

鉴权由 `proxy.ts` 统一完成，当前 `/api/plugin` 受保护；不在 endpoint 内重复登录校验。不要为普通新插件放开 proxy。确需公共能力时单独按项目 `/api/public` 规范实现，不能假定插件入口已公开。
