'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ModalSize } from '@/types/window';

export type MessageBoxAction = string | LucideIcon;

export type MessageBoxOptions = {
  title?: string;
  content?: ReactNode;
  confirm?: MessageBoxAction | null;
  showClose?: boolean;
  size?: ModalSize;
};

export type ConfirmOptions = MessageBoxOptions & {
  cancel?: MessageBoxAction | null;
};

export type PromptOptions = ConfirmOptions & {
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  type?: 'text' | 'password';
};

export type MessageBoxContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: MessageBoxOptions) => Promise<void>;
  prompt: (options: PromptOptions) => Promise<string | null>;
};

export const MessageBoxContext = createContext<MessageBoxContextValue | null>(null);

export function useMessageBox(): MessageBoxContextValue {
  const context = useContext(MessageBoxContext);

  if (!context) {
    throw new Error('useMessageBox must be used within MessageBox.');
  }

  return context;
}
