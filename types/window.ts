import type { CSSProperties, LazyExoticComponent, PointerEventHandler, ReactElement, ReactNode } from 'react';

export type HeaderMode = 'controls' | 'floating' | 'native';

export type WindowControlType = 'disabled' | 'hide' | 'default';

export type WindowControlsConfig = {
  minimize?: WindowControlType;
  maximize?: WindowControlType;
};

export type WindowState = 'closed' | 'normal' | 'maximized';

export type WindowContextValue = {
  id: string;
  state: WindowState;
  open: boolean;
  maximized: boolean;
  close: () => void;
  minimize: () => void;
  maximize: () => void;
  restore: () => void;
  toggleMaximize: () => void;
};

export type ModalSize = {
  width?: number;
  height?: number;
};

export type LiquidGlassModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
  title: string;
  size?: ModalSize;
  style?: CSSProperties;
  modal?: boolean;
  transparent?: boolean;
  top?: boolean;
  closeOnOverlay?: boolean;
  fit?: boolean;
  resizable?: boolean;
  draggable?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export type HeaderContent = { left?: ReactNode; center?: ReactNode; right?: ReactNode };
export type WindowHeaderRenderProps = { onDragStart: PointerEventHandler<HTMLElement> };
export type WindowModalHeader = boolean | HeaderContent | ((props: WindowHeaderRenderProps) => HeaderContent);

export type WindowModalProps = Omit<LiquidGlassModalProps, 'children' | 'header'> & {
  showClose?: boolean;
  id?: string;
  src?: string;
  mode?: HeaderMode;
  controls?: WindowControlsConfig;
  header?: WindowModalHeader;
  children?: ReactNode | ((controls: ReactNode) => ReactNode);
};

export type WindowContentProps = Pick<HeaderContent, 'left' | 'right'> & {
  title: ReactNode;
  children?: ReactNode;
  className?: string;
};

export type WindowContentElement = ReactElement<WindowContentProps>;
export type WindowContentComponent = () => WindowContentElement;

export type SplitWindowMenuItem = {
  type: 'item';
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  content: WindowContentElement | WindowContentComponent | LazyExoticComponent<WindowContentComponent>;
};

export type SplitWindowMenuGroup = {
  type: 'group';
  id: string;
  label?: ReactNode;
  items: SplitWindowMenuItem[];
};

export type SplitWindowSidebar = {
  header?: ReactNode;
  footer?: ReactNode;
  items: (SplitWindowMenuItem | SplitWindowMenuGroup)[];
};

export type SplitWindowModalProps = Omit<WindowModalProps, 'src' | 'children'> & {
  sidebar: SplitWindowSidebar;
  /** 初始激活的菜单 id。 */
  active?: string;
  onChange?: (id: string) => void;
};
