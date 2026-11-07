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
import cpQuestions from "@/content/shrm-cp/questions.json";
import cpQuestions2 from "@/content/shrm-cp/questions-2.json";
import cpHard from "@/content/shrm-cp/questions-hard.json";
import cpHard2 from "@/content/shrm-cp/questions-advanced-2.json";
import cpExpert from "@/content/shrm-cp/questions-expert.json";
import cpExpert2 from "@/content/shrm-cp/questions-expert-2.json";
import cpCases from "@/content/shrm-cp/case-studies.json";
import cpDocs from "@/content/shrm-cp/docs.json";

import scpFlashcards from "@/content/shrm-scp/flashcards.json";
import scpQuestions from "@/content/shrm-scp/questions.json";
import scpQuestions2 from "@/content/shrm-scp/questions-2.json";
import scpHard from "@/content/shrm-scp/questions-hard.json";
import scpHard2 from "@/content/shrm-scp/questions-advanced-2.json";
import scpExpert from "@/content/shrm-scp/questions-expert.json";
import scpExpert2 from "@/content/shrm-scp/questions-expert-2.json";
import scpCases from "@/content/shrm-scp/case-studies.json";
import scpDocs from "@/content/shrm-scp/docs.json";

function tag(qs: Question[], difficulty: Difficulty): Question[] {
  return qs.map((q) => ({ ...q, difficulty }));
}

export const courses: Course[] = coursesData as Course[];

export const courseContent: Record<string, CourseContent> = {
  "shrm-cp": {
    flashcards: cpFlashcards as Flashcard[],
    questions: [
      ...tag(cpQuestions as Question[], "foundational"),
      ...tag(cpQuestions2 as Question[], "intermediate"),
      ...tag(cpHard as Question[], "advanced"),
      ...tag(cpHard2 as Question[], "advanced"),
      ...tag(cpExpert as Question[], "expert"),
      ...tag(cpExpert2 as Question[], "expert"),
    ],
    caseStudies: cpCases as CaseStudy[],
    docs: cpDocs as DocGroup[],
  },
  "shrm-scp": {
    flashcards: scpFlashcards as Flashcard[],
    questions: [
      ...tag(scpQuestions as Question[], "foundational"),
      ...tag(scpQuestions2 as Question[], "intermediate"),
      ...tag(scpHard as Question[], "advanced"),
      ...tag(scpHard2 as Question[], "advanced"),
      ...tag(scpExpert as Question[], "expert"),
      ...tag(scpExpert2 as Question[], "expert"),
    ],
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
