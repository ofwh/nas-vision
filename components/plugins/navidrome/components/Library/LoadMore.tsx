import { useEffect, useRef } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavidromeTranslations } from '../../i18n/useTranslations';

type LoadMoreProps = {
  isLoading: boolean;
  error?: Error;
  onLoad: () => void;
  onRetry: () => void;
};

export default function LoadMore({ isLoading, error, onLoad, onRetry }: LoadMoreProps) {
  const t = useNavidromeTranslations();
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = sentinel.current;
    const root = target?.closest('[data-slot="scroll-area-viewport"]');

    if (!target || !root || isLoading || error) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoad();
        }
      },
      { root, rootMargin: '400px 0px' },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [isLoading, error, onLoad]);

  return (
    <div ref={sentinel} className="flex min-h-16 items-center justify-center pt-4 text-xs text-[#fff8f1]/50">
      {error ? (
        <div role="alert">
          <p>{error.message}</p>
          <Button variant="ghost" onClick={onRetry}>
            {t('library.retryLoading')}
          </Button>
        </div>
      ) : isLoading ? (
        <div role="status" className="flex items-center gap-2">
          <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
          <span>{t('library.loadingMore')}</span>
        </div>
      ) : null}
    </div>
  );
}
