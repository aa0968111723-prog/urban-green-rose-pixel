import { answersText } from "@/features/leader-quiz/lib/scoring";
import { getTaipeiTime } from "@/features/leader-quiz/lib/time";
import { leaderQuizConfig } from "@/features/leader-quiz/leaderQuizConfig";
import type { EvaluatedSubmission } from "@/features/leader-quiz/lib/evaluate";

export async function maybePostGoogleSheet(
  evaluated: EvaluatedSubmission,
  submissionId: string,
  alreadyRegistered: boolean,
): Promise<void> {
  const url = process.env.GOOGLE_SCRIPT_URL?.trim();
  if (!url) return;
  const payload = {
    game: leaderQuizConfig.gameId,
    submissionId,
    alreadyRegistered,
    time: getTaipeiTime(),
    name: evaluated.registration.name,
    department: evaluated.registration.department,
    phone: evaluated.registration.phone,
    email: evaluated.registration.email,
    score: evaluated.winner,
    title: evaluated.title,
    result: evaluated.title,
    visionScore: evaluated.scores.vision,
    empathyScore: evaluated.scores.empathy,
    decisionScore: evaluated.scores.decision,
    crisisScore: evaluated.scores.crisis,
    answersText: answersText(evaluated.answers),
    answersJson: JSON.stringify(evaluated.answers),
    source: evaluated.tracking.source,
    utm_source: evaluated.tracking.utmSource,
    utm_medium: evaluated.tracking.utmMedium,
    utm_campaign: evaluated.tracking.utmCampaign,
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch {
    // Sheet is a second outlet — DB is the source of truth.
  } finally {
    clearTimeout(timer);
  }
}
