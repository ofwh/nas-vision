'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Check, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { APP_ICONS } from '@/constants';
import { fetchApi, fetchUpload } from '@/lib/api/client';
import type { UploadRemoveRes, UploadRes } from '@/lib/services/upload';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

const ACCEPT = 'image/png,image/webp';

const CELL = 'relative flex size-16 shrink-0 items-center justify-center rounded-full transition-colors';

/** 选中态：玻璃底 + 描边，跟未选中的 hover 拉开距离。 */
const PICKED = 'bg-white/25 ring-1 ring-white/60';

/** 选中标记：右下角的绿点；白圈是为了在浅色图标上也分得出来。 */
function LogoSelectionIndicator() {
  return (
    <span className="absolute right-0 bottom-0 z-10 flex size-4 items-center justify-center rounded-full bg-green-500 text-white ring-2 ring-white/85">
      <Check className="size-3" aria-hidden />
    </span>
  );
}

export type LogoPickerContentProps = {
  value: string;
  suggestedImage?: string;
  onConfirm: (url: string) => void;
};

function UploadedLogoOption({
  uploaded,
  selected,
  busy,
  onSelect,
  onRemove,
  onUpload,
}: {
  uploaded: string | null;
  selected: string;
  busy: boolean;
  onSelect: (url: string) => void;
  onRemove: () => Promise<void>;
  onUpload: () => void;
}) {
  const t = useTranslations();

  return (
    <div className="group/logo relative size-16">
      {uploaded ? (
        <>
          <button
            type="button"
            disabled={busy}
            onClick={() => onSelect(uploaded)}
            className={cn(CELL, 'cursor-pointer', selected === uploaded ? PICKED : 'hover:bg-white/15')}
          >
            <Image
              src={uploaded}
              alt=""
              width={64}
              height={64}
              unoptimized
              loading="eager"
              className="size-full rounded-full object-cover"
            />
            {selected === uploaded ? <LogoSelectionIndicator /> : null}
          </button>

          <button
            type="button"
            aria-label={t('apps.removeIcon')}
            disabled={busy}
            onClick={onRemove}
            className="absolute top-0 right-0 z-10 flex size-5 items-center justify-center rounded-full bg-black/75 text-white opacity-0 transition-opacity group-hover/logo:opacity-100 hover:bg-black focus-visible:opacity-100"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </>
      ) : (
        <button
          type="button"
          aria-label={t('apps.uploadIcon')}
          disabled={busy}
          onClick={onUpload}
          className={cn(
            CELL,
            'cursor-pointer border border-dashed border-white/40 bg-white/6 text-white/70 hover:bg-white/15 hover:text-white',
          )}
        >
          <Upload className="size-6" aria-hidden />
        </button>
      )}
    </div>
  );
}

function LogoOption({
  icon,
  selected,
  onSelect,
}: {
  icon: string;
  selected: boolean;
  onSelect: (url: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(icon)}
      className={cn(CELL, 'cursor-pointer', selected ? PICKED : 'hover:bg-white/15')}
    >
      <Image
        src={icon}
        alt=""
        width={64}
        height={64}
        unoptimized
        loading="eager"
        className="size-full rounded-full object-cover"
      />
      {selected ? <LogoSelectionIndicator /> : null}
    </button>
  );
}

function LogoPickerContent({ value, suggestedImage, onConfirm }: LogoPickerContentProps) {
  const t = useTranslations();
  const [uploaded, setUploaded] = useState<string | null>(() => (value.startsWith('/static/uploads/') ? value : null));
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    const form = new FormData();

    form.append('files', file);

    setBusy(true);
    const response = await fetchUpload<UploadRes>('/api/upload', form);

    setBusy(false);

    const url = response.data?.files[0]?.url;

    if (!response.success || !url) {
      toast.add({
        type: 'error',
        title: !response.success && response.message ? response.message : t('apps.uploadIconFailed'),
      });

      return;
    }

    setUploaded(url);
    onConfirm(url);
  };

  const drop = async () => {
    if (!uploaded) {
      return;
    }

    setBusy(true);
    const response = await fetchApi<UploadRemoveRes>('/api/upload/delete', { url: uploaded });

    setBusy(false);
    if (!response.success) {
      toast.add({ type: 'error', title: response.message || t('apps.removeIconFailed') });

      return;
    }

    if (value === uploaded) {
      onConfirm('');
    }

    setUploaded(null);
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      <ScrollArea className="w-80 [&_[data-slot=scroll-area-viewport]]:max-h-64">
        <div className="grid grid-cols-4 gap-4 p-2">
          <UploadedLogoOption
            uploaded={uploaded}
            selected={value}
            busy={busy}
            onSelect={onConfirm}
            onRemove={drop}
            onUpload={() => inputRef.current?.click()}
          />

          {suggestedImage ? (
            <LogoOption icon={suggestedImage} selected={value === suggestedImage} onSelect={onConfirm} />
          ) : null}

          {APP_ICONS.map((icon) => (
            <LogoOption key={icon} icon={icon} selected={value === icon} onSelect={onConfirm} />
          ))}
        </div>
      </ScrollArea>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];

          // 清掉 value，同一个文件重选也还能触发 change
          event.target.value = '';
          if (file) {
            void upload(file);
          }
        }}
      />
    </div>
  );
}

export function AppLogoPicker({
  value,
  suggestedImage,
  onChange,
}: {
  value: string;
  suggestedImage?: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations();
  const [picking, setPicking] = useState(false);

  return (
    <Popover open={picking} onOpenChange={setPicking}>
      <PopoverTrigger aria-label={t('apps.changeIcon')} className="group/app relative rounded-full outline-none">
        {/* 别在玻璃上写 opacity：会自建 backdrop 根，毛玻璃就看不到背景了 */}
        <LiquidGlass className="group/icon h-32 w-32 cursor-pointer rounded-full" contentClassName="h-full">
          {value ? (
            <Image
              src={value}
              alt=""
              width={128}
              height={128}
              unoptimized
              loading="eager"
              className="h-full w-full rounded-full object-cover"
            />
          ) : null}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,transparent_50%,rgb(255_234_215/16%)_100%)] opacity-0 shadow-[inset_0_0_18px_2px_rgb(255_234_215/18%),inset_0_0_0_1px_rgb(255_248_241/24%)] transition-opacity duration-650 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/icon:opacity-100 group-focus-visible/app:opacity-100 motion-reduce:transition-none"
          />
        </LiquidGlass>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="center" sideOffset={10} className="w-auto gap-0 rounded-3xl p-0">
        <LogoPickerContent value={value} suggestedImage={suggestedImage} onConfirm={onChange} />
      </PopoverContent>
    </Popover>
  );
}
