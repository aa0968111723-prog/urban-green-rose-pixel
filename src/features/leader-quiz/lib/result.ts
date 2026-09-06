import { PROTOTYPES } from "../data/prototypes.ts";
import { leaderQuizConfig } from "../leaderQuizConfig.ts";
import type { Dimension, Prototype, Scores } from "../types.ts";
import { calculateWinner, normalizeScores } from "./scoring.ts";

export function getPrototype(key: Dimension): Prototype {
  return PROTOTYPES[key] ?? PROTOTYPES.vision;
}

export function dimensionLabel(key: Dimension): string {
  return leaderQuizConfig.dimensions.find((d) => d.key === key)?.label ?? key;
}

export function buildResultView(scores: Scores, answers: Parameters<typeof calculateWinner>[1]) {
  const winner = calculateWinner(scores, answers);
  const prototype = getPrototype(winner);
  const normalized = normalizeScores(scores);
  return { winner, prototype, normalized, scores };
}
