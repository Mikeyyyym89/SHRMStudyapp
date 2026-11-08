"use client";

import { useEffect, useMemo, useState } from "react";
import type { Question } from "@/lib/types";
import { DIFFICULTIES, DIFFICULTY_LABELS } from "@/lib/types";
import { recordAnswer } from "@/lib/store";
import { reportIssueUrl } from "@/lib/report";

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
    const present = new Set(questions.map((q) => q.difficulty ?? "expert"));
    return DIFFICULTIES.filter((d) => present.has(d));
  }, [questions]);

  const [domainFilter, setDomainFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [order, setOrder] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  // per-question state
  const [selected, setSelected] = useState<number | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const list = questions.filter(
      (q) =>
        (domainFilter === "all" || q.domain === domainFilter) &&
        (difficultyFilter === "all" ||
          (q.difficulty ?? "expert") === difficultyFilter),
    );
    setOrder(shuffle(list));
    setIndex(0);
    setSelected(null);
    setChosen([]);
    setRevealed(false);
    setCorrectCount(0);
    setFinished(false);
  }, [domainFilter, difficultyFilter, questions]);

  const q = order[index];

  const shuffledSteps = useMemo(() => shuffle(q?.steps ?? []), [q?.id]);

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
                      (qq.difficulty ?? "expert") === difficultyFilter),
                ),
              ),
            );
            setIndex(0);
            setSelected(null);
            setChosen([]);
            setRevealed(false);
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

  const isOrder = q.type === "order";
  const steps = q.steps ?? [];
  const correct =
    isOrder
      ? chosen.join("|") === steps.join("|")
      : selected === q.answer;

  function next() {
    setSelected(null);
    setChosen([]);
    setRevealed(false);
    if (index + 1 >= order.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  function chooseMcq(i: number) {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    const c = i === q.answer;
    if (c) setCorrectCount((x) => x + 1);
    recordAnswer(courseId, q.id, c);
  }

  function pickStep(s: string) {
    if (revealed) return;
    setChosen((prev) => (prev.includes(s) ? prev : [...prev, s]));
  }

  function checkOrder() {
    if (revealed || chosen.length !== steps.length) return;
    const c = chosen.join("|") === steps.join("|");
    if (c) setCorrectCount((x) => x + 1);
    recordAnswer(courseId, q.id, c);
    setRevealed(true);
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
          style={{ width: `${((index + (revealed ? 1 : 0)) / order.length) * 100}%` }}
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
          {isOrder && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              Put in order
            </span>
          )}
        </div>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">{q.prompt}</h3>

        {isOrder ? (
          <div className="mt-5">
            {chosen.length > 0 && (
              <ol className="mb-3 space-y-1 rounded-lg bg-slate-50 p-3">
                {chosen.map((s, i) => (
                  <li key={s} className="text-sm text-slate-800">
                    <span className="mr-1.5 font-semibold text-slate-500">
                      {i + 1}.
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            )}
            <div className="flex flex-wrap gap-2">
              {shuffledSteps
                .filter((s) => !chosen.includes(s))
                .map((s) => (
                  <button
                    key={s}
                    onClick={() => pickStep(s)}
                    disabled={revealed}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={checkOrder}
                disabled={revealed || chosen.length !== steps.length}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-40"
              >
                Check order
              </button>
              <button
                onClick={() => {
                  setChosen([]);
                  setRevealed(false);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 grid gap-2.5">
            {q.options.map((opt, i) => {
              const isAnswer = i === q.answer;
              const isSelected = i === selected;
              let cls =
                "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50";
              if (revealed) {
                if (isAnswer) cls = "border-emerald-500 bg-emerald-50";
                else if (isSelected) cls = "border-red-400 bg-red-50";
                else cls = "border-slate-200 bg-white opacity-60";
              }
              return (
                <button
                  key={i}
                  onClick={() => chooseMcq(i)}
                  disabled={revealed}
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
        )}

        {revealed && (
          <div
            className={`mt-5 rounded-lg p-4 ${
              correct
                ? "bg-emerald-50 text-emerald-900"
                : "bg-red-50 text-red-900"
            }`}
          >
            <p className="text-sm font-semibold">
              {correct
                ? isOrder
                  ? "Correct order!"
                  : "Correct!"
                : isOrder
                  ? "Not quite — see the correct order below."
                  : "Not quite."}
            </p>
            {isOrder && !correct && (
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                {steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            )}
            <p className="mt-1 text-sm leading-relaxed">{q.explanation}</p>
            {q.hint && (
              <div className="mt-2 rounded-lg bg-blue-50 p-3 text-blue-800">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Keyword signal
                </p>
                <p className="mt-0.5 text-sm">{q.hint}</p>
              </div>
            )}
            <a
              href={reportIssueUrl(courseId, q)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs text-slate-400 hover:text-slate-600"
            >
              Report an issue with this question ↗
            </a>
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
          disabled={!revealed}
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
