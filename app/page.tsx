'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const existingSession = window.localStorage.getItem('dossier_local_user');
    if (existingSession) {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-indigo-100/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-sky-100/60 blur-3xl pointer-events-none" />

      <section className="max-w-6xl mx-auto px-6 py-12 md:py-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-up">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 animate-fade-in">
              My Digital Dossier
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-4 leading-tight">
              Build your portfolio.
              <br />
              Share your story.
            </h1>
            <p className="text-gray-600 mt-5 text-base md:text-lg max-w-xl animate-fade-in-delayed">
              Create a personal digital dossier with your projects, work experience, CV and
              achievements, all in one place.
            </p>

            <div className="flex flex-wrap gap-3 mt-8 animate-fade-in-delayed-2">
              <Link
                href="/login?force=1"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#1E1B33] text-white rounded-xl font-bold hover:bg-black transition-all"
              >
                Login
              </Link>
              <Link
                href="/login?mode=signup&force=1"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                Create Account
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-8 animate-fade-in-delayed-2 max-w-md">
              <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-center">
                <p className="text-lg font-extrabold text-gray-900">1</p>
                <p className="text-[11px] text-gray-500 mt-1">Portfolio Hub</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-center">
                <p className="text-lg font-extrabold text-gray-900">4</p>
                <p className="text-[11px] text-gray-500 mt-1">Main Sections</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-center">
                <p className="text-lg font-extrabold text-gray-900">∞</p>
                <p className="text-[11px] text-gray-500 mt-1">Project Growth</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end animate-fade-in-delayed-2">
            <div className="w-full max-w-md bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-sm animate-float-slow">
              <div className="relative w-full aspect-square rounded-2xl bg-gray-50 overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="My Digital Dossier logo"
                  fill
                  className="object-contain p-8"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 md:mt-16 animate-fade-in-delayed-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <article className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Projects</p>
              <h3 className="text-lg font-bold text-gray-900 mt-2">Show your best work</h3>
              <p className="text-sm text-gray-600 mt-2">
                Add custom projects, pin highlights, and connect GitHub repositories in one view.
              </p>
            </article>

            <article className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Experience</p>
              <h3 className="text-lg font-bold text-gray-900 mt-2">Map your career</h3>
              <p className="text-sm text-gray-600 mt-2">
                Build a clean timeline of your jobs, roles, achievements, and growth over time.
              </p>
            </article>

            <article className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Vault</p>
              <h3 className="text-lg font-bold text-gray-900 mt-2">Keep files organized</h3>
              <p className="text-sm text-gray-600 mt-2">
                Store your CV and grade documents in your own space and share your public profile.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
