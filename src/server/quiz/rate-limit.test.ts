import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rateLimit, resetRateLimitForTests } from "./rate-limit.ts";
import { createSubmissionId, maskPhone } from "./ids.ts";

describe("rate limit", () => {
  it("blocks after the limit in the window", () => {
    resetRateLimitForTests();
    const now = 1_000_000;
    for (let i = 0; i < 3; i += 1) {
      const r = rateLimit("t", { limit: 3, windowMs: 1000 }, now);
      assert.equal(r.ok, true);
    }
    const blocked = rateLimit("t", { limit: 3, windowMs: 1000 }, now);
    assert.equal(blocked.ok, false);
  });
});

describe("ids", () => {
  it("formats LQ-YYYYMMDD-XXXXX", () => {
    const id = createSubmissionId(new Date("2026-09-06T04:00:00Z"));
    assert.match(id, /^LQ-\d{8}-[A-Z0-9]{5}$/);
  });

  it("masks phones as 0912****78", () => {
    assert.equal(maskPhone("0912345678"), "0912****78");
  });
});
