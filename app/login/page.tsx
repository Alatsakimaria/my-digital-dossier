'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, LockKeyhole, UserRound } from 'lucide-react';
import { createLocalUser, getLocalUserByUsername } from '@/lib/supabase';

type AuthMode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizeUsername = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 24);

  useEffect(() => {
    const requestedMode = searchParams.get('mode');
    if (requestedMode === 'signup') {
      setMode('signup');
      return;
    }

    setMode('login');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === 'signup') {
      const normalizedUsername = normalizeUsername(username);

      if (!normalizedUsername) {
        setError('Please provide a valid username.');
        return;
      }

      if (!normalizedUsername || !password.trim()) {
        setError('Username and password are required.');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      setIsSubmitting(true);
      try {
        await createLocalUser({
          username: normalizedUsername,
          full_name: fullName.trim() || null,
          password,
        });

        window.localStorage.setItem(
          'dossier_local_user',
          JSON.stringify({
            username: normalizedUsername,
            full_name: fullName.trim() || null,
          }),
        );

        router.replace('/dashboard');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Could not create account.';
        setError(message);
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizedUsername = normalizeUsername(username);
      const user = await getLocalUserByUsername(normalizedUsername);

      if (!user || user.password !== password) {
        throw new Error('Invalid username or password.');
      }

      window.localStorage.setItem(
        'dossier_local_user',
        JSON.stringify({
          username: user.username,
          full_name: user.full_name,
        }),
      );

      router.replace('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not login.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">My Digital Dossier</p>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {mode === 'login'
              ? 'Login to manage your portfolio dashboard.'
              : 'Create your account with username, full name and password.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="maria"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full name (optional)</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Maria Alatsaki"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>
            </>
          )}

          {mode === 'login' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <div className="relative">
                <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="maria"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          {info && <p className="text-sm font-medium text-green-700">{info}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1E1B33] text-white rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
            setError(null);
            setInfo(null);
          }}
          className="w-full mt-4 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          {mode === 'login'
            ? 'No account? Create one'
            : 'Already have an account? Login'}
        </button>

        <Link
          href="/"
          className="block w-full mt-2 text-center text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Back to welcome page
        </Link>
      </div>
    </main>
  );
}
