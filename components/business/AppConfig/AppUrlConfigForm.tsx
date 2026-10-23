'use client';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { FIELD_CONTROL_CLASS, type AppFormProps } from './form';

export function AppUrlConfigForm({ form, update }: AppFormProps) {
  const t = useTranslations();

  return (
    <Input
      aria-label={t('apps.url')}
      placeholder={t('apps.url')}
      className={FIELD_CONTROL_CLASS}
      value={form.url}
      onChange={(event) => update('url', event.target.value)}
    />
  );
}
