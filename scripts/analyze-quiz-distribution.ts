/**
 * Prints leader-quiz result distribution. Run via:
 * node --experimental-strip-types scripts/analyze-quiz-distribution.ts
 */
import { QUESTIONS } from "../src/features/leader-quiz/data/questions.ts";
import { OPTION_KEYS, type Dimension } from "../src/features/leader-quiz/types.ts";
import { calculateScores, calculateWinner } from "../src/features/leader-quiz/lib/scoring.ts";

const keys = OPTION_KEYS;
const winnerCount: Record<Dimension, number> = {
  vision: 0,
  empathy: 0,
  decision: 0,
  crisis: 0,
};
let ties = 0;
let total = 0;
const combo = new Array<number>(QUESTIONS.length).fill(0);

function step() {
  const answers = QUESTIONS.map((q, i) => ({ questionId: q.id, choice: keys[combo[i]!]! }));
  const scores = calculateScores(answers);
  const winner = calculateWinner(scores, answers);
  winnerCount[winner] += 1;
  const max = Math.max(scores.vision, scores.empathy, scores.decision, scores.crisis);
  if ([scores.vision, scores.empathy, scores.decision, scores.crisis].filter((s) => s === max).length > 1) {
    ties += 1;
  }
  total += 1;
}

function walk(idx: number) {
  if (idx === QUESTIONS.length) {
    step();
    return;
  }
  for (let k = 0; k < 4; k += 1) {
    combo[idx] = k;
    walk(idx + 1);
  }
}

walk(0);
const pct = (n: number) => `${((n / total) * 100).toFixed(1)}%`;
console.log(`Vision: ${pct(winnerCount.vision)}`);
console.log(`Empathy: ${pct(winnerCount.empathy)}`);
console.log(`Decision: ${pct(winnerCount.decision)}`);
console.log(`Crisis: ${pct(winnerCount.crisis)}`);
console.log(`Tie rate: ${pct(ties)}`);
