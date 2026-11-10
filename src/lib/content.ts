import type {
  Course,
  CourseContent,
  CaseStudy,
  DocGroup,
  Flashcard,
  Question,
  Difficulty,
  Takeaway,
} from "@/lib/types";

import coursesData from "@/content/courses.json";
import verifiedData from "@/content/verified.json";

import cpFlashcards from "@/content/shrm-cp/flashcards.json";
import cpOfficial from "@/content/shrm-cp/questions-official.json";
import cpCases from "@/content/shrm-cp/case-studies.json";
import cpDocs from "@/content/shrm-cp/docs.json";
import cpTakeaways from "@/content/shrm-cp/takeaways.json";

import scpFlashcards from "@/content/shrm-scp/flashcards.json";
import scpOfficial from "@/content/shrm-scp/questions-official.json";
import scpCases from "@/content/shrm-scp/case-studies.json";
import scpDocs from "@/content/shrm-scp/docs.json";
import scpTakeaways from "@/content/shrm-scp/takeaways.json";

function tag(qs: Question[], difficulty: Difficulty): Question[] {
  return qs.map((q) => ({ ...q, difficulty }));
}

export const courses: Course[] = coursesData as Course[];

export const courseContent: Record<string, CourseContent> = {
  "shrm-cp": {
    flashcards: cpFlashcards as Flashcard[],
    questions: [...tag(cpOfficial as Question[], "expert")],
    caseStudies: cpCases as CaseStudy[],
    docs: cpDocs as DocGroup[],
    takeaways: cpTakeaways as Takeaway[],
  },
  "shrm-scp": {
    flashcards: scpFlashcards as Flashcard[],
    questions: [...tag(scpOfficial as Question[], "expert")],
    caseStudies: scpCases as CaseStudy[],
    docs: scpDocs as DocGroup[],
    takeaways: scpTakeaways as Takeaway[],
  },
};

// Apply "verified" flags to questions that have been manually reviewed/verified.
{
  const verifiedMap = verifiedData as Record<string, string[]>;
  for (const courseId of Object.keys(courseContent)) {
    const set = new Set(verifiedMap[courseId] ?? []);
    courseContent[courseId].questions = courseContent[courseId].questions.map(
      (q) => ({ ...q, verified: set.has(q.id) }),
    );
  }
}

export function getCourse(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export function getCourseContent(id: string): CourseContent | undefined {
  return courseContent[id];
}

export function getDomain(course: Course, index: number): string {
  return course.domains[index % course.domains.length];
}
