"use client";

import { useEffect, useState } from "react";
import { computeStats, resetCourse, type Stats } from "@/lib/store";

export default function ProgressWidget({
  courseId,
  totalQuestions,
  totalFlashcards,
}: {
  courseId: string;
  totalQuestions: number;
  totalFlashcards: number;
}) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    setStats(computeStats(courseId, totalQuestions, totalFlashcards));
  }, [courseId, totalQuestions, totalFlashcards]);

  if (!stats) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
        Loading your progress…
      </div>
    );
  }

  const qPct = stats.total === 0 ? 0 : Math.round((stats.answered / stats.total) * 100);
  const fPct =
    stats.totalFlashcards === 0
      ? 0
      : Math.round((stats.known / stats.totalFlashcards) * 100);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Your progress
        </h3>
        <button
          onClick={() => {
            resetCourse(courseId);
            setStats(computeStats(courseId, totalQuestions, totalFlashcards));
          }}
          className="text-xs font-medium text-red-600 hover:text-red-700"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-slate-500">Questions</span>
            <span className="font-semibold text-slate-900">
              {stats.answered}/{stats.total}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${qPct}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-slate-500">Accuracy</span>
            <span className="font-semibold text-slate-900">
              {stats.percent}%
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-slate-500">Flashcards known</span>
            <span className="font-semibold text-slate-900">
              {stats.known}/{stats.totalFlashcards}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-violet-600"
              style={{ width: `${fPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
