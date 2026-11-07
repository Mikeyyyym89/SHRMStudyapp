import Link from "next/link";
import type { Course } from "@/lib/types";

const TABS = [
  { key: "overview", label: "Overview", href: "" },
  { key: "flashcards", label: "Flashcards", href: "/flashcards" },
  { key: "questions", label: "Question Bank", href: "/questions" },
  { key: "exam", label: "Mock Exam", href: "/exam" },
  { key: "case-studies", label: "Case Studies", href: "/case-studies" },
  { key: "docs", label: "Supporting Docs", href: "/docs" },
] as const;

export default function CourseShell({
  course,
  active,
  children,
}: {
  course: Course;
  active: (typeof TABS)[number]["key"];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full">
      <header
        className="border-b border-white/10 text-white"
        style={{ background: course.accent }}
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
          <Link
            href="/"
            className="text-sm font-medium text-white/80 hover:text-white"
          >
            ← All courses
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-white/15 px-2.5 py-1 text-xs font-bold tracking-wide">
              {course.code}
            </span>
            <h1 className="text-2xl font-bold sm:text-3xl">{course.name}</h1>
          </div>
          <p className="mt-1 text-sm text-white/85">
            {course.role} · {course.level}
          </p>
        </div>
        <nav className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = tab.key === active;
              return (
                <Link
                  key={tab.key}
                  href={`/course/${course.id}${tab.href}`}
                  className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-white text-white"
                      : "border-transparent text-white/70 hover:text-white"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
