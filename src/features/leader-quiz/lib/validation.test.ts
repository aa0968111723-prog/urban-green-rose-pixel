import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { QUESTIONS } from "../data/questions.ts";
import type { OptionKey } from "../types.ts";
import {
  isValidEmail,
  isValidPhone,
  validateAnswers,
  validateRegistration,
} from "./validation.ts";

describe("registration validation", () => {
  it("requires name, department and TW mobile phone", () => {
    const result = validateRegistration({
      name: "",
      department: "",
      phone: "",
      email: "",
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.errors.name, "請填寫姓名");
      assert.equal(result.errors.department, "請填寫系級");
      assert.equal(result.errors.phone, "請填寫電話");
      assert.equal(result.errors.email, undefined);
    }
  });

  it("accepts valid payload with empty email", () => {
    const result = validateRegistration({
      name: "小華",
      department: "資工一A",
      phone: "0912-345-678",
      email: "",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.phone, "0912345678");
      assert.equal(result.value.email, "");
    }
  });

  it("validates email only when present", () => {
    const bad = validateRegistration({
      name: "小華",
      department: "資工一A",
      phone: "0912345678",
      email: "not-an-email",
    });
    assert.equal(bad.ok, false);
    const good = validateRegistration({
      name: "小華",
      department: "資工一A",
      phone: "0912345678",
      email: "s111@tku.edu.tw",
    });
    assert.equal(good.ok, true);
  });
});

describe("phone validation", () => {
  it("accepts 09xxxxxxxx", () => {
    assert.equal(isValidPhone("0912345678"), true);
  });
  it("rejects short, landline and non-09 numbers", () => {
    assert.equal(isValidPhone("091234567"), false);
    assert.equal(isValidPhone("1812345678"), false);
    assert.equal(isValidPhone("0212345678"), false);
  });
});

describe("email validation", () => {
  it("allows empty and valid addresses", () => {
    assert.equal(isValidEmail(""), true);
    assert.equal(isValidEmail("tku@gmail.com"), true);
    assert.equal(isValidEmail("not-an-email"), false);
    assert.equal(isValidEmail("a@b"), false);
  });
});

describe("answers validation", () => {
  const complete = QUESTIONS.map((q) => ({ questionId: q.id, choice: "A" as OptionKey }));

  it("requires all 10 answers", () => {
    const result = validateAnswers(complete.slice(0, 9));
    assert.equal(result.ok, false);
  });

  it("rejects duplicate question ids", () => {
    const dup = [...complete];
    dup[1] = { questionId: 1, choice: "B" };
    const result = validateAnswers(dup);
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /重複/);
  });

  it("rejects invalid options", () => {
    const bad = complete.map((a, i) => (i === 0 ? { ...a, choice: "E" as OptionKey } : a));
    const result = validateAnswers(bad);
    assert.equal(result.ok, false);
  });

  it("rejects unknown question ids", () => {
    const bad = complete.map((a, i) => (i === 0 ? { questionId: 99, choice: "A" as const } : a));
    const result = validateAnswers(bad);
    assert.equal(result.ok, false);
  });

  it("accepts a complete unique 10-answer set", () => {
    const result = validateAnswers(complete);
    assert.equal(result.ok, true);
  });
});
