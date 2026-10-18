# Immich 插件

在应用设置中选择 `Immich` 插件，填写配置后即可打开。

- 服务地址：填写 **NAS Vision 后端可以访问**的地址，例如 `http://immich-server:2283`、`http://192.168.1.10:2283` 或 `https://photos.example.com`，也可带末尾 `/api`。容器服务名仅在两个服务处于同一个容器网络时可用；`localhost` 指向 NAS Vision 自己所在的环境。
- Immich 官方不支持部署在 `/immich` 等子路径，插件使用服务根地址下的 `/api`，不提供自定义 API 路径。
- 认证：推荐 API Key，需要 `asset.read`、`asset.view`；真实目录模式另需 `folder.read`，相册模式另需 `album.read`。邮箱密码方式需要 Immich 开启密码登录，后端会复用短期会话并在失效时重登。仅 OAuth 登录时请使用 API Key。
- 目录来源：默认真实目录，按原始文件路径逐层浏览；也可选择将相册作为目录。
- 起始目录：仅用于真实目录浏览，填写 **Immich 容器内**的目录路径，留空从路径树顶层开始。“全部照片”仍展示该认证用户可读取的照片。
- 列表展示图片、视频和目录；视频缩略图标记播放图标和时长。视频使用独立 `VideoView`，打开或切换后自动播放，footer 提供进度、播放/暂停、音量和全屏控制，不展示拍摄信息。浏览器限制有声自动播放时尝试静音播放，并提示开启声音。

## 模块结构

- `index.ts`：统一导出 `component`、`api`、`manifest`。
- `manifest.json`：插件元数据、窗口选项与配置字段。
- `pages/`：页面入口与内部导航组合。
- `components/`：展示与交互组件，视频播放使用独立的 `VideoView`。
- `hooks/`：分页查询与虚拟视口逻辑。
- `styles/`：组件使用的 CSS Modules。
- `api/`：HTTP 方法注册、请求与响应适配、业务 service 与 Immich HTTP client；`video.ts` 独立处理视频流协议，`response.ts` 统一适配插件异常。
- `types.ts`：插件私有请求、响应和领域类型。

## 接口

业务接口通过已有插件分发器调用，使用 POST 和统一 BaseResponse 信封，参数放 JSON body：

| 路径                               | 参数                                                                         | 返回                                             |
| ---------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| `/api/plugin/immich/api/list`      | `directory?`、`page?`（从 1 开始）、`pageSize?`（1–100，默认 48）、`photos?` | `items`、`hasMore`、当前目录及父目录             |
| `/api/plugin/immich/api/detail`    | `id`                                                                         | 文件信息、尺寸、EXIF、GPS 经纬度及城市等信息     |
| `/api/plugin/immich/api/preview`   | `directory`                                                                  | 最多三张图片；真实父目录缺少图片时从后代目录补足 |
| `/api/plugin/immich/api/thumbnail` | `id`、`size?`（`thumbnail` / `preview`）                                     | `dataUrl`                                        |

`GET /api/plugin/immich/api/video?id=<asset UUID>` 为视频二进制流，通用路由仅转交请求，由插件 `api/video.ts` 调用 service 转发 Immich `/assets/{id}/video/playback`，支持 Range、200/206 和越界范围的 416，鉴权仍由 `proxy.ts` 统一处理。连接超时为 20 秒，收到响应头后持续转发视频流；关闭或切换视频时取消读取。上游凭据保留在后端，失败返回统一错误信封，播放器展示加载、超时或解码错误及重试入口。

前端滚动接近底部时自动加载下一批并追加，加载失败可重试且保留已有内容。目录和照片均按行虚拟滚动，仅渲染可见区域及上下缓冲行；刷新或切换路径时重新加载。

目录 ID 在真实目录模式下为原始目录路径，在相册模式下为相册 UUID。列表始终先返回目录，再返回图片和视频。

真实目录和相册列表的上游接口没有分页参数，插件后端截取分页；目录内图片也是通过官方目录接口读取后分页。“全部照片”和相册内图片调用官方 `search/metadata` 分页接口（沿用兼容的 `page`、`albumIds` 参数）。目录预览进入可视区域后异步加载，最多使用三张图片扇形堆叠展示，左侧倾斜幅度略大于右侧。目录与照片分区展示，照片按宽高比动态分行，使用等高布局。缩略图和详情预览由 NAS Vision 后端代理，以 JSON data URL 返回，适配只开放内网访问的 Immich，并复用现有 POST 插件接口。

## 官方参考

- [反向代理与子路径限制](https://docs.immich.app/administration/reverse-proxy/)
- [官方 API 文档](https://api.immich.app/)
- [官方 OpenAPI 定义](https://github.com/immich-app/immich/blob/main/open-api/immich-openapi-specs.json)：`/auth/login`、`/view/folder`、`/view/folder/unique-paths`、`/albums`、`/search/metadata`、`/assets/{id}`、`/assets/{id}/thumbnail`、`/assets/{id}/video/playback`。
