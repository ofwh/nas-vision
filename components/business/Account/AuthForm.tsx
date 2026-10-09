'use client';

import { useTranslations } from 'next-intl';
import { useState, type SubmitEvent } from 'react';
import { UserRoundKey, UserRoundPlus } from 'lucide-react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { TwoFactorChallenge } from './TwoFactorChallenge';

export type AuthMode = 'sign-in' | 'sign-up';

const inputClass =
  'h-11 w-full rounded-lg border border-white/20 bg-black/10 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-sky-300/70 focus:ring-3 focus:ring-sky-300/15 disabled:opacity-50';

export function AuthForm({
  mode,
  onModeChange,
  onSuccess,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onSuccess: () => void;
}) {
  const t = useTranslations();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const isSignUp = mode === 'sign-up';
  const AccountIcon = isSignUp ? UserRoundPlus : UserRoundKey;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      const result = isSignUp
        ? await authClient.signUp.email({ name, email, password, username })
        : await authClient.signIn.username({ username, password });
      if (result.error) {
        setError(result.error.message ?? (isSignUp ? t('account.signUpFailed') : t('account.signInFailed')));
        return;
      }
      if (result.data && 'twoFactorRedirect' in result.data && result.data.twoFactorRedirect) {
        setPassword('');
        setTwoFactorRequired(true);
        return;
      }
      onSuccess();
    } catch {
      setError(t('common.connectionFailed'));
    } finally {
      setPending(false);
    }
  }

  if (twoFactorRequired) {
    return (
      <div className="my-auto flex w-full max-w-85 shrink-0 flex-col gap-6 py-3">
        <h3 className="text-center text-2xl font-semibold text-white">{t('account.twoFactorAuthentication')}</h3>
        <TwoFactorChallenge
          onSuccess={onSuccess}
          onCancel={() => {
            setTwoFactorRequired(false);
            setError(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="my-auto flex w-full max-w-85 shrink-0 flex-col items-center py-3">
      <span className="mb-5 flex size-24 items-center justify-center rounded-full bg-linear-to-b from-white/25 to-white/10 shadow-lg ring-1 ring-white/20">
        <AccountIcon className="size-13 text-white/90" strokeWidth={1.3} aria-hidden />
      </span>
      <h3 className="text-center text-2xl font-semibold tracking-tight text-white">
        {isSignUp ? t('account.createTitle') : t('account.signInTitle')}
      </h3>
      <p className="mt-2 max-w-72 text-center text-sm leading-5 text-white/60">
        {isSignUp ? t('account.createDescription') : t('account.signInDescription')}
      </p>
      <form onSubmit={handleSubmit} className="mt-6 flex w-full flex-col gap-3" aria-busy={pending}>
        <fieldset disabled={pending} className="flex min-w-0 flex-col gap-2.5">
          {isSignUp ? (
            <label className="block">
              <span className="sr-only">{t('account.nickname')}</span>
              <input
                name="name"
                placeholder={t('account.nickname')}
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="name"
                className={inputClass}
              />
            </label>
          ) : null}
          <label className="block">
            <span className="sr-only">{t('account.username')}</span>
            <input
              name="username"
              placeholder={t('account.username')}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_.]+"
              title={t('account.usernameHint')}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              className={inputClass}
            />
          </label>
          {isSignUp ? (
            <label className="block">
              <span className="sr-only">{t('account.email')}</span>
              <input
                name="email"
                placeholder={t('account.email')}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className={inputClass}
              />
            </label>
          ) : null}
          <label className="block">
            <span className="sr-only">{t('account.password')}</span>
            <input
              name="password"
              placeholder={t('account.password')}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className={inputClass}
            />
          </label>
        </fieldset>
        {error ? (
          <p role="alert" className="text-sm text-red-200">
            {error}
          </p>
        ) : null}
        <LiquidGlass className="mt-2 self-center rounded-full" contentClassName="h-full">
          <Button
            type="submit"
            variant="ghost"
            disabled={pending}
            className="h-9 min-w-32 rounded-full px-6 text-white hover:bg-white/15 hover:text-white"
          >
            {pending
              ? isSignUp
                ? t('account.signingUp')
                : t('account.signingIn')
              : isSignUp
                ? t('account.signUp')
                : t('account.signIn')}
          </Button>
        </LiquidGlass>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => onModeChange(isSignUp ? 'sign-in' : 'sign-up')}
          className="mt-1 self-center text-sky-200 hover:bg-white/5 hover:text-sky-100"
        >
          {isSignUp ? t('account.switchToSignIn') : t('account.switchToSignUp')}
        </Button>
      </form>
    </div>
  );
}
