'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';
import type { BaseResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxList,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxValue,
} from '@/components/ui/combobox';
import { pluginRequest } from '@/lib/plugins/client';
import { matchesPluginCondition } from '@/lib/plugins/config';
import type {
  PluginConfig,
  PluginListRes,
  PluginConfigRes,
  PluginFieldOption,
  PluginFieldType,
  PluginQueryRes,
  PluginSettingOption,
} from '@/types/plugins';
import { FormGroup, FIELD_CONTROL_CLASS } from './form';
import { AppSelectItem } from './AppSelectItem';

function parseValue(text: string, sample: PluginFieldType): PluginFieldType | undefined {
  if (text === '') {
    return '';
  }

  if (typeof sample === 'string') {
    return text;
  }

  if (typeof sample === 'number') {
    return Number.isFinite(Number(text)) ? Number(text) : undefined;
  }

  if (typeof sample === 'boolean') {
    return text === 'true' ? true : text === 'false' ? false : undefined;
  }

  try {
    const value: unknown = JSON.parse(text);

    if (!Array.isArray(value)) {
      return undefined;
    }

    if (
      value.every((item: unknown): item is string => typeof item === 'string') &&
      (!sample.length || typeof sample[0] === 'string')
    ) {
      return value;
    }

    if (
      value.every((item: unknown): item is number => typeof item === 'number' && Number.isFinite(item)) &&
      (!sample.length || typeof sample[0] === 'number')
    ) {
      return value;
    }

    if (
      value.every((item: unknown): item is boolean => typeof item === 'boolean') &&
      (!sample.length || typeof sample[0] === 'boolean')
    ) {
      return value;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function multipleValue(items: PluginFieldOption[]): PluginFieldType | undefined {
  const values = items.flatMap((item): (string | number | boolean)[] =>
    Array.isArray(item.value) ? item.value : [item.value],
  );

  if (values.every((value): value is string => typeof value === 'string')) {
    return values;
  }

  if (values.every((value): value is number => typeof value === 'number')) {
    return values;
  }

  if (values.every((value): value is boolean => typeof value === 'boolean')) {
    return values;
  }

  return undefined;
}

function PluginInputField({
  field,
  value,
  onChange,
}: {
  field: PluginSettingOption;
  value: PluginFieldType;
  onChange: (value: PluginFieldType | undefined) => void;
}) {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState(Array.isArray(value) ? JSON.stringify(value) : String(value));
  const [invalid, setInvalid] = useState(false);

  return (
    <div className="relative">
      <Input
        aria-label={field.label}
        placeholder={field.label}
        aria-invalid={invalid}
        required={field.required}
        type={field.secret && !visible ? 'password' : 'text'}
        className={`${FIELD_CONTROL_CLASS} ${field.secret ? 'pr-12' : ''}`}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          const parsed = parseValue(event.target.value, field.defaults ?? field.value);

          setInvalid(parsed === undefined);
          onChange(parsed);
        }}
      />
      {field.secret ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1.5 right-2 text-white/70"
          aria-label={t(visible ? 'apps.hideSecret' : 'apps.showSecret')}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      ) : null}
    </div>
  );
}

function PluginSelectContent() {
  const t = useTranslations();

  return (
    <ComboboxContent>
      <ComboboxEmpty>{t('common.noOptions')}</ComboboxEmpty>
      <ComboboxList>
        {(item: PluginFieldOption) => (
          <AppSelectItem
            key={JSON.stringify(item.value)}
            value={item}
            label={item.label}
            description={item.description}
          />
        )}
      </ComboboxList>
    </ComboboxContent>
  );
}

