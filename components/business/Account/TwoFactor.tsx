'use client';

import { useRef, useState, type SubmitEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Copy, ShieldCheck } from 'lucide-react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import QRCode from 'react-qr-code';
import { authErrorMessage } from '@/lib/api/auth-error';
import { errorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { authClient } from '@/lib/auth-client';
import { SecurityCloseButton, SecurityField, securityButtonClass, securityOTPSlotClass } from './SecurityFields';

type Enrollment = { totpURI: string };
type Step = 'password' | 'setup' | 'verify' | 'enabled';

type TwoFactorFormProps = {
  pending: boolean;
  error: string | null;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
};

function TwoFactorPasswordForm({
  enabled,
  password,
  onPasswordChange,
  pending,
  error,
  onSubmit,
}: TwoFactorFormProps & {
  enabled: boolean;
  password: string;
  onPasswordChange: (password: string) => void;
}) {
  const t = useTranslations();

  return (
    <>
      <div className="flex flex-col items-center gap-5 py-3 text-center">
        <span className="flex size-24 items-center justify-center rounded-full bg-linear-to-b from-white/25 to-white/10 shadow-lg ring-1 ring-white/20">
          <ShieldCheck className="size-13 text-white/90" strokeWidth={1.3} aria-hidden />
        </span>
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-2xl font-semibold tracking-tight">{t('account.twoFactorAuthentication')}</h3>
          <p className="max-w-85 text-sm leading-5 text-white/60">
            {t(enabled ? 'account.disableTwoFactorDescription' : 'account.enableTwoFactorDescription')}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} aria-busy={pending} className="flex flex-col gap-4">
        <SecurityField
          label={t('account.currentPassword')}
          hideLabel
          placeholder={t('account.currentPassword')}
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
        />

        {error ? (
          <p role="alert" className="text-center text-sm text-red-200">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={pending}
          className={`${securityButtonClass} w-full justify-center text-center ${enabled ? 'text-red-200 hover:text-red-100' : ''}`}
        >
          {pending ? t('common.saving') : t(enabled ? 'account.disableTwoFactor' : 'account.enableTwoFactor')}
        </Button>
      </form>
    </>
  );
}

function TwoFactorSetupView({
  enrollment,
  error,
  onErrorChange,
  onNext,
}: {
  enrollment: Enrollment;
  error: string | null;
  onErrorChange: (error: string | null) => void;
  onNext: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const setupInput = useRef<HTMLInputElement>(null);
  const setupKey = new URL(enrollment.totpURI).searchParams.get('secret') ?? '';

  async function copySetupKey() {
    onErrorChange(null);
    try {
      if (!navigator.clipboard || !window.isSecureContext) {
        throw new Error('Clipboard unavailable');
      }

      await navigator.clipboard.writeText(setupKey);
      setCopied(true);
    } catch {
      setCopied(false);
      setupInput.current?.focus();
      setupInput.current?.select();
      onErrorChange(errorMessage({ code: 'account.COPY_FAILED' }, locale));
    }
  }

  return (
    <>
      <h3 className="text-center text-2xl font-semibold tracking-tight">{t('account.enableTwoFactor')}</h3>
      <p className="text-center text-sm text-white/65">{t('account.scanQrDescription')}</p>
      <div className="self-center rounded-xl bg-white p-3">
        <QRCode value={enrollment.totpURI} size={176} title={t('account.authenticatorQrCode')} />
      </div>
      <p className="text-center text-sm leading-5 text-white/65">{t('account.manualSetupDescription')}</p>
      <ButtonGroup aria-label={t('account.setupKey')} className="w-full">
        <Input
          ref={setupInput}
          aria-label={t('account.setupKey')}
          readOnly
          value={setupKey}
          className="h-11 min-w-0 border-white/20 bg-black/10! font-mono text-xs text-white shadow-none focus-visible:border-sky-300/70 focus-visible:ring-sky-300/15"
          onFocus={(event) => event.target.select()}
        />
        <Button
          type="button"
          variant="outline"
          aria-label={t(copied ? 'account.copied' : 'account.copySetupKey')}
          title={t(copied ? 'account.copied' : 'account.copySetupKey')}
          onClick={() => void copySetupKey()}
          className="h-11 shrink-0 border-white/20 bg-white/8 text-white shadow-none hover:bg-white/15 hover:text-white dark:bg-white/8 dark:hover:bg-white/15"
        >
          {copied ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
        </Button>
      </ButtonGroup>
      {copied ? (
        <span role="status" className="sr-only">
          {t('account.copied')}
        </span>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <Button className={`${securityButtonClass} w-full justify-center text-center`} onClick={onNext}>
        {t('account.nextStep')}
      </Button>
    </>
  );
}

function TwoFactorVerificationForm({
  code,
  onCodeChange,
  pending,
  error,
  onSubmit,
  onBack,
}: TwoFactorFormProps & {
  code: string;
  onCodeChange: (code: string) => void;
  onBack: () => void;
}) {
  const t = useTranslations();

  return (
    <form onSubmit={onSubmit} aria-busy={pending} className="flex flex-col gap-4">
      <h3 className="text-center text-2xl font-semibold tracking-tight">{t('account.verificationCode')}</h3>
      <p className="text-center text-sm leading-5 text-white/65">{t('account.enrollmentVerificationDescription')}</p>
      <InputOTP
        containerClassName="w-full justify-center"
        aria-label={t('account.verificationCode')}
        autoComplete="one-time-code"
        inputMode="numeric"
        pattern={REGEXP_ONLY_DIGITS}
        minLength={6}
        maxLength={6}
        required
        autoFocus
        disabled={pending}
        value={code}
        onChange={onCodeChange}
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
      <div className="flex flex-col gap-1">
        <Button
          type="submit"
          disabled={pending || code.length !== 6}
          className={`${securityButtonClass} w-full justify-center text-center`}
        >
          {pending ? t('common.saving') : t('account.verifyAndEnable')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          className="rounded-full text-white/65 hover:bg-white/5 hover:text-white"
          onClick={onBack}
        >
          {t('account.backToSetup')}
        </Button>
      </div>
    </form>
  );
}

function TwoFactorEnabledStatus({ pending, onClose }: { pending: boolean; onClose: () => void }) {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center gap-5 py-3 text-center">
      <span className="flex size-24 items-center justify-center rounded-full bg-linear-to-b from-white/25 to-white/10 shadow-lg ring-1 ring-white/20">
        <ShieldCheck className="size-13 text-white/90" strokeWidth={1.3} aria-hidden />
      </span>
      <p role="status" className="text-center text-sm text-emerald-200">
        {t('account.twoFactorEnabled')}
      </p>
      <Button
        className={`${securityButtonClass} w-full justify-center text-center`}
        disabled={pending}
        onClick={onClose}
      >
        {t('common.done')}
      </Button>
    </div>
  );
}

export function TwoFactor({
  enabled,
  onSuccess,
  onCancel,
  onPendingChange,
  onUpdated,
}: {
  enabled: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  onPendingChange?: (pending: boolean) => void;
  onUpdated: () => Promise<void>;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const [step, setStep] = useState<Step>('password');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || (step !== 'password' && step !== 'verify')) {
      return;
    }

    setPending(true);
    onPendingChange?.(true);
    setError(null);
    try {
      if (step === 'verify') {
        const result = await authClient.twoFactor.verifyTotp({ code });

        if (result.error) {
          setError(authErrorMessage(result.error, locale));

          return;
        }

        setCode('');
        setStep('enabled');
        await onUpdated();
      } else if (enabled) {
        const result = await authClient.twoFactor.disable({ password });

        if (result.error) {
          setError(authErrorMessage(result.error, locale));

          return;
        }

        setPassword('');
        await onUpdated();
        onSuccess();
      } else {
        const result = await authClient.twoFactor.enable({ password, method: 'totp' });

        if (result.error) {
          setError(authErrorMessage(result.error, locale));

          return;
        }

        if (result.data?.method === 'totp') {
          setEnrollment({ totpURI: result.data.totpURI });
          setPassword('');
          setStep('setup');
        }
      }
    } catch {
      setError(t('common.connectionFailed'));
    } finally {
      setPending(false);
      onPendingChange?.(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-col gap-4 bg-[#545458]/25 p-4 text-white">
      <SecurityCloseButton onClose={onCancel} disabled={pending} />
      {step === 'password' ? (
        <TwoFactorPasswordForm
          enabled={enabled}
          password={password}
          onPasswordChange={setPassword}
          pending={pending}
          error={error}
          onSubmit={handleSubmit}
        />
      ) : step === 'setup' && enrollment ? (
        <TwoFactorSetupView
          enrollment={enrollment}
          error={error}
          onErrorChange={setError}
          onNext={() => {
            setError(null);
            setStep('verify');
          }}
        />
      ) : step === 'verify' ? (
        <TwoFactorVerificationForm
          code={code}
          onCodeChange={setCode}
          pending={pending}
          error={error}
          onSubmit={handleSubmit}
          onBack={() => {
            setCode('');
            setError(null);
            setStep('setup');
          }}
        />
      ) : step === 'enabled' ? (
        <TwoFactorEnabledStatus pending={pending} onClose={onCancel} />
      ) : null}
    </div>
  );
}
