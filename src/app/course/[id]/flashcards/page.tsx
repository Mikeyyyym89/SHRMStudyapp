import { notFound } from "next/navigation";
import { courses, getCourse, getCourseContent } from "@/lib/content";
import CourseShell from "@/components/CourseShell";
import FlashcardsView from "@/components/FlashcardsView";

export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export default async function FlashcardsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = getCourse(id);
  const content = getCourseContent(id);
  if (!course || !content) notFound();

  return (
    <CourseShell course={course} active="flashcards">
      <FlashcardsView courseId={id} flashcards={content.flashcards} />
    </CourseShell>
  );
}
