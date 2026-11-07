import type {
  Course,
  CourseContent,
  CaseStudy,
  DocGroup,
  Flashcard,
  Question,
} from "@/lib/types";

import coursesData from "@/content/courses.json";

import cpFlashcards from "@/content/shrm-cp/flashcards.json";
import cpQuestions from "@/content/shrm-cp/questions.json";
import cpCases from "@/content/shrm-cp/case-studies.json";
import cpDocs from "@/content/shrm-cp/docs.json";

import scpFlashcards from "@/content/shrm-scp/flashcards.json";
import scpQuestions from "@/content/shrm-scp/questions.json";
import scpCases from "@/content/shrm-scp/case-studies.json";
import scpDocs from "@/content/shrm-scp/docs.json";

export const courses: Course[] = coursesData as Course[];

export const courseContent: Record<string, CourseContent> = {
  "shrm-cp": {
    flashcards: cpFlashcards as Flashcard[],
    questions: cpQuestions as Question[],
    caseStudies: cpCases as CaseStudy[],
    docs: cpDocs as DocGroup[],
  },
  "shrm-scp": {
    flashcards: scpFlashcards as Flashcard[],
    questions: scpQuestions as Question[],
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
