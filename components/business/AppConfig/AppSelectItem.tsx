'use client';

import { ComboboxItem } from '@/components/ui/combobox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type AppSelectItemProps<Value> = {
  value: Value;
  label: string;
  description?: string;
  disabled?: boolean;
};

export function AppSelectItem<Value>({ value, label, description, disabled }: AppSelectItemProps<Value>) {
  const item = (
    <ComboboxItem value={value} disabled={disabled}>
      <span>{label}</span>
    </ComboboxItem>
  );

  return description ? (
    <Tooltip>
      <TooltipTrigger render={item} />
      <TooltipContent side="right">{description}</TooltipContent>
    </Tooltip>
  ) : (
    item
  );
}
