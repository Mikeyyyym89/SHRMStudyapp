import { notFound } from "next/navigation";
import { courses, getCourse, getCourseContent } from "@/lib/content";
import CourseShell from "@/components/CourseShell";

export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export default async function TakeawaysPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = getCourse(id);
  const content = getCourseContent(id);
  if (!course || !content) notFound();

  return (
    <CourseShell course={course} active="takeaways">
      <p className="max-w-3xl text-slate-600">
        A high-yield study summary for each domain — the core principle, what is
        most likely to show up on the exam, and ways to remember it.
      </p>

      <div className="mt-6 space-y-6">
        {content.takeaways.map((t) => (
          <section
            key={t.domain}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold text-slate-900">{t.domain}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {t.summary}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Most likely on the test
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {t.highYield.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  How to remember
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {t.memoryAids.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
        {content.takeaways.length === 0 && (
          <p className="text-slate-500">Key takeaways coming soon for this course.</p>
        )}
      </div>
    </CourseShell>
  );
}
