"use client";

import { useEffect, useState } from "react";
import type { Flashcard } from "@/lib/types";
import { getCourseProgress, toggleKnown } from "@/lib/store";

export default function FlashcardsView({
  courseId,
  flashcards,
}: {
  courseId: string;
  flashcards: Flashcard[];
}) {
  const [shuffled, setShuffled] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<string[]>([]);

  useEffect(() => {
    setShuffled(shuffle(flashcards));
    setKnown(getCourseProgress(courseId).known);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, flashcards]);

  const card = shuffled[index];

  function go(delta: number) {
    setFlipped(false);
    setIndex((i) => (i + delta + shuffled.length) % shuffled.length);
  }

  if (!card) {
    return (
      <p className="text-slate-500">
        {flashcards.length ? "Loading flashcards…" : "No flashcards for this course yet."}
      </p>
    );
  }

  const isKnown = known.includes(card.term);
  const pct = Math.round(((index + 1) / shuffled.length) * 100);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            Card {index + 1} of {shuffled.length}
          </p>
          <p className="text-xs text-slate-400">
            {known.length} marked as known
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFlipped(false);
              setIndex(0);
              setShuffled(shuffle(flashcards));
            }}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Shuffle
          </button>
        </div>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-violet-600 transition-all"
          style={{ width: `${pct}%` }}
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
          {flipped ? "Click to hide" : "Click to reveal"}
        </span>
      </button>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          onClick={() => go(-1)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Prev
        </button>
        <button
          onClick={() => {
            const nowKnown = toggleKnown(courseId, card.term);
            setKnown((prev) =>
              nowKnown
                ? [...prev, card.term]
                : prev.filter((t) => t !== card.term),
            );
          }}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            isKnown
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : "bg-slate-900 text-white hover:bg-slate-700"
          }`}
        >
          {isKnown ? "✓ Known" : "Mark as known"}
        </button>
        <button
          onClick={() => go(1)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
