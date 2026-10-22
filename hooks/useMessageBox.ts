'use client';

import { createContext, useContext, type ReactNode } from 'react';

export type MessageBoxOptions = {
  title: string;
  description?: ReactNode;
  content?: ReactNode;
  confirmText?: string;
};

export type ConfirmOptions = MessageBoxOptions & {
  cancelText?: string;
};

export type PromptOptions = ConfirmOptions & {
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  inputLabel?: string;
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
