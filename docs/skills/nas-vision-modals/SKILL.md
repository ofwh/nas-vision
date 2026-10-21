---
name: nas-vision-modals
description: 在 NAS Vision 使用或调整 LiquidGlassModal、WindowModal 及插件窗口时，指导头部模式、窗口控制、footer、透明、缩放与内容布局。适用于现有弹窗组件体系。
---

# NAS Vision 弹窗组件

## 组件与源码

路径相对于仓库根目录；行为以当前源码为准。

| 能力                     | 组件 / 源码                                                  |
| ------------------------ | ------------------------------------------------------------ |
| 窗口、插件与 iframe      | `components/common/WindowModal/WindowModal.tsx`              |
| 基础模态、玻璃容器与缩放 | `components/common/LiquidGlassModal.tsx`                     |
| 控制按钮与窗口上下文     | `components/common/WindowControls.tsx`、`hooks/useWindow.ts` |
| 侧栏窗口                 | `components/common/SplitWindowModal.tsx`、`WindowContent`    |
| 公共参数                 | `types/window.ts`                                            |
| 插件窗口接入             | `types/plugins.ts`、`components/home/AppItem.tsx`            |

窗口组件从 `@/components/common/WindowModal` 导入。复用现有组件与参数，不另建 Portal、遮罩或缩放实现；新增参数时同步公共类型与调用方。

## 状态与控制

使用受控的 `open` / `onOpenChange`；关闭时也执行 `onClose`，避免重复副作用。`title` 必传，隐藏头部时仍用作辅助技术可读标题。

后代组件通过 `useWindow()` 获取最近窗口的上下文：

- 状态：`id`、`state: closed | normal | maximized`、`open`、`maximized`。
- 动作：`close`、`minimize`、`maximize`、`restore`、`toggleMaximize`。

`id` 可显式传入，否则自动生成；它用于标识窗口，不提供全局查找。嵌套窗口各自独立；钩子在窗口后代组件调用，不能在创建窗口的父组件或 children 回调中直接调用。`minimize` 当前等同关闭。

## 头部

`mode` 默认为 `controls`，与 `header` 独立：

| mode       | 左侧                                    | 中间                        | 右侧              |
| ---------- | --------------------------------------- | --------------------------- | ----------------- |
| `controls` | 固定 WindowControls，忽略 `header.left` | `header.center`，默认 title | `header.right`    |
| `floating` | 固定关闭按钮，随后为 `header.left`      | `header.center`，默认 title | `header.right`    |
| `native`   | 仅 `header.left`                        | 仅 `header.center`          | 仅 `header.right` |

- `header={false}` 隐藏头部与控制按钮；`true` 或省略时使用模式默认行为。`native` 不自动补标题或关闭按钮。
- 对象形式为 `HeaderContent: { left?, center?, right? }`，值为 React 节点。
- `controls={{ minimize, maximize }}` 的值为 `default | disabled | hide`，默认 `default`；仅控制相应按钮，不影响关闭按钮及钩子动作。
- `LiquidGlassModal.header` 是 React 节点插槽，不使用对象语义；无头部时省略插槽。

函数式 `children: (controls) => ReactNode` 由调用方放置 controls；组件不再自动渲染 `controls` / `floating` 头部，`native` 头部仍按配置展示。`header={false}` 时回调中的 controls 为 null。自定义布局需保留关闭途径。

## 尺寸与布局

| 参数             | 行为                                                                                |
| ---------------- | ----------------------------------------------------------------------------------- |
| `size`           | 基础默认 480 × 400；仅传 width 且无 style.height 时高度自适应                       |
| `style`          | 设置 Popup 尺寸与视口上限；最大化时覆盖宽高并解除上限                               |
| `modal`          | 默认 true，控制模态与遮罩                                                           |
| `closeOnOverlay` | 默认 true，控制点击外部关闭                                                         |
| `transparent`    | 默认 false，透明化容器、头部 / footer 外壳及遮罩；模态点击拦截仍由 modal 控制       |
| `top`            | 默认 false，提高 Portal 层级                                                        |
| `resizable`      | 默认 false，启用右下角拖动与方向键缩放；最大化时隐藏控制点                          |
| `fit`            | true 为无边距全填充；基础弹窗默认 true，窗口普通内容默认 false、函数式内容默认 true |

- `LiquidGlassModal.className` 作用于 Popup；`WindowModal.className` 作用于内部内容容器。
- 圆角由 `--window-radius` 控制，默认 5 个 spacing 单位；不提供 radius 参数。`fit: true` 时内容无外层间距，沿用窗口圆角；否则普通内容的 `controls` 模式有左右与底部间距，`floating` 有四周间距，两者内容圆角均为外层圆角减去 2.5 个 spacing 单位。
- 最大化使用 `100vw × 100dvh`，清除窗口内容外侧间距与圆角，并启用透明容器分支；恢复后还原尺寸与样式。内置 controls 头部最大化时有不透明背景；自定义头部由调用方处理。
- 透明参数不清除 children 自身底色或边框。
- 撑满高度使用连续的 `flex`、`flex-1`、`min-h-0`；宽度约束使用 `min-w-0`，滚动放在内部内容区域。响应式布局根据窗口容器宽度调整。
- footer 位于弹窗底边外侧。不要为缩放给 Popup 添加 overflow 裁切、外层滚动或原生 resize，沿用独立缩放控制点。

## footer

`footer` 仅传内容，组件提供玻璃外壳、居中与半悬浮位置。子组件使用 `WindowFooter` 填充最近 `WindowModal` 的 footer，不重复套外壳。

## 使用示例

```tsx
'use client';

import { WindowModal } from '@/components/common/WindowModal';

type ExampleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExampleDialog({ open, onOpenChange }: ExampleDialogProps) {
  return (
    <WindowModal
      open={open}
      onOpenChange={onOpenChange}
      title="示例窗口"
      mode="floating"
      size={{ width: 720, height: 480 }}
      style={{ maxWidth: '90vw', maxHeight: '85vh' }}
      resizable
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">内容</div>
    </WindowModal>
  );
}
```

## 插件接入与检查

manifest 可声明 `size`、`mode`、`header`、`transparent`、`fit`、`resizable`、`top`；`header` 仅为布尔值。宿主统一透传，WindowModal 解释默认行为，不按插件 ID 添加窗口分支。子窗口需单独配置。

插件窗口按需使用已有能力；涉及公共组件调整时，遵守[插件技能的窗口与公共组件边界](../nas-vision-plugins/SKILL.md#窗口与公共组件)，先提出不影响其他模块的方案并取得用户确认，再实施调整。

仅检查修改涉及的头部、控制按钮、关闭、最大化恢复、透明遮罩、缩放及 footer 布局。不新增测试用例；静态检查不能代替实际交互验证。
