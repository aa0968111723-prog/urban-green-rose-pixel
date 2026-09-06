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
  set(t, k, v) { t[k] = v; sandbox[k] = v; return true; },
});
const ctx = createContext(sandbox);
runInContext(script, ctx);

const api = sandbox.window.__LEADER_QUIZ__;
assert.ok(api, "quiz api missing");
assert.equal(api.questions.length, 10);

api.questions.forEach((q, i) => {
  assert.equal(q.options.length, 4, `Q${i + 1} options`);
  const keys = q.options.map((o) => o.key).join("");
  assert.equal(keys, "ABCD");
  q.options.forEach((o) => {
    DIMENSIONS_CHECK(o.scores);
  });
});

function DIMENSIONS_CHECK(scores) {
  ["vision", "empathy", "decision", "crisis"].forEach((d) => {
    assert.equal(typeof scores[d], "number");
  });
}

const maxes = api.calculateDimensionMaximums();
assert.equal(maxes.vision, 30);
assert.equal(maxes.empathy, 30);
assert.equal(maxes.decision, 30);
assert.equal(maxes.crisis, 30);

const time = api.getTaipeiTime();
assert.match(time, /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/);

const phoneRe = /^09\d{8}$/;
assert.equal(phoneRe.test("0912345678"), true);
assert.equal(phoneRe.test("091234567"), false);
assert.equal(phoneRe.test("1812345678"), false);

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
assert.equal(emailRe.test("tku@gmail.com"), true);
assert.equal(emailRe.test("s111@tku.edu.tw"), true);
assert.equal(emailRe.test("not-an-email"), false);
assert.equal(emailRe.test("a@b"), false);

console.log("quiz logic ok", { maxes, time });
