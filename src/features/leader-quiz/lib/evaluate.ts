import { QUESTIONS } from "../data/questions.ts";
import { getPrototype } from "./result.ts";
import { calculateScores, calculateWinner } from "./scoring.ts";
import { sanitizeTrackingValue, validateAnswers, validateRegistration } from "./validation.ts";
import type { Answer, Dimension, Registration, Scores, Tracking } from "../types.ts";

export type EvaluatedSubmission = {
  registration: Registration;
  answers: Answer[];
  scores: Scores;
  winner: Dimension;
  title: string;
  tracking: Tracking;
};

export type EvaluateFailure = {
  ok: false;
  error: string;
  status: number;
};

export type EvaluateSuccess = {
  ok: true;
  value: EvaluatedSubmission;
};

export function evaluateQuizPayload(input: unknown): EvaluateSuccess | EvaluateFailure {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "payload 格式不正確", status: 400 };
  }
  const body = input as Record<string, unknown>;
  const registration = validateRegistration({
    name: String(body.name ?? ""),
    department: String(body.department ?? ""),
    phone: String(body.phone ?? ""),
    email: String(body.email ?? ""),
  });
  if (!registration.ok) {
    const first = Object.values(registration.errors)[0] ?? "報名資料不正確";
    return { ok: false, error: first, status: 400 };
  }
  const answers = validateAnswers(body.answers, QUESTIONS);
  if (!answers.ok) return { ok: false, error: answers.error, status: 400 };

  const scores = calculateScores(answers.answers, QUESTIONS);
  const winner = calculateWinner(scores, answers.answers, QUESTIONS);
  const tracking = {
    source: sanitizeTrackingValue(body.source),
    utmSource: sanitizeTrackingValue(body.utm_source),
    utmMedium: sanitizeTrackingValue(body.utm_medium),
    utmCampaign: sanitizeTrackingValue(body.utm_campaign),
  };

  return {
    ok: true,
    value: {
      registration: registration.value,
      answers: answers.answers,
      scores,
      winner,
      title: getPrototype(winner).title,
      tracking,
    },
  };
}
