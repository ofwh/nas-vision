'use client';

import { useTranslations } from 'next-intl';
import { ChevronRight, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm, type AuthMode } from '@/components/business/Account/AuthForm';
import { ChangePassword } from '@/components/business/Account/ChangePassword';
import { TwoFactor } from '@/components/business/Account/TwoFactor';
import { LiquidGlassDialog } from '@/components/common/LiquidGlassDialog';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Loading } from '@/components/common/Loading';
import { Button } from '@/components/ui/button';
import { authClient, useSession } from '@/lib/auth-client';

function ChangePasswordDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations();
  const [pending, setPending] = useState(false);

  return (
    <LiquidGlassDialog
      open
      header={false}
      title={t('account.changePassword')}
      size={{ width: 440 }}
      style={{ maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100dvh - 32px)' }}
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <ChangePassword onSuccess={onClose} onCancel={onClose} onPendingChange={setPending} />
    </LiquidGlassDialog>
  );
}

function TwoFactorDialog({
  enabled,
  onClose,
  onUpdated,
}: {
  enabled: boolean;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}) {
  const t = useTranslations();
  const [pending, setPending] = useState(false);

  return (
    <LiquidGlassDialog
      open
      header={false}
      title={t('account.twoFactorAuthentication')}
      size={{ width: 460 }}
      style={{ maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100dvh - 32px)' }}
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <TwoFactor
        enabled={enabled}
        onSuccess={onClose}
        onCancel={onClose}
        onPendingChange={setPending}
        onUpdated={onUpdated}
      />
    </LiquidGlassDialog>
  );
}

export function Account() {
  const t = useTranslations();
  const router = useRouter();
  const { data: session, isPending, error: sessionError, refetch } = useSession();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [securityDialog, setSecurityDialog] = useState<'changePassword' | 'twoFactorAuthentication' | null>(null);

  async function handleEdit() {
    if (!session || pending) return;
    if (!editing) {
      setName(session.user.name);
      setError(null);
      setEditing(true);
      return;
    }
    if (!name.trim()) {
      setError(t('account.nicknameRequired'));
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await authClient.updateUser({ name: name.trim() });
      if (result.error) {
        setError(result.error.message ?? t('common.saveFailed'));
        return;
      }
      setEditing(false);
      await refetch();
      router.refresh();
    } catch {
      setError(t('common.connectionFailed'));
    } finally {
      setPending(false);
    }
  }

  async function handleSignOut() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError(result.error.message ?? t('account.signOutFailed'));
        return;
      }
      setMode('sign-in');
      setEditing(false);
      router.refresh();
    } catch {
      setError(t('common.connectionFailed'));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative h-full min-h-0 overflow-hidden text-white">
      <div className="pointer-events-none absolute top-0 left-0 z-10 flex h-18 w-full items-center justify-end gap-3 bg-linear-to-b from-[#545458]/65 via-[#545458]/30 to-transparent px-6">
        <h2 className="sr-only">{t('account.title')}</h2>
        {session ? (
          <LiquidGlass className="pointer-events-auto rounded-full" contentClassName="h-full">
            <Button
              variant="ghost"
              disabled={pending}
              onClick={handleEdit}
              className="h-10 rounded-full px-5 text-white hover:bg-white/15 hover:text-white"
            >
              {editing ? t('common.done') : t('common.edit')}
            </Button>
          </LiquidGlass>
        ) : null}
      </div>
      <div
        className={`flex h-full min-h-0 flex-col items-center gap-3 overflow-y-auto overscroll-contain p-5 ${session && !isPending ? 'pt-18' : ''}`}
      >
        {session ? (
          <div className="flex w-full max-w-130 shrink-0 flex-col items-center pb-4">
            <span className="flex size-24 items-center justify-center rounded-full bg-linear-to-b from-white/25 to-white/10 shadow-lg ring-1 ring-white/20">
              <UserRound className="size-13 text-white/90" strokeWidth={1.3} aria-hidden />
            </span>
            <h3 className="mt-4 max-w-full truncate text-2xl font-semibold tracking-tight">{session.user.name}</h3>
            <p className="mt-1 max-w-full text-center text-sm wrap-anywhere text-white/60">{session.user.email}</p>
            <span className="mt-3 flex items-center gap-1.5 text-xs text-white/55">
              <span className="size-1.5 rounded-full bg-emerald-300" />
              {t('account.signedIn')}
            </span>
            <div className="mt-8 w-full">
              <h4 className="mb-2 px-1 text-sm font-medium text-white/75">{t('account.profile')}</h4>
              <dl className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm">
                <div className="flex items-start justify-between gap-6 py-3.5">
                  <dt className="shrink-0 text-white/65">{t('account.nickname')}</dt>
                  <dd className="min-w-0 text-right wrap-anywhere">
                    {editing ? (
                      <input
                        aria-label={t('account.nickname')}
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        disabled={pending}
                        autoFocus
                        className="w-full max-w-60 rounded-lg border border-white/20 bg-black/10 px-2 py-1 text-right outline-none focus:border-white/50"
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') void handleEdit();
                          if (event.key === 'Escape') setEditing(false);
                        }}
                      />
                    ) : (
                      session.user.name
                    )}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-6 py-3.5">
                  <dt className="shrink-0 text-white/65">{t('account.username')}</dt>
                  <dd className="text-right wrap-anywhere">
                    {session.user.displayUsername ?? session.user.username ?? t('account.notSet')}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-6 py-3.5">
                  <dt className="shrink-0 text-white/65">{t('account.email')}</dt>
                  <dd className="text-right wrap-anywhere">{session.user.email}</dd>
                </div>
              </dl>
            </div>
            <div className="mt-6 w-full">
              <h4 className="mb-2 px-1 text-sm font-medium text-white/75">{t('account.security')}</h4>
              <div className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-white/5 text-sm">
                {(['changePassword', 'twoFactorAuthentication'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={pending}
                    onClick={() => setSecurityDialog(option)}
                    className="flex w-full items-center justify-between gap-6 px-4 py-3.5 text-left transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white/50 disabled:opacity-50"
                  >
                    <span>{t(`account.${option}`)}</span>
                    <span className="flex shrink-0 items-center gap-2 text-white/45">
                      {option === 'twoFactorAuthentication' ? (
                        <span className="text-xs">
                          {t(session.user.twoFactorEnabled ? 'account.enabled' : 'account.disabled')}
                        </span>
                      ) : null}
                      <ChevronRight className="size-4" aria-hidden />
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <LiquidGlass className="mt-6 rounded-full" contentClassName="h-full">
              <Button
                variant="ghost"
                disabled={pending}
                onClick={handleSignOut}
                className="h-10 w-32 rounded-full px-6 text-red-300 hover:bg-red-400/10 hover:text-red-200"
              >
                {t('account.signOut')}
              </Button>
            </LiquidGlass>
            {error ? (
              <p role="alert" className="mt-4 text-sm text-red-200">
                {error}
              </p>
            ) : null}
          </div>
        ) : (
          <>
            {isPending ? (
              <Loading />
            ) : sessionError ? (
              <div className="flex flex-col items-center gap-3">
                <p role="alert" className="text-sm text-red-200">
                  {t('account.loadFailed')}
                </p>
                <Button
                  variant="ghost"
                  onClick={() => void refetch()}
                  className="text-white hover:bg-white/15 hover:text-white"
                >
                  {t('account.reload')}
                </Button>
              </div>
            ) : null}
            <div className={isPending || sessionError ? 'hidden' : 'contents'}>
              <AuthForm
                key={mode}
                mode={mode}
                onModeChange={setMode}
                onSuccess={() => {
                  setMode('sign-in');
                  router.refresh();
                }}
              />
            </div>
          </>
        )}
      </div>
      {session && securityDialog === 'changePassword' ? (
        <ChangePasswordDialog onClose={() => setSecurityDialog(null)} />
      ) : null}
      {session && securityDialog === 'twoFactorAuthentication' ? (
        <TwoFactorDialog
          enabled={session.user.twoFactorEnabled === true}
          onClose={() => setSecurityDialog(null)}
          onUpdated={async () => {
            await refetch();
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
