# AGENTS.md

本文件规定在本仓库中工作的编码代理应遵守的规则。

## API

接口开发、分层、鉴权、响应及错误码分配统一遵守 [API 规范](docs/api.md)。

## 插件开发

- 创建、接入或维护插件时，必须先阅读并遵守[插件技能](docs/skills/nas-vision-plugins/SKILL.md)。
- 插件涉及弹窗或窗口的使用、开发与调整时，必须先阅读并遵守[弹窗技能](docs/skills/nas-vision-modals/SKILL.md)。

## UI 组件

- 优先使用本地已有组件；缺少对应组件时，通过 `pnpm dlx shadcn@latest add <name>` 安装。
- 不修改 `components/ui` 目录下的文件，保持 shadcn 提供的原始代码。
- 应用级 shadcn 默认外观覆盖统一放在 `styles/ui.module.css`，包括玻璃底色、透明度、模糊、阴影及通用交互状态；复用该文件中的样式变量，不在调用处重复设置。
- 覆盖规则按组件分类，同一组件及其子部件的规则就近保存；优先使用原始组件的 `data-slot` 等稳定标识，不引入业务名称或业务条件。
- 业务布局、尺寸、对齐、内容展示及特殊交互样式由业务模块通过 Tailwind `className` 设置，不放入 `styles/ui.module.css`。
- 新安装 shadcn 组件后，检查其默认外观与现有玻璃风格的差异，说明拟统一调整的范围，并询问用户是否需要适配；仅在用户明确确认后实施，通用覆盖归入 `styles/ui.module.css` 对应组件分组。

## 类型

- 使用明确类型；存在多个确定形态时使用联合类型。
- 禁止 `any`；无法确定类型时才使用 `unknown`，使用前先收窄。

## 注释

- 极度精简：只在关键业务转折与关键参数处写，其余一律不写。
- 显而易见、复述代码的注释不写；不保留过程痕迹。

## 文档

- 文档内容应客观、准确、无歧义；仅保留设计约束、实现边界与可执行的开发规范。
- 同一规则只在一处完整定义，其他文档通过链接引用，避免重复维护。
- 通用规范不绑定具体业务模块或实现示例；模块文档仅保留该模块必要的差异与协议约束。
- 不记录历史过程、任务进度、完成记录、修改流水或无关信息。
- 可从源码直接查询的定义、常量和文件清单不在文档重复维护；业务码占用登记按 [API 规范](docs/api.md#业务码占用登记)维护。

## 技能维护

- 更新技能内容时，应确保内容客观、准确、无歧义且可复用，不依赖特定模块或具体实现，不包含历史过程、修改记录或无关信息，仅保留通用、可执行的技能规范。
- 调整技能内容前，必须先按上述要求输出拟调整的具体内容，并询问用户确认；仅在用户明确确认后，才能写入技能文档。

## 测试

- 不添加测试用例。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
