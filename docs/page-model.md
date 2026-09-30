# 设计模块内容描述 — Window (node: 1:675)

## 总览

组件名：Window
Node ID：1:675
尺寸：全尺寸 (size-full)
布局方向：flex row
溢出处理：overflow: clip
边框：1px solid rgba(255,255,255,0.4)
圆角：border-radius: 46px

背景效果层（叠加）：
层次 1：backdrop-blur，blur: 50px
层次 2：填充色 rgba(128,128,128,0.3)，mix-blend-mode: luminosity

## 一、Sidebar（侧边栏，node: 1:676）

宽度：320px
高度：1120px
溢出处理：overflow: clip
右侧分隔线：box-shadow: 0.5px 0 0 0 rgba(84,84,88,0.65)
布局方向：flex column

背景效果层（叠加）：
层次 1：rgba(214,214,214,0.45)，mix-blend-mode: color-burn
层次 2：rgba(0,0,0,0.08)，mix-blend-mode: luminosity

### 1.1 Sidebar Header（侧边栏头部，node: 1:162）

高度：92px
内边距：padding-left: 28px; padding-right: 20px
布局：flex row，items-center，justify-center

标题文字 (node: 1:163)：
文字内容：Title
字体：SF Pro: Bold
字重：bold (700)
字号：29px
颜色：#FFFFFF（白色）
fontVariationSettings："wdth" 100
行高：normal

Edit 按钮 (node: 1:164)：
高度：44px
水平内边距：20px
圆角：border-radius: 500px（胶囊形）
溢出处理：overflow: clip
背景层 1：rgba(255,255,255,0.06)，mix-blend-mode: lighten
背景层 2：rgba(94,94,94,0.18)，mix-blend-mode: color-dodge

按钮文字 (node: 1:165)：
文字内容：Edit
字体：SF Pro: Semibold
字重：590
字号：17px
颜色：rgba(255,255,255,0.96)
行高：22px
对齐：center
fontVariationSettings："wdth" 100

### 1.2 Sidebar Item — 普通状态（node: 1:79）

高度：56px
水平内边距：12px
布局：flex row，items-center
内部 Frame 内边距：padding-left: 8px; padding-right: 19px
内部 Frame 间距：gap: 8px
背景：无（透明）
圆角：无

图标区域 Accessory (node: 1:81 / 1:82)：
容器尺寸：32px × 56px
对齐：items-center, justify-center
图标类型：SF Symbol（Image(systemName: "square.dashed")）
图标尺寸：28px × 28px
图标颜色：#0091FF（蓝色）
字体：SF Pro: Medium
字重：510
字号：17px
fontVariationSettings："wdth" 100
fontFeatureSettings："ss16" 1

标签文字 (node: 1:83)：
文字内容：Title
字体：SF Pro: Regular
字重：normal (400)
字号：17px
颜色：rgba(255,255,255,0.96)
行高：19px
字间距：-0.4px
fontVariationSettings："wdth" 100
弹性：flex: 1 0 0

计数器 Counter（可选，node: 1:84）：
示例值：42
字体：SF Pro: Regular
字重：normal (400)
字号：17px
颜色：#545454（灰色）
对齐：text-align: right
字间距：-0.4px
行高：19px
fontVariationSettings："wdth" 100
溢出：white-space: nowrap

### 1.3 Sidebar Item — 选中/激活状态（node: I1:676;548:6090;487:16607）

与普通状态相同，但内部 Frame 增加背景高亮层：

内部 Frame 圆角：border-radius: 11px

激活状态内部背景效果层（叠加）：
层次 1：rgba(255,255,255,0.07)，正常（无混合）
层次 2：rgba(94,94,94,0.18)，mix-blend-mode: color-dodge

图标、文字属性与普通状态完全相同。

### 1.4 Section Header（分组标题，node: 1:167）

高度：66px
水平内边距：24px
顶部内边距：12px
布局：flex row，items-center，justify-center

标题文字 (node: 1:168)：
文字内容：Section Heading
字体：SF Pro: Semibold
字重：590
字号：20px
颜色：#FFFFFF（白色）
行高：25px
字间距：-0.4px
溢出：text-overflow: ellipsis; white-space: nowrap; overflow: hidden
fontVariationSettings："wdth" 100
弹性：flex: 1 0 0

折叠图标 Chevron (node: 1:169)：
容器尺寸：32px × 32px
图标类型：SF Symbol（chevron.down，展开/收起）
字号：17px
颜色：rgba(255,255,255,0.96)
对齐：center
fontVariationSettings："wdth" 100
fontFeatureSettings："ss15" 1

### 1.5 Item Group（分组容器，node: 1:309）

布局：flex column
子项间距：gap: 4px
溢出：overflow: clip
宽度：100%（full width）
内容：1 × Section Header + 6 × Sidebar Item

## 二、Content Area（内容区域，node: 1:677）

弹性：flex: 1 0 0（占满剩余宽度）
高度：100%
布局：flex column，items-center
背景：无（继承 Window 背景）

### 2.1 Navigation Bar（顶部导航栏，node: 1:678）

高度：92px
水平内边距：24px
布局：flex row，items-center，justify-between
宽度：full

返回按钮 Back（左侧，node: I1:678;487:11595）：
尺寸：44px × 44px
圆角：border-radius: 500px（圆形）
溢出：overflow: clip
图标：SF Symbol chevron.left
图标字号：19px
图标颜色：rgba(255,255,255,0.96)
字体：SF Pro: Medium，字重 510
fontVariationSettings："wdth" 100
背景层 1：rgba(255,255,255,0.06)，mix-blend-mode: lighten
背景层 2：rgba(94,94,94,0.18)，mix-blend-mode: color-dodge

导航标题 Title（居中，node: I1:678;487:11596）：
文字内容：Title
定位：绝对居中（left: 50%, top: 46px，translate -50%）
宽度：562px
字体：SF Pro: Bold
字重：bold (700)
字号：29px
颜色：rgba(255,255,255,0.96)
对齐：center
行高：normal
fontVariationSettings："wdth" 100

右侧图标按钮（node: I1:678;487:11597;127:82702）：
尺寸：44px × 44px
圆角：border-radius: 500px（圆形）
溢出：overflow: clip
图标：SF Symbol square.dashed
图标字号：19px
图标颜色：rgba(255,255,255,0.96)
字体：SF Pro: Medium，字重 510
fontVariationSettings："wdth" 100
背景层 1：rgba(255,255,255,0.06)，mix-blend-mode: lighten
背景层 2：rgba(94,94,94,0.18)，mix-blend-mode: color-dodge

## 三、设计系统全局 Token 汇总

主色（图标蓝）：#0091FF
主文字色：#FFFFFF / rgba(255,255,255,0.96)
次要文字色（计数器）：#545454
玻璃高亮层：rgba(255,255,255,0.06)，mix-blend-mode: lighten
玻璃反光层：rgba(94,94,94,0.18)，mix-blend-mode: color-dodge
激活项背景：rgba(255,255,255,0.07)
侧边栏色烧层：rgba(214,214,214,0.45)，mix-blend-mode: color-burn
侧边栏暗度层：rgba(0,0,0,0.08)，mix-blend-mode: luminosity
Window 边框：rgba(255,255,255,0.4)
分隔线颜色：rgba(84,84,88,0.65)
背景毛玻璃：backdrop-filter: blur(50px)
Window 圆角：46px
激活项内圆角：11px
按钮圆角（胶囊/圆形）：500px
字体族：SF Pro（Bold / Semibold / Medium / Regular）
全局字宽轴：fontVariationSettings: "wdth" 100
