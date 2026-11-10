"use client";

import { useEffect, useState } from "react";
import type { Flashcard, FlashcardRating, FlashcardReview } from "@/lib/types";
import {
  getFlashcardReviews,
  rateFlashcard,
  resetFlashcardReviews,
} from "@/lib/store";

const RATINGS: { value: FlashcardRating; label: string; cls: string }[] = [
  { value: 0, label: "Again", cls: "bg-red-100 text-red-700 hover:bg-red-200" },
  { value: 1, label: "Hard", cls: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
  { value: 2, label: "Good", cls: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
  { value: 3, label: "Easy", cls: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
];

export default function FlashcardsView({
  courseId,
  flashcards,
}: {
  courseId: string;
  flashcards: Flashcard[];
}) {
  const [reviews, setReviews] = useState<Record<string, FlashcardReview>>({});
  const [due, setDue] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, flashcards]);

  function load() {
    const revs = getFlashcardReviews(courseId);
    setReviews(revs);
    const now = Date.now();
    const dueCards = flashcards
      .filter((f) => {
        const r = revs[f.term];
        return !r || r.due <= now;
      })
      .sort((a, b) => {
        const ra = revs[a.term];
        const rb = revs[b.term];
        if (!ra && rb) return -1;
        if (ra && !rb) return 1;
        return (ra?.due ?? 0) - (rb?.due ?? 0);
      });
    setDue(dueCards);
    setIndex(0);
    setFlipped(false);
  }

  const mastered = Object.values(reviews).filter((r) => r.n >= 2).length;
  const learning = Object.values(reviews).length - mastered;

  const card = due[index];

  if (flashcards.length === 0) {
    return <p className="text-slate-500">No flashcards for this course yet.</p>;
  }

  if (!card) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">All caught up! 🎉</h3>
        <p className="mt-2 text-sm text-slate-600">
          {mastered} mastered · {learning} still learning
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Cards come back automatically when they're due.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              setDue(flashcards);
              setIndex(0);
              setFlipped(false);
            }}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Review all now
          </button>
          <button
            onClick={() => {
              resetFlashcardReviews(courseId);
              load();
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Reset progress
          </button>
        </div>
      </div>
    );
  }

  function rate(rating: FlashcardRating) {
    rateFlashcard(courseId, card!.term, rating);
    setReviews(getFlashcardReviews(courseId));
    setFlipped(false);
    if (index + 1 >= due.length) {
      setDue([]);
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            Card {index + 1} of {due.length} due
          </p>
          <p className="text-xs text-slate-400">
            {mastered} mastered · {learning} learning
          </p>
        </div>
        <button
          onClick={() => {
            resetFlashcardReviews(courseId);
            load();
          }}
          className="text-xs font-medium text-slate-400 hover:text-slate-600"
        >
          Reset
        </button>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-violet-600 transition-all"
          style={{ width: `${((index + 1) / due.length) * 100}%` }}
        />
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="mt-6 flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:shadow"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {flipped ? "Definition" : "Term"}
        </span>
        <span className="mt-4 text-2xl font-semibold text-slate-900">
          {flipped ? card.definition : card.term}
        </span>
        {flipped && (
          <span className="mt-4 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            {card.domain}
          </span>
        )}
        <span className="mt-5 text-xs font-medium text-slate-400">
          {flipped ? "How well did you recall it?" : "Click to reveal"}
        </span>
      </button>

      {flipped ? (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.value}
              onClick={() => rate(r.value)}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${r.cls}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 h-[46px]" aria-hidden />
      )}
    </div>
  );
}
