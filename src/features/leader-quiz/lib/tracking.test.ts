import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseTracking } from "./tracking.ts";

describe("source tracking", () => {
  it("reads source and utm params", () => {
    const t = parseTracking("?source=booth-a&utm_source=ig&utm_medium=story&utm_campaign=clubfair");
    assert.equal(t.source, "booth-a");
    assert.equal(t.utmSource, "ig");
    assert.equal(t.utmMedium, "story");
    assert.equal(t.utmCampaign, "clubfair");
  });

  it("strips unexpected characters", () => {
    const t = parseTracking("?source=<script>");
    assert.equal(t.source.includes("<"), false);
  });
});
