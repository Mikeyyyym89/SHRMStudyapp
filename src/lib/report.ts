import { REPORT_REPO } from "@/lib/config";
import type { Question } from "@/lib/types";

export function reportIssueUrl(
  courseId: string,
  q: Question,
  suggestion?: string,
  note?: string,
): string {
  const title = encodeURIComponent(`[Report] ${q.id} — possible incorrect answer`);
  const lines = [`Course: ${courseId}`, `Question: ${q.id}`, "", q.prompt, ""];
  if (suggestion) lines.push(`I think the correct answer is: ${suggestion}`);
  if (note) lines.push(`Note: ${note}`);
  const body = encodeURIComponent(lines.join("\n"));
  return `https://github.com/${REPORT_REPO}/issues/new?title=${title}&body=${body}`;
}
