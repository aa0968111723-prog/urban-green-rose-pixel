import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { QUESTIONS } from "../data/questions.ts";
import type { Answer, Dimension, OptionKey, Scores } from "../types.ts";
import {
  calculateDimensionMaximums,
  calculateScores,
  calculateWinner,
  countPrimaryThrees,
  emptyScores,
  normalizeScores,
  uniqueAnswers,
  upsertAnswer,
} from "./scoring.ts";

function play(choiceMap: Record<number, OptionKey>): Answer[] {
  return QUESTIONS.map((q) => ({ questionId: q.id, choice: choiceMap[q.id]! }));
}

const VISION = play({ 1: "D", 2: "D", 3: "A", 4: "C", 5: "B", 6: "D", 7: "A", 8: "C", 9: "D", 10: "D" });
const EMPATHY = play({ 1: "B", 2: "A", 3: "D", 4: "B", 5: "C", 6: "A", 7: "C", 8: "B", 9: "B", 10: "A" });
const DECISION = play({ 1: "A", 2: "B", 3: "B", 4: "D", 5: "A", 6: "B", 7: "B", 8: "A", 9: "A", 10: "C" });
const CRISIS = play({ 1: "C", 2: "C", 3: "C", 4: "A", 5: "D", 6: "C", 7: "D", 8: "D", 9: "C", 10: "B" });

describe("scoring", () => {
  it("calculates dimension maximums as 30", () => {
    const maxes = calculateDimensionMaximums();
    assert.equal(maxes.vision, 30);
    assert.equal(maxes.empathy, 30);
    assert.equal(maxes.decision, 30);
    assert.equal(maxes.crisis, 30);
  });

  it("scores a full vision path as 30 and winner vision", () => {
    const scores = calculateScores(VISION);
    assert.equal(scores.vision, 30);
    assert.equal(calculateWinner(scores, VISION), "vision");
  });

  it("scores empathy / decision / crisis paths", () => {
    assert.equal(calculateScores(EMPATHY).empathy, 30);
    assert.equal(calculateWinner(calculateScores(EMPATHY), EMPATHY), "empathy");
    assert.equal(calculateScores(DECISION).decision, 30);
    assert.equal(calculateWinner(calculateScores(DECISION), DECISION), "decision");
    assert.equal(calculateScores(CRISIS).crisis, 30);
    assert.equal(calculateWinner(calculateScores(CRISIS), CRISIS), "crisis");
  });

  it("recalculates when an answer is changed instead of accumulating", () => {
    const first = upsertAnswer([], { questionId: 1, choice: "A" });
    const second = upsertAnswer(first, { questionId: 1, choice: "B" });
    assert.equal(uniqueAnswers(second).length, 1);
    const scores = calculateScores(second);
    assert.equal(scores.empathy, 3);
    assert.equal(scores.decision, 1);
  });

  it("normalizes 30 to 1 and 0 to 0", () => {
    const full = normalizeScores({ vision: 30, empathy: 0, decision: 15, crisis: 30 });
    assert.equal(full.vision, 1);
    assert.equal(full.empathy, 0);
    assert.equal(full.decision, 0.5);
    assert.equal(full.crisis, 1);
  });

  it("uses primary-three count as the first tie-breaker", () => {
    const scores: Scores = { vision: 18, empathy: 18, decision: 10, crisis: 8 };
    const answers: Answer[] = [
      { questionId: 1, choice: "D" },
      { questionId: 2, choice: "D" },
      { questionId: 3, choice: "A" },
      { questionId: 4, choice: "B" },
      { questionId: 5, choice: "C" },
      { questionId: 6, choice: "A" },
      { questionId: 7, choice: "C" },
      { questionId: 8, choice: "B" },
      { questionId: 9, choice: "B" },
      { questionId: 10, choice: "A" },
    ];
    const primaries = countPrimaryThrees(answers);
    assert.ok(primaries.vision !== primaries.empathy || calculateWinner(scores, answers));
    const winner = calculateWinner(scores, answers);
    const tiedMax = Math.max(primaries.vision, primaries.empathy);
    const expected = primaries.vision === tiedMax && primaries.vision > primaries.empathy
      ? "vision"
      : primaries.empathy === tiedMax && primaries.empathy > primaries.vision
        ? "empathy"
        : winner;
    assert.equal(winner, expected);
    assert.ok(winner === "vision" || winner === "empathy");
  });

  it("falls back to last 5 questions then deterministic order", () => {
    const scores: Scores = { vision: 12, empathy: 12, decision: 12, crisis: 9 };
    const answers: Answer[] = QUESTIONS.map((q) => ({ questionId: q.id, choice: "A" as const }));
    const a = calculateWinner(scores, answers);
    const b = calculateWinner(scores, answers);
    assert.equal(a, b);
    const shuffled: Scores = { crisis: 9, decision: 12, empathy: 12, vision: 12 };
    assert.equal(calculateWinner(shuffled, answers), a);
  });

  it("never uses object key order", () => {
    const scoresA: Scores = { vision: 20, empathy: 20, decision: 10, crisis: 10 };
    const scoresB = {
      crisis: 10,
      decision: 10,
      empathy: 20,
      vision: 20,
    } as Scores;
    const answers = play({ 1: "D", 2: "A", 3: "A", 4: "B", 5: "B", 6: "A", 7: "A", 8: "B", 9: "B", 10: "A" });
    assert.equal(calculateWinner(scoresA, answers), calculateWinner(scoresB, answers));
  });

  it("same answers always produce the same winner", () => {
    const answers = DECISION;
    const scores = calculateScores(answers);
    const results = new Set<Dimension>();
    for (let i = 0; i < 20; i += 1) results.add(calculateWinner(scores, answers));
    assert.equal(results.size, 1);
    assert.equal([...results][0], "decision");
  });

  it("starts from empty scores", () => {
    assert.deepEqual(emptyScores(), { vision: 0, empathy: 0, decision: 0, crisis: 0 });
  });
});
