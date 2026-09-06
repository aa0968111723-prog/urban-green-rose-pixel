import type { Answer, QuizScreen, Registration, Tracking } from "../types.ts";
import { emptyTracking } from "./tracking.ts";
import { uniqueAnswers } from "./scoring.ts";

export const PROGRESS_KEY = "lq:v1:progress";
export const PENDING_KEY = "lq:v1:pending";
/** Short TTL so booth phones do not keep names/phones overnight. */
export const PROGRESS_TTL_MS = 4 * 60 * 60 * 1000;

export type StoredProgress = {
  savedAt: number;
  screen: QuizScreen;
  registration: Registration;
  answers: Answer[];
  currentIndex: number;
  tracking: Tracking;
};

export type PendingSubmission = {
  savedAt: number;
  payload: Record<string, unknown>;
};

function storageOrNull(explicit?: Storage | null): Storage | null {
  if (explicit) return explicit;
  try {
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  } catch {
    return null;
  }
  return null;
}

function readJson<T>(key: string, storage: Storage | null): T | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveProgress(
  progress: Omit<StoredProgress, "savedAt">,
  storage?: Storage | null,
  now = Date.now(),
): void {
  const store = storageOrNull(storage);
  if (!store) return;
  const payload: StoredProgress = {
    ...progress,
    answers: uniqueAnswers(progress.answers),
    savedAt: now,
  };
  store.setItem(PROGRESS_KEY, JSON.stringify(payload));
}

export function loadProgress(storage?: Storage | null, now = Date.now()): StoredProgress | null {
  const store = storageOrNull(storage);
  const data = readJson<StoredProgress>(PROGRESS_KEY, store);
  if (!data || typeof data.savedAt !== "number") return null;
  if (now - data.savedAt > PROGRESS_TTL_MS) {
    clearProgress(store);
    return null;
  }
  if (!data.registration?.name || !Array.isArray(data.answers)) return null;
  return {
    savedAt: data.savedAt,
    screen: data.screen === "result" || data.screen === "quiz" ? data.screen : "register",
    registration: data.registration,
    answers: uniqueAnswers(data.answers),
    currentIndex: Number.isInteger(data.currentIndex) ? data.currentIndex : 0,
    tracking: data.tracking ?? emptyTracking(),
  };
}

export function clearProgress(storage?: Storage | null): void {
  storageOrNull(storage)?.removeItem(PROGRESS_KEY);
}

export function savePendingSubmission(
  payload: Record<string, unknown>,
  storage?: Storage | null,
  now = Date.now(),
): void {
  const store = storageOrNull(storage);
  if (!store) return;
  const data: PendingSubmission = { savedAt: now, payload };
  store.setItem(PENDING_KEY, JSON.stringify(data));
}

export function loadPendingSubmission(
  storage?: Storage | null,
  now = Date.now(),
): PendingSubmission | null {
  const store = storageOrNull(storage);
  const data = readJson<PendingSubmission>(PENDING_KEY, store);
  if (!data || typeof data.savedAt !== "number") return null;
  if (now - data.savedAt > PROGRESS_TTL_MS) {
    clearPendingSubmission(store);
    return null;
  }
  return data;
}

export function clearPendingSubmission(storage?: Storage | null): void {
  storageOrNull(storage)?.removeItem(PENDING_KEY);
}

export function clearAllQuizStorage(storage?: Storage | null): void {
  clearProgress(storage);
  clearPendingSubmission(storage);
}
