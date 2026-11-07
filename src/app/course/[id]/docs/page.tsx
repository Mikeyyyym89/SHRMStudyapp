import { notFound } from "next/navigation";
import { courses, getCourse, getCourseContent } from "@/lib/content";
import CourseShell from "@/components/CourseShell";

export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = getCourse(id);
  const content = getCourseContent(id);
  if (!course || !content) notFound();

  return (
    <CourseShell course={course} active="docs">
      <p className="max-w-3xl text-slate-600">
        Official Microsoft Learn documentation organized by exam domain. Use
        these to close gaps when you miss a question or need a refresher.
      </p>

      <div className="mt-6 space-y-6">
        {content.docs.map((group) => (
          <section
            key={group.domain}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold text-slate-900">
              {group.domain}
            </h2>
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {group.links.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-700 underline-offset-2 hover:underline"
                  >
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </CourseShell>
  );
}
