'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

const inputClass =
  'rounded-md border border-black/10 bg-transparent px-3 py-2 text-base font-normal outline-none focus:border-black/40 dark:border-white/[.16] dark:focus:border-white/50';

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isSignUp = mode === 'sign-up';

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const { error } = isSignUp
      ? await authClient.signUp.email({ name, email, password, username })
      : await authClient.signIn.username({ username, password });

    if (error) {
      setError(error.message ?? 'Something went wrong.');
      setPending(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {isSignUp ? 'Create an account' : 'Sign in'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {isSignUp && (
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Name
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className={inputClass}
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Username
          <input
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_.]+"
            title="3–30 characters: letters, numbers, underscores and dots"
            autoComplete="username"
            className={inputClass}
          />
        </label>

        {isSignUp && (
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Email
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={inputClass}
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Password
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            className={inputClass}
          />
        </label>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="bg-foreground text-background mt-2 h-11 rounded-full font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'}
        </button>
      </form>

      <Link
        href={isSignUp ? '/sign-in' : '/sign-up'}
        className="mt-4 block w-full text-center text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
      >
        {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
      </Link>
    </>
  );
}
