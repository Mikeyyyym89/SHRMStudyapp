// ---------------------------------------------------------------------------
// App configuration
// ---------------------------------------------------------------------------
//
// ACCESS CODE (soft gate)
// -----------------------
// The app is gated behind a single shared access code. The code itself is not
// stored in plain text here — only its SHA-256 hash — so it isn't trivially
// visible in the browser bundle.
//
// To change the code:
//   1. Pick a new code, e.g. "StudyHR2026"
//   2. Generate its hash:   printf 'StudyHR2026' | sha256sum
//   3. Paste the hex hash below and rebuild/redeploy.
//
// Default code shipped with this app:  SHRMReady2026

export const ACCESS_CODE_HASH =
  "7dc6bba99957fa4887508b422cc27968c0ddebe34a0214b004be712ddb46aeed";

export const APP_NAME = "SHRM Study Prep";
export const APP_TAGLINE =
  "Master SHRM-CP & SHRM-SCP with flashcards, practice questions, and real-world HR scenarios.";

export const STORAGE_KEYS = {
  unlocked: "shrm.unlocked",
  progress: "shrm.progress",
} as const;

export const REPORT_REPO = "Mikeyyyym89/SHRMStudyapp";
