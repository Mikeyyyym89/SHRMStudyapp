import { REPORT_REPO } from "@/lib/config";
import type { Question } from "@/lib/types";

export function reportIssueUrl(courseId: string, q: Question): string {
  const title = encodeURIComponent(`[Report] ${q.id} — possible incorrect answer`);
  const options = (q.options || [])
    .map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`)
    .join("\n");
  const body = encodeURIComponent(
    `Course: ${courseId}\nQuestion ID: ${q.id}\n\nPrompt:\n${q.prompt}\n\nOptions:\n${options}\n\nMarked correct: ${q.options[q.answer]}\n\nWhat I believe is wrong:\n`,
  );
  return `https://github.com/${REPORT_REPO}/issues/new?title=${title}&body=${body}`;
}
