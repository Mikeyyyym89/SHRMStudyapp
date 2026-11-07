import { notFound } from "next/navigation";
import { courses, getCourse, getCourseContent } from "@/lib/content";
import CourseShell from "@/components/CourseShell";
import QuestionsView from "@/components/QuestionsView";

export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export default async function QuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = getCourse(id);
  const content = getCourseContent(id);
  if (!course || !content) notFound();

  return (
    <CourseShell course={course} active="questions">
      <QuestionsView courseId={id} questions={content.questions} />
    </CourseShell>
  );
}
