"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { courses } from "@/lib/content";
import { isUnlocked, unlock, lock, sha256Hex } from "@/lib/store";
import { ACCESS_CODE_HASH, APP_NAME, APP_TAGLINE, BETA_DISCLAIMER } from "@/lib/config";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setUnlocked(isUnlocked());
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!code.trim()) return;
    setChecking(true);
    setError("");
    const hash = await sha256Hex(code.trim());
    if (hash === ACCESS_CODE_HASH) {
      unlock();
      setUnlocked(true);
    } else {
      setError("That access code isn't right. Ask the app owner for the current code.");
    }
    setChecking(false);
  }

  function handleLock() {
    lock();
    setUnlocked(false);
    setCode("");
  }

  if (!mounted) {
    return <div className="min-h-full" />;
  }

  if (!unlocked) {
    return (
      <div className="flex min-h-full items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
              {APP_NAME.charAt(0)}
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              {APP_NAME}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{APP_TAGLINE}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            <label
              htmlFor="access-code"
              className="block text-sm font-medium text-slate-700"
            >
              Access code
            </label>
            <input
              id="access-code"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter the shared access code"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              autoFocus
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={checking || !code.trim()}
              className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checking ? "Checking…" : "Enter"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            This is a private study space. Ask the person who shared this link
            for the access code.
          </p>
          <p className="mt-3 border-t border-slate-100 pt-3 text-center text-xs text-amber-600">
            {BETA_DISCLAIMER}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              {APP_NAME.charAt(0)}
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">{APP_NAME}</h1>
              <p className="text-xs text-slate-500">{APP_TAGLINE}</p>
            </div>
          </div>
          <button
            onClick={handleLock}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Lock
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Choose a certification
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {courses.length} courses — flashcards, a deep question bank, and case
          studies for each.
        </p>
        <Link
          href="/paths"
          className="mt-3 inline-block text-sm font-medium text-blue-700 underline-offset-2 hover:underline"
        >
          View certification paths →
        </Link>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/course/${course.id}`}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              <div className="flex items-center justify-between">
                <span
                  className="rounded-md px-2.5 py-1 text-xs font-bold text-white"
                  style={{ background: course.accent }}
                >
                  {course.code}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {course.level}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900 group-hover:underline">
                {course.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{course.role}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                {course.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {course.domains.map((d) => (
                  <span
                    key={d}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          {BETA_DISCLAIMER}
        </p>
      </main>
    </div>
  );
}
