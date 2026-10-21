# Navidrome

在应用配置中选择 Navidrome 插件，填写服务器基础地址、用户名与密码。地址支持反向代理子路径，不包含 `/rest`；由 NAS Vision 服务端访问该地址。插件配置由框架按插件共享。

使用 [Navidrome 支持的 Subsonic API](https://www.navidrome.org/docs/developers/subsonic-api/)，协议版本为 1.16.1。通过 `getAlbumList2`、`getArtists`、`getArtist`、`getAlbum`、`getPlaylists`、`getPlaylist`、`search3`、`getStarred2`、`star` 和 `unstar` 提供浏览、搜索与歌曲收藏。歌曲列表使用 Navidrome 支持的空搜索，滚动接近底部时按批次追加，每批 48 项；歌单和专辑详情保留服务端顺序。播放队列属于当前窗口，关闭时停止播放。

业务请求遵守 [API 规范](../../../docs/api.md)。服务端以表单 POST 传递 Subsonic 的 `p=enc:` UTF-8 十六进制密码认证参数；这只是协议编码，远程部署应使用 HTTPS。

`api/cover` 与 `api/stream` 使用 GET，供图片与 HTML audio 原生读取二进制媒体；ID 位于查询参数。服务端从配置获取上游凭据，媒体地址不携带凭据，鉴权仍由宿主 `proxy.ts` 处理。音频使用 `stream` 的 `format=raw`，保留原始音质和上游 Range、200/206/416 响应；音频格式需浏览器支持。连接等待 20 秒，收到媒体响应头后持续转发，切歌或关闭窗口时取消读取。媒体错误使用插件错误信封，图片回退占位封面，播放器显示错误。配置查询与凭据存储沿用宿主框架。

窗口接入、配置、语言和分层遵守[插件技能](../../../docs/skills/nas-vision-plugins/SKILL.md)，窗口布局遵守[弹窗技能](../../../docs/skills/nas-vision-modals/SKILL.md)。播放队列与歌单状态在各窗口独立保存，其他资料库列表使用 SWR 分页缓存。
