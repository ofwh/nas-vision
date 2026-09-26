'use client';

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { LiquidGlass } from '@/components/LiquidGlass';

/** 一个菜单项：默认只露图标，hover 后向右展开 label。 */
export type SidebarItem = {
  id: string;
  label: string;
  icon: ReactNode;
};

/** 图标尺寸，和下面 ICON_CLASS 的 h-6 w-6 是同一个数。 */
const ICON_SIZE = 24;

/** 单个菜单元素：收起 44x44，也就是图标 24 上下左右各留 10。 */
const ITEM_SIZE = 44;

/** 图标在菜单元素里的内边距：(44 - 24) / 2 = 10。 */
const ICON_PADDING = (ITEM_SIZE - ICON_SIZE) / 2;

/** 菜单元素和容器之间的留白（容器的 padding），横竖都是 12。 */
const CONTAINER_PADDING = 12;

/** 菜单元素之间的间距。 */
const ITEM_GAP = 12;

/** 图标和文案之间的间距。 */
const ICON_LABEL_GAP = 12;

/** 文案左缘：12 + 10 + 24 + 12 = 58px，与下面文案的 left-14.5 对应。 */
const LABEL_LEFT = CONTAINER_PADDING + ICON_PADDING + ICON_SIZE + ICON_LABEL_GAP;

/** 文案右侧留白：元素内 10 + 容器 12 = 22px，与图标左侧的 12 + 10 一致。 */
const LABEL_RIGHT = ICON_PADDING + CONTAINER_PADDING;

/** 容器高度：设计稿定的 183，比内容（3 个 44 + 2 个 12 = 156）高一点，多出来的上下均分。 */
const CONTAINER_HEIGHT = 183;

/**
 * 玻璃的覆盖色（LiquidGlass 的 token）。参考给的 0.25 是配它那张亮照片的：那里的 25% 白
 * 只是给背景提一点亮。我们壁纸是暗的，25% 白会把背景对比压平、整块糊成灰板，背景反而
 * 看不见了 —— 玻璃就不像玻璃。压到 0.08 才是同一层关系：背景透出来、只带一点提亮。
 */
const GLASS_TINT = 'rgb(255 255 255 / 0.08)';

/**
 * 高光的扩散半径：参考的 5px 在它 120px 高的容器上占 4%，在 68px 宽的胶囊上占 15%，
 * 会变成一圈发白的描边，所以收细到 2px。
 */
const GLASS_SPECULAR_GLOW = '2px';

/** 图标和文案都画在同一个 24px 网格上；block 掉 svg 的行内基线，免得它在图标框里偏下。 */
const ICON_CLASS = 'block h-6 w-6';

