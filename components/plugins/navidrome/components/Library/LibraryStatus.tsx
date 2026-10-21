import { Disc3, LoaderCircle, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavidromeTranslations } from '../../i18n/useTranslations';

type LibraryStatusProps = {
  isLoading: boolean;
  error?: Error;
  empty: boolean;
  isQueue: boolean;
  isSearch: boolean;
  onRetry: () => void;
};

export default function LibraryStatus({ isLoading, error, empty, isQueue, isSearch, onRetry }: LibraryStatusProps) {
  const t = useNavidromeTranslations();

  return (
    <>
      {!isQueue && isLoading ? (
        <div
          role="status"
          className="flex min-h-[260px] flex-col items-center justify-center gap-3.5 p-6 text-center text-sm text-[#fff8f1]/55 [&>span]:max-w-[380px] [&>span]:text-xs [&>span]:leading-[1.8] [&>span]:text-[#fff8f1]/35"
        >
          <LoaderCircle className="animate-spin" />
          <p>{t('library.loading')}</p>
        </div>
      ) : null}
      {!isQueue && error ? (
        <div
          role="alert"
          className="flex min-h-[260px] flex-col items-center justify-center gap-3.5 p-6 text-center text-sm text-[#fff8f1]/55 [&>span]:max-w-[380px] [&>span]:text-xs [&>span]:leading-[1.8] [&>span]:text-[#fff8f1]/35"
        >
          <Music2 size={34} strokeWidth={1} />
          <p>{error.message}</p>
          <span>{t('library.checkSettings')}</span>
          <Button variant="ghost" onClick={onRetry}>
            {t('library.reconnect')}
          </Button>
        </div>
      ) : null}
      {(!isLoading && !error && empty) || (isQueue && empty) ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-3.5 p-6 text-center text-sm text-[#fff8f1]/55 [&>span]:max-w-[380px] [&>span]:text-xs [&>span]:leading-[1.8] [&>span]:text-[#fff8f1]/35">
          <Disc3 size={44} strokeWidth={1} />
          <p>{t(isSearch ? 'search.empty' : isQueue ? 'player.emptyQueue' : 'library.empty')}</p>
          <span>{t(isSearch ? 'search.emptyHint' : 'library.emptyHint')}</span>
        </div>
      ) : null}
    </>
  );
}
