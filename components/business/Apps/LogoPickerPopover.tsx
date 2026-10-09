'use client';

import { useTranslations } from 'next-intl';
import { CircleChevronDown } from 'lucide-react';
import { useState } from 'react';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { LogoPicker } from '@/components/business/Apps/LogoPicker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function LogoPickerPopover({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const t = useTranslations();
  const [picking, setPicking] = useState(false);

  return (
    <Popover open={picking} onOpenChange={setPicking}>
      <PopoverTrigger aria-label={t('apps.changeIcon')} className="relative rounded-full outline-none">
        {/* 别在玻璃上写 opacity：会自建 backdrop 根，毛玻璃就看不到背景了 */}
        <LiquidGlass className="h-32 w-32 cursor-pointer rounded-full" contentClassName="h-full">
          {value ? <img src={value} alt="" className="h-full w-full rounded-full object-cover" /> : null}
        </LiquidGlass>

        {/* 压住圆形边缘的指示箭头：深色投影保证浅色图标上也看得见 */}
        <CircleChevronDown
          aria-hidden
          strokeWidth={1.8}
          className="absolute right-1 bottom-0 size-7 text-white drop-shadow-[0_1px_3px_rgb(0_0_0/0.6)]"
        />
      </PopoverTrigger>

      {/* 底子交给 LiquidGlass，弹层自带的浅色底与描边全部让掉 */}
      <PopoverContent
        side="bottom"
        align="center"
        sideOffset={10}
        className="w-auto gap-0 rounded-3xl border-0 bg-transparent p-0 text-white shadow-none ring-0"
      >
        <LiquidGlass className="rounded-3xl" contentClassName="h-full">
          <LogoPicker
            value={value}
            onConfirm={(url) => {
              onChange(url);
              setPicking(false);
            }}
          />
        </LiquidGlass>
      </PopoverContent>
    </Popover>
  );
}