function PluginSelectField({
  field,
  value,
  onChange,
}: {
  field: PluginSettingOption;
  value: PluginFieldType;
  onChange: (value: PluginFieldType | undefined) => void;
}) {
  const options = field.options ?? [];

  return (
    <div className="flex min-h-12 items-center justify-between gap-3 px-4 py-2">
      <span className="text-sm text-white/70">{field.label}</span>
      {field.multiple ? (
        <Combobox
          required={field.required}
          multiple
          items={options}
          itemToStringLabel={(item) => item.label}
          itemToStringValue={(item) => item.label}
          value={options.filter(
            (option) =>
              Array.isArray(value) &&
              (Array.isArray(option.value)
                ? option.value.every((item) => value.some((entry) => entry === item))
                : value.some((item) => item === option.value)),
          )}
          onValueChange={(items) => onChange(multipleValue(items))}
        >
          <ComboboxChips className="ml-auto max-w-64 justify-end text-white">
            <ComboboxValue>
              {(items: PluginFieldOption[]) => (
                <>
                  {items.map((item) => (
                    <ComboboxChip key={JSON.stringify(item.value)}>{item.label}</ComboboxChip>
                  ))}
                  <ComboboxChipsInput aria-label={field.label} />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <PluginSelectContent />
        </Combobox>
      ) : (
        <Combobox
          required={field.required}
          items={options}
          itemToStringLabel={(item) => item.label}
          itemToStringValue={(item) => item.label}
          value={options.find((item) => JSON.stringify(item.value) === JSON.stringify(value)) ?? null}
          onValueChange={(item, details) => {
            const selected = item && JSON.stringify(item.value) === JSON.stringify(value);

            onChange(details.reason === 'item-press' && selected ? '' : (item?.value ?? ''));
          }}
        >
          <ComboboxInput
            aria-label={field.label}
            className="ml-auto h-8 w-auto border-0 px-0 focus-visible:ring-0 [&_input]:text-right"
          />
          <PluginSelectContent />
        </Combobox>
      )}
    </div>
  );
}

function PluginNameField({
  name,
  options,
  loading,
  onNameChange,
}: {
  name: string;
  options: PluginListRes['plugins'];
  loading: boolean;
  onNameChange: (name: string) => void;
}) {
  const t = useTranslations();

  return (
    <div className="flex h-12 items-center justify-between gap-3 px-4">
      <span className="text-sm text-white/70">{t('apps.plugin')}</span>
      <Combobox
        items={options}
        itemToStringLabel={(item) => item.name}
        itemToStringValue={(item) => item.name}
        value={options.find((item) => item.id === name) ?? null}
        onValueChange={(item, details) => {
          const next = details.reason === 'item-press' && item?.id === name ? '' : (item?.id ?? '');

          if (next !== name) {
            onNameChange(next);
          }
        }}
      >
        <ComboboxInput
          aria-label={t('apps.plugin')}
          className="ml-auto h-8 w-auto border-0 px-0 focus-visible:ring-0 [&_input]:text-right"
          disabled={loading}
        />
        <ComboboxContent>
          <ComboboxEmpty>{t('common.noOptions')}</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <AppSelectItem
                key={item.id}
                value={item}
                label={item.name}
                description={item.description}
                disabled={item.status === 'off'}
              />
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

function PluginConfigField({
  field,
  value,
  onChange,
}: {
  field: PluginSettingOption;
  value: PluginFieldType;
  onChange: (value: PluginFieldType | undefined) => void;
}) {
  return field.type === 'input' ? (
    <PluginInputField field={field} value={value} onChange={onChange} />
  ) : field.type === 'switch' ? (
    <label className="flex h-12 items-center justify-between px-4">
      <span className="text-sm text-white/70">{field.label}</span>
      <Switch className="ml-auto shrink-0" checked={value === true} onCheckedChange={onChange} />
    </label>
  ) : (
    <PluginSelectField field={field} value={value} onChange={onChange} />
  );
}

export function AppPluginConfigForm({
  name,
  onNameChange,
  onConfigChange,
}: {
  name: string;
  onNameChange: (name: string) => void;
  onConfigChange: (config: PluginConfig | null) => void;
}) {
  const t = useTranslations();
  const {
    data: catalog,
    error: listError,
    isLoading: listLoading,
  } = useSWR<BaseResponse<PluginListRes>, Error>('/api/plugin/list', (url: string) =>
    pluginRequest<PluginListRes>(url, {}),
  );
  const options = catalog?.data.plugins ?? [];
  const [loaded, setLoaded] = useState<{
    fields: PluginSettingOption[];
    values: PluginConfig;
    invalid: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) {
      return;
    }

    let active = true;

    void Promise.resolve()
      .then(() =>
        Promise.all([
          pluginRequest<PluginConfigRes>('/api/plugin/config', { id: name }),
          pluginRequest<PluginQueryRes>('/api/plugin/query', { id: name }),
        ]),
      )
      .then(([structure, saved]) => {
        if (!active) {
          return;
        }

        setLoaded({ fields: structure.data.configs, values: saved.data.config, invalid: [] });
        onConfigChange(saved.data.config);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : t('common.connectionFailed'));
        }
      });

    return () => {
      active = false;
    };
  }, [name, onConfigChange, t]);
  const update = (key: string, value: PluginFieldType | undefined) => {
    if (!loaded) {
      return;
    }

    const invalid = loaded.invalid.filter((item) => item !== key);

    if (value === undefined) {
      invalid.push(key);
    }

    const values = value === undefined ? loaded.values : { ...loaded.values, [key]: value };
    const activeInvalid = invalid.filter((key) =>
      loaded.fields.some((field) => field.key === key && matchesPluginCondition(field.conditions, values)),
    );

    setLoaded({ ...loaded, values, invalid: activeInvalid });
    onConfigChange(activeInvalid.length ? null : values);
  };

  return (
    <FormGroup label={t('apps.pluginOptions')}>
      <PluginNameField name={name} options={options} loading={listLoading} onNameChange={onNameChange} />
      {name !== '' && !loaded && !error ? (
        <p role="status" className="p-4 text-sm text-white/70">
          {t('apps.loadingPlugin')}
        </p>
      ) : null}
      {loaded?.fields
        .filter((field) => matchesPluginCondition(field.conditions, loaded.values))
        .map((field) => (
          <PluginConfigField
            key={field.key}
            field={field}
            value={loaded.values[field.key] ?? ''}
            onChange={(value) => update(field.key, value)}
          />
        ))}
      {error || listError ? (
        <p role="alert" className="p-4 text-sm text-red-300">
          {error ?? listError?.message}
        </p>
      ) : null}
    </FormGroup>
  );
}
