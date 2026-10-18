'use client';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { FormGroup, FIELD_CONTROL_CLASS, type AppFormProps } from './form';
export function AppUrlConfigForm({ form, update }: AppFormProps) {
  const t = useTranslations();
  return (
    <FormGroup label={t('apps.urlOptions')}>
      <Input
        aria-label={t('apps.url')}
        placeholder={t('apps.url')}
        className={FIELD_CONTROL_CLASS}
        value={form.url}
        onChange={(event) => update('url', event.target.value)}
      />

      <Input
        aria-label={t('apps.innerUrl')}
        placeholder={t('apps.innerUrl')}
        className={FIELD_CONTROL_CLASS}
        value={form.innerUrl}
        onChange={(event) => update('innerUrl', event.target.value)}
      />
    </FormGroup>
  );
}
