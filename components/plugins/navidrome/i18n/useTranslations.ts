'use client';

import { useLocale } from 'next-intl';
import { getTranslator } from '.';

export function useNavidromeTranslations() {
  return getTranslator(useLocale());
}
