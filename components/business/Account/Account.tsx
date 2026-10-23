'use client';

import { useTranslations } from 'next-intl';
import { ChevronRight, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { AuthForm, type AuthMode } from '@/components/business/Account/AuthForm';
import { ChangePassword } from '@/components/business/Account/ChangePassword';
import { TwoFactor } from '@/components/business/Account/TwoFactor';
import { WindowContent } from '@/components/common/SplitWindowModal';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Loading } from '@/components/common/Loading';
import { Button } from '@/components/ui/button';
import { authClient, useSession } from '@/lib/auth-client';

type AccountUser = NonNullable<ReturnType<typeof useSession>['data']>['user'];
type SecurityDialog = 'changePassword' | 'twoFactorAuthentication';

function AccountHeader({ user }: { user: AccountUser }) {
  const t = useTranslations();

  return (
    <>
      <span className="flex size-24 items-center justify-center rounded-full bg-linear-to-b from-white/25 to-white/10 shadow-lg ring-1 ring-white/20">
        <UserRound className="size-13 text-white/90" strokeWidth={1.3} aria-hidden />
      </span>
      <h3 className="mt-4 max-w-full truncate text-2xl font-semibold tracking-tight">{user.name}</h3>
      <p className="mt-1 max-w-full text-center text-sm wrap-anywhere text-white/60">{user.email}</p>
      <span className="mt-3 flex items-center gap-1.5 text-xs text-white/55">
        <span className="size-1.5 rounded-full bg-emerald-300" />
        {t('account.signedIn')}
      </span>
    </>
  );
}

function AccountProfile({
  user,
  editing,
  name,
  pending,
  onNameChange,
  onSave,
  onCancel,
}: {
  user: AccountUser;
  editing: boolean;
  name: string;
  pending: boolean;
  onNameChange: (name: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
}) {
  const t = useTranslations();

  return (
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
                onChange={(event) => onNameChange(event.target.value)}
                disabled={pending}
                autoFocus
                className="w-full max-w-60 rounded-lg border border-white/20 bg-black/10 px-2 py-1 text-right outline-none focus:border-white/50"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void onSave();
                  }

                  if (event.key === 'Escape') {
                    onCancel();
                  }
                }}
              />
            ) : (
              user.name
            )}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-6 py-3.5">
          <dt className="shrink-0 text-white/65">{t('account.username')}</dt>
          <dd className="text-right wrap-anywhere">{user.displayUsername ?? user.username ?? t('account.notSet')}</dd>
        </div>
        <div className="flex items-start justify-between gap-6 py-3.5">
          <dt className="shrink-0 text-white/65">{t('account.email')}</dt>
          <dd className="text-right wrap-anywhere">{user.email}</dd>
        </div>
      </dl>
    </div>
  );
}

function AccountSecuritySettings({
  enabled,
  pending,
  onSelect,
}: {
  enabled: boolean;
  pending: boolean;
  onSelect: (option: SecurityDialog) => void;
}) {
  const t = useTranslations();

  return (
    <div className="mt-6 w-full">
      <h4 className="mb-2 px-1 text-sm font-medium text-white/75">{t('account.security')}</h4>
      <div className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-white/5 text-sm">
        {(['changePassword', 'twoFactorAuthentication'] as const).map((option) => (
          <button
            key={option}
            type="button"
            disabled={pending}
            onClick={() => onSelect(option)}
            className="flex w-full items-center justify-between gap-6 px-4 py-3.5 text-left transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white/50 disabled:opacity-50"
          >
            <span>{t(`account.${option}`)}</span>
            <span className="flex shrink-0 items-center gap-2 text-white/45">
              {option === 'twoFactorAuthentication' ? (
                <span className="text-xs">{t(enabled ? 'account.enabled' : 'account.disabled')}</span>
              ) : null}
              <ChevronRight className="size-4" aria-hidden />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Account() {
  const t = useTranslations();
  const router = useRouter();
  const { data: session, isPending, error: sessionError, refetch } = useSession();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [securityDialog, setSecurityDialog] = useState<SecurityDialog | null>(null);

  async function handleEdit() {
    if (!session || pending) {
      return;
    }

    if (!editing) {
      setName(session.user.name);

      setEditing(true);

      return;
    }

    if (!name.trim()) {
      toast.add({ type: 'error', title: t('account.nicknameRequired') });

      return;
    }

    setPending(true);

    try {
      const result = await authClient.updateUser({ name: name.trim() });

      if (result.error) {
        toast.add({ type: 'error', title: result.error.message ?? t('common.saveFailed') });

        return;
      }

      setEditing(false);
      await refetch();
      router.refresh();
    } catch {
      toast.add({ type: 'error', title: t('common.connectionFailed') });
    } finally {
      setPending(false);
    }
  }

  async function handleSignOut() {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        toast.add({ type: 'error', title: result.error.message ?? t('account.signOutFailed') });

        return;
      }

      setMode('sign-in');
      setEditing(false);
      router.refresh();
    } catch {
      toast.add({ type: 'error', title: t('common.connectionFailed') });
    } finally {
      setPending(false);
    }
  }

  return (
    <WindowContent
      title={t('account.title')}
      right={
        session ? (
          <LiquidGlass className="pointer-events-auto rounded-full" contentClassName="h-full">
            <Button
              variant="ghost"
              disabled={pending}
              onClick={handleEdit}
              className="h-10 rounded-full px-5 text-white"
            >
              {editing ? t('common.done') : t('common.edit')}
            </Button>
          </LiquidGlass>
        ) : null
      }
    >
      <div className="flex min-h-0 flex-col items-center gap-3 p-5">
        {session ? (
          <div className="flex w-full max-w-130 shrink-0 flex-col items-center pb-4">
            <AccountHeader user={session.user} />
            <AccountProfile
              user={session.user}
              editing={editing}
              name={name}
              pending={pending}
              onNameChange={setName}
              onSave={handleEdit}
              onCancel={() => setEditing(false)}
            />
            <AccountSecuritySettings
              enabled={session.user.twoFactorEnabled === true}
              pending={pending}
              onSelect={setSecurityDialog}
            />
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
                <Button variant="ghost" onClick={() => void refetch()} className="text-white">
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
        <ChangePassword onSuccess={() => setSecurityDialog(null)} onCancel={() => setSecurityDialog(null)} />
      ) : null}
      {session && securityDialog === 'twoFactorAuthentication' ? (
        <TwoFactor
          enabled={session.user.twoFactorEnabled === true}
          onSuccess={() => setSecurityDialog(null)}
          onCancel={() => setSecurityDialog(null)}
          onUpdated={async () => {
            await refetch();
            router.refresh();
          }}
        />
      ) : null}
    </WindowContent>
  );
}
