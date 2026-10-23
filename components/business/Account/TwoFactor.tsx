'use client';

import { useId, useRef, useState, type SubmitEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, Check, Copy, Loader, ShieldCheck, ShieldOff, UserRoundKey } from 'lucide-react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import QRCode from 'react-qr-code';
import { useToast } from '@/hooks/useToast';
import { authErrorMessage } from '@/lib/api/auth-error';
import { errorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { authClient } from '@/lib/auth-client';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { WindowModal } from '@/components/common/WindowModal';
import { securityOTPSlotClass } from './SecurityFields';

type Enrollment = { totpURI: string };
type Step = 'password' | 'setup' | 'verify';

type TwoFactorFormProps = {
  formId: string;
  pending: boolean;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
};

function TwoFactorPasswordForm({
  formId,
  enabled,
  password,
  onPasswordChange,
  pending,
  onSubmit,
}: TwoFactorFormProps & {
  enabled: boolean;
  password: string;
  onPasswordChange: (password: string) => void;
}) {
  const t = useTranslations();
  const Icon = enabled ? ShieldOff : UserRoundKey;

  return (
    <>
      <div className="flex flex-col items-center gap-5 py-3 text-center">
        <span className="flex size-24 items-center justify-center rounded-full bg-linear-to-b from-white/25 to-white/10 shadow-lg ring-1 ring-white/20">
          <Icon className="size-13 text-white/90" strokeWidth={1.3} aria-hidden />
        </span>
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-2xl font-semibold tracking-tight">
            {t(enabled ? 'account.disableTwoFactor' : 'account.enableTwoFactor')}
          </h3>
          <p className="max-w-85 text-sm leading-5 text-white/60">
            {t(enabled ? 'account.disableTwoFactorDescription' : 'account.enableTwoFactorDescription')}
          </p>
        </div>
      </div>

      <form id={formId} onSubmit={onSubmit} aria-busy={pending} className="flex flex-col gap-4">
        <Input
          aria-label={t('account.currentPassword')}
          className="rounded-full"
          placeholder={t('account.currentPassword')}
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
        />
      </form>
    </>
  );
}

function TwoFactorSetupView({ enrollment }: { enrollment: Enrollment }) {
  const t = useTranslations();
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const setupInput = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const setupKey = new URL(enrollment.totpURI).searchParams.get('secret') ?? '';

  async function copySetupKey() {
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
      toast.add({ type: 'error', title: errorMessage({ code: 'account.COPY_FAILED' }, locale) });
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
    </>
  );
}

function TwoFactorVerificationForm({
  formId,
  code,
  onCodeChange,
  pending,
  onSubmit,
}: TwoFactorFormProps & {
  code: string;
  onCodeChange: (code: string) => void;
}) {
  const t = useTranslations();

  return (
    <form id={formId} onSubmit={onSubmit} aria-busy={pending} className="flex flex-col gap-4">
      <span className="flex size-24 items-center justify-center self-center rounded-full bg-linear-to-b from-white/25 to-white/10 shadow-lg ring-1 ring-white/20">
        <ShieldCheck className="size-13 text-white/90" strokeWidth={1.3} aria-hidden />
      </span>
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
    </form>
  );
}

export function TwoFactor({
  enabled,
  onSuccess,
  onCancel,
  onUpdated,
}: {
  enabled: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  onUpdated: () => Promise<void>;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const formId = useId();
  const [step, setStep] = useState<Step>('password');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [pending, setPending] = useState(false);
  const toast = useToast();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || (step !== 'password' && step !== 'verify')) {
      return;
    }

    setPending(true);

    try {
      if (step === 'verify') {
        const result = await authClient.twoFactor.verifyTotp({ code });

        if (result.error) {
          toast.add({ type: 'error', title: authErrorMessage(result.error, locale) });

          return;
        }

        setCode('');
        await onUpdated();
        toast.add({ type: 'success', title: t('account.twoFactorEnabled') });
        onSuccess();
      } else if (enabled) {
        const result = await authClient.twoFactor.disable({ password });

        if (result.error) {
          toast.add({ type: 'error', title: authErrorMessage(result.error, locale) });

          return;
        }

        setPassword('');
        await onUpdated();
        onSuccess();
      } else {
        const result = await authClient.twoFactor.enable({ password, method: 'totp' });

        if (result.error) {
          toast.add({ type: 'error', title: authErrorMessage(result.error, locale) });

          return;
        }

        if (result.data?.method === 'totp') {
          setEnrollment({ totpURI: result.data.totpURI });
          setPassword('');
          setStep('setup');
        }
      }
    } catch {
      toast.add({ type: 'error', title: t('common.connectionFailed') });
    } finally {
      setPending(false);
    }
  }

  const submitsForm = step === 'password' || step === 'verify';
  const actionLabel = pending
    ? t('common.saving')
    : step === 'password'
      ? t(enabled ? 'account.disableTwoFactor' : 'account.enableTwoFactor')
      : step === 'setup'
        ? t('account.nextStep')
        : t('account.verifyAndEnable');

  return (
    <WindowModal
      open
      mode="floating"
      title={t('account.twoFactorAuthentication')}
      size={{ width: 360 }}
      style={{ maxWidth: '90dvw', maxHeight: '85dvh' }}
      fit
      header={{
        center: <></>,
        right: (
          <>
            {step === 'verify' ? (
              <LiquidGlass className="size-10 shrink-0 rounded-full" contentClassName="h-full">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  aria-label={t('account.backToSetup')}
                  title={t('account.backToSetup')}
                  disabled={pending}
                  className="rounded-full text-white"
                  onClick={() => {
                    setCode('');
                    setStep('setup');
                  }}
                >
                  <ArrowLeft aria-hidden className="size-5" />
                </Button>
              </LiquidGlass>
            ) : null}
            <LiquidGlass className="size-10 rounded-full" contentClassName="h-full">
              <Button
                type={submitsForm ? 'submit' : 'button'}
                form={submitsForm ? formId : undefined}
                variant="ghost"
                size="icon-lg"
                aria-label={actionLabel}
                title={actionLabel}
                aria-busy={pending}
                disabled={pending || (step === 'verify' && code.length !== 6)}
                className="rounded-full text-white"
                onClick={step === 'setup' ? () => setStep('verify') : undefined}
              >
                {pending ? (
                  <Loader aria-hidden className="size-5 animate-spin" />
                ) : step === 'setup' ? (
                  <ArrowRight aria-hidden className="size-5" />
                ) : (
                  <Check aria-hidden className="size-5" />
                )}
              </Button>
            </LiquidGlass>
          </>
        ),
      }}
      onOpenChange={(open) => {
        if (!open && !pending) {
          onCancel();
        }
      }}
    >
      <div className="flex min-w-0 shrink-0 flex-col gap-4 bg-[#545458]/25 p-4 pt-16 text-white">
        {step === 'password' ? (
          <TwoFactorPasswordForm
            formId={formId}
            enabled={enabled}
            password={password}
            onPasswordChange={setPassword}
            pending={pending}
            onSubmit={handleSubmit}
          />
        ) : step === 'setup' && enrollment ? (
          <TwoFactorSetupView enrollment={enrollment} />
        ) : step === 'verify' ? (
          <TwoFactorVerificationForm
            formId={formId}
            code={code}
            onCodeChange={setCode}
            pending={pending}
            onSubmit={handleSubmit}
          />
        ) : null}
      </div>
    </WindowModal>
  );
}
