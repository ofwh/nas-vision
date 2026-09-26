import { ParallaxBackground } from '@/components/home/ParallaxBackground';
import { Sidebar } from '@/components/home/Sidebar';
import { APP_PAGE_CAPACITY } from '@/components/home/AppPage';
import { AppItem, type AppItemProps } from '@/components/home/AppItem';
import { AppList } from '@/components/home/AppList';

/**
 * 首页：背景视差层 + 左菜单 + 中间 300 宽的主列（上/下留白 + 内容区）+ 右侧与菜单等宽的对称留白。
 *
 * 壳子和蜂巢同在这一页里，没有再拆成 `(home)/layout + page`：首页只有这一页，壳子放 layout 里
 * 除了多一层文件没有别的收益。右侧那颗空 aside 是给左侧菜单配平的：菜单自己浮在左侧，主列要
 * 保持在视口正中就得右边垫同样宽的占位。
 *
 * 根上的 `isolate` 是为背景层服务的：它要垫在所有内容底下（-z-10），得先有个属于自己的层叠
 * 上下文，否则负 z-index 会掉到 body 的背景图后面去。背景层就在这个上下文里，所以菜单那几块
 * 玻璃（backdrop-filter）看到的底还是这张图。
 */

// No app data source yet — placeholder tiles, enough of them to spill onto a
// second page. Swap this for the real list; AppItem takes the same fields.
const apps: AppItemProps[] = Array.from({ length: APP_PAGE_CAPACITY + 2 }, (_, index) => ({
  id: `placeholder-${index}`,
  name: index % 3 ? `Custom App Bundle Name 00000${index + 1}` : `App ${index + 1}`,
  image: '',
  url: '',
  innerUrl: '',
  config: {},
}));

export default function Home() {
  return (
    <div className="isolate flex min-h-screen">
      <ParallaxBackground />

      <aside className="flex min-w-31 flex-1 flex-col justify-center">
        <Sidebar />
      </aside>

      <div className="flex w-300 flex-none flex-col">
        <header className="flex min-h-20 flex-1 justify-center" />

        <main className="flex h-156 items-center justify-center">
          <AppList
            apps={apps.map((app) => (
              <AppItem key={app.id} {...app} />
            ))}
          />
        </main>

        <footer className="flex min-h-20 flex-1 justify-center">
          <div className="mt-7 h-6 w-30 rounded-full" />
        </footer>
      </div>

      <aside className="flex min-w-31 flex-1 flex-col justify-center" />
    </div>
  );
}
