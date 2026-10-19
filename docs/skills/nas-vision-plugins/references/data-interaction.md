# 数据交互

## 路径

| 用途              | 示例                                | 使用位置                                |
| ----------------- | ----------------------------------- | --------------------------------------- |
| 内部导航          | `/detail`                           | `PluginViewProps.path`、`page.navigate` |
| endpoint 相对路径 | `/api/query`                        | 请求 hook、`pluginPath`                 |
| endpoint 注册 key | `api/query`                         | `PluginApi`                             |
| 实际请求地址      | `/api/plugin/<plugin-id>/api/query` | 同源请求入口                            |

`pluginPath(name, path)` 构造请求地址，插件名与路径各段只接受字母、数字、下划线、连字符。业务参数放 JSON body，不拼入 endpoint。内部导航路径由视图解析。

## usePlugin(name)

| 成员                             | 返回或行为                                                   |
| -------------------------------- | ------------------------------------------------------------ |
| `page`                           | `isOpen`、`path`、`open(path?)`、`navigate(path)`、`close()` |
| `app`                            | `component`、`manifest`、模块加载的 `error` / `isLoading`    |
| `config.query()`                 | 配置查询 hook                                                |
| `config.update(values)`          | 保存配置的异步动作                                           |
| `api.fetch<T>(path, params?)`    | 数据查询 hook                                                |
| `api.upload<T>(path, formData?)` | 上传 hook                                                    |

`page.open()` 默认进入 `/`。存在 `PluginPageContext` 时复用宿主导航与关闭状态；再次调用 `usePlugin` 不会创建独立窗口。模块查询仅在 `page.isOpen` 时启用，数据请求与配置查询不自动受此开关控制。

`fetch`、`upload`、`query` 内部调用 React hooks，须在组件或自定义 hook 顶层无条件调用。`fetch` 的路径传 `null` 可暂停查询。独立导出 `usePluginFetch<T>(name, path, params?)`、`usePluginUpload<T>(name, path, formData?)` 提供相同数据能力。

## 查询与写操作

查询返回 `{ success, data, error, isLoading }`，`data` 已是业务数据。使用对应请求的状态展示加载、空态与错误；`app.isLoading` 只表示模块加载。

底层 `pluginRequest<T>(url, params, onProgress?)` 发起 POST，接收 JSON 或 FormData，返回 `BaseResponse<T>`。URL 可由 `pluginPath` 构造。业务失败或网络异常会 reject，调用方负责捕获错误；它不返回展平的 `success` 字段。

查询 SWR key 为 `[完整URL, params]`。查询 hook 未暴露 `mutate` 或 `isValidating`；需要刷新时使用 `useSWRConfig` 更新对应 key。创建、保存、删除等副作用由用户事件通过 `pluginRequest` 或 `useSWRMutation` 触发，完成后刷新受影响缓存。

`config.update(values)` 返回 `{ success, data }`，失败会 reject；成功后更新 `['/api/plugin/query', { id: name }]` 并清理该插件 endpoint 的请求缓存，不立即重新验证。自定义聚合或分页缓存需自行处理失效与重载。

## 上传

上传 hook 返回 `{ success, progress, data, error, isLoading }`，进度为 0–100，`data` 为业务数据。`formData` 改变会自动上传，不暴露 `trigger`。在事件中创建 FormData 并存入 state，避免每次渲染重建而重复上传。

需要显式控制时，在事件中调用 `pluginRequest<T>(pluginPath(name, path), formData, setProgress)`。服务端用 `readForm` 解析，业务校验交给 service。

## 服务端

```text
页面 / hook
  -> pluginRequest + pluginPath
  -> app/api/plugin/[pluginName]/[...slug]/route.ts
  -> lib/services/plugins.dispatch
  -> plugin.api[path][request.method](request, config)
  -> 插件 service
  -> 按需调用外部 client / repository
```

分发层检查插件注册、启用状态及 endpoint 方法，并注入配置。插件在 `PluginApi` 中按路径、方法声明 handler，例如 `{ 'api/query': { POST: handler } }`。

handler 接收 `(request, config)`，返回 `Result<Response>`：

- JSON 使用 `readParams<Params>`，表单使用 `readForm`；公共解析失败可直接返回失败 Result。
- 成功使用 `{ ok: true, value: okResponse(data) }`。
- 插件业务错误由自身 API 构造错误 Response，再通过成功 Result 返回；`ok` 表示 Response 已构造，业务结果看信封 `code`。错误归属、编号与文案规则见 [API 错误规范](../../../api.md)。

业务接口使用 POST、body 参数及 HTTP 200 信封。框架也支持 GET handler；确有协议需求时，在插件自身 API 处理原始 Request、响应头、状态与响应体。`pluginRequest` 仅支持 POST，其他协议需在调用处使用对应请求方式。外部服务调用遵循其自身协议。

鉴权由 `proxy.ts` 统一处理，当前 `/api/plugin` 受保护。公共能力遵循 `/api/public` 规则，不通过放开插件分发入口实现。
