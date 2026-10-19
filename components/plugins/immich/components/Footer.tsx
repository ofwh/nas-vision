'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Folder, House, Images, RefreshCw } from 'lucide-react';
import { WindowFooter } from '@/components/common/WindowModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ImmichListRes } from '../types';
import styles from '../styles/Footer.module.css';

type FooterProps = {
  name: string;
  mode: ImmichListRes['mode'];
  loading: boolean;
  canGoBack: boolean;
  onBack: () => void;
  onRoot: () => void;
  onModeChange: (mode: ImmichListRes['mode']) => void;
  onRefresh: () => void;
};

function FolderName({ name }: { name: string }) {
  const container = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);

  useEffect(() => {
    const bar = container.current;
    const label = text.current;

    if (!bar || !label) {
      return;
    }

    const measure = () => setOverflow(Math.max(0, label.scrollWidth - bar.clientWidth));

    measure();
    const observer = new ResizeObserver(measure);

    observer.observe(bar);
    observer.observe(label);

    return () => observer.disconnect();
  }, [name]);

  return (
    <div
      ref={container}
      title={name}
      className={`flex min-w-0 overflow-hidden text-sm font-medium text-white/90 ${overflow > 0 ? 'justify-start' : 'justify-center'}`}
    >
      <span
        key={`${name}-${overflow}`}
        ref={text}
        className={
          overflow > 0
            ? 'animate-marquee block shrink-0 whitespace-nowrap motion-reduce:animate-none'
            : 'block whitespace-nowrap'
        }
        style={
          { '--marquee-shift': `-${overflow}px`, ...(overflow > 0 ? { marginRight: 'auto' } : {}) } as CSSProperties
        }
      >
        {name}
      </span>
    </div>
  );
}

export default function Footer({
  name,
  mode,
  loading,
  canGoBack,
  onBack,
  onRoot,
  onModeChange,
  onRefresh,
}: FooterProps) {
  return (
    <WindowFooter>
      <div className="relative flex h-8 w-[min(42rem,calc(90vw-3rem))] max-w-full items-center justify-between text-white">
        <div className="flex shrink-0 items-center gap-2">
          {canGoBack ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                aria-label="返回上级目录"
                title="返回上级目录"
                onClick={onBack}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                aria-label="返回根目录"
                title="返回根目录"
                onClick={onRoot}
              >
                <House className="size-4" />
              </Button>
            </>
          ) : null}
        </div>
        <div className="absolute left-1/2 w-60 max-w-[calc(100%-15rem)] -translate-x-1/2">
          <FolderName name={name} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Tabs
            value={mode}
            onValueChange={(value) => {
              if (value === 'folders' || value === 'albums') {
                onModeChange(value);
              }
            }}
          >
            <TabsList
              aria-label="浏览模式"
              className="relative gap-2 rounded-full bg-white/10 p-1 group-data-horizontal/tabs:h-8"
            >
              <span
                aria-hidden
                className={`pointer-events-none absolute top-1 left-1 size-6 rounded-full bg-white/20 shadow-sm ${mode === 'albums' ? styles.albums : styles.folders}`}
              />
              <TabsTrigger
                value="folders"
                aria-label="目录模式"
                title="目录模式"
                className="z-10 size-6 flex-none rounded-full p-0 text-white/55 hover:text-white data-active:bg-transparent data-active:text-white group-data-[variant=default]/tabs-list:data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-transparent dark:data-active:text-white"
              >
                <Folder className="size-4" />
              </TabsTrigger>
              <TabsTrigger
                value="albums"
                aria-label="相册模式"
                title="相册模式"
                className="z-10 size-6 flex-none rounded-full p-0 text-white/55 hover:text-white data-active:bg-transparent data-active:text-white group-data-[variant=default]/tabs-list:data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-transparent dark:data-active:text-white"
              >
                <Images className="size-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
            aria-label="刷新列表"
            disabled={loading}
            onClick={onRefresh}
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`} />
          </Button>
        </div>
      </div>
    </WindowFooter>
  );
}
