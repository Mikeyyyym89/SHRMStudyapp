"use client";

import { useState } from "react";
import type { CaseStudy } from "@/lib/types";
import { recordCaseAnswer } from "@/lib/store";

export default function CaseStudiesView({
  courseId,
  caseStudies,
}: {
  courseId: string;
  caseStudies: CaseStudy[];
}) {
  const [activeId, setActiveId] = useState<string | null>(
    caseStudies[0]?.id ?? null,
  );

  const active = caseStudies.find((c) => c.id === activeId) ?? caseStudies[0];

  if (caseStudies.length === 0) {
    return <p className="text-slate-500">No case studies for this course yet.</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Case studies</h3>
        {caseStudies.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition ${
              active?.id === c.id
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            {c.title}
          </button>
        ))}
      </aside>

      {active && (
        <CaseStudyDetail key={active.id} courseId={courseId} study={active} />
      )}
    </div>
  );
}

function CaseStudyDetail({
  courseId,
  study,
}: {
  courseId: string;
  study: CaseStudy;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState(0);

  const q = study.questions[index];
  const sections = study.sections ?? [];
  const hasSections = sections.length > 0;

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    recordCaseAnswer(courseId, study.id, q.id, i === q.answer);
  }

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{study.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {study.scenario}
        </p>

        {hasSections ? (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1 border-b border-slate-200">
              {sections.map((s, i) => (
                <button
                  key={s.title}
                  onClick={() => setActiveSection(i)}
                  className={`px-3 py-2 text-sm font-medium transition ${
                    activeSection === i
                      ? "border-b-2 border-slate-900 text-slate-900"
                      : "border-b-2 border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {sections[activeSection].content.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Requirements
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {study.context.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Question {index + 1} of {study.questions.length}
          </span>
        </div>

        <h3 className="mt-3 text-base font-semibold text-slate-900">{q.prompt}</h3>

        <div className="mt-4 grid gap-2.5">
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
            className={`mt-4 rounded-lg p-4 ${
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

        <div className="mt-4 flex justify-end gap-2">
          {index > 0 && (
            <button
              onClick={() => {
                setIndex((i) => i - 1);
                setSelected(null);
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ← Prev
            </button>
          )}
          {index + 1 < study.questions.length && (
            <button
              onClick={() => {
                setIndex((i) => i + 1);
                setSelected(null);
              }}
              disabled={selected === null}
              className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
