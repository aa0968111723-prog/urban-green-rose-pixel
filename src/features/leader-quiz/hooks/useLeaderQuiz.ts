import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { QUESTIONS } from "../data/questions.ts";
import { leaderQuizConfig } from "../leaderQuizConfig.ts";
import {
  calculateScores,
  calculateWinner,
  uniqueAnswers,
  upsertAnswer,
} from "../lib/scoring.ts";
import {
  clearAllQuizStorage,
  clearPendingSubmission,
  clearProgress,
  loadPendingSubmission,
  loadProgress,
  saveProgress,
} from "../lib/persistence.ts";
import { submitQuiz, toSubmitPayload } from "../lib/submit-client.ts";
import { emptyTracking, readTrackingFromWindow } from "../lib/tracking.ts";
import { validateRegistration } from "../lib/validation.ts";
import type { Answer, OptionKey, QuizScreen, Registration, SubmitStatus, Tracking } from "../types.ts";
import type { FieldErrors as FormErrors } from "../lib/validation.ts";

const ADVANCE_MS = 300;

type State = {
  screen: QuizScreen;
  registration: Registration | null;
  form: Registration;
  errors: FormErrors;
  currentIndex: number;
  answers: Answer[];
  selectedKey: OptionKey | null;
  isAdvancing: boolean;
  submitStatus: SubmitStatus;
  submitMessage: string;
  submissionId: string | null;
  tracking: Tracking;
  restored: boolean;
};

type Action =
  | { type: "HYDRATE"; progress: ReturnType<typeof loadProgress>; tracking: Tracking }
  | { type: "SET_FIELD"; field: keyof Registration; value: string }
  | { type: "SET_ERRORS"; errors: FormErrors }
  | { type: "START"; registration: Registration }
  | { type: "SELECT"; choice: OptionKey }
  | { type: "ADVANCE" }
  | { type: "BACK" }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_DONE"; status: SubmitStatus; message: string; submissionId?: string }
  | { type: "RESET" };

const emptyForm: Registration = { name: "", department: "", phone: "", email: "" };

