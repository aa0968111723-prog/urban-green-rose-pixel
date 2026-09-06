import { QUESTIONS } from "../data/questions.ts";
import { DIMENSIONS, type Answer, type Dimension, type Question, type Scores } from "../types.ts";

export function emptyScores(): Scores {
  return { vision: 0, empathy: 0, decision: 0, crisis: 0 };
}

/** Last write wins so going back and changing an answer never duplicates a question. */
export function uniqueAnswers(answers: readonly Answer[]): Answer[] {
  const map = new Map<number, Answer>();
  for (const answer of answers) map.set(answer.questionId, answer);
  return [...map.values()];
}

export function upsertAnswer(answers: readonly Answer[], next: Answer): Answer[] {
  const map = new Map(answers.map((a) => [a.questionId, a]));
  map.set(next.questionId, next);
  return [...map.values()];
}

export function lookupOption(question: Question, choice: Answer["choice"]) {
  return question.options.find((option) => option.key === choice) ?? null;
}

export function calculateScores(
  answers: readonly Answer[],
  questions: readonly Question[] = QUESTIONS,
): Scores {
  const scores = emptyScores();
  const byId = new Map(questions.map((q) => [q.id, q]));
  for (const answer of uniqueAnswers(answers)) {
    const question = byId.get(answer.questionId);
    if (!question) continue;
    const option = lookupOption(question, answer.choice);
    if (!option) continue;
    for (const dim of DIMENSIONS) {
      scores[dim] += Number(option.scores[dim] || 0);
    }
  }
  return scores;
}

export function calculateDimensionMaximums(questions: readonly Question[] = QUESTIONS): Scores {
  const maxes = emptyScores();
  for (const question of questions) {
    const qMax = emptyScores();
    for (const option of question.options) {
      for (const dim of DIMENSIONS) {
        qMax[dim] = Math.max(qMax[dim], Number(option.scores[dim] || 0));
      }
    }
    for (const dim of DIMENSIONS) maxes[dim] += qMax[dim];
  }
  return maxes;
}

export function normalizeScores(
  scores: Scores,
  questions: readonly Question[] = QUESTIONS,
): Scores {
  const maxes = calculateDimensionMaximums(questions);
  const normalized = emptyScores();
  for (const dim of DIMENSIONS) {
    const max = maxes[dim] || 1;
    normalized[dim] = Math.min(1, Math.max(0, scores[dim] / max));
  }
  return normalized;
}

/** Count how many times this dimension was the 3-point primary pick. */
export function countPrimaryThrees(
  answers: readonly Answer[],
  questions: readonly Question[] = QUESTIONS,
): Scores {
  const counts = emptyScores();
  const byId = new Map(questions.map((q) => [q.id, q]));
  for (const answer of uniqueAnswers(answers)) {
    const question = byId.get(answer.questionId);
    if (!question) continue;
    const option = lookupOption(question, answer.choice);
    if (!option) continue;
    for (const dim of DIMENSIONS) {
      if (Number(option.scores[dim] || 0) === 3) counts[dim] += 1;
    }
  }
  return counts;
}

export function scoresOnLastQuestions(
  answers: readonly Answer[],
  lastCount = 5,
  questions: readonly Question[] = QUESTIONS,
): Scores {
  const tailIds = new Set(questions.slice(-lastCount).map((q) => q.id));
  return calculateScores(
    uniqueAnswers(answers).filter((a) => tailIds.has(a.questionId)),
    questions,
  );
}

function pickFromOrder(tied: readonly Dimension[]): Dimension {
  const found = DIMENSIONS.find((dim) => tied.includes(dim));
  return found ?? "vision";
}

/**
 * Highest score decides the prototype.
 *
 * Tie-breaker (deterministic, never random; same answers always same winner):
 * 1. Highest final total.
 * 2. If tied, more times that dimension received the 3-point primary option.
 * 3. If still tied, higher score on the last 5 questions.
 * 4. If still tied, fixed order: vision → empathy → decision → crisis.
 *
 * Iteration always uses DIMENSIONS, never Object.keys(scores), so object key
 * insertion order cannot change the result.
 */
export function calculateWinner(
  scores: Scores,
  answers: readonly Answer[] = [],
  questions: readonly Question[] = QUESTIONS,
): Dimension {
  const maxScore = Math.max(...DIMENSIONS.map((dim) => scores[dim]));
  let tied = DIMENSIONS.filter((dim) => scores[dim] === maxScore);
  if (tied.length === 1) return tied[0];

  const primaries = countPrimaryThrees(answers, questions);
  const maxPrimary = Math.max(...tied.map((dim) => primaries[dim]));
  tied = tied.filter((dim) => primaries[dim] === maxPrimary);
  if (tied.length === 1) return tied[0];

  const lastFive = scoresOnLastQuestions(answers, 5, questions);
  const maxLast = Math.max(...tied.map((dim) => lastFive[dim]));
  tied = tied.filter((dim) => lastFive[dim] === maxLast);
  if (tied.length === 1) return tied[0];

  return pickFromOrder(tied);
}

export function answersText(answers: readonly Answer[]): string {
  return uniqueAnswers(answers)
    .sort((a, b) => a.questionId - b.questionId)
    .map((a) => `Q${a.questionId}:${a.choice}`)
    .join(" | ");
}
