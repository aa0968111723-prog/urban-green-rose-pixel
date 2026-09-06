import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { QUESTIONS } from "./data/questions.ts";
import { OPTION_KEYS, type Dimension, type OptionKey } from "./types.ts";
import { calculateScores, calculateWinner } from "./lib/scoring.ts";

function analyze(sampleLimit = 0) {
  const keys = OPTION_KEYS;
  const winnerCount: Record<Dimension, number> = {
    vision: 0,
    empathy: 0,
    decision: 0,
    crisis: 0,
  };
  let ties = 0;
  let total = 0;
  const letterWins: Record<OptionKey, number> = { A: 0, B: 0, C: 0, D: 0 };
  const dimMin: Record<Dimension, number> = {
    vision: Infinity,
    empathy: Infinity,
    decision: Infinity,
    crisis: Infinity,
  };
  const dimMax: Record<Dimension, number> = {
    vision: 0,
    empathy: 0,
    decision: 0,
    crisis: 0,
  };
  const primaryLetter: Record<Dimension, Record<OptionKey, number>> = {
    vision: { A: 0, B: 0, C: 0, D: 0 },
    empathy: { A: 0, B: 0, C: 0, D: 0 },
    decision: { A: 0, B: 0, C: 0, D: 0 },
    crisis: { A: 0, B: 0, C: 0, D: 0 },
  };

  for (const q of QUESTIONS) {
    for (const opt of q.options) {
      for (const dim of Object.keys(primaryLetter) as Dimension[]) {
        if (opt.scores[dim] === 3) primaryLetter[dim][opt.key] += 1;
      }
    }
  }

  const n = QUESTIONS.length;
  const limit = sampleLimit > 0 ? sampleLimit : 4 ** n;
  const combo = new Array<number>(n).fill(0);

  const step = () => {
    const answers = QUESTIONS.map((q, i) => ({
      questionId: q.id,
      choice: keys[combo[i]!]!,
    }));
    const scores = calculateScores(answers);
    const winner = calculateWinner(scores, answers);
    winnerCount[winner] += 1;
    letterWins[answers[0]!.choice] += 0;
    const max = Math.max(scores.vision, scores.empathy, scores.decision, scores.crisis);
    if ([scores.vision, scores.empathy, scores.decision, scores.crisis].filter((s) => s === max).length > 1) {
      ties += 1;
    }
    (Object.keys(scores) as Dimension[]).forEach((dim) => {
      dimMin[dim] = Math.min(dimMin[dim], scores[dim]);
      dimMax[dim] = Math.max(dimMax[dim], scores[dim]);
    });
    total += 1;
  };

  if (sampleLimit > 0) {
    for (let i = 0; i < sampleLimit; i += 1) {
      for (let q = 0; q < n; q += 1) combo[q] = Math.floor(Math.random() * 4);
      step();
    }
  } else {
    const walk = (idx: number) => {
      if (idx === n) {
        step();
        return;
      }
      for (let k = 0; k < 4; k += 1) {
        combo[idx] = k;
        walk(idx + 1);
      }
    };
    walk(0);
  }

  const pct = (count: number) => ((count / total) * 100).toFixed(1);
  const warnings: string[] = [];
  for (const dim of Object.keys(winnerCount) as Dimension[]) {
    const p = (winnerCount[dim] / total) * 100;
    if (p > 40 || p < 15) warnings.push(`${dim} is ${p.toFixed(1)}% (skew warning)`);
  }
  return {
    total,
    limit,
    winnerCount,
    pct: {
      vision: pct(winnerCount.vision),
      empathy: pct(winnerCount.empathy),
      decision: pct(winnerCount.decision),
      crisis: pct(winnerCount.crisis),
    },
    tieRate: ((ties / total) * 100).toFixed(1),
    dimMin,
    dimMax,
    primaryLetter,
    warnings,
  };
}

describe("quiz distribution", () => {
  it("enumerates all 4^10 combinations and reports balance", () => {
    const report = analyze(0);
    assert.equal(report.total, 4 ** 10);
    console.log("Vision:", report.pct.vision + "%");
    console.log("Empathy:", report.pct.empathy + "%");
    console.log("Decision:", report.pct.decision + "%");
    console.log("Crisis:", report.pct.crisis + "%");
    console.log("Tie rate:", report.tieRate + "%");
    console.log("Range", report.dimMin, report.dimMax);
    console.log("Primary letter positions", report.primaryLetter);
    if (report.warnings.length) {
      console.log("WARNINGS (do not auto-edit questions):", report.warnings);
    }
    assert.ok(report.total > 0);
  });
});
