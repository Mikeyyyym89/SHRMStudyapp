import type {
  CourseProgress,
  FlashcardReview,
  FlashcardRating,
} from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/config";

// --- low-level localStorage helpers ---

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

function remove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// --- Access gate ---

export function isUnlocked(): boolean {
  return read(STORAGE_KEYS.unlocked) === "1";
}

export function unlock(): void {
  write(STORAGE_KEYS.unlocked, "1");
}

export function lock(): void {
  remove(STORAGE_KEYS.unlocked);
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// --- Profiles (local, on-device only) ---

const PROFILE_KEY = "acp.profile";
const PROFILES_KEY = "acp.profiles";

export function getProfiles(): string[] {
  const raw = read(PROFILES_KEY);
  if (!raw) return ["Default"];
  try {
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) && arr.length > 0 ? arr : ["Default"];
  } catch {
    return ["Default"];
  }
}

export function getCurrentProfile(): string {
  const current = read(PROFILE_KEY);
  const profiles = getProfiles();
  if (current && profiles.includes(current)) return current;
  return profiles[0];
}

export function setCurrentProfile(name: string): void {
  write(PROFILE_KEY, name);
}

export function addProfile(name: string): void {
  const profiles = getProfiles();
  if (!profiles.includes(name)) {
    profiles.push(name);
    write(PROFILES_KEY, JSON.stringify(profiles));
  }
  setCurrentProfile(name);
}

export function deleteProfile(name: string): void {
  const profiles = getProfiles().filter((p) => p !== name);
  write(PROFILES_KEY, JSON.stringify(profiles));
  const progress = readAllProgress();
  delete progress[name];
  writeAllProgress(progress);
  const reviews = readAllReviews();
  delete reviews[name];
  writeAllReviews(reviews);
  if (getCurrentProfile() === name) {
    write(PROFILE_KEY, profiles[0] ?? "Default");
  }
}

// --- Progress (per profile) ---

type AllProgress = Record<string, Record<string, CourseProgress>>;

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

function writeAllProgress(value: AllProgress): void {
  write(STORAGE_KEYS.progress, JSON.stringify(value));
}

export function getCourseProgress(courseId: string): CourseProgress {
  return readAllProgress()[getCurrentProfile()]?.[courseId] ?? emptyProgress();
}

export function recordAnswer(
  courseId: string,
  questionId: string,
  correct: boolean,
): void {
  const all = readAllProgress();
  const profile = getCurrentProfile();
  const course = all[profile]?.[courseId] ?? emptyProgress();
  course.results[questionId] = correct;
  all[profile] = { ...(all[profile] ?? {}), [courseId]: course };
  writeAllProgress(all);
}

export function recordCaseAnswer(
  courseId: string,
  caseId: string,
  questionId: string,
  correct: boolean,
): void {
  const all = readAllProgress();
  const profile = getCurrentProfile();
  const course = all[profile]?.[courseId] ?? emptyProgress();
  if (!course.caseResults[caseId]) course.caseResults[caseId] = {};
  course.caseResults[caseId][questionId] = correct;
  all[profile] = { ...(all[profile] ?? {}), [courseId]: course };
  writeAllProgress(all);
}

export function resetCourse(courseId: string): void {
  const all = readAllProgress();
  const profile = getCurrentProfile();
  if (all[profile]) {
    delete all[profile][courseId];
    writeAllProgress(all);
  }
}

// --- Spaced repetition flashcards (per profile) ---

const FLASHCARD_REVIEWS_KEY = "acp.flashcardReviews";

type AllReviews = Record<
  string,
  Record<string, Record<string, FlashcardReview>>
>;

function readAllReviews(): AllReviews {
  const raw = read(FLASHCARD_REVIEWS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as AllReviews;
  } catch {
    return {};
  }
}

function writeAllReviews(value: AllReviews): void {
  write(FLASHCARD_REVIEWS_KEY, JSON.stringify(value));
}

export function getFlashcardReviews(
  courseId: string,
): Record<string, FlashcardReview> {
  return readAllReviews()[getCurrentProfile()]?.[courseId] ?? {};
}

export function sm2(
  prev: FlashcardReview | undefined,
  rating: FlashcardRating,
): FlashcardReview {
  const ef = prev?.ef ?? 2.5;
  const n = prev?.n ?? 0;
  const prevInterval = prev?.interval ?? 0;

  let nextN = n;
  let interval = prevInterval;

  if (rating === 0) {
    nextN = 0;
    interval = 0;
  } else if (rating === 1) {
    interval = Math.max(1, Math.round(prevInterval * 1.2));
  } else if (rating === 2) {
    nextN = n + 1;
    interval = n === 0 ? 1 : n === 1 ? 3 : Math.round(prevInterval * ef);
  } else {
    nextN = n + 1;
    interval = n === 0 ? 3 : Math.round(prevInterval * ef * 1.3);
  }

  let nextEf = ef;
  if (rating === 0) nextEf = Math.max(1.3, ef - 0.2);
  else if (rating === 3) nextEf = Math.min(2.5, ef + 0.1);

  return { n: nextN, ef: nextEf, interval, due: Date.now() + interval * 86400000 };
}

export function rateFlashcard(
  courseId: string,
  term: string,
  rating: FlashcardRating,
): FlashcardReview {
  const all = readAllReviews();
  const profile = getCurrentProfile();
  const course = all[profile]?.[courseId] ?? {};
  const review = sm2(course[term], rating);
  course[term] = review;
  all[profile] = { ...(all[profile] ?? {}), [courseId]: course };
  writeAllReviews(all);
  return review;
}

export function resetFlashcardReviews(courseId: string): void {
  const all = readAllReviews();
  const profile = getCurrentProfile();
  if (all[profile]) {
    delete all[profile][courseId];
    writeAllReviews(all);
  }
}

// --- Stats ---

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
  const mastered = Object.values(getFlashcardReviews(courseId)).filter(
    (r) => r.n >= 2,
  ).length;
  return {
    answered,
    total: totalQuestions,
    correct,
    percent: answered === 0 ? 0 : Math.round((correct / answered) * 100),
    known: mastered,
    totalFlashcards,
  };
}
