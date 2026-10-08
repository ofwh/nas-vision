'use client';

import { useTranslations } from 'next-intl';
import { Check, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { APP_ICONS } from '@/constants';
import { fetchApi, fetchUpload } from '@/lib/api/client';
import type { UploadRemoveRes, UploadRes } from '@/lib/services/upload';
import { cn } from '@/lib/utils';

const ACCEPT = 'image/png,image/webp';

const CELL = 'relative flex size-16 shrink-0 items-center justify-center rounded-full transition-colors';

/** 选中态：玻璃底 + 描边，跟未选中的 hover 拉开距离。 */
const PICKED = 'bg-white/25 ring-1 ring-white/60';

/** 选中标记：右下角的绿点；白圈是为了在浅色图标上也分得出来。 */
function CheckMark() {
  return (
    <span className="absolute right-0 bottom-0 z-10 flex size-4 items-center justify-center rounded-full bg-green-500 text-white ring-2 ring-white/85">
      <Check className="size-3" aria-hidden />
    </span>
  );
}

export type LogoPickerProps = {
  value: string;
  onConfirm: (url: string) => void;
};

export function LogoPicker({ value, onConfirm }: LogoPickerProps) {
  const t = useTranslations();
  // 非内置的路径都当已上传处理：删它才对应删掉磁盘上的文件
  const [uploaded, setUploaded] = useState<string | null>(() => (value && !APP_ICONS.includes(value) ? value : null));
  const [selected, setSelected] = useState(value);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    const form = new FormData();
    form.append('files', file);

    setBusy(true);
    const response = await fetchUpload<UploadRes>('/api/upload', form);
    setBusy(false);

    const url = response.data?.files[0]?.url;
    if (!response.success || !url) return;

    setUploaded(url);
    setSelected(url);
  };

  const drop = async () => {
    if (!uploaded) return;

    setBusy(true);
    const response = await fetchApi<UploadRemoveRes>('/api/upload/delete', { url: uploaded });
    setBusy(false);
    if (!response.success) return;

    if (selected === uploaded) setSelected('');
    setUploaded(null);
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* 最高 150px，超出在这一块里滚；宽度交给格子撑，横向不留滚动条。
          内边距让最后一列和 check 不贴着滚动条与容器边。 */}
      <div className="grid max-h-50 grid-cols-4 gap-4 overflow-x-hidden overflow-y-auto p-2">
        <div className="group/logo relative size-16">
          {uploaded ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => setSelected(uploaded)}
                className={cn(CELL, 'cursor-pointer', selected === uploaded ? PICKED : 'hover:bg-white/15')}
              >
                <img src={uploaded} alt="" className="size-full rounded-full object-cover" />
                {selected === uploaded ? <CheckMark /> : null}
              </button>

              <button
                type="button"
                aria-label={t('apps.removeIcon')}
                disabled={busy}
                onClick={drop}
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
              onClick={() => inputRef.current?.click()}
              className={cn(
                CELL,
                'cursor-pointer border border-dashed border-white/40 bg-white/6 text-white/70 hover:bg-white/15 hover:text-white',
              )}
            >
              <Upload className="size-6" aria-hidden />
            </button>
          )}
        </div>

        {APP_ICONS.map((icon) => (
          <button
            key={icon}
            type="button"
            onClick={() => setSelected(icon)}
            className={cn(CELL, 'cursor-pointer', selected === icon ? PICKED : 'hover:bg-white/15')}
          >
            <img src={icon} alt="" className="size-full rounded-full object-cover" />
            {selected === icon ? <CheckMark /> : null}
          </button>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // 清掉 value，同一个文件重选也还能触发 change
          event.target.value = '';
          if (file) void upload(file);
        }}
      />

      <Button
        variant="outline"
        disabled={busy}
        onClick={() => onConfirm(selected)}
        className="border-white/25 bg-white/15 text-white hover:bg-white/25 hover:text-white"
      >
        {t('apps.useIcon')}
      </Button>
    </div>
  );
}
