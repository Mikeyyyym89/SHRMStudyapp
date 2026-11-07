export interface DocLink {
  label: string;
  url: string;
}

export type Difficulty = "foundational" | "intermediate" | "advanced" | "expert";

export const DIFFICULTIES: Difficulty[] = [
  "foundational",
  "intermediate",
  "advanced",
  "expert",
];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  foundational: "Foundational",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

export interface Course {
  id: string;
  code: string;
  name: string;
  shortName: string;
  role: string;
  level: string;
  description: string;
  domains: string[];
  examUrl: string;
  studyGuideUrl: string;
  accent: string;
}

export interface Flashcard {
  term: string;
  definition: string;
  domain: string;
}

export interface Question {
  id: string;
  domain: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  docs: DocLink[];
  difficulty?: Difficulty;
}

export interface CaseStudy {
  id: string;
  title: string;
  scenario: string;
  context: string[];
  questions: Question[];
}

export interface DocGroup {
  domain: string;
  links: DocLink[];
}

export interface CourseContent {
  flashcards: Flashcard[];
  questions: Question[];
  caseStudies: CaseStudy[];
  docs: DocGroup[];
}

export interface CourseProgress {
  results: Record<string, boolean>;
  known: string[];
  caseResults: Record<string, Record<string, boolean>>;
}
