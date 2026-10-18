---
name: nas-vision-modals
description: 在 NAS Vision 项目使用、接入或调整 LiquidGlassModal、WindowModal 及插件弹窗时，指导模式、头部、footer、透明、缩放和内容布局。用于现有组件体系，不用于其他项目的通用弹窗设计。
---

# NAS Vision 弹窗组件

## 先核对当前实现

以下路径均相对于仓库根目录。先读对应组件与公共类型，组件发生变化时以源码为准：

- `components/common/LiquidGlassModal.tsx`：模态、玻璃容器、尺寸、footer 和缩放控制点。
- `components/common/WindowModal.tsx`：窗口模式、头部、自定义内容、iframe 与 `WindowFooter`。
- `types/window.ts`：`HeaderMode`、`HeaderContent` 和弹窗 props。
- 接入插件时再读 `types/plugins.ts`、`components/home/AppItem.tsx` 与目标插件的 manifest。
- 需要侧栏时读 `components/common/SplitWindowModal.tsx`；交互排查可参考 `components/plugins/plugin-debug/pages/index.tsx`。

公共类型从根目录 `types/` 的对应模块导入。新增参数或改名时同步类型与调用，不把唯一用途的 prop 无故细化命名：保留 `className`、`mode`、`header`、`fit` 等现有接口。

## 选择组件

- 普通窗口、插件、iframe 优先使用 `WindowModal`。
- 只需要玻璃内容容器、基础弹窗行为与插槽时使用 `LiquidGlassModal`，不要重复实现 Portal、遮罩或缩放。
- 带侧栏的设置窗口可用 `SplitWindowModal` 与 `WindowContent`，无需自行搭建第二套窗口。

使用受控的 `open` / `onOpenChange`。`onClose` 在关闭时也会执行，不要在两个回调中重复提交同一个业务副作用。`title` 仍需传入，即使隐藏可见头部，它也提供辅助技术可读的弹窗标题。

## WindowModal 的头部

`mode` 与 `header` 独立配置，默认模式由 `WindowModal` 兜底为 `controls`。

| mode       | 左侧                                                   | 中间                                | 右侧              |
| ---------- | ------------------------------------------------------ | ----------------------------------- | ----------------- |
| `controls` | 固定 `WindowControls`，不渲染 `header.left`            | `header.center`，未传则使用 `title` | `header.right`    |
| `floating` | 固定关闭按钮，然后是 `header.left`，组件已保留安全间距 | `header.center`，未传则使用 `title` | `header.right`    |
| `native`   | 仅 `header.left`                                       | 仅 `header.center`                  | 仅 `header.right` |

- `header={false}` 在所有模式下隐藏头部和窗口控制按钮。
- `header={true}` 或省略时使用模式默认行为；`native` 不会补上标题或关闭按钮。
- 传入对象时使用公共 `HeaderContent`：`{ left?, center?, right? }`，各值是 React 节点，不是图标动作配置数组。
- 浮动关闭按钮由 `FloatingHeader` 自身渲染，不在父调用方再次添加。
- `LiquidGlassModal.header` 是 React 节点插槽，不支持上述对象语义。底层不需要头部时省略该插槽，不依赖 `false` 消除其容器。

## 参数与布局

| 参数             | 当前行为                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `size`           | 数值宽高，基础默认 480 × 400；传入仅含 `width` 的对象且不指定 `style.height` 时高度自适应 |
| `style`          | 覆盖弹窗宽高或设置视口上限；与 `className` 的作用位置不同                                 |
| `modal`          | 默认 `true`；启用模态与遮罩，不能简化理解为底色开关                                       |
| `closeOnOverlay` | 默认 `true`；控制点击外部关闭                                                             |
| `transparent`    | 默认 `false`；开启后容器、头部外壳、footer 外壳和遮罩透明，模态点击拦截仍由 `modal` 控制  |
| `top`            | 默认 `false`；提升整个 Portal 层级，不表示最大化或模态                                    |
| `resizable`      | 默认 `false`；启用右下角圆弧控制点及方向键缩放                                            |
| `fit`            | 默认 `true`；具体内边距规则见下文                                                         |

