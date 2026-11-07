"use client";

import { useEffect, useMemo, useState } from "react";
import type { Question } from "@/lib/types";
import { DIFFICULTIES, DIFFICULTY_LABELS } from "@/lib/types";

const COUNT_OPTIONS = [10, 20, 30, 50, 65, 100];
const MINUTE_OPTIONS = [10, 20, 30, 45, 60, 90, 120];

type Phase = "setup" | "exam" | "results";

export default function ExamView({
  courseId,
  questions,
}: {
  courseId: string;
  questions: Question[];
}) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [count, setCount] = useState(20);
  const [minutes, setMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState("all");
  const [exam, setExam] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showWrongOnly, setShowWrongOnly] = useState(false);

  const totalSeconds = useMemo(() => minutes * 60, [minutes]);

  const pool = useMemo(
    () =>
      difficulty === "all"
        ? questions
        : questions.filter((q) => (q.difficulty ?? "intermediate") === difficulty),
    [questions, difficulty],
  );

  useEffect(() => {
    if (phase !== "exam") return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setPhase("results");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  function start() {
    const n = Math.min(count, pool.length);
    setExam(shuffle(pool).slice(0, n));
    setAnswers({});
    setIndex(0);
    setSecondsLeft(totalSeconds);
    setPhase("exam");
  }

  if (questions.length === 0) {
    return <p className="text-slate-500">No questions for this course yet.</p>;
  }

  if (phase === "setup") {
    const effectiveCount = Math.min(count, pool.length);
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Mock Exam</h2>
        <p className="mt-1 text-sm text-slate-500">
          A timed, exam-style test. Filter by difficulty to target the level you
          want, and review every missed question at the end.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Number of questions
            </label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-slate-900 focus:outline-none"
            >
              {COUNT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
              <option value={pool.length}>All ({pool.length})</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-slate-900 focus:outline-none"
            >
              <option value="all">All levels</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {DIFFICULTY_LABELS[d]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Time limit (minutes)
            </label>
            <select
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-slate-900 focus:outline-none"
            >
              {MINUTE_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={start}
          disabled={pool.length === 0}
          className="mt-6 w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          Start exam ({effectiveCount} questions · {minutes} min)
        </button>
      </div>
    );
  }

  if (phase === "results") {
    const results = exam.map((q) => {
      const chosen = answers[q.id];
      return { q, chosen, correct: chosen === q.answer };
    });
    const correctCount = results.filter((r) => r.correct).length;
    const wrongCount = results.length - correctCount;
    const pct =
      results.length === 0
        ? 0
        : Math.round((correctCount / results.length) * 100);
    const visible = showWrongOnly ? results.filter((r) => !r.correct) : results;

    return (
      <div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-500">Your score</p>
          <p className="mt-1 text-5xl font-bold text-slate-900">
            {correctCount}
            <span className="text-2xl text-slate-400">/{results.length}</span>
          </p>
          <p className="mt-1 text-lg font-medium text-slate-700">{pct}%</p>
          <p className="mt-2 text-sm text-slate-500">
            {wrongCount === 0
              ? "Perfect — no questions missed!"
              : `${wrongCount} question${wrongCount === 1 ? "" : "s"} to review below.`}
          </p>
          <button
            onClick={() => {
              setPhase("setup");
              setExam([]);
              setAnswers({});
              setShowWrongOnly(false);
            }}
            className="mt-4 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            New exam
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Review</h3>
          <button
            onClick={() => setShowWrongOnly((v) => !v)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            {showWrongOnly ? "Show all" : "Show only wrong"}
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {visible.map(({ q, chosen, correct }, i) => (
            <div
              key={q.id}
              className={`rounded-xl border p-4 shadow-sm ${
                correct ? "border-slate-200 bg-white" : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    correct
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {correct ? "✓" : "✗"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {q.domain}
                    </span>
                    {q.difficulty && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                        {DIFFICULTY_LABELS[q.difficulty]}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {i + 1}. {q.prompt}
                  </p>
                  <div className="mt-2 text-sm">
                    <p className={correct ? "text-slate-600" : "text-red-700"}>
                      Your answer:{" "}
                      {chosen == null ? "(not answered)" : q.options[chosen]}
                    </p>
                    {!correct && (
                      <p className="mt-0.5 font-medium text-emerald-700">
                        Correct: {q.options[q.answer]}
                      </p>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {q.explanation}
                  </p>
                  {q.docs.length > 0 && (
                    <a
                      href={q.docs[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-sm font-medium text-blue-700 underline-offset-2 hover:underline"
                    >
                      {q.docs[0].label} ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {visible.length === 0 && (
            <p className="text-sm text-slate-500">
              {showWrongOnly
                ? "No incorrect answers — nice work!"
                : "Nothing here."}
            </p>
          )}
        </div>
      </div>
    );
  }

  // phase === "exam"
  const q = exam[index];
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-slate-500">
          Question {index + 1} of {exam.length}
        </span>
        <span
          className={`rounded-lg px-3 py-1 text-sm font-bold tabular-nums ${
            secondsLeft < 300
              ? "bg-red-100 text-red-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {mm}:{ss}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${((index + 1) / exam.length) * 100}%` }}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {q.domain}
          </span>
          {q.difficulty && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              {DIFFICULTY_LABELS[q.difficulty]}
            </span>
          )}
        </div>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">{q.prompt}</h3>

        <div className="mt-5 grid gap-2.5">
          {q.options.map((opt, i) => {
            const isSelected = answers[q.id] === i;
            return (
              <button
                key={i}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-500">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-slate-800">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          ← Prev
        </button>
        {index + 1 < exam.length ? (
          <button
            onClick={() => setIndex((i) => i + 1)}
            className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={() => setPhase("results")}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Submit exam
          </button>
        )}
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
