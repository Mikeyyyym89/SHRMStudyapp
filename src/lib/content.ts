import type {
  Course,
  CourseContent,
  CaseStudy,
  DocGroup,
  Flashcard,
  Question,
  Difficulty,
} from "@/lib/types";

import coursesData from "@/content/courses.json";

import cpFlashcards from "@/content/shrm-cp/flashcards.json";
import cpOfficial from "@/content/shrm-cp/questions-official.json";
import cpCases from "@/content/shrm-cp/case-studies.json";
import cpDocs from "@/content/shrm-cp/docs.json";

import scpFlashcards from "@/content/shrm-scp/flashcards.json";
import scpOfficial from "@/content/shrm-scp/questions-official.json";
import scpCases from "@/content/shrm-scp/case-studies.json";
import scpDocs from "@/content/shrm-scp/docs.json";

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
  },
  "shrm-scp": {
    flashcards: scpFlashcards as Flashcard[],
    questions: [...tag(scpOfficial as Question[], "expert")],
    caseStudies: scpCases as CaseStudy[],
    docs: scpDocs as DocGroup[],
  },
};

export function getCourse(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export function getCourseContent(id: string): CourseContent | undefined {
  return courseContent[id];
}

export function getDomain(course: Course, index: number): string {
  return course.domains[index % course.domains.length];
}
