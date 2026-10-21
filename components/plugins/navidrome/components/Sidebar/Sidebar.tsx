import { Library } from 'lucide-react';
import type { MusicItem } from '../../types';
import type { LibrarySection } from '../../utils/navigation';
import { useNavidromeTranslations } from '../../i18n/useTranslations';
import LibraryMenu from './LibraryMenu';
import PlaylistMenu from './PlaylistMenu';

type SidebarProps = {
  activeSection?: LibrarySection;
  activePlaylistId?: string;
  onNavigate: (section: LibrarySection, item?: MusicItem) => void;
};

export default function Sidebar({ activeSection, activePlaylistId, onNavigate }: SidebarProps) {
  const t = useNavidromeTranslations();

  return (
    <aside className="flex min-w-0 flex-[0_0_245px] flex-col border-r border-white/7 bg-[rgb(20_18_17/28%)] px-[18px] pt-[78px] pb-[22px] @max-[850px]/music-window:basis-[190px] @max-[850px]/music-window:px-2.5 @max-[560px]/music-window:basis-[62px] @max-[560px]/music-window:px-1.5">
      <div className="flex items-center gap-2.5 px-3 text-[23px] font-[650] tracking-[-0.7px] @max-[850px]/music-window:text-[20px] @max-[560px]/music-window:justify-center @max-[560px]/music-window:p-0 @max-[560px]/music-window:[&>span]:hidden">
        <Library size={19} />
        <span>{t('library.title')}</span>
      </div>
      <p className="mt-[9px] pl-3 text-[8px] font-medium tracking-[1.6px] text-[#fff8f1]/40 @max-[850px]/music-window:text-[7px] @max-[850px]/music-window:tracking-[0.7px] @max-[560px]/music-window:hidden">
        {t('library.eyebrow')}
      </p>
      <LibraryMenu activeSection={activeSection} onNavigate={onNavigate} />
      <PlaylistMenu activeId={activePlaylistId} onOpen={(item) => onNavigate('playlists', item)} />
    </aside>
  );
}
