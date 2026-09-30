import { ParallaxBackground } from '@/components/home/ParallaxBackground';
import { Sidebar } from '@/components/home/Sidebar';
import { SidebarPages } from '@/components/home/SidebarPages';
import { AppList } from '@/components/home/AppList';

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <ParallaxBackground />

      <aside className="flex min-w-31 flex-1 flex-col justify-center">
        <Sidebar />
      </aside>

      <div className="flex w-300 flex-none flex-col">
        <header className="flex min-h-20 flex-1 justify-center" />

        <main className="flex h-156 items-center justify-center">
          <AppList />
        </main>

        <footer className="flex min-h-20 flex-1 justify-center">
          <div className="mt-7 h-6 w-30 rounded-full" />
        </footer>
      </div>

      <aside className="flex min-w-31 flex-1 flex-col justify-center" />

      <SidebarPages />
    </div>
  );
}
