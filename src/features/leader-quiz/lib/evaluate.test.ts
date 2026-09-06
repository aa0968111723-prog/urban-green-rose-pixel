import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { QUESTIONS } from "../data/questions.ts";
import { calculateScores, calculateWinner } from "./scoring.ts";
import { evaluateQuizPayload } from "./evaluate.ts";

describe("API recalculates score from answers", () => {
  it("ignores client-sent scores and winner", () => {
    const answers = QUESTIONS.map((q) => ({ questionId: q.id, choice: "D" as const }));
    const result = evaluateQuizPayload({
      name: "小華",
      department: "資工一A",
      phone: "0912345678",
      email: "",
      answers,
      winner: "empathy",
      visionScore: 99,
      empathyScore: 99,
      decisionScore: 99,
      crisisScore: 99,
      title: "fake",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const expectedScores = calculateScores(answers);
    const expectedWinner = calculateWinner(expectedScores, answers);
    assert.deepEqual(result.value.scores, expectedScores);
    assert.equal(result.value.winner, expectedWinner);
    assert.notEqual(result.value.scores.vision, 99);
  });

  it("rejects incomplete answers", () => {
    const result = evaluateQuizPayload({
      name: "小華",
      department: "資工一A",
      phone: "0912345678",
      answers: [{ questionId: 1, choice: "A" }],
    });
    assert.equal(result.ok, false);
  });
});