function initialState(): State {
  return {
    screen: "register",
    registration: null,
    form: emptyForm,
    errors: {},
    currentIndex: 0,
    answers: [],
    selectedKey: null,
    isAdvancing: false,
    submitStatus: "idle",
    submitMessage: "",
    submissionId: null,
    tracking: emptyTracking(),
    restored: false,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE": {
      const tracking = { ...action.tracking, ...(action.progress?.tracking ?? {}) };
      if (!action.progress) return { ...state, tracking, restored: false };
      const answers = uniqueAnswers(action.progress.answers);
      const current = QUESTIONS[action.progress.currentIndex];
      const selected = current
        ? (answers.find((a) => a.questionId === current.id)?.choice ?? null)
        : null;
      return {
        ...state,
        tracking,
        restored: true,
        screen: action.progress.screen,
        registration: action.progress.registration,
        form: action.progress.registration,
        currentIndex: Math.min(action.progress.currentIndex, QUESTIONS.length - 1),
        answers,
        selectedKey: selected,
      };
    }
    case "SET_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: undefined },
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "START":
      return {
        ...state,
        screen: "quiz",
        registration: action.registration,
        form: action.registration,
        errors: {},
        currentIndex: 0,
        answers: [],
        selectedKey: null,
        isAdvancing: false,
        submitStatus: "idle",
        submitMessage: "",
        submissionId: null,
        restored: false,
      };
    case "SELECT":
      if (state.isAdvancing) return state;
      return { ...state, selectedKey: action.choice, isAdvancing: true };
    case "ADVANCE": {
      const question = QUESTIONS[state.currentIndex];
      if (!question || !state.selectedKey) {
        return { ...state, isAdvancing: false };
      }
      const answers = upsertAnswer(state.answers, {
        questionId: question.id,
        choice: state.selectedKey,
      });
      const last = state.currentIndex >= QUESTIONS.length - 1;
      if (last) {
        return {
          ...state,
          answers,
          screen: "result",
          isAdvancing: false,
          submitStatus: "pending",
          submitMessage: "正在登記抽獎…",
        };
      }
      const nextIndex = state.currentIndex + 1;
      const nextQ = QUESTIONS[nextIndex];
      const nextSelected = nextQ
        ? (answers.find((a) => a.questionId === nextQ.id)?.choice ?? null)
        : null;
      return {
        ...state,
        answers,
        currentIndex: nextIndex,
        selectedKey: nextSelected,
        isAdvancing: false,
      };
    }
    case "BACK": {
      if (state.currentIndex <= 0 || state.isAdvancing) return state;
      const prev = state.currentIndex - 1;
      const q = QUESTIONS[prev];
      const selected = q
        ? (state.answers.find((a) => a.questionId === q.id)?.choice ?? null)
        : null;
      return { ...state, currentIndex: prev, selectedKey: selected, isAdvancing: false };
    }
    case "SUBMIT_START":
      return { ...state, submitStatus: "pending", submitMessage: "正在登記抽獎…" };
    case "SUBMIT_DONE":
      return {
        ...state,
        submitStatus: action.status,
        submitMessage: action.message,
        submissionId: action.submissionId ?? state.submissionId,
      };
    case "RESET":
      return { ...initialState(), tracking: state.tracking };
    default:
      return state;
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useLeaderQuiz() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const timerRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    dispatch({
      type: "HYDRATE",
      progress: loadProgress(),
      tracking: readTrackingFromWindow(),
    });
  }, []);

  useEffect(() => {
    if (!state.registration) return;
    if (state.screen === "register") return;
    saveProgress({
      screen: state.screen,
      registration: state.registration,
      answers: state.answers,
      currentIndex: state.currentIndex,
      tracking: state.tracking,
    });
  }, [state.screen, state.registration, state.answers, state.currentIndex, state.tracking]);

  const scores = useMemo(() => calculateScores(state.answers), [state.answers]);
  const winner = useMemo(
    () => calculateWinner(scores, state.answers),
    [scores, state.answers],
  );

  const sendSubmission = useCallback(async () => {
    if (!state.registration) return;
    if (state.answers.length < leaderQuizConfig.questionCount) return;
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    dispatch({ type: "SUBMIT_START" });
    const payload = toSubmitPayload(state.registration, state.answers, state.tracking);
    try {
      const result = await submitQuiz(payload);
      if (result.ok) {
        clearProgress();
        clearPendingSubmission();
        dispatch({
          type: "SUBMIT_DONE",
          status: result.alreadyRegistered ? "duplicate" : "success",
          message: result.alreadyRegistered
            ? "你已經完成抽獎登記，這次結果仍可查看與分享。"
            : "已成功登記抽獎",
          submissionId: result.submissionId,
        });
      } else {
        dispatch({
          type: "SUBMIT_DONE",
          status: "error",
          message: result.error || "抽獎資料暫時無法送出，請稍後再試。",
        });
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [state.registration, state.answers, state.tracking]);

  useEffect(() => {
    if (state.screen !== "result") return;
    if (state.submitStatus !== "pending") return;
    void sendSubmission();
  }, [state.screen, state.submitStatus, sendSubmission]);

  useEffect(() => {
    if (state.screen !== "result") return;
    const pending = loadPendingSubmission();
    if (pending && state.submitStatus === "idle") {
      void sendSubmission();
    }
  }, [state.screen, state.submitStatus, sendSubmission]);

  const start = useCallback(() => {
    const result = validateRegistration(state.form);
    if (!result.ok) {
      dispatch({ type: "SET_ERRORS", errors: result.errors });
      return;
    }
    dispatch({ type: "START", registration: result.value });
  }, [state.form]);

  const select = useCallback(
    (choice: OptionKey) => {
      if (state.isAdvancing) return;
      dispatch({ type: "SELECT", choice });
      const delay = prefersReducedMotion() ? 0 : ADVANCE_MS;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        dispatch({ type: "ADVANCE" });
      }, delay);
    },
    [state.isAdvancing],
  );

  const back = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    dispatch({ type: "BACK" });
  }, []);

  const retrySubmit = useCallback(() => {
    void sendSubmission();
  }, [sendSubmission]);

  const reset = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    clearAllQuizStorage();
    dispatch({ type: "RESET" });
  }, []);

  const question = QUESTIONS[state.currentIndex] ?? QUESTIONS[0];
  const total = QUESTIONS.length;

  return {
    ...state,
    question,
    total,
    scores,
    winner,
    start,
    select,
    back,
    retrySubmit,
    reset,
    setField: (field: keyof Registration, value: string) =>
      dispatch({ type: "SET_FIELD", field, value }),
    fieldErrors: state.errors,
  };
}

export type LeaderQuizModel = ReturnType<typeof useLeaderQuiz>;
