'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { WindowModal } from '@/components/common/WindowModal';
import { Button } from '@/components/ui/button';
import { DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/useToast';
import {
  MessageBoxContext,
  type ConfirmOptions,
  type MessageBoxContextValue,
  type MessageBoxOptions,
  type PromptOptions,
} from '@/hooks/useMessageBox';

type MessageBoxFrameProps = MessageBoxOptions & {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cancelText?: string;
  children?: ReactNode;
};

function MessageBoxFrame({
  open,
  title,
  description,
  content,
  confirmText,
  cancelText,
  onClose,
  onConfirm,
  children,
}: MessageBoxFrameProps) {
  const t = useTranslations('common');

  return (
    <WindowModal
      open={open}
      title={title}
      mode="floating"
      fit
      top
      size={{ width: 300 }}
      style={{ maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100dvh - 32px)' }}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <div className="flex shrink-0 flex-col bg-[#545458]/25 px-4 pt-20 pb-4">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            onConfirm();
          }}
          className="flex flex-col gap-4 text-white"
        >
          {description != null && (
            <DialogDescription className="px-4 py-3 text-center text-sm leading-6 wrap-break-word text-white">
              {description}
            </DialogDescription>
          )}
          {content}
          {children}
          <div className="flex flex-col gap-2">
            <LiquidGlass className="w-full rounded-full" contentClassName="h-full">
              <Button type="submit" variant="ghost" className="h-10 w-full justify-center rounded-full text-white">
                {confirmText ?? t('confirm')}
              </Button>
            </LiquidGlass>
            {cancelText != null && (
              <LiquidGlass className="w-full rounded-full" contentClassName="h-full">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="h-10 w-full justify-center rounded-full text-white"
                >
                  {cancelText}
                </Button>
              </LiquidGlass>
            )}
          </div>
        </form>
      </div>
    </WindowModal>
  );
}

export type ConfirmMessageBoxProps = ConfirmOptions & {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmMessageBox({ onCancel, cancelText, ...props }: ConfirmMessageBoxProps) {
  const t = useTranslations('common');

  return <MessageBoxFrame {...props} cancelText={cancelText ?? t('cancel')} onClose={onCancel} />;
}

export type AlertMessageBoxProps = MessageBoxOptions & {
  open: boolean;
  onClose: () => void;
};

function AlertMessageBox({ onClose, ...props }: AlertMessageBoxProps) {
  return <MessageBoxFrame {...props} onClose={onClose} onConfirm={onClose} />;
}

export type PromptMessageBoxProps = PromptOptions & {
  open: boolean;
  onConfirm: (value: string) => void;
  onCancel: () => void;
};

function PromptMessageBox({
  required = false,
  defaultValue = '',
  placeholder,
  inputLabel,
  onConfirm,
  onCancel,
  cancelText,
  ...props
}: PromptMessageBoxProps) {
  const t = useTranslations('common');
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <MessageBoxFrame
      {...props}
      cancelText={cancelText ?? t('cancel')}
      onClose={onCancel}
      onConfirm={() => {
        const value = inputRef.current?.value ?? defaultValue;

        if (required && !value.trim()) {
          toast.add({ type: 'error', title: t('inputRequired') });
          inputRef.current?.focus();

          return;
        }

        onConfirm(value);
      }}
    >
      <Input
        ref={inputRef}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={inputLabel ?? props.title}
        autoFocus
        className="rounded-full"
      />
    </MessageBoxFrame>
  );
}

type DialogRequest =
  | { id: number; kind: 'confirm'; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { id: number; kind: 'alert'; options: MessageBoxOptions; resolve: () => void }
  | { id: number; kind: 'prompt'; options: PromptOptions; resolve: (value: string | null) => void };

function cancelRequest(request: DialogRequest) {
  switch (request.kind) {
    case 'confirm':
      request.resolve(false);
      break;
    case 'alert':
      request.resolve();
      break;
    case 'prompt':
      request.resolve(null);
      break;
  }
}

function MessageBoxProvider({ children }: { children: ReactNode }) {
  const queue = useRef<DialogRequest[]>([]);
  const nextId = useRef(0);
  const mounted = useRef(true);
  const lifecycle = useRef({ generation: 0 });
  const [requests, setRequests] = useState<DialogRequest[]>([]);

  useEffect(() => {
    const currentLifecycle = lifecycle.current;
    const generation = ++currentLifecycle.generation;

    mounted.current = true;

    return () => {
      // Strict Mode 会在同一轮中重放 effect，延后清理以保留仍有效的请求。
      queueMicrotask(() => {
        if (currentLifecycle.generation !== generation) {
          return;
        }

        mounted.current = false;
        const pendingRequests = queue.current;

        queue.current = [];
        setRequests(queue.current);
        pendingRequests.forEach(cancelRequest);
      });
    };
  }, []);

  const enqueue = useCallback((request: DialogRequest) => {
    if (!mounted.current) {
      cancelRequest(request);

      return;
    }

    queue.current = [...queue.current, request];
    setRequests(queue.current);
  }, []);

  const complete = useCallback((request: DialogRequest, resolve: () => void) => {
    if (queue.current[0]?.id !== request.id) {
      return;
    }

    queue.current = queue.current.slice(1);
    setRequests(queue.current);
    resolve();
  }, []);

  const dialog = useMemo<MessageBoxContextValue>(
    () => ({
      confirm: (options) =>
        new Promise<boolean>((resolve) => {
          enqueue({ id: nextId.current++, kind: 'confirm', options, resolve });
        }),
      alert: (options) =>
        new Promise<void>((resolve) => {
          enqueue({ id: nextId.current++, kind: 'alert', options, resolve });
        }),
      prompt: (options) =>
        new Promise<string | null>((resolve) => {
          enqueue({ id: nextId.current++, kind: 'prompt', options, resolve });
        }),
    }),
    [enqueue],
  );
  const request = requests[0];

  return (
    <MessageBoxContext.Provider value={dialog}>
      {children}
      {request?.kind === 'confirm' && (
        <ConfirmMessageBox
          key={request.id}
          {...request.options}
          open
          onConfirm={() => complete(request, () => request.resolve(true))}
          onCancel={() => complete(request, () => request.resolve(false))}
        />
      )}
      {request?.kind === 'alert' && (
        <AlertMessageBox
          key={request.id}
          {...request.options}
          open
          onClose={() => complete(request, () => request.resolve())}
        />
      )}
      {request?.kind === 'prompt' && (
        <PromptMessageBox
          key={request.id}
          {...request.options}
          open
          onConfirm={(value) => complete(request, () => request.resolve(value))}
          onCancel={() => complete(request, () => request.resolve(null))}
        />
      )}
    </MessageBoxContext.Provider>
  );
}

export const MessageBox = Object.assign(MessageBoxProvider, {
  Confirm: ConfirmMessageBox,
  Alert: AlertMessageBox,
  Prompt: PromptMessageBox,
});
