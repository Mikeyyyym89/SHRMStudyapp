import type { CourseProgress } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/config";

// All state is stored in the browser's localStorage. This keeps the app 100%
// static (no backend) while remembering each user's progress on their device.

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore quota / privacy-mode errors
  }
}

// --- Access gate -----------------------------------------------------------

export function isUnlocked(): boolean {
  return read(STORAGE_KEYS.unlocked) === "1";
}

export function unlock(): void {
  write(STORAGE_KEYS.unlocked, "1");
}

export function lock(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.unlocked);
  } catch {
    // ignore
  }
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// --- Progress --------------------------------------------------------------

type AllProgress = Record<string, CourseProgress>;

function emptyProgress(): CourseProgress {
  return { results: {}, known: [], caseResults: {} };
}

function readAllProgress(): AllProgress {
  const raw = read(STORAGE_KEYS.progress);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as AllProgress;
  } catch {
    return {};
  }
}

function writeAllProgress(progress: AllProgress): void {
  write(STORAGE_KEYS.progress, JSON.stringify(progress));
}

export function getCourseProgress(courseId: string): CourseProgress {
  return readAllProgress()[courseId] ?? emptyProgress();
}

export function recordAnswer(
  courseId: string,
  questionId: string,
  correct: boolean,
): void {
  const all = readAllProgress();
  const current = all[courseId] ?? emptyProgress();
  current.results[questionId] = correct;
  all[courseId] = current;
  writeAllProgress(all);
}

export function recordCaseAnswer(
  courseId: string,
  caseId: string,
  questionId: string,
  correct: boolean,
): void {
  const all = readAllProgress();
  const current = all[courseId] ?? emptyProgress();
  if (!current.caseResults[caseId]) current.caseResults[caseId] = {};
  current.caseResults[caseId][questionId] = correct;
  all[courseId] = current;
  writeAllProgress(all);
}

export function toggleKnown(courseId: string, term: string): boolean {
  const all = readAllProgress();
  const current = all[courseId] ?? emptyProgress();
  const idx = current.known.indexOf(term);
  let nowKnown: boolean;
  if (idx >= 0) {
    current.known.splice(idx, 1);
    nowKnown = false;
  } else {
    current.known.push(term);
    nowKnown = true;
  }
  all[courseId] = current;
  writeAllProgress(all);
  return nowKnown;
}

export function resetCourse(courseId: string): void {
  const all = readAllProgress();
  delete all[courseId];
  writeAllProgress(all);
}

export interface Stats {
  answered: number;
  total: number;
  correct: number;
  percent: number;
  known: number;
  totalFlashcards: number;
}

export function computeStats(
  courseId: string,
  totalQuestions: number,
  totalFlashcards: number,
): Stats {
  const p = getCourseProgress(courseId);
  const answeredIds = Object.keys(p.results);
  const answered = answeredIds.length;
  const correct = answeredIds.filter((id) => p.results[id]).length;
  return {
    answered,
    total: totalQuestions,
    correct,
    percent: answered === 0 ? 0 : Math.round((correct / answered) * 100),
    known: p.known.length,
    totalFlashcards,
  };
}
