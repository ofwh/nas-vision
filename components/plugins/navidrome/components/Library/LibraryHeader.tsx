import { ArrowLeft, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavidromeTranslations } from '../../i18n/useTranslations';

type LibraryHeaderProps = {
  title: string;
  canGoBack: boolean;
  search: string;
  isSearching: boolean;
  onBack: () => void;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
};

export default function LibraryHeader({
  title,
  canGoBack,
  search,
  isSearching,
  onBack,
  onSearchChange,
  onSearch,
  onClearSearch,
}: LibraryHeaderProps) {
  const t = useNavidromeTranslations();

  return (
    <header className="px-[30px] pt-[30px] @max-[850px]/music-window:px-[22px] @max-[850px]/music-window:pt-[22px] @max-[560px]/music-window:px-4 @max-[560px]/music-window:pt-[72px]">
      <div className="flex items-center gap-3 pr-40 @max-[560px]/music-window:pr-0 [&_h1]:mb-1.5 [&_h1]:truncate [&_h1]:text-[29px] [&_h1]:leading-[1.3] [&_h1]:font-[650] [&_h1]:tracking-[-0.9px] @max-[560px]/music-window:[&_h1]:text-[24px] [&>div]:min-w-0 [&>div]:flex-1">
        {canGoBack ? (
          <Button variant="ghost" size="icon" aria-label={t('library.back')} onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
        ) : null}
        <div>
          <h1>{title}</h1>
          <p className="mb-1.5 text-[9px] font-medium tracking-[2.3px] text-[#fff8f1]/40">{t('library.collection')}</p>
        </div>
      </div>
      <form
        className="mt-[22px] flex h-[41px] items-center gap-2.5 rounded-full border border-white/6 pr-[9px] pl-3.5 text-[#fff8f1]/55 focus-within:outline focus-within:outline-[#f0a17e]"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <Search size={17} />
        <Input
          className="h-full min-w-0 border-0 bg-transparent text-xs text-white shadow-none placeholder:text-[#fff8f1]/42 focus-visible:shadow-none focus-visible:ring-0 md:text-xs dark:bg-transparent"
          aria-label={t('search.label')}
          value={search}
          maxLength={256}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('search.placeholder')}
        />
        {search || isSearching ? (
          <Button
            variant="ghost"
            type="button"
            size="icon-sm"
            className="shrink-0 rounded-full"
            aria-label={t('search.clear')}
            title={t('search.clear')}
            onClick={onClearSearch}
          >
            <X aria-hidden className="size-4" />
          </Button>
        ) : null}
        <Button variant="ghost" type="submit" size="sm" className="rounded-full">
          {t('search.submit')}
        </Button>
      </form>
    </header>
  );
}
