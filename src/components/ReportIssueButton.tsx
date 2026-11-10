"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";
import { reportIssueUrl } from "@/lib/report";

export default function ReportIssueButton({
  courseId,
  question,
}: {
  courseId: string;
  question: Question;
}) {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState("");
  const [note, setNote] = useState("");

  function submit() {
    const suggestion = choice || undefined;
    const n = note.trim() || undefined;
    window.open(reportIssueUrl(courseId, question, suggestion, n), "_blank");
    setOpen(false);
    setChoice("");
    setNote("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-slate-400 hover:text-slate-600"
      >
        Report an issue / suggest a correction ↗
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-slate-900">
              Report an issue
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
              {question.prompt}
            </p>

            {question.options.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-700">
                  Which answer do you think is correct?
                </p>
                <div className="mt-2 space-y-1">
                  {question.options.map((o, i) => (
                    <label
                      key={i}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <input
                        type="radio"
                        name="correction"
                        checked={choice === o}
                        onChange={() => setChoice(o)}
                        className="accent-slate-900"
                      />
                      <span>
                        {String.fromCharCode(65 + i)}. {o}
                      </span>
                    </label>
                  ))}
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <input
                      type="radio"
                      name="correction"
                      checked={choice === ""}
                      onChange={() => setChoice("")}
                      className="accent-slate-900"
                    />
                    <span>Not sure — just flag it</span>
                  </label>
                </div>
              </div>
            )}

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note — why you think it's wrong…"
              rows={3}
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Submit to GitHub
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
