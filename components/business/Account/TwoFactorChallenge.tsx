'use client';

import { useState, type SubmitEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { authErrorMessage } from '@/lib/api/auth-error';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { authClient } from '@/lib/auth-client';
import { securityButtonClass, securityOTPSlotClass } from './SecurityFields';

export function TwoFactorChallenge({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const t = useTranslations();
  const locale = useLocale();
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || code.length !== 6) return;
    setPending(true);
    setError(null);
    try {
      const result = await authClient.twoFactor.verifyTotp({ code: code.trim() });
      if (result.error) {
        setError(authErrorMessage(result.error, locale));
        return;
      }
      onSuccess();
    } catch {
      setError(t('common.connectionFailed'));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={pending} className="flex w-full flex-col gap-4 text-white">
      <p className="text-center text-sm text-white/65">{t('account.verificationDescription')}</p>
      <InputOTP
        containerClassName="w-full justify-center"
        aria-label={t('account.verificationCode')}
        value={code}
        onChange={setCode}
        autoComplete="one-time-code"
        inputMode="numeric"
        pattern={REGEXP_ONLY_DIGITS}
        minLength={6}
        maxLength={6}
        autoCapitalize="none"
        spellCheck={false}
        required
        autoFocus
        disabled={pending}
      >
        <InputOTPGroup className="grid w-full max-w-80 grid-cols-6 gap-2">
          {[0, 1, 2, 3, 4, 5].map((slot) => (
            <InputOTPSlot key={slot} index={slot} className={securityOTPSlotClass} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      {error ? (
        <p role="alert" className="text-center text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={pending || code.length !== 6}
        className={`${securityButtonClass} w-full justify-center text-center`}
      >
        {pending ? t('account.verifying') : t('account.verify')}
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={pending}
        className="text-white/65 hover:bg-white/5 hover:text-white"
        onClick={onCancel}
      >
        {t('account.backToSignIn')}
      </Button>
    </form>
  );
}
