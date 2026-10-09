'use client';

import { useId, useState, type SubmitEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader, UserRoundKey } from 'lucide-react';
import { authErrorMessage } from '@/lib/api/auth-error';
import { errorMessage } from '@/lib/api';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { SecurityCloseButton } from './SecurityFields';

const FIELD_CONTROL_CLASS =
  'h-12 w-full rounded-none border-0 bg-transparent px-4 text-white shadow-none placeholder:text-white/50 focus-visible:border-transparent focus-visible:ring-0 focus-visible:bg-white/5 dark:bg-transparent';

export function ChangePassword({
  onSuccess,
  onCancel,
  onPendingChange,
}: {
  onSuccess: () => void;
  onCancel: () => void;
  onPendingChange?: (pending: boolean) => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const formId = useId();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validatePasswordLength(value: string): boolean {
    if (value.length < 6) {
      setError(errorMessage({ code: 'account.PASSWORD_TOO_SHORT' }, locale));
      return false;
    }
    if (value.length > 128) {
      setError(errorMessage({ code: 'account.PASSWORD_TOO_LONG' }, locale));
      return false;
    }
    return true;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    if (!currentPassword) {
      setError(errorMessage({ code: 'account.CURRENT_PASSWORD_REQUIRED' }, locale));
      return;
    }
    if (!newPassword) {
      setError(errorMessage({ code: 'account.NEW_PASSWORD_REQUIRED' }, locale));
      return;
    }
    if (!confirmation) {
      setError(errorMessage({ code: 'account.CONFIRM_PASSWORD_REQUIRED' }, locale));
      return;
    }
    if (newPassword !== confirmation) {
      setError(errorMessage({ code: 'account.PASSWORD_MISMATCH' }, locale));
      return;
    }
    if (!validatePasswordLength(newPassword)) return;
    if (newPassword === currentPassword) {
      setError(errorMessage({ code: 'account.PASSWORD_UNCHANGED' }, locale));
      return;
    }
    setPending(true);
    onPendingChange?.(true);
    try {
      const result = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
      if (result.error) {
        setError(authErrorMessage(result.error, locale));
        return;
      }
      onSuccess();
    } catch {
      setError(t('common.connectionFailed'));
    } finally {
      setPending(false);
      onPendingChange?.(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-col gap-3 bg-[#545458]/25 p-4">
      <div className="flex shrink-0 items-center justify-between">
        <SecurityCloseButton onClose={onCancel} disabled={pending} />
      </div>
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
      <form
        id={formId}
        noValidate
        onSubmit={handleSubmit}
        aria-busy={pending}
        className="flex flex-col gap-4 text-white"
      >
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
                onChange={(event) => setCurrentPassword(event.target.value)}
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
                onChange={(event) => setNewPassword(event.target.value)}
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
                onChange={(event) => setConfirmation(event.target.value)}
              />
            </div>
          </div>
        </fieldset>
        {error ? (
          <p role="alert" className="px-4 text-center text-sm leading-5 text-red-200">
            {error}
          </p>
        ) : null}
        <LiquidGlass className="w-full rounded-full" contentClassName="h-full">
          <Button
            type="submit"
            variant="ghost"
            aria-busy={pending}
            disabled={pending}
            className="h-10 w-full justify-center rounded-full text-white hover:bg-white/15 hover:text-white"
          >
            {pending ? <Loader aria-hidden className="size-5 animate-spin" /> : null}
            {pending ? t('common.saving') : t('common.save')}
          </Button>
        </LiquidGlass>
      </form>
    </div>
  );
}
