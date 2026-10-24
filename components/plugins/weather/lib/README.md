# Weather Service

独立于插件与 Next.js 的单源天气接口。初始化时确定天气源、凭据、输出单位、语言与超时；业务方法只接收经纬度和预报长度。实例不执行跨源回退或数据合并。

```ts
import { createWeatherService } from '@/components/plugins/weather/lib';

const weather = createWeatherService({
  provider: { type: 'qweather', host: 'your-host.qweatherapi.com', apiKey },
  language: 'zh-CN',
  timeoutMs: 15000,
  units: {
    temperature: 'celsius',
    pressure: 'hectopascal',
    windSpeed: 'kilometer_per_hour',
    visibility: 'kilometer',
    precipitation: 'millimeter',
  },
});

const location = { latitude: 39.92, longitude: 116.41 };
const current = await weather.realtime(location);
const hourly = await weather.hourly(location, { hours: 72 });
const daily = await weather.daily(location, { days: 7 });
const minutes = await weather.minutely(location, { minutes: 60 });
const alerts = await weather.alerts(location);
const air = await weather.airQuality(location);
```

## 数据边界

- 物理量包含 `value` 与 `unit`。缺失值为 `null`，不以零补齐。时间为 ISO 8601 字符串；源未提供实时观测时间时为 `null`。业务不得把获取时间当成观测时间。
- 小时、日、分钟与预警返回 `items` 集合。请求长度是上限；实际长度受套餐、地点与可用数据限制，不补造预报。
- 分钟预报的 `intervalMinutes` 保留源分辨率。降水累积量与强度分别表示；不把五分钟累积量或一小时累积量当成瞬时强度。彩云半小时概率不扩展成逐分钟概率。
- 气压保留地面或海平面类型。AQI 保留标准、名称与类别，`indexes` 按源适配器推荐顺序排列；不同标准不互相转换。污染物浓度保留质量或体积比单位。
- 预警等级仅映射可对应的统一等级，其余为 `unknown`；不得将预警查询失败显示为无预警。
- 展示时保留 `attributions`。

## 接入边界

- 凭据通过初始化配置传入，不记录到日志或错误消息。和风使用 API Key，彩云使用 Token；凭据更新后创建新实例。默认 HTTP 客户端禁用重定向，第二个工厂参数可注入实现相同解码契约的 `HttpClient`。
- Provider client 处理源参数与鉴权，运行时解码器检查外部响应，normalizer 转换成标准模型，公共转换器生成目标单位。扩展天气源时在 Provider 工厂注册；Service 不判断源类型。
- 彩云中国大陆要求 GCJ-02，其他地区要求 WGS84。默认按传入坐标请求；使用其他输入坐标系的应用须在初始化时提供彩云 `transformLocation`，由其按适用地域转换。不要用简单矩形边界判断大陆范围。地点名称和显示时区属于展示层。插件查询 API 通过请求参数接收经纬度及可选地点名称、显示时区，不从插件配置读取；未指定显示时区时使用 UTC。预报范围由查询参数 `hours`、`days` 指定，缺省为 24 小时、7 天，不作为插件配置项。
- 和风分钟预报、彩云增值能力均受地区或权限限制；失败使用 `WeatherError.code`，不自动切换数据源。
- 仅合并实例内同时进行的相同请求，不持久缓存天气数据或跨实例共享凭据。
- 天气插件在初始化时应用 manifest 中配置的输出单位，再通过私有展示适配器提取数值。通用接口模型不依赖插件 DTO。

## 插件调试接口

调试页面通过同源 POST 接口 `api/realtime`、`api/hourly`、`api/daily`、`api/minutely`、`api/alerts`、`api/airQuality` 分别查询对应能力，仅请求所选数据，不聚合其他能力。请求包含经纬度及 locale；预报长度分别使用可选 `hours`、`days`、`minutes`。返回统一模型及插件 API 响应信封，使用已保存的天气源凭据和单位，沿用宿主登录鉴权。

## 协议参考

- [彩云 v2.6](https://docs.caiyunapp.com/weather-api/v2/v2.6/index.html)、[单位](https://docs.caiyunapp.com/weather-api/v2/v2.6/tables/unit.html)、[分钟预报](https://docs.caiyunapp.com/weather-api/v2/v2.6/2-minutely.html)
- [和风实时天气](https://dev.qweather.com/en/docs/api/weather/weather-current/)、[分钟预报](https://dev.qweather.com/en/docs/api/minutely/minutely-precipitation/)、[AQI 标准](https://dev.qweather.com/en/docs/api/air-quality/aqi-list/)
