import { QUESTIONS, QUESTION_BY_ID } from "../data/questions.ts";
import {
  OPTION_KEYS,
  type Answer,
  type OptionKey,
  type Question,
  type Registration,
} from "../types.ts";
import { uniqueAnswers } from "./scoring.ts";

export const PHONE_RE = /^09\d{8}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type FieldErrors = Partial<Record<keyof Registration, string>>;

export function cleanText(value: string, max: number): string {
  let out = "";
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    if (code < 32 || code === 127) continue;
    out += ch;
  }
  return out.trim().slice(0, max);
}

export function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, "");
}

export function isValidPhone(value: string): boolean {
  return PHONE_RE.test(normalizePhone(value));
}

export function isValidEmail(value: string): boolean {
  if (!value.trim()) return true;
  return EMAIL_RE.test(value.trim().toLowerCase());
}

export function validateRegistration(input: {
  name: string;
  department: string;
  phone: string;
  email: string;
}): { ok: true; value: Registration } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const name = cleanText(input.name, 40);
  const department = cleanText(input.department, 40);
  const phone = normalizePhone(cleanText(input.phone, 16));
  const email = cleanText(input.email, 80).toLowerCase();

  if (!name) errors.name = "請填寫姓名";
  if (!department) errors.department = "請填寫系級";
  if (!phone) errors.phone = "請填寫電話";
  else if (!isValidPhone(phone)) errors.phone = "請輸入有效的台灣手機號碼（09 開頭共 10 碼）";
  if (email && !isValidEmail(email)) errors.email = "請輸入有效的電子信箱";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { name, department, phone, email } };
}

export function isOptionKey(value: string): value is OptionKey {
  return (OPTION_KEYS as readonly string[]).includes(value);
}

export type AnswersError = { ok: false; error: string };
export type AnswersOk = { ok: true; answers: Answer[] };

export function validateAnswers(
  raw: unknown,
  questions: readonly Question[] = QUESTIONS,
): AnswersOk | AnswersError {
  if (!Array.isArray(raw)) return { ok: false, error: "answers 必須是陣列" };
  if (raw.length !== questions.length) {
    return { ok: false, error: `必須作答全部 ${questions.length} 題` };
  }

  const answers: Answer[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return { ok: false, error: "答案格式不正確" };
    const row = item as { questionId?: unknown; question?: unknown; choice?: unknown };
    const questionId = Number(row.questionId ?? row.question);
    const choice = String(row.choice ?? "");
    if (!Number.isInteger(questionId)) return { ok: false, error: "題號不合法" };
    if (!QUESTION_BY_ID.has(questionId) && !questions.some((q) => q.id === questionId)) {
      return { ok: false, error: `題號 ${questionId} 不存在` };
    }
    if (!isOptionKey(choice)) return { ok: false, error: "選項只能是 A/B/C/D" };
    answers.push({ questionId, choice });
  }

  const unique = uniqueAnswers(answers);
  if (unique.length !== questions.length) return { ok: false, error: "不可重複題號" };

  const expected = new Set(questions.map((q) => q.id));
  for (const answer of unique) {
    if (!expected.has(answer.questionId)) return { ok: false, error: "題號不合法" };
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question?.options.some((o) => o.key === answer.choice)) {
      return { ok: false, error: "選項不合法" };
    }
  }
  return { ok: true, answers: unique.sort((a, b) => a.questionId - b.questionId) };
}

export function sanitizeTrackingValue(value: unknown, max = 64): string {
  if (typeof value !== "string") return "";
  return value.replace(/[^\w\-.:]/g, "").slice(0, max);
}
