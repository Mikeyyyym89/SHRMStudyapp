import { notFound } from "next/navigation";
import { courses, getCourse, getCourseContent } from "@/lib/content";
import CourseShell from "@/components/CourseShell";
import CaseStudiesView from "@/components/CaseStudiesView";

export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export default async function CaseStudiesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = getCourse(id);
  const content = getCourseContent(id);
  if (!course || !content) notFound();

  return (
    <CourseShell course={course} active="case-studies">
      <CaseStudiesView courseId={id} caseStudies={content.caseStudies} />
    </CourseShell>
  );
}
