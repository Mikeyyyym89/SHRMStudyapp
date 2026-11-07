"use client";

import { useEffect, useMemo, useState } from "react";
import type { Question } from "@/lib/types";
import { DIFFICULTIES, DIFFICULTY_LABELS } from "@/lib/types";
import { recordAnswer } from "@/lib/store";

export default function QuestionsView({
  courseId,
  questions,
}: {
  courseId: string;
  questions: Question[];
}) {
  const domains = useMemo(
    () => Array.from(new Set(questions.map((q) => q.domain))),
    [questions],
  );

  const difficulties = useMemo(() => {
    const present = new Set(questions.map((q) => q.difficulty ?? "intermediate"));
    return DIFFICULTIES.filter((d) => present.has(d));
  }, [questions]);

  const [domainFilter, setDomainFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [order, setOrder] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const list = questions.filter(
      (q) =>
        (domainFilter === "all" || q.domain === domainFilter) &&
        (difficultyFilter === "all" ||
          (q.difficulty ?? "intermediate") === difficultyFilter),
    );
    setOrder(shuffle(list));
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setFinished(false);
  }, [domainFilter, difficultyFilter, questions]);

  const q = order[index];

  if (questions.length === 0) {
    return <p className="text-slate-500">No questions for this course yet.</p>;
  }

  if (!q) {
    return (
      <p className="text-slate-500">
        {order.length === 0
          ? "No questions match those filters."
          : "Loading questions…"}
      </p>
    );
  }

  if (finished) {
    const total = order.length;
    const pct = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">
          {total === 0 ? "No questions" : "Session complete"}
        </h3>
        <p className="mt-2 text-4xl font-bold text-slate-900">
          {correctCount}/{total}
        </p>
        <p className="mt-1 text-sm text-slate-500">{pct}% correct</p>
        <button
          onClick={() => {
            setOrder(
              shuffle(
                questions.filter(
                  (qq) =>
                    (domainFilter === "all" || qq.domain === domainFilter) &&
                    (difficultyFilter === "all" ||
                      (qq.difficulty ?? "intermediate") === difficultyFilter),
                ),
              ),
            );
            setIndex(0);
            setSelected(null);
            setCorrectCount(0);
            setFinished(false);
          }}
          className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Try again
        </button>
      </div>
    );
  }

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === q.answer;
    if (correct) setCorrectCount((c) => c + 1);
    recordAnswer(courseId, q.id, correct);
  }

  function next() {
    setSelected(null);
    if (index + 1 >= order.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Domain
          </span>
          <FilterChip
            label="All"
            active={domainFilter === "all"}
            onClick={() => setDomainFilter("all")}
          />
          {domains.map((d) => (
            <FilterChip
              key={d}
              label={d}
              active={domainFilter === d}
              onClick={() => setDomainFilter(d)}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Difficulty
          </span>
          <FilterChip
            label="All"
            active={difficultyFilter === "all"}
            onClick={() => setDifficultyFilter("all")}
          />
          {difficulties.map((d) => (
            <FilterChip
              key={d}
              label={DIFFICULTY_LABELS[d]}
              active={difficultyFilter === d}
              onClick={() => setDifficultyFilter(d)}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          Question {index + 1} of {order.length}
        </span>
        <span className="font-medium text-slate-700">Score: {correctCount}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{
            width: `${((index + (selected !== null ? 1 : 0)) / order.length) * 100}%`,
          }}
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
            const isAnswer = i === q.answer;
            const isSelected = i === selected;
            let cls =
              "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50";
            if (selected !== null) {
              if (isAnswer) cls = "border-emerald-500 bg-emerald-50";
              else if (isSelected) cls = "border-red-400 bg-red-50";
              else cls = "border-slate-200 bg-white opacity-60";
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={selected !== null}
                className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${cls}`}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-500">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-slate-800">{opt}</span>
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div
            className={`mt-5 rounded-lg p-4 ${
              selected === q.answer
                ? "bg-emerald-50 text-emerald-900"
                : "bg-red-50 text-red-900"
            }`}
          >
            <p className="text-sm font-semibold">
              {selected === q.answer ? "Correct!" : "Not quite."}
            </p>
            <p className="mt-1 text-sm leading-relaxed">{q.explanation}</p>
            {q.docs.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                  Learn more
                </p>
                <ul className="mt-1 space-y-1">
                  {q.docs.map((d) => (
                    <li key={d.url}>
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium underline underline-offset-2 hover:opacity-80"
                      >
                        {d.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={next}
          disabled={selected === null}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {index + 1 >= order.length ? "Finish" : "Next →"}
        </button>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? "bg-slate-900 text-white"
          : "bg-white text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
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
