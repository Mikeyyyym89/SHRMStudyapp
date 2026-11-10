"use client";

import { useEffect, useState } from "react";
import type { Question } from "@/lib/types";
import { getCourseProgress } from "@/lib/store";

interface DomainStat {
  domain: string;
  total: number;
  answered: number;
  accuracy: number | null;
}

function barColor(acc: number | null): string {
  if (acc === null) return "bg-slate-200";
  if (acc >= 80) return "bg-emerald-500";
  if (acc >= 60) return "bg-amber-500";
  return "bg-red-500";
}

export default function DomainAnalytics({
  courseId,
  questions,
}: {
  courseId: string;
  questions: Question[];
}) {
  const [stats, setStats] = useState<DomainStat[]>([]);

  useEffect(() => {
    const p = getCourseProgress(courseId);
    const byDomain = new Map<
      string,
      { total: number; answered: number; correct: number }
    >();
    for (const q of questions) {
      const d = byDomain.get(q.domain) ?? { total: 0, answered: 0, correct: 0 };
      d.total++;
      if (q.id in p.results) {
        d.answered++;
        if (p.results[q.id]) d.correct++;
      }
      byDomain.set(q.domain, d);
    }
    const arr: DomainStat[] = Array.from(byDomain.entries()).map(
      ([domain, s]) => ({
        domain,
        total: s.total,
        answered: s.answered,
        accuracy: s.answered ? Math.round((s.correct / s.answered) * 100) : null,
      }),
    );
    // weakest first
    arr.sort((a, b) => (a.accuracy ?? -1) - (b.accuracy ?? -1));
    setStats(arr);
  }, [courseId, questions]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">Domain breakdown</h3>
      <p className="text-xs text-slate-500">
        Weakest areas at the top — study those first.
      </p>
      <div className="mt-4 space-y-3">
        {stats.map((s) => (
          <div key={s.domain}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="text-slate-700">{s.domain}</span>
              <span className="text-xs text-slate-500">
                {s.accuracy === null
                  ? `${s.answered}/${s.total} answered`
                  : `${s.accuracy}% (${s.answered}/${s.total})`}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${barColor(s.accuracy)}`}
                style={{ width: `${s.accuracy ?? 0}%` }}
              />
            </div>
          </div>
        ))}
        {stats.length === 0 && (
          <p className="text-sm text-slate-500">
            Answer some questions to see your domain strengths.
          </p>
        )}
      </div>
    </div>
  );
}
