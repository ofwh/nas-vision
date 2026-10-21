import { Clock3, Disc3, Heart, Music2, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavidromeTranslations } from '../../i18n/useTranslations';
import { librarySections, type LibrarySection } from '../../utils/navigation';

const icons = {
  recent: Clock3,
  artists: UserRound,
  albums: Disc3,
  songs: Music2,
  starred: Heart,
};

type LibraryMenuProps = { activeSection?: LibrarySection; onNavigate: (section: LibrarySection) => void };

export default function LibraryMenu({ activeSection, onNavigate }: LibraryMenuProps) {
  const t = useNavidromeTranslations();

  return (
    <nav className="mt-8 flex flex-col gap-[7px] @max-[560px]/music-window:mt-6" aria-label={t('library.title')}>
      {librarySections
        .filter((id) => id !== 'playlists')
        .map((id) => {
          const Icon = icons[id];

          return (
            <Button
              key={id}
              variant="ghost"
              className="h-10 w-full justify-start gap-2.5 rounded-lg px-2.5 py-0 font-normal text-white/85 transition-colors duration-200 hover:bg-white/10 hover:text-white active:bg-white/15 active:text-white data-[active=true]:bg-white/15 data-[active=true]:text-white motion-reduce:transition-none @max-[560px]/music-window:justify-center @max-[560px]/music-window:p-0 dark:hover:bg-white/10 @max-[560px]/music-window:[&>span]:hidden"
              aria-label={t(`sections.${id}`)}
              aria-current={activeSection === id ? 'page' : undefined}
              data-active={activeSection === id}
              onClick={() => onNavigate(id)}
            >
              <Icon className="size-5 shrink-0" strokeWidth={1.6} />
              <span>{t(`sections.${id}`)}</span>
            </Button>
          );
        })}
    </nav>
  );
}
