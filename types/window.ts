import type { CSSProperties, LazyExoticComponent, ReactElement, ReactNode } from 'react';

export type HeaderMode = 'controls' | 'floating' | 'native';

export type ModalSize = {
  width: number;
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
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export type HeaderContent = { left?: ReactNode; center?: ReactNode; right?: ReactNode };

export type WindowModalProps = Omit<LiquidGlassModalProps, 'children' | 'header'> & {
  src?: string;
  mode?: HeaderMode;
  header?: boolean | HeaderContent;
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
