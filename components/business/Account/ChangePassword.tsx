'use client';

import { useId, useState, type SubmitEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Loader, UserRoundKey } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { authErrorMessage } from '@/lib/api/auth-error';
import { errorMessage } from '@/lib/api';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { WindowModal } from '@/components/common/WindowModal';

const FIELD_CONTROL_CLASS =
  'h-12 w-full rounded-none border-0 px-4 shadow-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:bg-white/5!';

function ChangePasswordHeader({ formId }: { formId: string }) {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center gap-5 py-3 text-white">
      <span className="flex size-24 items-center justify-center rounded-full bg-linear-to-b from-white/25 to-white/10 shadow-lg ring-1 ring-white/20">
        <UserRoundKey className="size-13 text-white/90" strokeWidth={1.3} aria-hidden />
      </span>
      <div>
        <h3 className="text-center text-2xl font-semibold tracking-tight">{t('account.changePassword')}</h3>
        <p id={`${formId}-requirements`} className="px-4 text-center text-xs leading-5 text-white/50">
          {t('account.passwordDescription')}
        </p>
      </div>
    </div>
  );
}

function ChangePasswordForm({
  formId,
  currentPassword,
  newPassword,
  confirmation,
  pending,
  onSubmit,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmationChange,
}: {
  formId: string;
  currentPassword: string;
  newPassword: string;
  confirmation: string;
  pending: boolean;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmationChange: (value: string) => void;
}) {
  const t = useTranslations();

  return (
    <form id={formId} noValidate onSubmit={onSubmit} aria-busy={pending} className="flex flex-col gap-4 text-white">
      <fieldset
        disabled={pending}
        aria-label={t('account.changePassword')}
        className="min-w-0 shrink-0 overflow-hidden rounded-2xl bg-white/8 px-4"
      >
        <div className="divide-y divide-white/15">
          <div className="-mx-4">
            <Input
              aria-label={t('account.currentPassword')}
              placeholder={t('account.currentPassword')}
              className={FIELD_CONTROL_CLASS}
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => onCurrentPasswordChange(event.target.value)}
            />
          </div>
          <div className="-mx-4">
            <Input
              aria-label={t('account.newPassword')}
              placeholder={t('account.newPassword')}
              aria-describedby={`${formId}-requirements`}
              className={FIELD_CONTROL_CLASS}
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => onNewPasswordChange(event.target.value)}
            />
          </div>
          <div className="-mx-4">
            <Input
              aria-label={t('account.confirmPassword')}
              placeholder={t('account.confirmPassword')}
              aria-describedby={`${formId}-requirements`}
              className={FIELD_CONTROL_CLASS}
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => onConfirmationChange(event.target.value)}
            />
          </div>
        </div>
      </fieldset>
    </form>
  );
}

export function ChangePassword({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const t = useTranslations();
  const locale = useLocale();
  const formId = useId();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [pending, setPending] = useState(false);
  const toast = useToast();

  function validatePasswordLength(value: string): boolean {
    if (value.length < 6) {
      toast.add({ type: 'error', title: errorMessage({ code: 'account.PASSWORD_TOO_SHORT' }, locale) });

      return false;
    }

    if (value.length > 128) {
      toast.add({ type: 'error', title: errorMessage({ code: 'account.PASSWORD_TOO_LONG' }, locale) });

      return false;
    }

    return true;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }

    if (!currentPassword) {
      toast.add({
        type: 'error',

        title: errorMessage({ code: 'account.CURRENT_PASSWORD_REQUIRED' }, locale),
      });

      return;
    }

    if (!newPassword) {
      toast.add({
        type: 'error',

        title: errorMessage({ code: 'account.NEW_PASSWORD_REQUIRED' }, locale),
      });

      return;
    }

    if (!confirmation) {
      toast.add({
        type: 'error',

        title: errorMessage({ code: 'account.CONFIRM_PASSWORD_REQUIRED' }, locale),
      });

      return;
    }

    if (newPassword !== confirmation) {
      toast.add({ type: 'error', title: errorMessage({ code: 'account.PASSWORD_MISMATCH' }, locale) });

      return;
    }

    if (!validatePasswordLength(newPassword)) {
      return;
    }

    setPending(true);
    try {
      const result = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });

      if (result.error) {
        toast.add({ type: 'error', title: authErrorMessage(result.error, locale) });

        return;
      }

      toast.add({ type: 'success', title: t('account.passwordChanged') });
      onSuccess();
    } catch {
      toast.add({ type: 'error', title: t('common.connectionFailed') });
    } finally {
      setPending(false);
    }
  }

  return (
    <WindowModal
      open
      mode="floating"
      title={t('account.changePassword')}
      size={{ width: 360 }}
      style={{ maxWidth: '90dvw', maxHeight: '85dvh' }}
      fit
      header={{
        right: (
          <LiquidGlass className="size-10 rounded-full" contentClassName="h-full">
            <Button
              type="submit"
              form={formId}
              variant="ghost"
              size="icon-lg"
              aria-label={pending ? t('common.saving') : t('common.save')}
              title={t('common.save')}
              aria-busy={pending}
              disabled={pending}
              className="rounded-full text-white"
            >
              {pending ? (
                <Loader aria-hidden className="size-5 animate-spin" />
              ) : (
                <Check aria-hidden className="size-5" />
              )}
            </Button>
          </LiquidGlass>
        ),
      }}
      onOpenChange={(open) => {
        if (!open && !pending) {
          onCancel();
        }
      }}
    >
      <div className="flex min-w-0 shrink-0 flex-col gap-3 bg-[#545458]/25 p-4 pt-16">
        <ChangePasswordHeader formId={formId} />
        <ChangePasswordForm
          formId={formId}
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmation={confirmation}
          pending={pending}
          onSubmit={handleSubmit}
          onCurrentPasswordChange={setCurrentPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmationChange={setConfirmation}
        />
      </div>
    </WindowModal>
  );
}
