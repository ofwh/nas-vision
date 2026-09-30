# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 接口

### 方法与路径

- 只用 GET / POST，默认使用 POST。
- 路径里不带 `[id]` 这类参数，参数统一放 body。
- 新增和更新合并成一个接口，靠 body 里可选的 `id` 区分：带 `id` 是更新，不带是新增。

### 请求

- 请求体类型命名 `<模块>XxxParams`。
- 请求体在接口层直接转成强类型（`readParams`），不做逐字段校验 —— 要校验就加到对应的 service 里。

### 响应

- 响应体统一 `BaseResponse<XxxRes>`：

  ```ts
  type BaseResponse<T> = {
    code: number; // 业务码：0 表示成功，其余是错误码
    data: T; // 成功时是 XxxRes，失败时为 null
    error?: { code: ErrorCode; message: string }; // 仅失败时给
    message: string; // 成功是 'OK'，失败是同一句错误文案
  };
  ```

- HTTP 状态恒为 200，成败只看 `code`。
- 解析请求体失败这类异常也必须回同一个信封，不许抛成 5xx。

### 错误与鉴权

- 错误码、业务码与错误文案统一收拢至 lib/api。
- 鉴权统一收拢至 proxy.ts，接口自身不做登录校验。

## 分层

调用链 `api -> services -> repositories -> db`，按需复杂度实现；**api 和 services 两层必须有**。

- **api** —— 请求体转强类型、调 service、拼 `BaseResponse`。不写业务判断，不直接碰 db / repositories。
- **services** —— 业务判断都在这一层（新增排哪、ids 合不合法）。不写 SQL，读写交给 repository。
- **repositories** —— 只跟库打交道，不做业务判断，只被 services 调用。
- **db** —— drizzle 实例与 schema。

service 的约定：

- 方法名用简洁动词：list / create / update / save / updateStatus / remove / sort。
- 既导出单个方法，也通过 default 导出全量方法，调用方写 `service.xxx(...)`。

## 类型

- 数据使用强类型，接口数据根据接口实现，在接口层直接转为强类型。
- 全应用强制不允许使用任何 `any` 类型。
- 默认使用确定的类型。
- 类型不固定（非确定类型）时，使用确定的联合类型。
- 实在不确定时才使用 `unknown` 类型，仅作为最终兜底。

## 注释

- 极度精简：只在关键业务转折与关键参数处写，其余一律不写。
- 显而易见、复述代码的注释不写；不保留过程痕迹。
