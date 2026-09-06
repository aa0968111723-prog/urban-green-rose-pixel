import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { submitQuiz } from "./submit-client.ts";

describe("submission client", () => {
  it("does not treat a non-ok payload as success", async () => {
    const fakeFetch = (async () =>
      new Response(JSON.stringify({ ok: false, error: "nope" }), { status: 200 })) as typeof fetch;
    const result = await submitQuiz(
      {
        name: "小華",
        department: "資工一A",
        phone: "0912345678",
        email: "",
        answers: [],
      },
      fakeFetch,
    );
    assert.equal(result.ok, false);
  });

  it("returns error when fetch throws / network fails", async () => {
    const fakeFetch = (async () => {
      throw new Error("offline");
    }) as typeof fetch;
    const result = await submitQuiz(
      {
        name: "小華",
        department: "資工一A",
        phone: "0912345678",
        email: "",
        answers: [],
      },
      fakeFetch,
    );
    assert.equal(result.ok, false);
    assert.match(result.error ?? "", /網路|送出/);
  });

  it("accepts only explicit ok: true", async () => {
    const fakeFetch = (async () =>
      new Response(
        JSON.stringify({
          ok: true,
          submissionId: "LQ-20260906-A7K4P",
          winner: "vision",
          scores: { vision: 18, empathy: 12, decision: 10, crisis: 9 },
          alreadyRegistered: false,
        }),
        { status: 200 },
      )) as typeof fetch;
    const result = await submitQuiz(
      {
        name: "小華",
        department: "資工一A",
        phone: "0912345678",
        email: "",
        answers: [],
      },
      fakeFetch,
    );
    assert.equal(result.ok, true);
    assert.equal(result.submissionId, "LQ-20260906-A7K4P");
  });
});
