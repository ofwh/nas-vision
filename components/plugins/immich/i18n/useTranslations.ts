'use client';

import { useLocale } from 'next-intl';
import { getTranslator } from '.';

export function useImmichTranslations() {
  return getTranslator(useLocale());
}
