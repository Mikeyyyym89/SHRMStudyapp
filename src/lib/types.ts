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

export type QuestionType = "mcq" | "order";

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
  type?: QuestionType;
  prompt: string;
  options: string[];
  steps?: string[];
  answer: number;
  explanation: string;
  hint?: string;
  docs: DocLink[];
  difficulty?: Difficulty;
}

export interface CaseStudySection {
  title: string;
  content: string[];
}

export interface CaseStudy {
  id: string;
  title: string;
  scenario: string;
  context: string[];
  sections?: CaseStudySection[];
  questions: Question[];
}

export interface DocGroup {
  domain: string;
  links: DocLink[];
}

export interface Takeaway {
  domain: string;
  summary: string;
  highYield: string[];
  memoryAids: string[];
}

export interface CourseContent {
  flashcards: Flashcard[];
  questions: Question[];
  caseStudies: CaseStudy[];
  docs: DocGroup[];
  takeaways: Takeaway[];
}

export interface CertificationPath {
  id: string;
  name: string;
  level: string;
  description: string;
  courses: string[];
}

export interface CourseProgress {
  results: Record<string, boolean>;
  known: string[];
  caseResults: Record<string, Record<string, boolean>>;
}
