export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 p-6 dark:bg-black">
      <main className="w-full max-w-sm rounded-xl border border-black/8 bg-white p-8 dark:border-white/[.145] dark:bg-zinc-950">
        {children}
      </main>
    </div>
  );
}