`description` 能力已移除，不传递该参数。

### 内容尺寸与样式

- `LiquidGlassModal.className` 作用于 Popup；`WindowModal.className` 作用于内部内容容器。保持这两个现有作用位置，按需在调用处定制。
- 基础容器提供 `--window-radius`，内容圆角可继承。若内层相对外层有内缩，圆角应与内缩量匹配。
- 基础弹窗的 `fit={false}` 增加内容内边距。`WindowModal` 普通节点内容有模式自带间距；其 `fit` 主要控制函数式自定义内容的额外内边距，不能假定开关会改变普通内容布局。
- 高度撑满使用连续的 `flex` / `flex-1` / `min-h-0`，宽度约束使用 `min-w-0`，滚动放在内部内容区域。
- footer 半悬浮在弹窗底边之外。不要给 Popup 添加 `overflow-auto`、`overflow-hidden` 或原生 `resize` 以解决缩放问题，否则会出现外层滚动条或裁切 footer。复用现有独立缩放控制点。
- `transparent` 不会清除 children 自己的底色或边框。全透明展示时检查内容与调用处样式。
- 可缩放列表按容器宽度响应，不按 `window.innerWidth` 固定卡片尺寸；需要时使用 `ResizeObserver`，避免无意的最大宽度或列数上限。

### footer 与自定义内容

`footer` 只传内容，组件已提供玻璃外壳、居中和半遮挡位置，不要再套重复外壳。插件子组件需要填充父窗口 footer 时使用 `WindowFooter`，它只在最近的 `WindowModal` 上下文中生效。

`children` 也可为 `(controls) => ReactNode`。使用该模式后，窗口不再自动渲染 `controls` / `floating` 头部，调用方在自己的布局中放置 controls。`native` 的独立头部仍按其配置展示。`header={false}` 时传给函数的 controls 为 `null`。自定义内容要保留可用的关闭途径，例如自有关闭按钮、允许外部关闭或 Escape。

## 示例

普通窗口：

```tsx
import { WindowModal } from '@/components/common/WindowModal';
import { Button } from '@/components/ui/button';

function ExampleDialog({ onClose }: { onClose: () => void }) {
  return (
    <WindowModal
      open
      title="资料库"
      mode="floating"
      size={{ width: 960, height: 640 }}
      style={{ maxWidth: '90vw', maxHeight: '85vh' }}
      resizable
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      header={{ right: <Button variant="ghost">刷新</Button> }}
      footer={
        <Button variant="ghost" onClick={onClose}>
          完成
        </Button>
      }
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">内容</div>
    </WindowModal>
  );
}
```

完全自定义的无头内容：

```tsx
<WindowModal open title="预览" header={false} onOpenChange={setOpen}>
  {() => <div className="min-h-0 min-w-0 flex-1">自定义预览内容</div>}
</WindowModal>
```

示例仅说明组件组合。将状态、刷新等事件接到真实调用方，不把示例中的空动作直接当作完成的业务交互。

## 插件接入

插件 manifest 可声明 `size`、`mode`、`header`、`transparent`、`resizable`、`top`；以 `types/plugins.ts` 为准。`header` 在 manifest 中是布尔值，React 节点应由具体组件提供。

例如窗口配置片段：

```json
{
  "size": { "width": 1280, "height": 800 },
  "mode": "floating",
  "header": true,
  "transparent": false,
  "resizable": true,
  "top": true
}
```

`AppPluginDialog` 只透传 manifest 参数，`WindowModal` 负责模式兜底及头部渲染。不要在 AppItem 按插件 ID 生成头部或重复实现默认行为。主窗口配置不自动继承到内部二级弹窗；二级窗口在调用处单独配置。

## 验证使用结果

按任务覆盖相关行为即可：头部三种模式与 `header={false}`、透明模态下的底层点击拦截和外部关闭、缩放后的内容高度与 footer 完整性、窄窗口的列表重排。使用项目的格式、ESLint 与类型检查；是否能实际操作浏览器应如实说明，静态检查不能证明拖动或遮罩效果。
