import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import { connection } from 'next/server';
import { cookies, headers } from 'next/headers';
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import configService from '@/lib/services/config';
import { auth } from '@/lib/auth';
import { SettingsProvider } from '@/components/business/Appearance/SettingsProvider';
import { GlassFilter } from '@/components/common/GlassFilter';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return { title: t('title'), description: t('description') };
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  const cookieStore = await cookies();
  const config = configService.list({
    language: cookieStore.get('language')?.value,
    theme: cookieStore.get('theme')?.value,
    veil: cookieStore.get('veil')?.value,
  });
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        config.theme === 'dark' && 'dark',
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        'font-sans',
        inter.variable,
      )}
    >
      <body className="mx-auto flex min-h-full max-w-400 flex-col">
        <GlassFilter />
        <NextIntlClientProvider>
          <SettingsProvider config={config} signedIn={!!session}>
            <TooltipProvider>{children}</TooltipProvider>
          </SettingsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
