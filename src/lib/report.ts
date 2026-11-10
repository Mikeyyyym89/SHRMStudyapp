import { REPORT_REPO } from "@/lib/config";
import type { Question } from "@/lib/types";

export function reportIssueUrl(courseId: string, q: Question): string {
  const title = encodeURIComponent(`[Report] ${q.id} — possible incorrect answer`);
  const body = encodeURIComponent(
    `Course: ${courseId}\nQuestion: ${q.id}\n\n${q.prompt}\n\nI think the marked answer is wrong.`,
  );
  return `https://github.com/${REPORT_REPO}/issues/new?title=${title}&body=${body}`;
}
