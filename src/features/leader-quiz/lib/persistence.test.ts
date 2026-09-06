import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PROGRESS_TTL_MS,
  clearAllQuizStorage,
  loadPendingSubmission,
  loadProgress,
  savePendingSubmission,
  saveProgress,
} from "./persistence.ts";

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  key(index: number) {
    return [...this.store.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

describe("localStorage restore", () => {
  it("saves and restores registration, answers and currentIndex", () => {
    const storage = new MemoryStorage();
    saveProgress(
      {
        screen: "quiz",
        registration: { name: "小華", department: "資工一A", phone: "0912345678", email: "" },
        answers: [
          { questionId: 1, choice: "A" },
          { questionId: 2, choice: "B" },
        ],
        currentIndex: 6,
        tracking: { source: "booth-a", utmSource: "ig", utmMedium: "", utmCampaign: "" },
      },
      storage,
      1_000,
    );
    const loaded = loadProgress(storage, 1_000);
    assert.ok(loaded);
    assert.equal(loaded.currentIndex, 6);
    assert.equal(loaded.registration.name, "小華");
    assert.equal(loaded.answers.length, 2);
    assert.equal(loaded.tracking.source, "booth-a");
  });

  it("expires after the short TTL", () => {
    const storage = new MemoryStorage();
    saveProgress(
      {
        screen: "quiz",
        registration: { name: "小華", department: "資工一A", phone: "0912345678", email: "" },
        answers: [{ questionId: 1, choice: "A" }],
        currentIndex: 1,
        tracking: { source: "", utmSource: "", utmMedium: "", utmCampaign: "" },
      },
      storage,
      1_000,
    );
    const loaded = loadProgress(storage, 1_000 + PROGRESS_TTL_MS + 1);
    assert.equal(loaded, null);
  });

  it("keeps a pending submission for retry and clears it", () => {
    const storage = new MemoryStorage();
    savePendingSubmission({ name: "小華" }, storage, 1_000);
    assert.ok(loadPendingSubmission(storage, 1_000));
    clearAllQuizStorage(storage);
    assert.equal(loadPendingSubmission(storage, 1_000), null);
    assert.equal(loadProgress(storage, 1_000), null);
  });
});
