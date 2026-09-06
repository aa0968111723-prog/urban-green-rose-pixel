import type { Answer, Registration, SubmitResponse, Tracking } from "../types.ts";
import { clearPendingSubmission, savePendingSubmission } from "./persistence.ts";

export type SubmitPayload = Registration & {
  answers: Answer[];
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

export function toSubmitPayload(
  registration: Registration,
  answers: Answer[],
  tracking: Tracking,
): SubmitPayload {
  return {
    name: registration.name,
    department: registration.department,
    phone: registration.phone,
    email: registration.email,
    answers,
    source: tracking.source,
    utm_source: tracking.utmSource,
    utm_medium: tracking.utmMedium,
    utm_campaign: tracking.utmCampaign,
  };
}

export async function submitQuiz(
  payload: SubmitPayload,
  fetchImpl: typeof fetch = fetch,
): Promise<SubmitResponse> {
  savePendingSubmission(payload);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetchImpl("/api/quiz/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = (await response.json().catch(() => null)) as SubmitResponse | null;
    if (!data || data.ok !== true) {
      return { ok: false, error: data?.error || "抽獎登記暫時無法送出" };
    }
    clearPendingSubmission();
    return data;
  } catch {
    return { ok: false, error: "網路不穩，結果仍可查看。請稍後重新送出登記。" };
  } finally {
    clearTimeout(timer);
  }
}
