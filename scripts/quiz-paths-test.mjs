import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { createContext, runInContext } from "node:vm";

const html = readFileSync("/workspace/public/leader-quiz.html", "utf8");
const script = html.split("<script>")[1].split("</script>")[0];
const sandbox = {
  document: {
    getElementById: () => ({
      textContent: "",
      innerHTML: "",
      value: "",
      classList: { toggle() {}, contains() { return false; } },
      setAttribute() {},
      style: {},
      querySelector: () => ({ textContent: "" }),
      addEventListener() {},
      reset() {},
      focus() {},
    }),
    querySelector: () => null,
    querySelectorAll: () => [],
  },
  window: { scrollTo() {}, addEventListener() {}, devicePixelRatio: 1 },
  console,
};
sandbox.window = new Proxy(sandbox.window, {
  set(t, k, v) {
    t[k] = v;
    sandbox[k] = v;
    return true;
  },
});
runInContext(script, createContext(sandbox));
const { questions } = sandbox.window.__LEADER_QUIZ__;

function play(choiceMap) {
  const scores = { vision: 0, empathy: 0, decision: 0, crisis: 0 };
  const scoreHistory = [];
  const answers = [];
  questions.forEach((q, questionIndex) => {
    const opt = q.options.find((o) => o.key === choiceMap[q.id]);
    assert.ok(opt, `missing Q${q.id}`);
    answers.push(opt.key);
    ["vision", "empathy", "decision", "crisis"].forEach((dim) => {
      const add = opt.scores[dim] || 0;
      if (add > 0) {
        scores[dim] += add;
        scoreHistory.push({ dimension: dim, score: scores[dim], questionIndex });
      }
    });
  });
  return { scores, scoreHistory, answers };
}

function winnerOf(scores, scoreHistory) {
  const DIMENSIONS = ["vision", "empathy", "decision", "crisis"];
  const maxScore = Math.max(...DIMENSIONS.map((d) => scores[d]));
  const tied = DIMENSIONS.filter((d) => scores[d] === maxScore);
  if (tied.length === 1) return tied[0];
  let winner = tied[0];
  let bestIndex = Infinity;
  tied.forEach((dim) => {
    const first = scoreHistory.find((h) => h.dimension === dim && h.score >= maxScore);
    const idx = first ? first.questionIndex : Infinity;
    if (idx < bestIndex) {
      bestIndex = idx;
      winner = dim;
    } else if (idx === bestIndex && DIMENSIONS.indexOf(dim) < DIMENSIONS.indexOf(winner)) {
      winner = dim;
    }
  });
  return winner;
}

const vision = play({ 1: "D", 2: "D", 3: "A", 4: "C", 5: "B", 6: "D", 7: "A", 8: "C", 9: "D", 10: "D" });
const empathy = play({ 1: "B", 2: "A", 3: "D", 4: "B", 5: "C", 6: "A", 7: "C", 8: "B", 9: "B", 10: "A" });
const decision = play({ 1: "A", 2: "B", 3: "B", 4: "D", 5: "A", 6: "B", 7: "B", 8: "A", 9: "A", 10: "C" });
const crisis = play({ 1: "C", 2: "C", 3: "C", 4: "A", 5: "D", 6: "C", 7: "D", 8: "D", 9: "C", 10: "B" });

assert.equal(winnerOf(vision.scores, vision.scoreHistory), "vision");
assert.equal(winnerOf(empathy.scores, empathy.scoreHistory), "empathy");
assert.equal(winnerOf(decision.scores, decision.scoreHistory), "decision");
assert.equal(winnerOf(crisis.scores, crisis.scoreHistory), "crisis");
assert.equal(vision.scores.vision, 30);
assert.equal(empathy.scores.empathy, 30);
assert.equal(decision.scores.decision, 30);
assert.equal(crisis.scores.crisis, 30);

// 同分：vision 與 empathy 都 18，vision 先到達
const scores = { vision: 18, empathy: 18, decision: 15, crisis: 12 };
const history = [
  { dimension: "vision", score: 18, questionIndex: 5 },
  { dimension: "empathy", score: 18, questionIndex: 8 },
];
assert.equal(winnerOf(scores, history), "vision");
const history2 = [
  { dimension: "empathy", score: 18, questionIndex: 3 },
  { dimension: "vision", score: 18, questionIndex: 8 },
];
assert.equal(winnerOf(scores, history2), "empathy");
assert.equal(
  winnerOf(scores, [
    { dimension: "vision", score: 18, questionIndex: 6 },
    { dimension: "empathy", score: 18, questionIndex: 6 },
  ]),
  "vision",
);

console.log("paths ok", {
  vision: vision.scores,
  empathy: empathy.scores,
  decision: decision.scores,
  crisis: crisis.scores,
});
