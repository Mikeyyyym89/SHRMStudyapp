import Link from "next/link";
import { notFound } from "next/navigation";
import { courses, getCourse, getCourseContent } from "@/lib/content";
import CourseShell from "@/components/CourseShell";
import ProgressWidget from "@/components/ProgressWidget";

export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export default async function CourseOverview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = getCourse(id);
  const content = getCourseContent(id);
  if (!course || !content) notFound();

  const stats = [
    { label: "Flashcards", value: content.flashcards.length, href: `/course/${id}/flashcards` },
    { label: "Practice questions", value: content.questions.length, href: `/course/${id}/questions` },
    { label: "Case studies", value: content.caseStudies.length, href: `/course/${id}/case-studies` },
  ];

  return (
    <CourseShell course={course} active="overview">
      <p className="max-w-3xl leading-relaxed text-slate-600">
        {course.description}
      </p>

      <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
        <a
          href={course.examUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline underline-offset-2 hover:text-blue-900"
        >
          Exam details ↗
        </a>
        <a
          href={course.studyGuideUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline underline-offset-2 hover:text-blue-900"
        >
          Official study guide ↗
        </a>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
          >
            <div className="text-3xl font-bold text-slate-900">{s.value}</div>
            <div className="mt-1 text-sm text-slate-500">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <ProgressWidget
          courseId={id}
          totalQuestions={content.questions.length}
          totalFlashcards={content.flashcards.length}
        />
      </div>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">
        Skills measured
      </h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {course.domains.map((d, i) => (
          <li
            key={d}
            className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700"
          >
            <span className="font-semibold text-slate-400">{i + 1}.</span>
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </CourseShell>
  );
}
