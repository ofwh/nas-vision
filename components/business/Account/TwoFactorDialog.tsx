'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Copy, ShieldCheck } from 'lucide-react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import QRCode from 'react-qr-code';
import { authErrorMessage } from '@/lib/api/auth-error';
import { errorMessage } from '@/lib/api';
import { LiquidGlassDialog } from '@/components/common/LiquidGlassDialog';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { authClient } from '@/lib/auth-client';
import { SecurityDialogClose, SecurityField, securityButtonClass, securityOTPSlotClass } from './SecurityFields';

type Enrollment = { totpURI: string };
type Step = 'password' | 'setup' | 'verify' | 'enabled';

export function TwoFactorDialog({
  enabled,
  onClose,
  onUpdated,
}: {
  enabled: boolean;
  onClose: () => void;
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
  const [copied, setCopied] = useState(false);
  const setupInput = useRef<HTMLInputElement>(null);
  const setupKey = enrollment ? (new URL(enrollment.totpURI).searchParams.get('secret') ?? '') : '';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || (step !== 'password' && step !== 'verify')) return;
    setPending(true);
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
        onClose();
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
    }
  }

  async function copySetupKey() {
    setError(null);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(setupKey);
      } else {
        setupInput.current?.focus();
        setupInput.current?.select();
        if (!document.execCommand('copy')) throw new Error('Copy failed');
      }
      setCopied(true);
    } catch {
      setError(errorMessage({ code: 'account.COPY_FAILED' }, locale));
    }
  }

  return (
    <LiquidGlassDialog
      open
      header={false}
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
      title={t('account.twoFactorAuthentication')}
      size={{ width: 460 }}
      style={{ maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100dvh - 32px)' }}
    >
      <div className="flex shrink-0 flex-col gap-4 bg-[#545458]/25 p-4 text-white">
        <SecurityDialogClose onClose={onClose} disabled={pending} />
        {step === 'password' ? (
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
        ) : null}
        {step === 'enabled' ? (
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
        ) : step === 'setup' && enrollment ? (
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
                className="h-11 min-w-0 border-white/20 bg-black/10 font-mono text-xs text-white shadow-none focus-visible:border-sky-300/70 focus-visible:ring-sky-300/15 dark:bg-black/10"
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
            <Button
              className={`${securityButtonClass} w-full justify-center text-center`}
              onClick={() => {
                setError(null);
                setStep('verify');
              }}
            >
              {t('account.nextStep')}
            </Button>
          </>
        ) : (
          <form onSubmit={handleSubmit} aria-busy={pending} className="flex flex-col gap-4">
            {step === 'verify' && enrollment ? (
              <>
                <h3 className="text-center text-2xl font-semibold tracking-tight">{t('account.verificationCode')}</h3>
                <p className="text-center text-sm leading-5 text-white/65">
                  {t('account.enrollmentVerificationDescription')}
                </p>
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
                  onChange={setCode}
                >
                  <InputOTPGroup className="grid w-full max-w-80 grid-cols-6 gap-2">
                    {[0, 1, 2, 3, 4, 5].map((slot) => (
                      <InputOTPSlot key={slot} index={slot} className={securityOTPSlotClass} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </>
            ) : (
              <>
                <SecurityField
                  label={t('account.currentPassword')}
                  hideLabel
                  placeholder={t('account.currentPassword')}
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={pending}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </>
            )}
            {error ? (
              <p role="alert" className="text-center text-sm text-red-200">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={pending || (step === 'verify' && code.length !== 6)}
              className={`${securityButtonClass} w-full justify-center text-center ${enabled && step === 'password' ? 'text-red-200 hover:text-red-100' : ''}`}
            >
              {pending
                ? t('common.saving')
                : step === 'verify'
                  ? t('account.verifyAndEnable')
                  : t(enabled ? 'account.disableTwoFactor' : 'account.enableTwoFactor')}
            </Button>
            {step === 'verify' ? (
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                className="text-white/65 hover:bg-white/5 hover:text-white"
                onClick={() => {
                  setCode('');
                  setError(null);
                  setStep('setup');
                }}
              >
                {t('account.backToSetup')}
              </Button>
            ) : null}
          </form>
        )}
      </div>
    </LiquidGlassDialog>
  );
}