const MENU_ITEMS: SidebarItem[] = [
  {
    id: 'apps',
    label: '应用',
    icon: (
      <svg
        className={ICON_CLASS}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="3" y="3" width="7.5" height="7.5" rx="2.2" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="2.2" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="2.2" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.2" />
      </svg>
    ),
  },
  {
    id: 'files',
    label: '文件',
    icon: (
      <svg
        className={ICON_CLASS}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 7.5A2 2 0 0 1 5 5.5h3.2a2 2 0 0 1 1.6.8l.8 1.1h8.4a2 2 0 0 1 2 2v7.1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: '设置',
    icon: (
      <svg
        className={ICON_CLASS}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 7h8M18 7h2M4 17h2M12 17h8" />
        <circle cx="15" cy="7" r="2.4" />
        <circle cx="9" cy="17" r="2.4" />
      </svg>
    ),
  },
];

/**
 * 左侧菜单：一颗 68x183 的玻璃胶囊，默认只显示图标，鼠标 hover 时整个菜单向右展开出文案。
 *
 * 玻璃质感来自 <LiquidGlass />，这里只给它形状和尺寸、把菜单塞进 slot —— 杯子是它做的，
 * 里面装什么不归它管。
 *
 * 尺寸和留白（收起 → 展开）：
 *   容器       68x183                     → 12 + 展开后的菜单元素 + 12
 *   菜单元素   44x44                      → 10 + 图标 24 + 12 + 文案 + 10
 *   菜单之间   12px，菜单与容器之间 12px（容器 padding）
 * 收起宽度就是这么来的：12 + 44 + 12 = 68。容器高度 183 是设计稿定的，比内容
 * （3 个 44 + 2 个 12 = 156）高 3px，多出来的上下均分。
 *
 * 展开是"整颗胶囊向右长"，不是每项旁边弹出一个 popover：胶囊变宽、图标一动不动，文案在
 * 图标右侧 12px 处跟着胶囊边缘被一点点"擦"出来。左缘靠 margin 钉死（`calc(100% - 124px)`，
 * 124 就是设计稿里 68 胶囊 + 56 间距的预留区）——不能用 ml-auto，auto 钉的是右缘，胶囊会
 * 往左长。展开宽度 = 文案左缘 + 文案宽 + 右侧留白，由文案自己决定，见下面的测量。
 *
 * 容器相对定位、内部元素全部绝对定位：绝对定位的子元素不参与布局，胶囊变宽时它们不会被
 * 重新排版，所以图标的位置与文案的起点都是稳定的。
 *
 * 容器拿最高层级（z-50）：展开后要盖在蜂巢列表之上。
 *
 * 圆角写死 34px（收起宽度的一半，形态和 rounded-full 一样）而不是用 rounded-full：后者的
 * 半径是按盒子现算的，胶囊一长宽，圆角就跟着从 34 变到 62，展开过程中会看到两端在变形。
 */
export function Sidebar({ items = MENU_ITEMS }: { items?: SidebarItem[] }) {
  const listRef = useRef<HTMLDivElement>(null);
  /** 展开后的宽度：文案左缘 + 最宽的那条文案 + 文案右侧留白。 */
  const [expandedWidth, setExpandedWidth] = useState(LABEL_LEFT + LABEL_RIGHT);

  useEffect(() => {
    const labels = listRef.current?.querySelectorAll<HTMLElement>('[data-sidebar-label]');
    if (!labels?.length) return;

    // 子元素都是绝对定位，不参与布局，容器自己算不出内容的固有宽度，所以量最宽的那条文案
    // 再喂给容器。量一次不够：webfont 换上来同一句话会更宽（AppItem 的跑马灯同理）。
    const measure = () =>
      setExpandedWidth(
        LABEL_LEFT + Math.max(...Array.from(labels, (label) => label.getBoundingClientRect().width)) + LABEL_RIGHT,
      );

    measure();
    const observer = new ResizeObserver(measure);
    labels.forEach((label) => observer.observe(label));
    return () => observer.disconnect();
  }, [items]);

  // 整组菜单在容器里居中（183 比 156 高 3px，上下各分 1.5），再按 44 + 12 一行行往下排。
  const groupHeight = items.length * ITEM_SIZE + Math.max(0, items.length - 1) * ITEM_GAP;
  const itemTop = (index: number) => (CONTAINER_HEIGHT - groupHeight) / 2 + index * (ITEM_SIZE + ITEM_GAP);

  return (
    <LiquidGlass
      ref={listRef}
      // 覆盖色和高光按胶囊的实际尺寸/背景调过，见上面两个常量
      style={
        {
          '--sidebar-expand': `${expandedWidth}px`,
          '--glass-tint': GLASS_TINT,
          '--glass-specular-glow': GLASS_SPECULAR_GLOW,
        } as CSSProperties
      }
      className="group z-50 ml-[calc(100%_-_124px)] h-[183px] w-17 shrink-0 rounded-[34px] transition-all duration-300 ease-out hover:w-[var(--sidebar-expand)]"
    >
      {items.map((item, index) => (
        // 菜单元素：高 44（= h-11），横向撑满容器再各留 12 的 padding（= left-3 right-3），
        // 所以 hover 底色能一路铺到文案末尾。
        <div
          key={item.id}
          className="group/item absolute inset-x-0 cursor-pointer"
          style={{ top: itemTop(index), height: ITEM_SIZE }}
        >
          {/* hover 底色：图标和文案是整体，所以它不是围着图标的圆——收起时宽度正好是
                44px 的圆（包住图标），胶囊长开后跟着长成一条盖住图标+文案的胶囊。 */}
          <div className="absolute inset-y-0 right-3 left-3 rounded-full transition-colors duration-200 group-hover/item:bg-white/15" />

          {/* 图标：左缘钉死（12 + 10 = 22px），所以胶囊怎么变宽它都在这 */}
          <span className="absolute top-1/2 left-5.5 h-6 w-6 -translate-y-1/2 text-white/85 transition-colors duration-200 group-hover/item:text-white">
            {item.icon}
          </span>

          {/* 文案：左缘 58px（不是 left-full，行宽会跟着胶囊变），收起时被容器裁掉，
                展开时跟着露出来；透明度只负责让边缘不那么硬。 */}
          <span
            data-sidebar-label
            className="absolute top-1/2 left-14.5 -translate-y-1/2 text-sm whitespace-nowrap text-white/85 opacity-0 transition-[color,opacity] duration-200 group-hover:opacity-100 group-hover/item:text-white"
          >
            {item.label}
          </span>
        </div>
      ))}
    </LiquidGlass>
  );
}
